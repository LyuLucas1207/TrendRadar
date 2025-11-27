/**
 * 获取用户数据操作
 */
import { eq } from 'drizzle-orm'
import { users } from '@models/auth/user'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 获取用户数据
 */
export async function getUserData(
  db: ReturnType<PostgreSQLClient['getDb']>,
  id: string
): Promise<{ data: string; updated: number }> {
  const result = await db
    .select({ data: users.data, updated: users.updated })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (result.length === 0) {
    throw new Error(`user ${id} not found`)
  }

  consola.success(`get ${id} data`)
  return {
    data: result[0].data || '',
    updated: result[0].updated,
  }
}

