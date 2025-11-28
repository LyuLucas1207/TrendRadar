/**
 * News Handler
 * 类似 Sjgz-Backend 的 interfaces/http/handler/news.go
 */
import type { FastifyRequest, FastifyReply } from 'fastify'
import { NewsService } from '../../../application/news/service'
import type { GetNewsQuery, SearchNewsQuery } from '../dto/req.dto'
import type { NewsResponse, ErrorResponse } from '../dto/res.dto'

export class NewsHandler {
  constructor(private readonly newsService: NewsService) {}

  /**
   * 获取新闻
   */
  async getNews(
    request: FastifyRequest<{ Querystring: GetNewsQuery }>,
    reply: FastifyReply
  ) {
    const { id, sourceId, limit, offset } = request.query

    try {
      const result = await this.newsService.getNews.execute({
        id,
        sourceId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      })

      return reply.send({
        success: true,
        data: Array.isArray(result) ? result : [result],
      } as NewsResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message } as ErrorResponse)
    }
  }

  /**
   * 搜索新闻
   */
  async searchNews(
    request: FastifyRequest<{ Querystring: SearchNewsQuery }>,
    reply: FastifyReply
  ) {
    const { q, limit, offset } = request.query

    if (!q) {
      return reply.code(400).send({ error: 'Missing query parameter' } as ErrorResponse)
    }

    try {
      const result = await this.newsService.searchNews.execute({
        query: q,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      })

      return reply.send({
        success: true,
        data: result,
      } as NewsResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message } as ErrorResponse)
    }
  }
}

