/**
 * Source HTTP 服务器启动
 * 类似 Sjgz-Backend 的 server/http.go
 */
import type { FastifyInstance } from 'fastify'
import { NewDeps, type SourceDependencies } from './wiring'
import { NewHTTPServer } from '../presentation/http/server'
import type { SourceConfig } from '../config/config'
import { consola } from 'consola'

export async function RunAPI(
  _fastify: FastifyInstance,
  config: SourceConfig
): Promise<{ app: FastifyInstance; deps: SourceDependencies }> {
  // 初始化依赖
  const deps = await NewDeps(config)

  // 创建 HTTP 服务器
  const app = NewHTTPServer({
    getterService: deps.getterService,
  })

  consola.success('Source HTTP 服务器已初始化')
  return { app, deps }
}

