/**
 * Kafka 配置验证 Schema
 * 类似 Sjgz-Backend 的配置验证
 */
import { z } from 'zod'
import type { KafkaConfig, ProducerConfig, ConsumerConfig } from './client'

const ProducerConfigSchema: z.ZodType<ProducerConfig> = z.object({
  acks: z.enum(['all', '0', '1', '-1']).optional(),
  compression: z.enum(['none', 'gzip', 'snappy', 'lz4', 'zstd']).optional(),
  retries: z.number().int().nonnegative('Kafka producer retries must be >= 0').optional(),
  batchBytes: z.number().int().positive('Kafka producer batchBytes must be > 0').optional(),
  lingerMs: z.number().int().nonnegative('Kafka producer lingerMs must be >= 0').optional(),
  idempotent: z.boolean().optional(),
})

const ConsumerConfigSchema: z.ZodType<ConsumerConfig> = z.object({
  groupId: z.string().min(1, 'Kafka consumer groupId is required').optional(),
  initialOffset: z.enum(['earliest', 'latest']).optional(),
  sessionTimeout: z.number().int().positive('Kafka consumer sessionTimeout must be > 0').optional(),
  heartbeatInterval: z.number().int().positive('Kafka consumer heartbeatInterval must be > 0').optional(),
  fetchMinBytes: z.number().int().nonnegative('Kafka consumer fetchMinBytes must be >= 0').optional(),
  fetchMaxBytes: z.number().int().positive('Kafka consumer fetchMaxBytes must be > 0').optional(),
  returnErrors: z.boolean().optional(),
})

export const KafkaConfigSchema: z.ZodType<KafkaConfig> = z.object({
  bootstrapServers: z.string().min(1, 'Kafka bootstrapServers is required'),
  enableKafka: z.boolean().optional(),
  clientId: z.string().min(1, 'Kafka clientId is required'),
  noPartitionerWarning: z.boolean().optional().default(true),
  // Producer 配置
  producer: ProducerConfigSchema.optional(),
  // Consumer 配置
  consumer: ConsumerConfigSchema.optional(),
  // Producer Topics (服务发布的事件)
  producerTopics: z.record(z.string(), z.string()).optional(),
  // Consumer Topics (服务监听的事件)
  consumerTopics: z.record(z.string(), z.string()).optional(),
  // Retry 配置
  retries: z.number().int().nonnegative('Kafka retries must be >= 0').optional(),
  initialRetryTime: z.number().int().positive('Kafka initialRetryTime must be > 0').optional(),
  multiplier: z.number().positive('Kafka multiplier must be > 0').optional(),
})

