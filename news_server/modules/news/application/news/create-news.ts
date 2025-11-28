/**
 * 创建新闻用例
 * 类似 Sjgz-Backend 的 application/news/create.go
 */
import type { INewsRepository } from '../../domain/news/repository'
import type { NewsCreateWO } from '../../domain/news/write_model'
import type { NewsRO } from '../../domain/news/read_model'

export interface CreateNewsParams {
  sourceId: string
  originalId: string | number
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: NewsCreateWO['extra']
}

export class CreateNews {
  constructor(private readonly newsRepository: INewsRepository) {}

  async execute(params: CreateNewsParams): Promise<NewsRO> {
    const wo: NewsCreateWO = {
      sourceId: params.sourceId,
      originalId: params.originalId,
      title: params.title,
      url: params.url,
      mobileUrl: params.mobileUrl,
      pubDate: params.pubDate,
      extra: params.extra,
    }

    return await this.newsRepository.createNews(wo)
  }
}

