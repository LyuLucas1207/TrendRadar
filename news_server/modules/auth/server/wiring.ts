/**
 * 依赖注入/装配
 * 类似 Sjgz-Backend 的 wiring.go
 */
import { PostgreSQLClient } from '@packages/postgresqlx/client'
import { UserRepository } from '../infrastructure/repository/user/postgres'
import { GitHubOAuthClient } from '../infrastructure/external/github/oauth'
import { JWTService } from '../domain/auth/jwt'
import { AuthService } from '../application/auth/service'
import { UserService } from '../application/user/service'
import type { AuthConfig } from '../config/config'
import { consola } from 'consola'

export class AuthDependencies {
  constructor(
    public readonly pgClient: PostgreSQLClient,
    public readonly userRepository: UserRepository,
    public readonly githubOAuth: GitHubOAuthClient,
    public readonly jwtService: JWTService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
  ) {}

  async cleanup() {
    await this.pgClient.close()
    consola.info('Auth dependencies cleaned up')
  }
}

export async function NewDeps(config: AuthConfig): Promise<AuthDependencies> {
  // 初始化 PostgreSQL
  const pgClient = new PostgreSQLClient(config.toPostgreSQLConfig())

  if (!pgClient.enablePostgreSQL) {
    throw new Error('PostgreSQL 未启用，无法启动服务')
  }

  // 验证 PostgreSQL 连接，失败时抛出错误并停止服务
  await pgClient.ensureConnected()

  // 初始化仓储
  const userRepository = new UserRepository(pgClient.getDb())

  // 初始化表（如果需要）
  if (config.features.initTable) {
    await userRepository.init()
  }

  // 初始化外部服务
  const githubOAuth = new GitHubOAuthClient(config.toGitHubConfig())

  // 初始化领域服务
  const jwtService = new JWTService(config.toJWTConfig())

  // 初始化应用服务
  const authService = new AuthService(userRepository, githubOAuth, jwtService)
  const userService = new UserService(userRepository)

  return new AuthDependencies(
    pgClient,
    userRepository,
    githubOAuth,
    jwtService,
    authService,
    userService
  )
}

