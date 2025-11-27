/**
 * User 表初始化工具函数
 * 将表创建逻辑从 Repository 中分离出来，保持 Repository 类简洁
 */
import { sql } from 'drizzle-orm'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'
import { consola } from 'consola'

/**
 * 初始化 User 表
 * @param db Drizzle 数据库实例
 */
export async function initUserTable(
  db: ReturnType<PostgreSQLClient['getDb']>
): Promise<void> {
  try {
    // 检查表是否存在
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user'
      );
    `)
    
    const exists = (tableExists.rows[0] as { exists: boolean }).exists
    
    if (exists) {
      consola.info('User table already exists')
      return
    }

    // 创建表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "email" text,
        "data" text DEFAULT '',
        "type" text NOT NULL,
        "created" bigint NOT NULL,
        "updated" bigint NOT NULL
      );
    `)

    // 创建索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_user_id" ON "user" ("id");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user" ("email");
    `)

    consola.success('✅ User table created successfully')
  } catch (error) {
    consola.error('❌ Failed to create user table:', error)
    throw error
  }
}

