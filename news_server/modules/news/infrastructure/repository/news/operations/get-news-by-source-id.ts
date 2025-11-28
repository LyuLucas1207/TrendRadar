/**
 * 根据 sourceId 获取新闻列表操作
 */
import { eq, desc } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 根据 sourceId 获取新闻列表
 */
export async function getNewsBySourceId(
  db: ReturnType<PostgreSQLClient['getDb']>,
  sourceId: string,
  limit: number = 30,
  offset: number = 0
): Promise<NewsRO[]> {
  const results = await db
    .select()
    .from(news)
    .where(eq(news.sourceId, sourceId))
    .orderBy(desc(news.createdAt))
    .limit(limit)
    .offset(offset)

  return results.map(ToNewsRO)
}

