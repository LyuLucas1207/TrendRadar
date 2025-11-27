/**
 * Source Worker 服务入口（Kafka Consumer）
 * 类似 Sjgz-Backend 的 cmd/source/worker/main.go
 */
import { consola } from 'consola'
import { RunWorker } from '@modules/source/server/kafka'
import { loadSourceConfig } from '@modules/source/config/loader'

async function main() {
  // 加载配置
  const config = loadSourceConfig({
    env: process.env.NODE_ENV || 'development',
  })

  // 启动 Worker
  const { deps, server } = await RunWorker(config)

  consola.success('Source Worker 服务已启动')

  // 保持运行
  process.on('SIGINT', async () => {
    consola.info('正在关闭服务...')
    await server.Close()
    await deps.cleanup()
    process.exit(0)
  })
}

main().catch((error) => {
  consola.error('启动失败:', error)
  process.exit(1)
})

