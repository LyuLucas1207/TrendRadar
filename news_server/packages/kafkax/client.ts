/**
 * Kafka 客户端封装
 * 使用 kafkajs
 */
import { Kafka, Producer, Admin } from 'kafkajs'
import { consola } from 'consola'

export interface KafkaConfig {
  bootstrapServers: string
  enableKafka?: boolean
  clientId?: string
  topic?: string
  groupId?: string
}

export class KafkaClient {
  private kafka: Kafka | null = null
  private producer: Producer | null = null
  private admin: Admin | null = null
  public enableKafka: boolean

  constructor(config: KafkaConfig) {
    this.enableKafka = config.enableKafka ?? false

    if (this.enableKafka) {
      try {
        const brokers = config.bootstrapServers.split(',').map(s => s.trim())
        
        this.kafka = new Kafka({
          clientId: config.clientId || 'news-server',
          brokers,
          retry: {
            retries: 3,
            initialRetryTime: 100,
            multiplier: 2,
          },
        })
        
        this.producer = this.kafka.producer()
        this.admin = this.kafka.admin()
        
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
}

