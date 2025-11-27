/**
 * Redis GET 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function get(client: Redis, key: string): Promise<string | null> {
  try {
    return await client.get(key)
  } catch (error) {
    consola.error(`Redis GET 失败:`, error)
    return null
  }
}

