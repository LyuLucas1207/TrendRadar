/**
 * News Service
 * 类似 Sjgz-Backend 的 application/news/service.go
 * 负责 news 相关的业务逻辑
 */
import { CreateNews } from './create-news'
import { CreateNewsBatch } from './create-news-batch'
import { GetNews } from './get-news'
import { SearchNews } from './search-news'
import type { INewsRepository } from '../../domain/news/repository'

export class NewsService {
  public readonly createNews: CreateNews
  public readonly createNewsBatch: CreateNewsBatch
  public readonly getNews: GetNews
  public readonly searchNews: SearchNews

  constructor(newsRepository: INewsRepository) {
    this.createNews = new CreateNews(newsRepository)
    this.createNewsBatch = new CreateNewsBatch(newsRepository)
    this.getNews = new GetNews(newsRepository)
    this.searchNews = new SearchNews(newsRepository)
  }
}

