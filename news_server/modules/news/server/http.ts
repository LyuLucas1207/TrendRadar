/**
 * News HTTP 服务器启动
 * 从 inputs/news/api/main.ts 调用
 * 类似 Sjgz-Backend 的 server/http.go
 */
import type { FastifyInstance } from 'fastify'
import { NewDeps, type NewsDependencies } from './wiring'
import { NewHTTPServer } from '../presentation/http/server'
import type { NewsConfig } from '../config/config'
import { consola } from 'consola'

export async function RunAPI(
  _fastify: FastifyInstance,
  config: NewsConfig
): Promise<{ app: FastifyInstance; deps: NewsDependencies }> {
  // 初始化依赖
  const deps = await NewDeps(config)

  // 创建 HTTP 服务器
  const app = NewHTTPServer({
    newsService: deps.newsService,
  })

  consola.success('News HTTP 服务器已初始化')
  return { app, deps }
}

