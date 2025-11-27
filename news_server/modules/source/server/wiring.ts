/**
 * 依赖注入/装配
 * 类似 Sjgz-Backend 的 wiring.go
 */
import { RedisClient } from '@packages/redisx/client'
import { RedisCacheRepository } from '../infrastructure/cache/redis'
import { MemoryGetterRepository } from '../infrastructure/repository/getter/memory'
import { createSourceGetterRegistry } from '../infrastructure/getters/index'
import { GetterService } from '../application/getter/service'
import type { SourceConfig } from '../config/config'
import type { ICacheRepository } from '../domain/cache/repository'
import { consola } from 'consola'

export class SourceDependencies {
  constructor(
    public readonly redisClient: RedisClient,
    public readonly cacheRepository: ICacheRepository,
    public readonly getterRepository: MemoryGetterRepository,
    public readonly getterRegistry: ReturnType<typeof createSourceGetterRegistry>,
    public readonly getterService: GetterService
  ) {}

  async cleanup() {
    await this.redisClient.close()
    consola.info('Source dependencies cleaned up')
  }
}

export async function NewDeps(config: SourceConfig): Promise<SourceDependencies> {
  // 初始化 Redis
  const redisClient = new RedisClient(config.toRedisConfig())
  if (!redisClient.enableRedis) throw new Error('Redis 未启用，无法启动服务')
  await redisClient.ensureConnected()

  // 初始化缓存仓储
  const cacheRepository = new RedisCacheRepository(redisClient)

  // 初始化 getter 仓储（内存）
  const getterRepository = new MemoryGetterRepository()

  // 初始化源获取器注册表（传入 ProductHunt 配置）
  const getterRegistry = createSourceGetterRegistry(config.productHunt)

  // 初始化应用服务
  const getterService = new GetterService(
    getterRepository,
    getterRegistry,
    cacheRepository,
    config.defaultTTL
  )

  return new SourceDependencies(
    redisClient,
    cacheRepository,
    getterRepository,
    getterRegistry,
    getterService
  )
}

