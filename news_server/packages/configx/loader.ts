/**
 * Config Loader
 * 类似 Sjgz-Backend 的 pkg/configx/loader.go
 * 使用 defu 进行配置合并，支持环境变量和配置文件
 */
import { config } from 'dotenv'
import { defu } from 'defu'
import { consola } from 'consola'
import { existsSync, readFileSync } from 'fs'

export interface LoaderOptions {
  /**
   * 配置文件路径
   */
  configPath?: string
  /**
   * 环境变量前缀
   */
  envPrefix?: string
  /**
   * 默认配置
   */
  defaults?: Record<string, any>
}

/**
 * 配置加载器
 */
export class ConfigLoader<T> {
  private config: T

  constructor(configType: new () => T, options: LoaderOptions = {}) {
    const { configPath, envPrefix = 'APP', defaults = {} } = options

    // 1. 加载环境变量
    config()

    // 2. 加载配置文件（必需）
    let fileConfig: Record<string, any> = {}
    if (configPath && existsSync(configPath)) {
      try {
        const fileContent = readFileSync(configPath, 'utf-8')
        fileConfig = JSON.parse(fileContent)
        consola.info(`✅ 已加载配置文件: ${configPath}`)
      } catch (error) {
        consola.error(`❌ 加载配置文件失败: ${configPath}`, error)
        throw new Error(`Failed to load config file: ${configPath}`)
      }
    } else if (configPath) {
      throw new Error(`Config file not found: ${configPath}`)
    }

    // 3. 从环境变量加载（覆盖配置文件）
    const envConfig = this.loadFromEnv(envPrefix)

    // 4. 使用 defu 合并配置（优先级：env > file > defaults）
    // 注意：不合并类默认值，强制用户提供所有配置
    const mergedConfig = defu(
      envConfig,
      fileConfig,
      defaults
    )

    // 5. 创建配置类实例并赋值属性
    const instance = new configType()
    Object.assign(instance as object, mergedConfig)
    this.config = instance

    consola.success('✅ 配置加载完成')
  }

  /**
   * 从环境变量加载配置
   * 支持嵌套结构，例如 APP_POSTGRESQL_HOST -> postgresql.host
   */
  private loadFromEnv(prefix: string): Record<string, any> {
    const result: Record<string, any> = {}
    const prefixUpper = prefix.toUpperCase() + '_'

    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(prefixUpper)) {
        continue
      }

      // 移除前缀并转换为小写
      const configKey = key
        .slice(prefixUpper.length)
        .toLowerCase()
        .replace(/_/g, '.')

      // 支持嵌套结构
      this.setNestedValue(result, configKey, value)
    }

    return result
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]
    
    // 尝试转换类型
    const convertedValue = this.convertValue(value)
    current[lastKey] = convertedValue
  }

  /**
   * 转换值类型（字符串 -> 数字/布尔值）
   */
  private convertValue(value: string): any {
    // 布尔值
    if (value === 'true' || value === 'false') {
      return value === 'true'
    }

    // 数字
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10)
    }

    // 浮点数
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value)
    }

    // JSON 对象/数组
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value)
      } catch {
        // 解析失败，返回原值
      }
    }

    return value
  }

  /**
   * 获取配置
   */
  getConfig(): T {
    return this.config
  }

  /**
   * 打印所有配置（隐藏敏感信息）
   */
  printAll(): void {
    const sanitized = this.sanitizeConfig(this.config)
    consola.info('📋 当前配置:', JSON.stringify(sanitized, null, 2))
  }

  /**
   * 隐藏敏感信息
   */
  private sanitizeConfig(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth']
    const result: any = Array.isArray(obj) ? [] : {}

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase()
      if (sensitiveKeys.some(sk => keyLower.includes(sk))) {
        result[key] = '***'
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitizeConfig(value)
      } else {
        result[key] = value
      }
    }

    return result
  }
}

/**
 * 创建配置加载器
 */
export function createConfigLoader<T>(
  configType: new () => T,
  options?: LoaderOptions
): ConfigLoader<T> {
  return new ConfigLoader(configType, options)
}

