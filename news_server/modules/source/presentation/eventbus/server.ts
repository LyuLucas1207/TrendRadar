/**
 * EventBus 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go
 */
import { KafkaClient, type KafkaConfig } from '@packages/kafkax/client'
import { Registry } from './registry'
import { Router } from './router'
import { SourceHandler } from './handler/source'
import { consola } from 'consola'

export interface EventBusServerConfig {
  kafka: KafkaConfig
  getterService: any
}

export class EventBusServer {
  private kafkaClient: KafkaClient | null = null
  private router: Router
  private config: EventBusServerConfig

  constructor(config: EventBusServerConfig) {
    this.config = config
    this.router = new Router(new Registry(new SourceHandler(config.getterService)))
    if (config.kafka.enableKafka) this.kafkaClient = new KafkaClient(config.kafka)
  }

  async Run(): Promise<void> {
    if (!this.config.kafka.enableKafka || !this.kafkaClient) {
      consola.error('Kafka 未启用，无法启动 EventBus Server')
      return
    }

    // 确保 topic 存在
    if (this.config.kafka.topic) await this.kafkaClient.ensureTopicExists(this.config.kafka.topic)
    this.router.RegisterRoutes()
  
    const consumer = this.kafkaClient.getConsumer()
    await consumer.connect()

    consola.success('Kafka Consumer 已连接')

    if (!this.config.kafka.topic) {
      throw new Error('Kafka topic is required')
    }
    await consumer.subscribe({ topic: this.config.kafka.topic, fromBeginning: false })
    consola.info(`已订阅 topic: ${this.config.kafka.topic}`)

    // 开始消费消息
    await consumer.run({
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
    if (this.kafkaClient) {
      await this.kafkaClient.disconnect()
    }
    consola.info('EventBus Server 已关闭')
  }
}

export function NewEventBusServer(config: EventBusServerConfig): EventBusServer {
  return new EventBusServer(config)
}

