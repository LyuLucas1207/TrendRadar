/**
 * Source Handler
 * 类似 Sjgz-Backend 的 interfaces/http/handler/source.go
 */
import type { FastifyRequest, FastifyReply } from 'fastify'
import { GetterService } from '../../../application/getter/service'
import type { GetSourceDataQuery } from '../dto/req.dto'
import type { SourceDataResponse, ErrorResponse } from '../dto/res.dto'

export class SourceHandler {
  constructor(private readonly getterService: GetterService) {}

  /**
   * 获取源数据
   */
  async getSourceData(
    request: FastifyRequest<{ Querystring: GetSourceDataQuery }>,
    reply: FastifyReply
  ) {
    const { id, latest } = request.query

    if (!id) {
      return reply.code(400).send({ error: 'Missing id parameter' } as ErrorResponse)
    }

    try {
      const result = await this.getterService.getSourceData.execute({
        sourceId: id,
        latest: latest === 'true',
      })

      return reply.send(result as SourceDataResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message } as ErrorResponse)
    }
  }
}

