/**
 * 批量创建新闻用例
 */
import type { INewsRepository } from '../../domain/news/repository'
import type { NewsCreateWO } from '../../domain/news/write_model'
import type { NewsRO } from '../../domain/news/read_model'

export interface CreateNewsBatchParams {
  items: Array<{
    sourceId: string
    originalId: string | number
    title: string
    url: string
    mobileUrl?: string
    pubDate?: number | string
    extra?: NewsCreateWO['extra']
  }>
}

export class CreateNewsBatch {
  constructor(private readonly newsRepository: INewsRepository) {}

  async execute(params: CreateNewsBatchParams): Promise<NewsRO[]> {
    const wos: NewsCreateWO[] = params.items.map(item => ({
      sourceId: item.sourceId,
      originalId: item.originalId,
      title: item.title,
      url: item.url,
      mobileUrl: item.mobileUrl,
      pubDate: item.pubDate,
      extra: item.extra,
    }))

    return await this.newsRepository.createNewsBatch(wos)
  }
}

