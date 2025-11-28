/**
 * HTTP 路由注册
 * 类似 Sjgz-Backend 的 interfaces/http/router.go
 */
import type { FastifyInstance } from 'fastify'
import { Registry } from './registry'
import type { GetSourceDataQuery } from './dto/req.dto'

export class Router {
  constructor(
    private readonly app: FastifyInstance,
    private readonly handlers: Registry
  ) {}

  RegisterRoutes() {
    // 获取源数据
    this.app.get<{ Querystring: GetSourceDataQuery }>('/source/api/s', async (request, reply) => {
      return this.handlers.Source.getSourceData(request, reply)
    })
  }
}

