/**
 * Kafka 客户端初始化逻辑
 * 将初始化逻辑从 constructor 中分离出来
 */
import { Kafka, Producer, Admin, Consumer } from 'kafkajs'
import { consola } from 'consola'
import type { KafkaConfig } from './client'

export interface InitResult {
  kafka: Kafka
  producer: Producer
  admin: Admin
  consumer: Consumer | null
}

/**
 * 初始化 Kafka 客户端
 */
export function initKafka(config: KafkaConfig): InitResult {
  try {
    // 设置环境变量以消除 partitioner 警告
    if (config.noPartitionerWarning !== false) {
      process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1'
    }
    
    const brokers = config.bootstrapServers.split(',').map(s => s.trim())
    
    const kafka = new Kafka({
      clientId: config.clientId || 'news-server',
      brokers,
      retry: {
        retries: config.retries ?? 3,
        initialRetryTime: config.initialRetryTime ?? 100,
        multiplier: config.multiplier ?? 2,
      },
    })
    
    const producer = kafka.producer()
    const admin = kafka.admin()
    
    // 如果提供了 consumer 配置，创建 Consumer
    let consumer: Consumer | null = null
    const consumerConfig = config.consumer
    if (consumerConfig?.groupId) {
      consumer = kafka.consumer({
        groupId: consumerConfig.groupId,
        sessionTimeout: consumerConfig.sessionTimeout ?? 30000,
        heartbeatInterval: consumerConfig.heartbeatInterval ?? 3000,
      })
    }
    
    return { kafka, producer, admin, consumer }
  } catch (error) {
    consola.error(`❌ Kafka 初始化失败:`, error)
    throw new Error(`Kafka 初始化失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

