/**
 * PostgreSQL 配置验证 Schema
 */
import { z } from 'zod'
import type { PostgreSQLConfig } from './client'

export const PostgreSQLConfigSchema: z.ZodType<PostgreSQLConfig> = z.object({
  host: z.string().min(1, 'PostgreSQL host is required'),
  port: z.number().int().positive('PostgreSQL port must be > 0'),
  database: z.string().min(1, 'PostgreSQL database is required'),
  user: z.string().min(1, 'PostgreSQL user is required'),
  password: z.string().min(1, 'PostgreSQL password is required'),
  enablePostgreSQL: z.boolean().optional(),
})

