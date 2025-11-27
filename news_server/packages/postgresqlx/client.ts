/**
 * PostgreSQL 客户端封装
 * 使用 pg + drizzle-orm
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { consola } from 'consola'

export interface PostgreSQLConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  enablePostgreSQL?: boolean
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
        this.pool = new Pool({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          password: config.password,
          max: 10,
          idleTimeoutMillis: 20000,
          connectionTimeoutMillis: 10000,
        })
        
        this.db = drizzle(this.pool)
      } catch (error) {
        consola.error(`❌ PostgreSQL 初始化失败:`, error)
        this.enablePostgreSQL = false
        throw new Error(`PostgreSQL 初始化失败: ${error instanceof Error ? error.message : String(error)}`)
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

