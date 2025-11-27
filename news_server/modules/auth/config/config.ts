/**
 * Auth 模块配置类
 * 类似 Sjgz-Backend 的 internal/user/config/config.go
 * 包含配置类和验证逻辑
 */
import type { PostgreSQLConfig } from '@packages/postgresqlx/client'
import type { RedisConfig } from '@packages/redisx/client'
import type { KafkaConfig } from '@packages/kafkax/client'
import type { GitHubOAuthConfig } from '../infrastructure/external/github/oauth'
import type { JWTConfig } from '../domain/auth/jwt'
import type { AuthConfigType, GitHubConfig, JWTConfigType, ServerConfig, FeatureFlags, ProductHuntConfig } from './types'
import { ServerConfigSchema, FeatureFlagsSchema, GitHubConfigSchema, JWTConfigSchema, ProductHuntConfigSchema } from './types'
import { validate } from '@packages/validatex'
import { PostgreSQLConfigSchema } from '@packages/postgresqlx/validate'
import { RedisConfigSchema } from '@packages/redisx/validate'
import { KafkaConfigSchema } from '@packages/kafkax/validate'

/**
 * Auth 模块完整配置类
 * 所有字段都是必需的，不允许有默认值
 */
export class AuthConfig implements AuthConfigType {
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

