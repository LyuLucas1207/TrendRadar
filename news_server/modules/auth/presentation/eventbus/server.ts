/**
 * EventBus 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go
 */
import { Kafka, Consumer } from 'kafkajs'
import { KafkaClient, type KafkaConfig } from '@packages/kafkax/client'
import { Registry } from './registry'
import { Router } from './router'
import { AuthHandler } from './handler/auth'
import { consola } from 'consola'

export interface EventBusServerConfig {
  kafka: KafkaConfig
}

export class EventBusServer {
  private kafka: Kafka | null = null
  private consumer: Consumer | null = null
  private kafkaClient: KafkaClient | null = null
  private router: Router
  private config: EventBusServerConfig

  constructor(config: EventBusServerConfig) {
    this.config = config

    // 创建 Registry
    const registry = new Registry(new AuthHandler())

    // 创建 Router
    this.router = new Router(registry)

    if (config.kafka.enableKafka) {
      // 创建 Kafka 客户端（用于确保 topic 存在）
      this.kafkaClient = new KafkaClient({
        bootstrapServers: config.kafka.bootstrapServers,
        clientId: config.kafka.clientId,
        enableKafka: config.kafka.enableKafka ?? true,
      })

      // 创建 Kafka Consumer
      const brokers = config.kafka.bootstrapServers.split(',').map(s => s.trim())
      this.kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers,
        retry: {
          retries: 3,
          initialRetryTime: 100,
          multiplier: 2,
        },
      })

      this.consumer = this.kafka.consumer({ groupId: config.kafka.groupId! })
    }
  }

  async Run(): Promise<void> {
    if (!this.config.kafka.enableKafka || !this.kafka || !this.consumer) {
      consola.error('Kafka 未启用，无法启动 EventBus Server')
      return
    }

    // 确保 topic 存在
    if (this.kafkaClient && this.config.kafka.topic) {
      await this.kafkaClient.ensureTopicExists(this.config.kafka.topic)
    }

    // 注册路由
    this.router.RegisterRoutes()

    // 连接 Consumer
    await this.consumer.connect()
    consola.success('Kafka Consumer 已连接')

    // 订阅 topic
    if (!this.config.kafka.topic) {
      throw new Error('Kafka topic is required')
    }
    await this.consumer.subscribe({ topic: this.config.kafka.topic, fromBeginning: true })
    consola.info(`已订阅 topic: ${this.config.kafka.topic}`)

    // 开始消费消息
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) {
          consola.warn(`收到空消息，topic: ${topic}, partition: ${partition}`)
          return
        }
        try {
          const eventData = JSON.parse(message.value.toString())
          const eventType = message.headers?.eventType?.toString() || 'unknown'
          consola.info(`收到 Kafka 消息: topic=${topic}, eventType=${eventType}`)
          await this.router.route(eventType, eventData)
        } catch (error) {
          consola.error(`处理 Kafka 消息失败: ${error}`)
        }
      },
    })

    consola.success('EventBus Server 已启动')
  }

  async Close(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect()
      consola.info('Kafka Consumer 已断开')
    }
    if (this.kafkaClient) {
      await this.kafkaClient.disconnect()
    }
    consola.info('EventBus Server 已关闭')
  }
}

export function NewEventBusServer(config: EventBusServerConfig): EventBusServer {
  return new EventBusServer(config)
}
