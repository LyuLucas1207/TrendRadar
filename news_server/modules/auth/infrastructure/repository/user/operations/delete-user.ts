/**
 * 删除用户操作
 */
import { eq } from 'drizzle-orm'
import { users } from '@models/auth/user'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 删除用户
 */
export async function deleteUser(
  db: ReturnType<PostgreSQLClient['getDb']>,
  id: string
): Promise<void> {
  const result = await db.delete(users).where(eq(users.id, id)).returning()

  if (result.length === 0) {
    throw new Error(`delete user ${id} failed`)
  }
  consola.success(`delete user ${id}`)
}

