/**
 * Redis SET 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function set(
  client: Redis,
  key: string,
  value: string,
  ttl?: number,
  defaultTTL?: number
): Promise<boolean> {
  try {
    // 使用传入的 TTL，如果没有则使用默认 TTL
    const finalTTL = ttl ?? defaultTTL
    if (finalTTL) {
      await client.setex(key, finalTTL, value)
    } else {
      await client.set(key, value)
    }
    return true
  } catch (error) {
    consola.error(`Redis SET 失败:`, error)
    return false
  }
}

