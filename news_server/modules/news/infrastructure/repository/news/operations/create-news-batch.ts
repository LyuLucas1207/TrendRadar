/**
 * 批量创建新闻操作
 */
import { inArray } from 'drizzle-orm'
import { news } from '@models/news/news'
import type { NewsCreateWO } from '../../../../domain/news/write_model'
import type { NewsRO } from '../../../../domain/news/read_model'
import { ToNewsRO } from '../../mapper/news'
import { News } from '../../../../domain/news/entity'
import { consola } from 'consola'
import type { PostgreSQLClient } from '@packages/postgresqlx/client'

/**
 * 批量创建新闻
 */
export async function createNewsBatch(
  db: ReturnType<PostgreSQLClient['getDb']>,
  wos: NewsCreateWO[]
): Promise<NewsRO[]> {
  if (wos.length === 0) {
    return []
  }

  const now = Date.now()
  const values = wos.map(wo => ({
    id: News.generateId(wo.sourceId, wo.originalId),
    sourceId: wo.sourceId,
    originalId: String(wo.originalId),
    title: wo.title,
    url: wo.url,
    mobileUrl: wo.mobileUrl,
    pubDate: wo.pubDate ? String(wo.pubDate) : undefined,
    extra: wo.extra ? JSON.stringify(wo.extra) : undefined,
    createdAt: now,
    updatedAt: now,
  }))

  // 使用 INSERT ... ON CONFLICT DO NOTHING 避免重复插入
  await db.insert(news).values(values).onConflictDoNothing()
  
  consola.success(`create news batch: ${wos.length} items`)
  
  // 重新查询所有创建的新闻
  const ids = values.map(v => v.id)
  const results = await db
    .select()
    .from(news)
    .where(inArray(news.id, ids))
  
  return results.map(ToNewsRO)
}

