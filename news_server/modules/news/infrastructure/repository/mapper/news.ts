/**
 * News 映射器
 * 将数据库模型转换为领域模型
 */
import type { NewsRO } from '../../../domain/news/read_model'
import type { News as NewsModel } from '@models/news/news'

/**
 * 将数据库模型转换为读模型
 */
export function ToNewsRO(model: NewsModel): NewsRO {
  return {
    id: model.id,
    sourceId: model.sourceId,
    originalId: model.originalId,
    title: model.title,
    url: model.url,
    mobileUrl: model.mobileUrl ?? undefined,
    pubDate: model.pubDate ?? undefined,
    extra: model.extra ? JSON.parse(model.extra) : undefined,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}

