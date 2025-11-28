/**
 * 依赖注入/装配
 * 类似 Sjgz-Backend 的 wiring.go
 */
import { PostgreSQLClient } from '@packages/postgresqlx/client'
import { RedisClient } from '@packages/redisx/client'
import { NewsRepository } from '../infrastructure/repository/news/postgres'
import { RedisCacheRepository } from '../infrastructure/cache/redis'
import { NewsService } from '../application/news/service'
import type { NewsConfig } from '../config/config'
import type { ICacheRepository } from '../domain/cache/repository'
import { consola } from 'consola'

export class NewsDependencies {
  constructor(
    public readonly pgClient: PostgreSQLClient,
    public readonly redisClient: RedisClient,
    public readonly cacheRepository: ICacheRepository,
    public readonly newsRepository: NewsRepository,
    public readonly newsService: NewsService,
  ) {}

  async cleanup() {
    await this.pgClient.close()
    await this.redisClient.close()
    consola.info('News dependencies cleaned up')
  }
}

export async function NewDeps(config: NewsConfig): Promise<NewsDependencies> {
  // 初始化 PostgreSQL
  const pgClient = new PostgreSQLClient(config.toPostgreSQLConfig())
  if (!pgClient.enablePostgreSQL) throw new Error('PostgreSQL 未启用，无法启动服务')
  await pgClient.ensureConnected()

  // 初始化 Redis
  const redisClient = new RedisClient(config.toRedisConfig())
  if (!redisClient.enableRedis) throw new Error('Redis 未启用，无法启动服务')
  await redisClient.ensureConnected()

  // 初始化缓存仓储
  const cacheRepository = new RedisCacheRepository(redisClient)

  // 初始化仓储
  const newsRepository = new NewsRepository(pgClient.getDb())

  // 初始化表（如果需要）
  if (config.features.initTable) await newsRepository.init()

  // 初始化应用服务
  const newsService = new NewsService(newsRepository)

  return new NewsDependencies(
    pgClient,
    redisClient,
    cacheRepository,
    newsRepository,
    newsService
  )
}

