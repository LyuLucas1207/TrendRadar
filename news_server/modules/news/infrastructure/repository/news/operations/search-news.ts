/**
 * 搜索新闻操作
 */
import { sql, desc } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 搜索新闻（使用 PostgreSQL 全文搜索）
 */
export async function searchNews(
  db: ReturnType<PostgreSQLClient['getDb']>,
  query: string,
  limit: number = 30,
  offset: number = 0
): Promise<NewsRO[]> {
  // 使用 PostgreSQL 全文搜索
  const results = await db
    .select()
    .from(news)
    .where(sql`to_tsvector('english', ${news.title}) @@ plainto_tsquery('english', ${query})`)
    .orderBy(desc(news.createdAt))
    .limit(limit)
    .offset(offset)

  return results.map(ToNewsRO)
}

