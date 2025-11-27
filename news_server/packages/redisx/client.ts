/**
 * Redis 客户端封装
 * 使用 ioredis
 */
import type Redis from 'ioredis'
import { consola } from 'consola'
import { initRedis } from './init'
import { get as getOp } from './operations/get'
import { set as setOp } from './operations/set'
import { deleteKey as deleteOp } from './operations/delete'
import { exists as existsOp } from './operations/exists'
import { expire as expireOp } from './operations/expire'
import { ttl as ttlOp } from './operations/ttl'

export interface RedisConfig {
  host: string
  port: number
  db?: number
  password?: string
  enableRedis?: boolean
  defaultTTL?: number // 默认存储时间（秒），如果未指定则不过期
  // 连接配置
  maxRetriesPerRequest?: number // 每个请求的最大重试次数，默认 3
  retryDelayMultiplier?: number // 重试延迟倍数（毫秒），默认 50
  maxRetryDelay?: number // 最大重试延迟（毫秒），默认 2000
  connectTimeout?: number // 连接超时时间（毫秒），默认 10000
  lazyConnect?: boolean // 是否延迟连接，默认 false
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
        const { client } = initRedis(config)
        this.client = client
      } catch (error) {
        this.enableRedis = false
        throw error
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
    if (!this.enableRedis || !this.client)  return null
    return getOp(this.client, key)
  }

  async set(key: string, value: string, ex?: number): Promise<boolean> {
    if (!this.enableRedis || !this.client) return false
    return setOp(this.client, key, value, ex, this.defaultTTL)
  }

  async delete(key: string): Promise<boolean> {
    if (!this.enableRedis || !this.client) return false
    return deleteOp(this.client, key)
  }

  async exists(key: string): Promise<boolean> {
    if (!this.enableRedis || !this.client) return false
    return existsOp(this.client, key)
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.enableRedis || !this.client) return false
    return expireOp(this.client, key, ttl)
  }

  async ttl(key: string): Promise<number> {
    if (!this.enableRedis || !this.client) return -2
    return ttlOp(this.client, key)
  }

  /**
   * 确保 Redis 连接已建立
   * 如果连接未就绪，等待连接建立
   */
  async ensureConnected(): Promise<void> {
    if (!this.enableRedis || !this.client) {
      throw new Error('Redis 未启用或未初始化')
    }

    if (this.client.status === 'ready') return
    

    // 等待连接就绪
    await new Promise<void>((resolve, reject) => {
      if (this.client!.status === 'ready') {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Redis 连接超时: ${this.client?.options.host}:${this.client?.options.port}`))
      }, 10000) // 10秒超时

      this.client!.once('ready', () => {
        clearTimeout(timeout)
        resolve()
      })

      this.client!.once('error', (error) => {
        clearTimeout(timeout)
        reject(new Error(`Redis 连接失败: ${error.message}`))
      })
    })
  }

  async close() {
    if (this.client) {
      await this.client.quit()
      consola.info('Redis 连接已关闭')
    }
  }
}

