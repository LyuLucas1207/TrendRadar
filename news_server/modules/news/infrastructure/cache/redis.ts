/**
 * Redis 缓存实现
 * 类似 Sjgz-Backend 的 infrastructure/cache/redis.go
 */
import { RedisClient } from '@packages/redisx/client'
import type { ICacheRepository } from '../../domain/cache/repository'

export class RedisCacheRepository implements ICacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  async get(key: string): Promise<string | null> {
    if (!this.redisClient.enableRedis) {
      return null
    }
    return await this.redisClient.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.redisClient.enableRedis) {
      return false
    }
    return await this.redisClient.set(key, value, ttl)
  }

  async delete(key: string): Promise<boolean> {
    if (!this.redisClient.enableRedis) {
      return false
    }
    return await this.redisClient.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redisClient.enableRedis) {
      return false
    }
    return await this.redisClient.exists(key)
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.redisClient.enableRedis) {
      return false
    }
    return await this.redisClient.expire(key, ttl)
  }

  async ttl(key: string): Promise<number> {
    if (!this.redisClient.enableRedis) {
      return -2
    }
    return await this.redisClient.ttl(key)
  }
}

