/**
 * Kafka 配置验证 Schema
 */
import { z } from 'zod'
import type { KafkaConfig } from './client'

export const KafkaConfigSchema: z.ZodType<KafkaConfig> = z.object({
  bootstrapServers: z.string().min(1, 'Kafka bootstrapServers is required'),
  enableKafka: z.boolean().optional(),
  clientId: z.string().min(1, 'Kafka clientId is required'),
  topic: z.string().min(1, 'Kafka topic is required'),
  groupId: z.string().min(1, 'Kafka groupId is required'),
  noPartitionerWarning: z.boolean().optional().default(true),
  sessionTimeout: z.number().int().positive('Kafka sessionTimeout must be > 0').optional(),
  heartbeatInterval: z.number().int().positive('Kafka heartbeatInterval must be > 0').optional(),
  retries: z.number().int().nonnegative('Kafka retries must be >= 0').optional(),
  initialRetryTime: z.number().int().positive('Kafka initialRetryTime must be > 0').optional(),
  multiplier: z.number().positive('Kafka multiplier must be > 0').optional(),
})

