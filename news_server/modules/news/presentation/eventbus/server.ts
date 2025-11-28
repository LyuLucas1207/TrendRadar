/**
 * EventBus 服务器创建
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go
 */
import { KafkaClient, type KafkaConfig } from '@packages/kafkax/client'
import { Registry } from './registry'
import { Router } from './router'
import { NewsHandler } from './handler/news'
import { TopicKeys } from '@events/topics'
import { consola } from 'consola'

export interface EventBusServerConfig {
  kafka: KafkaConfig
}

export class EventBusServer {
  private kafkaClient: KafkaClient | null = null
  private router: Router
  private config: EventBusServerConfig

  constructor(config: EventBusServerConfig, newsHandler: NewsHandler) {
    this.config = config
    this.router = new Router(new Registry(newsHandler))
    if (config.kafka.enableKafka) this.kafkaClient = new KafkaClient(config.kafka)
  }

  async Run(): Promise<void> {
    if (!this.config.kafka.enableKafka || !this.kafkaClient) {
      consola.error('Kafka 未启用，无法启动 EventBus Server')
      return
    }

    // 获取 consumer topic
    const topicName = this.config.kafka.consumerTopics?.[TopicKeys.NEWS]
    if (!topicName) {
      throw new Error('Kafka consumer topic not found for news service')
    }

    // 确保 topic 存在
    await this.kafkaClient.ensureTopicExists(topicName)
    this.router.RegisterRoutes()
  
    const consumer = this.kafkaClient.getConsumer()
    await consumer.connect()

    consola.success('Kafka Consumer 已连接')

    await consumer.subscribe({ topic: topicName, fromBeginning: false })
    consola.info(`已订阅 topic: ${topicName}`)

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

export function NewEventBusServer(config: EventBusServerConfig, newsHandler: NewsHandler): EventBusServer {
  return new EventBusServer(config, newsHandler)
}

