/**
 * News 模块配置类
 * 类似 Sjgz-Backend 的 internal/news/config/config.go
 * 包含配置类和验证逻辑
 */
import type { PostgreSQLConfig } from '@packages/postgresqlx/client'
import type { RedisConfig } from '@packages/redisx/client'
import type { KafkaConfig } from '@packages/kafkax/client'
import type { NewsConfigType, ServerConfig, FeatureFlags, ProductHuntConfig } from './types'
import { ServerConfigSchema, FeatureFlagsSchema, ProductHuntConfigSchema } from './types'
import { validate } from '@packages/validatex'
import { PostgreSQLConfigSchema } from '@packages/postgresqlx/validate'
import { RedisConfigSchema } from '@packages/redisx/validate'
import { KafkaConfigSchema } from '@packages/kafkax/validate'

/**
 * News 模块完整配置类
 * 所有字段都是必需的，不允许有默认值
 */
export class NewsConfig implements NewsConfigType {
  postgresql!: PostgreSQLConfig
  redis!: RedisConfig
  kafka!: KafkaConfig
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
   * 验证配置（严格模式，所有必需配置必须存在）
   * 使用 validatex 工具进行类型安全验证
   */
  validate(): void {
    validate(PostgreSQLConfigSchema, this.postgresql, 'PostgreSQL')
    validate(RedisConfigSchema, this.redis, 'Redis')
    validate(KafkaConfigSchema, this.kafka, 'Kafka')
    validate(ServerConfigSchema, this.server, 'Server')
    validate(FeatureFlagsSchema, this.features, 'Features')
    validate(ProductHuntConfigSchema, this.productHunt, 'ProductHunt')
  }
}

