/**
 * HTTP 路由注册
 * 类似 Sjgz-Backend 的 interfaces/http/router.go
 */
import type { FastifyInstance } from 'fastify'
import { Registry } from './registry'
import type {
  GitHubCallbackQuery,
  GetUserDataParams,
  SetUserDataParams,
  SetUserDataBody,
} from './dto/req.dto'

export class Router {
  constructor(
    private readonly app: FastifyInstance,
    private readonly handlers: Registry
  ) {}

  RegisterRoutes() {
    // GitHub OAuth 登录入口
    this.app.get('/api/login', async (request, reply) => {
      return this.handlers.Auth.login(request, reply)
    })

    // GitHub OAuth 回调
    this.app.get<{ Querystring: GitHubCallbackQuery }>('/auth/api/oauth/github', async (request, reply) => {
      return this.handlers.Auth.githubCallback(request, reply)
    })

    // 获取用户数据
    this.app.get<{ Params: GetUserDataParams }>('/auth/api/me/:id', async (request, reply) => {
      return this.handlers.Auth.getUserData(request, reply)
    })

    // 设置用户数据
    this.app.post<{ Params: SetUserDataParams; Body: SetUserDataBody }>('/auth/api/me/:id', async (request, reply) => {
      return this.handlers.Auth.setUserData(request, reply)
    })
  }
}

