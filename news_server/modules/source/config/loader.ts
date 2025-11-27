/**
 * Source 配置加载器
 * 类似 Sjgz-Backend 的 internal/source/config/loader.go
 */
import { createConfigLoader, type LoaderOptions } from '@packages/configx/loader'
import { SourceConfig } from './config'
import { consola } from 'consola'
import { resolve } from 'path'
import { existsSync } from 'fs'

export interface SourceConfigLoaderOptions extends LoaderOptions {
  /**
   * 环境（development, production, etc.）
   */
  env?: string
}

/**
 * 加载 Source 配置
 * 配置文件是必需的，不允许使用默认值
 */
export function loadSourceConfig(options: SourceConfigLoaderOptions = {}): SourceConfig {
  const { env = process.env.NODE_ENV || 'development', configPath, ...restOptions } = options

  // 确定配置文件路径（必需）
  let finalConfigPath = configPath
  if (!finalConfigPath) {
    const defaultPath = resolve(process.cwd(), 'config', `source.${env}.json`)
    if (existsSync(defaultPath)) {
      finalConfigPath = defaultPath
    } else {
      throw new Error(
        `Config file not found. Please provide configPath or create config/source.${env}.json`
      )
    }
  }

  const loader = createConfigLoader(SourceConfig, {
    envPrefix: 'SOURCE',
    configPath: finalConfigPath,
    ...restOptions,
  })

  const config = loader.getConfig()

  // 严格验证配置（所有必需字段必须存在）
  try {
    config.validate()
  } catch (error) {
    consola.error('❌ 配置验证失败:', error)
    throw error
  }

  consola.success('✅ Source 配置加载成功')
  return config
}

/**
 * 从环境变量加载配置（兼容旧版本，不推荐使用）
 * @deprecated 请使用 loadSourceConfig 从配置文件加载
 */
export function LoadSourceConfigFromEnv(): SourceConfig {
  consola.warn('⚠️ LoadSourceConfigFromEnv 已废弃，请使用 loadSourceConfig 从配置文件加载')
  return loadSourceConfig()
}
