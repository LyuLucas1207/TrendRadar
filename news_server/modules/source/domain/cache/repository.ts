/**
 * Cache 仓储接口
 * 类似 Sjgz-Backend 的 domain/cache/repository.go
 */
import type { NewsItem } from '../newsitem/entity'

export interface CacheInfo {
  id: string
  items: NewsItem[]
  updated: number
}

export interface ICacheRepository {
  /**
   * 获取缓存
   */
  get(key: string): Promise<CacheInfo | undefined>

  /**
   * 设置缓存
   */
  set(key: string, items: NewsItem[]): Promise<void>

  /**
   * 批量获取缓存
   */
  getEntire(keys: string[]): Promise<CacheInfo[]>

  /**
   * 删除缓存
   */
  delete(key: string): Promise<void>
}

