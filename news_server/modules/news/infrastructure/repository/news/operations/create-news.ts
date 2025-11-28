/**
 * 创建新闻操作
 */
import { eq } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsCreateWO } from '../../../../domain/news/write_model'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import { News } from '../../../../domain/news/entity'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 创建新闻
 */
export async function createNews(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wo: NewsCreateWO
): Promise<NewsRO> {
  const id = News.generateId(wo.sourceId, wo.originalId)
  const now = Date.now()

  // 检查是否已存在
  const existing = await db
    .select()
    .from(news)
    .where(eq(news.id, id))
    .limit(1)

  if (existing.length > 0) {
    // 如果已存在，返回现有记录
    return ToNewsRO(existing[0])
  }

  // 创建新新闻
  await db.insert(news).values({
    id,
    sourceId: wo.sourceId,
    originalId: String(wo.originalId),
    title: wo.title,
    url: wo.url,
    mobileUrl: wo.mobileUrl,
    pubDate: wo.pubDate ? String(wo.pubDate) : undefined,
    extra: wo.extra ? JSON.stringify(wo.extra) : undefined,
    createdAt: now,
    updatedAt: now,
  })
  
  consola.success(`create news ${id}`)
  
  // 重新查询并转换为 RO
  const result = await db
    .select()
    .from(news)
    .where(eq(news.id, id))
    .limit(1)
  
  return ToNewsRO(result[0])
}

