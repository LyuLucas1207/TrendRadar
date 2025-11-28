/**
 * 根据 ID 获取新闻操作
 */
import { eq } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 根据 ID 获取新闻
 */
export async function getNewsById(
  db: ReturnType<PostgreSQLClient['getDb']>,
  id: string
): Promise<NewsRO | null> {
  const result = await db
    .select()
    .from(news)
    .where(eq(news.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return ToNewsRO(result[0])
}

