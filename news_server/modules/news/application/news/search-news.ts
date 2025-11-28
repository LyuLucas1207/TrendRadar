/**
 * 搜索新闻用例
 */
import type { INewsRepository } from '../../domain/news/repository'
import type { NewsRO } from '../../domain/news/read_model'

export interface SearchNewsParams {
  query: string
  limit?: number
  offset?: number
}

export class SearchNews {
  constructor(private readonly newsRepository: INewsRepository) {}

  async execute(params: SearchNewsParams): Promise<NewsRO[]> {
    return await this.newsRepository.searchNews(
      params.query,
      params.limit,
      params.offset
    )
  }
}

