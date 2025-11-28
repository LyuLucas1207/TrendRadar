/**
 * HTTP 路由注册
 * 类似 Sjgz-Backend 的 interfaces/http/router.go
 */
import type { FastifyInstance } from 'fastify'
import { Registry } from './registry'
import type { GetNewsQuery, SearchNewsQuery } from './dto/req.dto'

export class Router {
  constructor(
    private readonly app: FastifyInstance,
    private readonly handlers: Registry
  ) {}

  RegisterRoutes() {
    // 获取新闻
    this.app.get<{ Querystring: GetNewsQuery }>('/news/api/news', async (request, reply) => {
      return this.handlers.News.getNews(request, reply)
    })

    // 搜索新闻
    this.app.get<{ Querystring: SearchNewsQuery }>('/news/api/news/search', async (request, reply) => {
      return this.handlers.News.searchNews(request, reply)
    })
  }
}

