/**
 * News 仓储接口
 * 类似 Sjgz-Backend 的 domain/news/repository.go
 */
import type { NewsRO } from './read_model'
import type { NewsCreateWO, NewsUpdateWO } from './write_model'

export interface INewsRepository {
  /**
   * 初始化表结构
   */
  init(): Promise<void>

  /**
   * 创建新闻
   */
  createNews(wo: NewsCreateWO): Promise<NewsRO>

  /**
   * 批量创建新闻
   */
  createNewsBatch(wos: NewsCreateWO[]): Promise<NewsRO[]>

  /**
   * 根据 ID 获取新闻
   */
  getNewsById(id: string): Promise<NewsRO | null>

  /**
   * 根据 sourceId 获取新闻列表
   */
  getNewsBySourceId(sourceId: string, limit?: number, offset?: number): Promise<NewsRO[]>

  /**
   * 搜索新闻
   */
  searchNews(query: string, limit?: number, offset?: number): Promise<NewsRO[]>

  /**
   * 更新新闻
   */
  updateNews(wo: NewsUpdateWO): Promise<NewsRO>

  /**
   * 删除新闻
   */
  deleteNews(id: string): Promise<void>
}

