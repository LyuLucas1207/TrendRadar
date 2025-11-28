/**
 * 依赖注入/装配
 * 类似 Sjgz-Backend 的 wiring.go
 */
import { RedisClient } from '@packages/redisx/client'
import { KafkaClient } from '@packages/kafkax/client'
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
    public readonly kafkaClient: KafkaClient | null,
    public readonly cacheRepository: ICacheRepository,
    public readonly getterRepository: MemoryGetterRepository,
    public readonly getterRegistry: ReturnType<typeof createSourceGetterRegistry>,
    public readonly getterService: GetterService
  ) {}

  async cleanup() {
    await this.redisClient.close()
    if (this.kafkaClient) {
      await this.kafkaClient.disconnect()
    }
    consola.info('Source dependencies cleaned up')
  }
}

export async function NewDeps(config: SourceConfig): Promise<SourceDependencies> {
  // 初始化 Redis
  const redisClient = new RedisClient(config.toRedisConfig())
  if (!redisClient.enableRedis) throw new Error('Redis 未启用，无法启动服务')
  await redisClient.ensureConnected()

  // 初始化 Kafka（如果启用）
  let kafkaClient: KafkaClient | null = null
  if (config.kafka.enableKafka) {
    kafkaClient = new KafkaClient(config.kafka)
    try {
      await kafkaClient.connect()
      // 确保 producer topic 存在
      const topicName = config.kafka.producerTopics?.['news']
      if (topicName) {
        await kafkaClient.ensureTopicExists(topicName)
      }
    } catch (error) {
      consola.error('Kafka 连接失败:', error)
      throw error
    }
  }

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
    config.defaultTTL,
    kafkaClient || undefined,
    config.kafka
  )

  return new SourceDependencies(
    redisClient,
    kafkaClient,
    cacheRepository,
    getterRepository,
    getterRegistry,
    getterService
  )
}

