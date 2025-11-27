/**
 * Auth 配置加载器
 * 类似 Sjgz-Backend 的 internal/user/config/config.go
 */
import { createConfigLoader, type LoaderOptions } from '@packages/configx/loader'
import { AuthConfig } from './types'
import { consola } from 'consola'
import { resolve } from 'path'
import { existsSync } from 'fs'

export interface AuthConfigLoaderOptions extends LoaderOptions {
  /**
   * 环境（development, production, etc.）
   */
  env?: string
}

/**
 * 加载 Auth 配置
 * 配置文件是必需的，不允许使用默认值
 */
export function loadAuthConfig(options: AuthConfigLoaderOptions = {}): AuthConfig {
  const { env = process.env.NODE_ENV || 'development', configPath, ...restOptions } = options

  // 确定配置文件路径（必需）
  let finalConfigPath = configPath
  if (!finalConfigPath) {
    const defaultPath = resolve(process.cwd(), 'config', `auth.${env}.json`)
    if (existsSync(defaultPath)) {
      finalConfigPath = defaultPath
    } else {
      throw new Error(
        `Config file not found. Please provide configPath or create config/auth.${env}.json`
      )
    }
  }

  const loader = createConfigLoader(AuthConfig, {
    envPrefix: 'AUTH',
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

  consola.success('✅ Auth 配置加载成功')
  return config
}

