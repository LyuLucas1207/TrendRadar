/**
 * GitHub 登录用例
 * 类似 Sjgz-Backend 的 application/user/login.go
 */
import { GitHubOAuthClient } from '../../infrastructure/external/github/oauth'
import { JWTService } from '../../domain/auth/jwt'
import type { IUserRepository } from '../../domain/user/repository'
import type { UserCreateWO } from '../../domain/user/write_model'

export interface GitHubLoginResult {
  jwt: string
  user: {
    id: string
    avatar: string
    name: string
  }
}

export class GitHubLogin {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly githubOAuth: GitHubOAuthClient,
    private readonly jwtService: JWTService
  ) {}

  async execute(code: string): Promise<GitHubLoginResult> {
    // 1. 使用 code 换取 access_token
    const tokenResponse = await this.githubOAuth.getAccessToken(code)

    // 2. 使用 access_token 获取用户信息
    const githubUser = await this.githubOAuth.getUserInfo(tokenResponse.access_token)

    // 3. 创建 Write Model (WO)
    const userId = String(githubUser.id)
    const wo: UserCreateWO = {
      id: userId,
      email: githubUser.notification_email || githubUser.email,
      type: 'github',
    }

    // 4. 保存或更新用户 (WO → Repository → RO)
    const userRO = await this.userRepository.addUser(wo)

    // 5. 生成 JWT Token
    const jwt = await this.jwtService.generateToken({
      id: userId,
      type: 'github',
    })

    return {
      jwt,
      user: {
        id: userId,
        avatar: githubUser.avatar_url,
        name: githubUser.name,
      },
    }
  }
}

