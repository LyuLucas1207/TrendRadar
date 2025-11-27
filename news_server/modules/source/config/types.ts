/**
 * Source 模块配置类型定义
 * 类似 Sjgz-Backend 的 internal/source/config/types.go
 * 包含类型定义和对应的 Zod Schema
 */
import { z } from 'zod'
import type { PostgreSQLConfig } from '@packages/postgresqlx/client'
import type { RedisConfig } from '@packages/redisx/client'
import type { KafkaConfig } from '@packages/kafkax/client'

/**
 * 服务器配置
 */
export interface ServerConfig {
  port: number
  host: string
}

/**
 * 功能开关配置
 */
export interface FeatureFlags {
  enableCache: boolean
  initTable: boolean
}

/**
 * ProductHunt 配置（可选）
 */
export interface ProductHuntConfig {
  apiToken?: string
}

/**
 * 服务器配置 Schema
 */
export const ServerConfigSchema: z.ZodType<ServerConfig> = z.object({
  port: z.number().int().positive('Server port must be > 0'),
  host: z.string().min(1, 'Server host is required'),
})

/**
 * 功能开关配置 Schema
 */
export const FeatureFlagsSchema: z.ZodType<FeatureFlags> = z.object({
  enableCache: z.boolean(),
  initTable: z.boolean(),
})

/**
 * ProductHunt 配置 Schema（可选）
 */
export const ProductHuntConfigSchema: z.ZodType<ProductHuntConfig> = z.object({
  apiToken: z.string().optional(),
})

/**
 * Source 模块完整配置类型
 * 所有字段都是必需的，不允许有默认值
 */
export interface SourceConfigType {
  postgresql: PostgreSQLConfig
  redis: RedisConfig
  kafka: KafkaConfig
  server: ServerConfig
  features: FeatureFlags
  defaultTTL: number // 默认缓存 TTL（毫秒）
  productHunt: ProductHuntConfig
}
