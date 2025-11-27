/**
 * Auth Service
 * 类似 Sjgz-Backend 的 application/user/service.go
 * 负责认证相关的业务逻辑
 */
import { GitHubOAuthClient } from '../../infrastructure/external/github/oauth'
import { JWTService } from '../../domain/auth/jwt'
import type { IUserRepository } from '../../domain/user/repository'
import { GitHubLogin } from './github-login'

export class AuthService {
  public readonly githubLogin: GitHubLogin

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly githubOAuth: GitHubOAuthClient,
    private readonly jwtService: JWTService
  ) {
    this.githubLogin = new GitHubLogin(userRepository, githubOAuth, jwtService)
  }
}

