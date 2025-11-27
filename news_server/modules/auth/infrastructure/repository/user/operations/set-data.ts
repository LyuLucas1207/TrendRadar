/**
 * 设置用户数据操作
 */
import { eq } from 'drizzle-orm'
import { users } from '@models/auth/user'
import type { UserUpdateWO } from '../../../../domain/user/write_model'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 设置用户数据
 */
export async function setUserData(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wo: UserUpdateWO,
  updatedTime: number = Date.now()
): Promise<void> {
  const result = await db
    .update(users)
    .set({ data: wo.data || '', updated: updatedTime })
    .where(eq(users.id, wo.id))
    .returning()

  if (result.length === 0) {
    throw new Error(`set user ${wo.id} data failed`)
  }
  consola.success(`set ${wo.id} data`)
}

