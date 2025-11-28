/**
 * News Worker 启动（Kafka Consumer）
 * 从 inputs/news/pipeline/main.ts 调用
 * 类似 Sjgz-Backend 的 server/eventbus.go
 */
import { NewDeps, type NewsDependencies } from './wiring'
import { NewEventBusServer } from '../presentation/eventbus/server'
import { NewsHandler } from '../presentation/eventbus/handler/news'
import type { NewsConfig } from '../config/config'
import { consola } from 'consola'

export async function RunWorker(config: NewsConfig): Promise<{ deps: NewsDependencies; server: ReturnType<typeof NewEventBusServer> }> {
  // 初始化依赖（如果需要）
  const deps = await NewDeps(config)

  // 创建事件处理器
  const newsHandler = new NewsHandler(deps.newsService)

  // 创建事件总线服务器
  const eventbusSrv = NewEventBusServer({
    kafka: config.kafka,
  }, newsHandler)

  // 启动事件总线服务器
  await eventbusSrv.Run()

  consola.success('News Worker 已启动')
  return { deps, server: eventbusSrv }
}

