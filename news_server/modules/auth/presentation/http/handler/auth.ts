/**
 * Auth Handler
 * 类似 Sjgz-Backend 的 interfaces/http/handler/user.go
 */
import type { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../../../application/auth/service'
import { UserService } from '../../../application/user/service'
import { GitHubOAuthClient } from '../../../infrastructure/external/github/oauth'
import type {
  GitHubCallbackQuery,
  GetUserDataParams,
  SetUserDataParams,
  SetUserDataBody,
} from '../dto/req.dto'
import type {
  UserDataResponse,
  SetUserDataResponse,
  ErrorResponse,
} from '../dto/res.dto'

export class AuthHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly githubOAuth: GitHubOAuthClient
  ) {}

  /**
   * 重定向到 GitHub OAuth 登录
   */
  async login(_request: FastifyRequest, reply: FastifyReply) {
    const url = this.githubOAuth.getAuthorizationUrl()
    return reply.redirect(url)
  }

  /**
   * GitHub OAuth 回调
   */
  async githubCallback(
    request: FastifyRequest<{ Querystring: GitHubCallbackQuery }>,
    reply: FastifyReply
  ) {
    const { code } = request.query

    if (!code) {
      return reply.code(400).send({ error: 'Missing code parameter' } as ErrorResponse)
    }

    try {
      const result = await this.authService.githubLogin.execute(code)

      // 重定向到前端，携带 JWT 和用户信息
      const params = new URLSearchParams({
        login: 'github',
        jwt: result.jwt,
        user: JSON.stringify(result.user),
      })

      // 这里应该重定向到前端 URL，暂时返回 JSON
      return reply.redirect(`/?${params.toString()}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message })
    }
  }

  /**
   * 获取用户数据
   */
  async getUserData(
    request: FastifyRequest<{ Params: GetUserDataParams }>,
    reply: FastifyReply
  ) {
    const { id } = request.params

    try {
      const result = await this.userService.getUserData.execute(id)
      return reply.send(result as UserDataResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message } as ErrorResponse)
    }
  }

  /**
   * 设置用户数据
   */
  async setUserData(
    request: FastifyRequest<{
      Params: SetUserDataParams
      Body: SetUserDataBody
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const { data, updatedTime } = request.body

    try {
      const result = await this.userService.setUserData.execute({
        userId: id,
        data,
        updatedTime,
      })
      return reply.send(result as SetUserDataResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return reply.code(500).send({ error: message } as ErrorResponse)
    }
  }
}

