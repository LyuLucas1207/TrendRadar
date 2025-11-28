/**
 * News API 服务入口
 * 类似 Sjgz-Backend 的 cmd/news/api/main.go
 */
import Fastify from 'fastify'
import { consola } from 'consola'
import { RunAPI } from '@modules/news/server/http'
import { loadNewsConfig } from '@modules/news/config/loader'

async function main() {
  // 加载配置
  const config = loadNewsConfig({
    env: process.env.NODE_ENV || 'development',
  })

  // 初始化 HTTP 服务器
  const { app, deps } = await RunAPI(Fastify({ logger: true }), config)

  // 启动服务器
  const { port, host } = config.server

  try {
    await app.listen({ port, host })
    consola.success(`News API 服务已启动: http://${host}:${port}`)
  } catch (error) {
    consola.error('启动失败:', error)
    process.exit(1)
  }

  // 优雅关闭
  process.on('SIGINT', async () => {
    consola.info('正在关闭服务...')
    await app.close()
    await deps.cleanup()
    process.exit(0)
  })
}

main().catch((error) => {
  consola.error('启动失败:', error)
  process.exit(1)
})

