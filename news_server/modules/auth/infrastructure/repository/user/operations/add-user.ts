/**
 * 添加用户操作（纯添加）
 * 如果用户已存在则抛出错误
 */
import { eq } from 'drizzle-orm'
import { users } from '@models/auth/user'
import type { UserCreateWO } from '../../../../domain/user/write_model'
import type { UserRO } from '../../../../domain/user/read_model'
import { ToUserRO } from '../../mapper/user'
import { getUser } from './get-user'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 添加用户（纯添加，如果用户已存在则抛出错误）
 */
export async function addUser(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wo: UserCreateWO
): Promise<UserRO> {
  const existing = await getUser(db, wo.id)
  
  if (existing) {
    throw new Error(`User with id ${wo.id} already exists`)
  }

  const now = Date.now()
  
  // 创建新用户
  await db.insert(users).values({
    id: wo.id,
    email: wo.email,
    data: wo.data || '',
    type: wo.type,
    created: now,
    updated: now,
  })
  consola.success(`add user ${wo.id}`)
  
  // 重新查询并转换为 RO
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, wo.id))
    .limit(1)
  return ToUserRO(result[0])
}
