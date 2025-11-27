/**
 * Redis 客户端初始化逻辑
 * 将初始化逻辑从 constructor 中分离出来
 */
import Redis from 'ioredis'
import { consola } from 'consola'
import type { RedisConfig } from './client'

export interface InitResult {
  client: Redis
}

/**
 * 初始化 Redis 客户端
 */
export function initRedis(config: RedisConfig): InitResult {
  try {
    const client = new Redis({
      host: config.host,
      port: config.port,
      db: config.db ?? 0,
      password: config.password,
      maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
      retryStrategy: (times) => {
        const maxDelay = config.maxRetryDelay ?? 2000
        const delay = Math.min(times * (config.retryDelayMultiplier ?? 50), maxDelay)
        return delay
      },
      connectTimeout: config.connectTimeout ?? 10000,
      lazyConnect: config.lazyConnect ?? false,
    })
    
    client.on('connect', () => {
      consola.success(`✅ Redis 连接成功: ${config.host}:${config.port}/${config.db ?? 0}`)
    })
    
    client.on('error', (error) => {
      consola.error(`❌ Redis 连接错误:`, error)
    })
    
    return { client }
  } catch (error) {
    consola.error(`❌ Redis 初始化失败:`, error)
    throw new Error(`Redis 初始化失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

