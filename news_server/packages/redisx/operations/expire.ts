/**
 * Redis EXPIRE 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function expire(client: Redis, key: string, ttl: number): Promise<boolean> {
  try {
    const result = await client.expire(key, ttl)
    return result === 1
  } catch (error) {
    consola.error(`Redis EXPIRE 失败:`, error)
    return false
  }
}

