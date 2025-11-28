/**
 * Getter Service
 * 类似 Sjgz-Backend 的 application/getter/service.go
 * 负责 getter 相关的业务逻辑
 * 
 * 当前实现：
 * - getSourceData: 使用 getter 获取源数据（缓存到 Redis，并发送到 Kafka）
 */
import { GetSourceData } from './get-source-data'
import type { IGetterRepository } from '../../domain/getter/repository'
import type { IGetterRegistry } from '../../domain/getter/registry'
import type { ICacheRepository } from '../../domain/cache/repository'
import type { KafkaClient } from '@packages/kafkax/client'
import type { KafkaConfig } from '@packages/kafkax/client'

export class GetterService {
  public readonly getSourceData: GetSourceData

  constructor(
    getterRepository: IGetterRepository,
    getterRegistry: IGetterRegistry,
    cacheRepository: ICacheRepository,
    defaultTTL: number = 30 * 60 * 1000,
    kafkaClient?: KafkaClient,
    kafkaConfig?: KafkaConfig
  ) {
    this.getSourceData = new GetSourceData(
      getterRepository,
      getterRegistry,
      cacheRepository,
      defaultTTL,
      kafkaClient,
      kafkaConfig
    )
  }
}

