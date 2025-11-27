/**
 * JWT 认证领域服务
 * 类似 Sjgz-Backend 的 domain 层服务
 */
import { SignJWT } from 'jose'

export interface JWTConfig {
  secret: string
  expirationTime?: string
}

export class JWTService {
  constructor(private readonly config: JWTConfig) {}

  /**
   * 生成 JWT Token
   */
  async generateToken(payload: { id: string; type: string }): Promise<string> {
    const token = await new SignJWT(payload)
      .setExpirationTime(this.config.expirationTime || '60d')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode(this.config.secret))

    return token
  }
}

