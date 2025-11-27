/**
 * Redis DELETE 操作
 */
import type Redis from 'ioredis'
import { consola } from 'consola'

export async function deleteKey(client: Redis, key: string): Promise<boolean> {
  try {
    const result = await client.del(key)
    return result > 0
  } catch (error) {
    consola.error(`Redis DELETE 失败:`, error)
    return false
  }
}

