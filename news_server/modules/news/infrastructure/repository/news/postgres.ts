/**
 * News 仓储实现（PostgreSQL）
 * 类似 Sjgz-Backend 的 infrastructure/repository/news/postgres.go
 * 
 * 注意：所有业务逻辑都提取到 operations/ 目录下的独立函数中
 * Repository 类只负责协调和接口实现，保持简洁
 */
import { PostgreSQLClient } from '@packages/postgresqlx/client'
import type { INewsRepository } from '../../../domain/news/repository'
import type { NewsRO } from '../../../domain/news/read_model'
import type { NewsCreateWO, NewsUpdateWO } from '../../../domain/news/write_model'
import { initNewsTable } from './init-table'
import { createNews as createNewsOp } from './operations/create-news'
import { createNewsBatch as createNewsBatchOp } from './operations/create-news-batch'
import { getNewsById as getNewsByIdOp } from './operations/get-news-by-id'
import { getNewsBySourceId as getNewsBySourceIdOp } from './operations/get-news-by-source-id'
import { searchNews as searchNewsOp } from './operations/search-news'
import { updateNews as updateNewsOp } from './operations/update-news'
import { deleteNews as deleteNewsOp } from './operations/delete-news'

export class NewsRepository implements INewsRepository {
  constructor(private readonly db: ReturnType<PostgreSQLClient['getDb']>) {}

  async init(): Promise<void> {
    await initNewsTable(this.db)
  }

  async createNews(wo: NewsCreateWO): Promise<NewsRO> {
    return createNewsOp(this.db, wo)
  }

  async createNewsBatch(wos: NewsCreateWO[]): Promise<NewsRO[]> {
    return createNewsBatchOp(this.db, wos)
  }

  async getNewsById(id: string): Promise<NewsRO | null> {
    return getNewsByIdOp(this.db, id)
  }

  async getNewsBySourceId(sourceId: string, limit?: number, offset?: number): Promise<NewsRO[]> {
    return getNewsBySourceIdOp(this.db, sourceId, limit, offset)
  }

  async searchNews(query: string, limit?: number, offset?: number): Promise<NewsRO[]> {
    return searchNewsOp(this.db, query, limit, offset)
  }

  async updateNews(wo: NewsUpdateWO): Promise<NewsRO> {
    return updateNewsOp(this.db, wo)
  }

  async deleteNews(id: string): Promise<void> {
    return deleteNewsOp(this.db, id)
  }
}

