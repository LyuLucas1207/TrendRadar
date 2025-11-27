/**
 * Auth Worker 启动（Kafka Consumer）
 * 从 inputs/auth/pipeline/main.ts 调用
 * 类似 Sjgz-Backend 的 server/eventbus.go
 */
import { NewDeps, type AuthDependencies } from './wiring'
import { NewEventBusServer } from '../presentation/eventbus/server'
import type { AuthConfig } from '../config/types'
import { consola } from 'consola'

export async function RunWorker(config: AuthConfig): Promise<{ deps: AuthDependencies; server: ReturnType<typeof NewEventBusServer> }> {
  // 初始化依赖（如果需要）
  const deps = await NewDeps(config)

  // 创建事件总线服务器
  const eventbusSrv = NewEventBusServer({
    kafka: config.kafka,
  })

  // 启动事件总线服务器
  await eventbusSrv.Run()

  consola.success('Auth Worker 已启动')
  return { deps, server: eventbusSrv }
}

