/**
 * Source Worker 启动（Kafka Consumer）
 * 从 inputs/source/pipeline/main.ts 调用
 * 类似 Sjgz-Backend 的 server/eventbus.go
 */
import { NewDeps, type SourceDependencies } from './wiring'
import { NewEventBusServer } from '../presentation/eventbus/server'
import type { SourceConfig } from '../config/config'
import { consola } from 'consola'

export async function RunWorker(config: SourceConfig): Promise<{ deps: SourceDependencies; server: ReturnType<typeof NewEventBusServer> }> {
  // 初始化依赖
  const deps = await NewDeps(config)

  // 创建事件总线服务器
  const eventbusSrv = NewEventBusServer({
    kafka: config.kafka,
    getterService: deps.getterService,
  })

  // 启动事件总线服务器
  await eventbusSrv.Run()

  consola.success('Source Worker 已启动')
  return { deps, server: eventbusSrv }
}

