/**
 * 删除新闻操作
 */
import { eq } from 'drizzle-orm'
import { news } from '@models/news/news'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 删除新闻
 */
export async function deleteNews(
  db: ReturnType<PostgreSQLClient['getDb']>,
  id: string
): Promise<void> {
  await db
    .delete(news)
    .where(eq(news.id, id))
  
  consola.success(`delete news ${id}`)
}

