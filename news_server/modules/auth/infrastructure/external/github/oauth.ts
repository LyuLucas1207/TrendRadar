/**
 * GitHub OAuth 客户端
 * 类似 Sjgz-Backend 的 infrastructure/external 服务
 */
import { ofetch } from 'ofetch'

export interface GitHubOAuthConfig {
  clientId: string
  clientSecret: string
  jwtSecret: string
}

export interface GitHubAccessTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

export interface GitHubUserInfo {
  id: number
  name: string
  avatar_url: string
  email: string
  notification_email: string
}

export class GitHubOAuthClient {
  constructor(private readonly config: GitHubOAuthConfig) {}

  /**
   * 获取 OAuth 授权 URL
   */
  getAuthorizationUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.config.clientId}`
  }

  /**
   * 使用 code 换取 access_token
   */
  async getAccessToken(code: string): Promise<GitHubAccessTokenResponse> {
    const response = await ofetch<GitHubAccessTokenResponse>(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        body: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
        },
        headers: {
          accept: 'application/json',
        },
      }
    )
    return response
  }

  /**
   * 使用 access_token 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<GitHubUserInfo> {
    const response = await ofetch<GitHubUserInfo>('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${accessToken}`,
        'User-Agent': 'NewsServer App',
      },
    })
    return response
  }
}

