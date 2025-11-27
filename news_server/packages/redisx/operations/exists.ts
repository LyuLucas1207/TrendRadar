/**
 * Redis EXISTS 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function exists(client: Redis, key: string): Promise<boolean> {
  try {
    const result = await client.exists(key)
    return result > 0
  } catch (error) {
    consola.error(`Redis EXISTS 失败:`, error)
    return false
  }
}

