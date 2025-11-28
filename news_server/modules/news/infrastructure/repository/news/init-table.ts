/**
 * News 表初始化工具函数
 * 将表创建逻辑从 Repository 中分离出来，保持 Repository 类简洁
 */
import { sql } from 'drizzle-orm'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'
import { consola } from 'consola'

/**
 * 初始化 News 表
 * @param db Drizzle 数据库实例
 */
export async function initNewsTable(
  db: ReturnType<PostgreSQLClient['getDb']>
): Promise<void> {
  try {
    // 检查表是否存在
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'news'
      );
    `)
    
    const exists = (tableExists.rows[0] as { exists: boolean }).exists
    
    if (exists) {
      consola.info('News table already exists')
      return
    }

    // 创建表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "news" (
        "id" text PRIMARY KEY,
        "source_id" text NOT NULL,
        "original_id" text NOT NULL,
        "title" text NOT NULL,
        "url" text NOT NULL,
        "mobile_url" text,
        "pub_date" text,
        "extra" jsonb,
        "created_at" bigint NOT NULL,
        "updated_at" bigint NOT NULL
      );
    `)

    // 创建索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_news_id" ON "news" ("id");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_news_source_id" ON "news" ("source_id");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_news_created_at" ON "news" ("created_at");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_news_updated_at" ON "news" ("updated_at");
    `)

    // 全文搜索索引（PostgreSQL）
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_news_title_search" 
      ON "news" USING gin(to_tsvector('english', "title"));
    `)

    consola.success('✅ News table created successfully')
  } catch (error) {
    consola.error('❌ Failed to create news table:', error)
    throw error
  }
}

