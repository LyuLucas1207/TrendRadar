/**
 * 获取源数据用例（Getter 模式）
 * 类似 Sjgz-Backend 的 application/getter/get_data.go
 * 
 * 当前实现：使用 getter 获取源数据，仅缓存到 Redis，不存储到数据库
 * 未来扩展：会在 application/source/ 下添加新的用例，用于将 fetch 到的数据存储到数据库 table
 */
import type { IGetterRepository } from '../../domain/getter/repository'
import type { IGetterRegistry } from '../../domain/getter/registry'
import type { ICacheRepository } from '../../domain/cache/repository'
import type { NewsItem } from '../../domain/newsitem/entity'

export interface GetSourceDataParams {
  sourceId: string
  latest?: boolean
  ttl?: number // 缓存 TTL（毫秒）
}

export interface GetSourceDataResult {
  status: 'success' | 'cache'
  id: string
  updatedTime: number
  items: NewsItem[]
}

export class GetSourceData {
  constructor(
    private readonly getterRepository: IGetterRepository,
    private readonly getterRegistry: IGetterRegistry,
    private readonly cacheRepository: ICacheRepository,
    private readonly defaultTTL: number = 30 * 60 * 1000 // 默认 30 分钟
  ) {}

  async execute(params: GetSourceDataParams): Promise<GetSourceDataResult> {
    const { sourceId, latest = false, ttl = this.defaultTTL } = params
    const now = Date.now()

    // 获取源配置
    let source = await this.getterRepository.getSource(sourceId)
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`)
    }

    // 处理重定向
    let effectiveId = source.getEffectiveId()
    if (effectiveId !== sourceId) {
      source = await this.getterRepository.getSource(effectiveId)
      if (!source) {
        throw new Error(`Redirected source not found: ${effectiveId}`)
      }
    }

    // 检查源是否启用
    if (!source.isEnabled()) {
      throw new Error(`Source is disabled: ${effectiveId}`)
    }

    // 检查获取器是否存在
    const getter = this.getterRegistry.get(effectiveId)
    if (!getter) {
      throw new Error(`Source getter not found: ${effectiveId}`)
    }

    // 尝试从缓存获取
    const cache = await this.cacheRepository.get(effectiveId)

    if (cache) {
      // 检查是否在刷新间隔内（使用缓存，不更新）
      if (now - cache.updated < source.interval) {
        return {
          status: 'success',
          id: effectiveId,
          updatedTime: now,
          items: cache.items,
        }
      }

      // 检查是否在 TTL 内（使用缓存，但可能返回旧数据）
      if (now - cache.updated < ttl) {
        // 如果没有 latest 参数，或者用户未登录，返回缓存
        if (!latest) {
          return {
            status: 'cache',
            id: effectiveId,
            updatedTime: cache.updated,
            items: cache.items,
          }
        }
      }
    }

    // 获取新数据
    try {
      const newItems = await getter()
      const limitedItems = newItems.slice(0, 30) // 限制最多 30 条，与 newsnow 一致

      // 更新缓存（同步，与 newsnow 逻辑一致）
      // newsnow 中：if (event.context.waitUntil) event.context.waitUntil(cacheTable.set(id, newData))
      // else await cacheTable.set(id, newData)
      // 这里我们直接 await，因为不是 Cloudflare Worker 环境
      if (limitedItems.length > 0) {
        await this.cacheRepository.set(effectiveId, limitedItems)
      }

      return {
        status: 'success',
        id: effectiveId,
        updatedTime: now,
        items: limitedItems,
      }
    } catch (error) {
      // 如果获取失败，但有缓存，返回缓存（与 newsnow 逻辑一致）
      if (cache) {
        return {
          status: 'cache',
          id: effectiveId,
          updatedTime: cache.updated,
          items: cache.items,
        }
      }
      throw error
    }
  }
}

