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
  defaultTTL: z.number().int().positive('Redis defaultTTL must be > 0').optional(),
  maxRetriesPerRequest: z.number().int().nonnegative('Redis maxRetriesPerRequest must be >= 0').optional(),
  retryDelayMultiplier: z.number().int().positive('Redis retryDelayMultiplier must be > 0').optional(),
  maxRetryDelay: z.number().int().positive('Redis maxRetryDelay must be > 0').optional(),
  connectTimeout: z.number().int().positive('Redis connectTimeout must be > 0').optional(),
  lazyConnect: z.boolean().optional(),
})

