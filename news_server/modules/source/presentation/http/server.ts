/**
 * HTTP 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/http/server.go
 */
import type { FastifyInstance } from 'fastify'
import fastify from 'fastify'
import { Router } from './router'
import { Registry } from './registry'
import { SourceHandler } from './handler/source'
import type { GetterService } from '../../application/getter/service'

export interface NewHTTPServerOptions {
  getterService: GetterService
}

export function NewHTTPServer(options: NewHTTPServerOptions): FastifyInstance {
  const app = fastify({
    logger: true,
  })

  // 创建 Handler
  const sourceHandler = new SourceHandler(options.getterService)

  // 创建 Registry
  const registry = new Registry(sourceHandler)

  // 创建 Router 并注册路由
  const router = new Router(app, registry)
  router.RegisterRoutes()

  return app
}

