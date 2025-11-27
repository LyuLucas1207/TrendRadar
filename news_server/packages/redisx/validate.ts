/**
 * Redis 配置验证 Schema
 */
import { z } from 'zod'
import type { RedisConfig } from './client'

export const RedisConfigSchema: z.ZodType<RedisConfig> = z.object({
  host: z.string().min(1, 'Redis host is required'),
  port: z.number().int().positive('Redis port must be > 0'),
  db: z.number().int().nonnegative('Redis db must be >= 0').optional(),
  password: z.string().optional(),
  enableRedis: z.boolean().optional(),
})

