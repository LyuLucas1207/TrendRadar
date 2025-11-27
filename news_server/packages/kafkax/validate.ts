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
})

