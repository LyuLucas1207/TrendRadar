/**
 * Kafka 客户端封装
 * 使用 kafkajs
 * 类似 Sjgz-Backend 的 pkg/kafkax/types.go
 */
import { Kafka, Producer, Admin, Consumer, type ProducerRecord, type Message, type RecordMetadata, type IHeaders } from 'kafkajs'
import { consola } from 'consola'
import type { TopicKey } from '../../events/topics'
import { initKafka } from './init'

/**
 * Producer 配置
 */
export interface ProducerConfig {
  acks?: 'all' | '0' | '1' | '-1'
  compression?: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd'
  retries?: number
  batchBytes?: number
  lingerMs?: number
  idempotent?: boolean
}

/**
 * Consumer 配置
 */
export interface ConsumerConfig {
  groupId?: string
  initialOffset?: 'earliest' | 'latest'
  sessionTimeout?: number // 会话超时时间（毫秒），默认 30000
  heartbeatInterval?: number // 心跳间隔（毫秒），默认 3000
  fetchMinBytes?: number
  fetchMaxBytes?: number
  returnErrors?: boolean
}

/**
 * Kafka 配置
 * 区分 Producer Topics 和 Consumer Topics
 * 类似 Sjgz-Backend 的 pkg/kafkax/types.go
 */
export interface KafkaConfig {
  bootstrapServers: string
  enableKafka?: boolean
  clientId: string
  noPartitionerWarning?: boolean
  // Producer 配置
  producer?: ProducerConfig
  // Consumer 配置
  consumer?: ConsumerConfig
  // Producer Topics (服务发布的事件)
  producerTopics?: Record<TopicKey, string>
  // Consumer Topics (服务监听的事件)
  consumerTopics?: Record<TopicKey, string>
  // Retry 配置
  retries?: number // 重试次数，默认 3
  initialRetryTime?: number // 初始重试时间（毫秒），默认 100
  multiplier?: number // 重试时间倍数，默认 2
}

/**
 * Kafka 发送消息类型
 * 用于 send 方法的参数
 */
export interface KafkaMessage {
  key?: string | Buffer
  value: string | object
  headers?: IHeaders
}

export class KafkaClient {
  private kafka: Kafka | null = null
  private producer: Producer | null = null
  private admin: Admin | null = null
  private consumer: Consumer | null = null
  public enableKafka: boolean

  constructor(config: KafkaConfig) {
    this.enableKafka = config.enableKafka ?? false

    if (this.enableKafka) {
      try {
        const { kafka, producer, admin, consumer } = initKafka(config)
        this.kafka = kafka
        this.producer = producer
        this.admin = admin
        this.consumer = consumer
        consola.success(`✅ Kafka 客户端初始化成功: ${config.bootstrapServers}`)
      } catch (error) {
        consola.error(`❌ Kafka 初始化失败:`, error)
        this.enableKafka = false
      }
    }
  }

  async connect() {
    if (!this.enableKafka || !this.producer) {
      throw new Error('Kafka 未启用或未初始化')
    }
    await this.producer.connect()
    consola.info('Kafka Producer 已连接')
  }

  async disconnect() {
    if (this.consumer) {
      await this.consumer.disconnect()
      consola.info('Kafka Consumer 已断开连接')
    }
    if (this.producer) {
      await this.producer.disconnect()
      consola.info('Kafka Producer 已断开连接')
    }
  }

  /**
   * 发送消息到 Kafka
   * 使用 kafkajs 官方类型定义
   * @param topic Topic 名称
   * @param messages 消息数组，value 可以是 string 或 object（会自动序列化为 JSON）
   * @returns Promise<RecordMetadata[]> 发送结果元数据
   */
  async send(topic: string, messages: KafkaMessage[]): Promise<RecordMetadata[]> {
    if (!this.enableKafka || !this.producer) {
      throw new Error('Kafka 未启用或未初始化')
    }

    const formattedMessages: Message[] = messages.map(msg => ({
      key: msg.key ? (typeof msg.key === 'string' ? Buffer.from(msg.key) : msg.key) : null,
      value: typeof msg.value === 'string' ? Buffer.from(msg.value) : Buffer.from(JSON.stringify(msg.value)),
      headers: msg.headers,
    }))

    const record: ProducerRecord = {
      topic,
      messages: formattedMessages,
    }

    return await this.producer.send(record)
  }

  async ensureTopicExists(topic: string, numPartitions: number = 3, replicationFactor: number = 1) {
    if (!this.enableKafka || !this.admin) {
      return false
    }

    try {
      await this.admin.connect()
      const topics = await this.admin.listTopics()
      
      if (topics.includes(topic)) {
        await this.admin.disconnect()
        return true
      }

      await this.admin.createTopics({
        topics: [{
          topic,
          numPartitions,
          replicationFactor,
        }],
      })
      
      await this.admin.disconnect()
      consola.success(`Topic '${topic}' 已创建`)
      return true
    } catch (error) {
      consola.error(`创建 Topic '${topic}' 失败:`, error)
      await this.admin?.disconnect()
      return false
    }
  }

  getProducer() {
    if (!this.enableKafka || !this.producer) {
      throw new Error('Kafka 未启用或未初始化')
    }
    return this.producer
  }

  /**
   * 获取 Consumer
   * 如果配置了 groupId，会在构造函数中自动创建
   */
  getConsumer() {
    if (!this.enableKafka || !this.consumer) {
      throw new Error('Kafka Consumer 未启用或未初始化，请确保配置了 groupId')
    }
    return this.consumer
  }

  /**
   * 根据 TopicKey 获取 Topic 名称
   * 从配置的 producerTopics 或 consumerTopics 中查找
   */
  getTopicName(key: TopicKey, config: KafkaConfig): string | undefined {
    return config.producerTopics?.[key] || config.consumerTopics?.[key]
  }

  /**
   * 获取内部的 Kafka 实例
   * 用于需要直接使用 Kafka 的场景（不推荐，优先使用封装的方法）
   */
  getKafka() {
    if (!this.enableKafka || !this.kafka) {
      throw new Error('Kafka 未启用或未初始化')
    }
    return this.kafka
  }
}

