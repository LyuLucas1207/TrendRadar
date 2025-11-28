/**
 * 更新新闻操作
 */
import { eq } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsUpdateWO } from '../../../../domain/news/write_model'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 更新新闻
 */
export async function updateNews(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wo: NewsUpdateWO
): Promise<NewsRO> {
  const now = Date.now()
  const updateData: Partial<typeof news.$inferInsert> = {
    updatedAt: now,
  }

  if (wo.title !== undefined) updateData.title = wo.title
  if (wo.url !== undefined) updateData.url = wo.url
  if (wo.mobileUrl !== undefined) updateData.mobileUrl = wo.mobileUrl
  if (wo.pubDate !== undefined) updateData.pubDate = String(wo.pubDate)
  if (wo.extra !== undefined) updateData.extra = JSON.stringify(wo.extra)

  await db
    .update(news)
    .set(updateData)
    .where(eq(news.id, wo.id))
  
  consola.success(`update news ${wo.id}`)
  
  // 重新查询并转换为 RO
  const result = await db
    .select()
    .from(news)
    .where(eq(news.id, wo.id))
    .limit(1)
  
  return ToNewsRO(result[0])
}

