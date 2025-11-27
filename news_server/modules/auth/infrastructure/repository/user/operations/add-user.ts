/**
 * 添加或更新用户操作
 * 将业务逻辑从 Repository 中分离
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
 * 添加或更新用户
 */
export async function addUser(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wo: UserCreateWO
): Promise<UserRO> {
  const existing = await getUser(db, wo.id)
  const now = Date.now()

  if (!existing) {
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
  } else if (existing.email !== wo.email || existing.type !== wo.type) {
    // 更新用户信息
    await db
      .update(users)
      .set({ email: wo.email, updated: now })
      .where(eq(users.id, wo.id))
    consola.success(`update user ${wo.id} email`)
    
    // 重新查询并转换为 RO
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, wo.id))
      .limit(1)
    return ToUserRO(result[0])
  } else {
    consola.info(`user ${wo.id} already exists`)
    return existing
  }
}

