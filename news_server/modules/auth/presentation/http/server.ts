/**
 * HTTP 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/http/server.go
 */
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { Registry } from './registry'
import { AuthHandler } from './handler/auth'
import { Router } from './router'
import type { AuthDependencies } from '../../server/wiring'

export interface HTTPDeps {
  authService: AuthDependencies['authService']
  userService: AuthDependencies['userService']
  githubOAuth: AuthDependencies['githubOAuth']
}

export function NewHTTPServer(deps: HTTPDeps): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  // 创建 handlers
  const registry = new Registry(
    new AuthHandler(
      deps.authService,
      deps.userService,
      deps.githubOAuth
    )
  )

  // 注册路由
  const router = new Router(app, registry)
  router.RegisterRoutes()

  return app
}

