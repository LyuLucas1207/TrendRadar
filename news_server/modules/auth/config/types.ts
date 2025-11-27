/**
 * Auth 模块配置类型定义
 * 类似 Sjgz-Backend 的 internal/user/config/types.go
 * 直接使用 packages 中的类型，不重新定义
 */
import { z } from 'zod'
import type { PostgreSQLConfig } from '@packages/postgresqlx/client'
import type { RedisConfig } from '@packages/redisx/client'
import type { KafkaConfig } from '@packages/kafkax/client'
import type { GitHubOAuthConfig } from '../infrastructure/external/github/oauth'
import type { JWTConfig } from '../domain/auth/jwt'
import { validate } from '@packages/validatex'
import { PostgreSQLConfigSchema } from '@packages/postgresqlx/validate'
import { RedisConfigSchema } from '@packages/redisx/validate'
import { KafkaConfigSchema } from '@packages/kafkax/validate'

/**
 * GitHub OAuth 配置
 */
export interface GitHubConfig {
  clientId: string
  clientSecret: string
  jwtSecret: string
}

/**
 * JWT 配置
 */
export interface JWTConfigType {
  secret: string
  expirationTime?: string
}

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
 * GitHub OAuth 配置 Schema
 */
export const GitHubConfigSchema: z.ZodType<GitHubConfig> = z.object({
  clientId: z.string().min(1, 'GitHub clientId is required'),
  clientSecret: z.string().min(1, 'GitHub clientSecret is required'),
  jwtSecret: z.string().min(1, 'GitHub jwtSecret is required'),
})

/**
 * JWT 配置 Schema
 */
export const JWTConfigSchema: z.ZodType<JWTConfigType> = z.object({
  secret: z.string().min(1, 'JWT secret is required'),
  expirationTime: z.string().optional(),
})

/**
 * ProductHunt 配置 Schema（可选）
 */
export const ProductHuntConfigSchema: z.ZodType<ProductHuntConfig> = z.object({
  apiToken: z.string().optional(),
})

/**
 * Auth 模块完整配置
 * 所有字段都是必需的，不允许有默认值
 */
export class AuthConfig {
  postgresql!: PostgreSQLConfig
  redis!: RedisConfig
  kafka!: KafkaConfig
  github!: GitHubConfig
  jwt!: JWTConfigType
  server!: ServerConfig
  features!: FeatureFlags
  productHunt!: ProductHuntConfig

  /**
   * 转换为 PostgreSQLConfig（直接使用，无需转换）
   */
  toPostgreSQLConfig(): PostgreSQLConfig {
    return this.postgresql
  }

  /**
   * 转换为 RedisConfig（直接使用，无需转换）
   */
  toRedisConfig(): RedisConfig {
    return this.redis
  }

  /**
   * 转换为 KafkaConfig（直接使用，无需转换）
   */
  toKafkaConfig(): KafkaConfig {
    return this.kafka
  }

  /**
   * 转换为 GitHubOAuthConfig
   */
  toGitHubConfig(): GitHubOAuthConfig {
    return {
      clientId: this.github.clientId,
      clientSecret: this.github.clientSecret,
      jwtSecret: this.github.jwtSecret,
    }
  }

  /**
   * 转换为 JWTConfig
   */
  toJWTConfig(): JWTConfig {
    return {
      secret: this.jwt.secret,
      expirationTime: this.jwt.expirationTime,
    }
  }

  /**
   * 验证配置（严格模式，所有必需配置必须存在）
   * 使用 validatex 工具进行类型安全验证
   */
  validate(): void {
    validate(PostgreSQLConfigSchema, this.postgresql, 'PostgreSQL')
    validate(RedisConfigSchema, this.redis, 'Redis')
    validate(KafkaConfigSchema, this.kafka, 'Kafka')
    validate(GitHubConfigSchema, this.github, 'GitHub')
    validate(JWTConfigSchema, this.jwt, 'JWT')
    validate(ServerConfigSchema, this.server, 'Server')
    validate(FeatureFlagsSchema, this.features, 'Features')
    validate(ProductHuntConfigSchema, this.productHunt, 'ProductHunt')
  }
}

