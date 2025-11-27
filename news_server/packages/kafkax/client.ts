/**
 * Kafka 客户端封装
 * 使用 kafkajs
 */
import { Kafka, Producer, Admin, Consumer } from 'kafkajs'
import { consola } from 'consola'

export interface KafkaConfig {
  bootstrapServers: string
  enableKafka?: boolean
  clientId?: string
  topic?: string
  groupId?: string
  noPartitionerWarning?: boolean
  // Consumer 配置
  sessionTimeout?: number // 会话超时时间（毫秒），默认 30000
  heartbeatInterval?: number // 心跳间隔（毫秒），默认 3000
  // Retry 配置
  retries?: number // 重试次数，默认 3
  initialRetryTime?: number // 初始重试时间（毫秒），默认 100
  multiplier?: number // 重试时间倍数，默认 2
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
        // 设置环境变量以消除 partitioner 警告
        if (config.noPartitionerWarning !== false) {
          process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1'
        }
        
        const brokers = config.bootstrapServers.split(',').map(s => s.trim())
        
        this.kafka = new Kafka({
          clientId: config.clientId || 'news-server',
          brokers,
          retry: {
            retries: config.retries ?? 3,
            initialRetryTime: config.initialRetryTime ?? 100,
            multiplier: config.multiplier ?? 2,
          },
        })
        
        this.producer = this.kafka.producer()
        this.admin = this.kafka.admin()
        
        // 如果提供了 groupId，创建 Consumer
        if (config.groupId) {
          this.consumer = this.kafka.consumer({
            groupId: config.groupId,
            sessionTimeout: config.sessionTimeout ?? 30000,
            heartbeatInterval: config.heartbeatInterval ?? 3000,
          })
        }
        
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

  async send(topic: string, messages: Array<{ key?: string; value: string | object }>) {
    if (!this.enableKafka || !this.producer) {
      throw new Error('Kafka 未启用或未初始化')
    }

    const formattedMessages = messages.map(msg => ({
      key: msg.key,
      value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
    }))

    await this.producer.send({
      topic,
      messages: formattedMessages,
    })
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

