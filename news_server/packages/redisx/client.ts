/**
 * Redis 客户端封装
 * 使用 ioredis
 */
import Redis from 'ioredis'
import { consola } from 'consola'

export interface RedisConfig {
  host: string
  port: number
  db?: number
  password?: string
  enableRedis?: boolean
  defaultTTL?: number // 默认存储时间（秒），如果未指定则不过期
}

export class RedisClient {
  private client: Redis | null = null
  public enableRedis: boolean
  private defaultTTL: number | undefined

  constructor(config: RedisConfig) {
    this.defaultTTL = config.defaultTTL
    this.enableRedis = config.enableRedis ?? false

    if (this.enableRedis) {
      try {
        this.client = new Redis({
          host: config.host,
          port: config.port,
          db: config.db ?? 0,
          password: config.password,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
        })
        
        this.client.on('connect', () => {
          consola.success(`✅ Redis 连接成功: ${config.host}:${config.port}/${config.db ?? 0}`)
        })
        
        this.client.on('error', (error) => {
          consola.error(`❌ Redis 连接错误:`, error)
        })
      } catch (error) {
        consola.error(`❌ Redis 初始化失败:`, error)
        this.enableRedis = false
      }
    }
  }

  getClient() {
    if (!this.enableRedis || !this.client) {
      throw new Error('Redis 未启用或未初始化')
    }
    return this.client
  }

  async get(key: string): Promise<string | null> {
    if (!this.enableRedis || !this.client) {
      return null
    }
    try {
      return await this.client.get(key)
    } catch (error) {
      consola.error(`Redis GET 失败:`, error)
      return null
    }
  }

  async set(key: string, value: string, ex?: number): Promise<boolean> {
    if (!this.enableRedis || !this.client) {
      return false
    }
    try {
      // 使用传入的 TTL，如果没有则使用默认 TTL
      const ttl = ex ?? this.defaultTTL
      if (ttl) {
        await this.client.setex(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      consola.error(`Redis SET 失败:`, error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.enableRedis || !this.client) {
      return false
    }
    try {
      const result = await this.client.del(key)
      return result > 0
    } catch (error) {
      consola.error(`Redis DELETE 失败:`, error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.enableRedis || !this.client) {
      return false
    }
    try {
      const result = await this.client.exists(key)
      return result > 0
    } catch (error) {
      consola.error(`Redis EXISTS 失败:`, error)
      return false
    }
  }

  async close() {
    if (this.client) {
      await this.client.quit()
      consola.info('Redis 连接已关闭')
    }
  }
}

