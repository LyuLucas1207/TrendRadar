/**
 * 获取用户操作
 */
import { eq } from 'drizzle-orm'
import { users } from '@models/auth/user'
import type { UserRO } from '../../../../domain/user/read_model'
import { ToUserRO } from '../../mapper/user'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 根据 ID 获取用户
 */
export async function getUser(
  db: ReturnType<PostgreSQLClient['getDb']>,
  id: string
): Promise<UserRO | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return ToUserRO(result[0])
}

