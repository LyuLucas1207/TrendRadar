/**
 * 获取新闻用例
 */
import type { INewsRepository } from '../../domain/news/repository'
import type { NewsRO } from '../../domain/news/read_model'

export interface GetNewsParams {
  id?: string
  sourceId?: string
  limit?: number
  offset?: number
}

export class GetNews {
  constructor(private readonly newsRepository: INewsRepository) {}

  async execute(params: GetNewsParams): Promise<NewsRO | NewsRO[]> {
    if (params.id) {
      const news = await this.newsRepository.getNewsById(params.id)
      return news || []
    }

    if (params.sourceId) {
      return await this.newsRepository.getNewsBySourceId(
        params.sourceId,
        params.limit,
        params.offset
      )
    }

    return []
  }
}

