/**
 * PostgreSQL 客户端初始化逻辑
 * 将初始化逻辑从 constructor 中分离出来
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { consola } from 'consola'
import type { PostgreSQLConfig } from './client'

export interface InitResult {
  pool: Pool
  db: ReturnType<typeof drizzle>
}

/**
 * 初始化 PostgreSQL 连接池和数据库实例
 */
export function initPostgreSQL(config: PostgreSQLConfig): InitResult {
  try {
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max ?? 10,
      idleTimeoutMillis: config.idleTimeoutMillis ?? 20000,
      connectionTimeoutMillis: config.connectionTimeoutMillis ?? 10000,
    })
    
    const db = drizzle(pool)
    
    return { pool, db }
  } catch (error) {
    consola.error(`❌ PostgreSQL 初始化失败:`, error)
    throw new Error(`PostgreSQL 初始化失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

