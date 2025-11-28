/**
 * HTTP 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/http/server.go
 */
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { Router } from './router'
import { Registry } from './registry'
import { NewsHandler } from './handler/news'
import type { NewsDependencies } from '../../server/wiring'

export interface HTTPDeps {
  newsService: NewsDependencies['newsService']
}

export function NewHTTPServer(deps: HTTPDeps): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  // 创建 handlers
  const registry = new Registry(
    new NewsHandler(deps.newsService)
  )

  // 注册路由
  const router = new Router(app, registry)
  router.RegisterRoutes()

  return app
}

