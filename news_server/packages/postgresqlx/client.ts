/**
 * PostgreSQL 客户端封装
 * 使用 pg + drizzle-orm
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import { consola } from 'consola'
import { initPostgreSQL } from './init'

export interface PostgreSQLConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  enablePostgreSQL?: boolean
  // 连接池配置
  max?: number // 最大连接数，默认 10
  idleTimeoutMillis?: number // 空闲连接超时时间（毫秒），默认 20000
  connectionTimeoutMillis?: number // 连接超时时间（毫秒），默认 10000
}

export class PostgreSQLClient {
  private pool: Pool | null = null
  private db: ReturnType<typeof drizzle> | null = null
  public enablePostgreSQL: boolean
  private config: PostgreSQLConfig | null = null

  constructor(config: PostgreSQLConfig) {
    this.enablePostgreSQL = config.enablePostgreSQL ?? false
    this.config = config

    if (this.enablePostgreSQL) {
      try {
        const { pool, db } = initPostgreSQL(config)
        this.pool = pool
        this.db = db
      } catch (error) {
        this.enablePostgreSQL = false
        throw error
      }
    }
  }

  /**
   * 验证 PostgreSQL 连接
   * 如果连接失败，抛出错误并停止服务
   */
  async ensureConnected(): Promise<void> {
    if (!this.enablePostgreSQL || !this.pool) {
      throw new Error('PostgreSQL 未启用，无法启动服务')
    }

    try {
      await this.pool.query('SELECT 1')
      const host = this.config?.host || 'unknown'
      const port = this.config?.port || 5432
      const database = this.config?.database || 'unknown'
      consola.success(`✅ PostgreSQL 连接成功: ${host}:${port}/${database}`)
    } catch (error) {
      consola.error(`❌ PostgreSQL 连接失败:`, error)
      this.enablePostgreSQL = false
      throw new Error(`PostgreSQL 连接失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  getDb() {
    if (!this.enablePostgreSQL || !this.db) {
      throw new Error('PostgreSQL 未启用或未初始化')
    }
    return this.db
  }

  getPool() {
    if (!this.enablePostgreSQL || !this.pool) {
      throw new Error('PostgreSQL 未启用或未初始化')
    }
    return this.pool
  }

  async close() {
    if (this.pool) {
      await this.pool.end()
      consola.info('PostgreSQL 连接已关闭')
    }
  }
}

