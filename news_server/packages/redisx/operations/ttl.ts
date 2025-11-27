/**
 * Redis TTL 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function ttl(client: Redis, key: string): Promise<number> {
  try {
    return await client.ttl(key)
  } catch (error) {
    consola.error(`Redis TTL 失败:`, error)
    return -2
  }
}

