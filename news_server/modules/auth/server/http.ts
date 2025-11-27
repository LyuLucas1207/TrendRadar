/**
 * Auth HTTP 服务器启动
 * 从 inputs/auth/api/main.ts 调用
 * 类似 Sjgz-Backend 的 server/http.go
 */
import type { FastifyInstance } from 'fastify'
import { NewDeps, type AuthDependencies } from './wiring'
import { NewHTTPServer } from '../presentation/http/server'
import type { AuthConfig } from '../config/config'
import { consola } from 'consola'

export async function RunAPI(
  _fastify: FastifyInstance,
  config: AuthConfig
): Promise<{ app: FastifyInstance; deps: AuthDependencies }> {
  // 初始化依赖
  const deps = await NewDeps(config)

  // 创建 HTTP 服务器
  const app = NewHTTPServer({
    authService: deps.authService,
    userService: deps.userService,
    githubOAuth: deps.githubOAuth,
  })

  consola.success('Auth HTTP 服务器已初始化')
  return { app, deps }
}
