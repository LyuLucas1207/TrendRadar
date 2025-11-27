/**
 * Cache 仓储实现（Redis）
 * 类似 Sjgz-Backend 的 infrastructure/repository/cache/redis.go
 */
import { RedisClient } from '@packages/redisx/client'
import type { ICacheRepository } from '../../domain/cache/repository'
import type { NewsItem } from '../../domain/newsitem/entity'
import type { CacheInfo } from '../../domain/cache/repository'
import { consola } from 'consola'

export class RedisCacheRepository implements ICacheRepository {
  private readonly keyPrefix = 'source:cache:'

  constructor(private readonly redisClient: RedisClient) {}

  private getKey(id: string): string {
    return `${this.keyPrefix}${id}`
  }

  async get(id: string): Promise<CacheInfo | undefined> {
    const key = this.getKey(id)
    const data = await this.redisClient.get(key)

    if (!data) {
      return undefined
    }

    try {
      const parsed = JSON.parse(data) as { items: NewsItem[]; updated: number }
      return {
        id,
        items: parsed.items,
        updated: parsed.updated,
      }
    } catch (error) {
      consola.error(`Failed to parse cache for ${id}:`, error)
      return undefined
    }
  }

  async set(id: string, items: NewsItem[]): Promise<void> {
    const key = this.getKey(id)
    const now = Date.now()
    const data = JSON.stringify({
      items,
      updated: now,
    })

    // 设置缓存，TTL 为 1 小时（3600 秒）
    await this.redisClient.set(key, data, 3600)
    consola.success(`Set cache for ${id}`)
  }

  async getEntire(keys: string[]): Promise<CacheInfo[]> {
    if (keys.length === 0) {
      return []
    }

    const redisKeys = keys.map((k) => this.getKey(k))
    const values = await Promise.all(
      redisKeys.map((key) => this.redisClient.get(key))
    )

    const results: CacheInfo[] = []
    for (let i = 0; i < keys.length; i++) {
      const value = values[i]
      if (value) {
        try {
          const parsed = JSON.parse(value) as { items: NewsItem[]; updated: number }
          results.push({
            id: keys[i],
            items: parsed.items,
            updated: parsed.updated,
          })
        } catch (error) {
          consola.error(`Failed to parse cache for ${keys[i]}:`, error)
        }
      }
    }

    return results
  }

  async delete(id: string): Promise<void> {
    const key = this.getKey(id)
    await this.redisClient.delete(key)
    consola.success(`Deleted cache for ${id}`)
  }
}

