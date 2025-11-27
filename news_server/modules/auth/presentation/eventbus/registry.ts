/**
 * EventBus Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go 中的 Registry
 */
import { AuthHandler } from './handler/auth'

export class Registry {
  Auth: AuthHandler

  constructor(authHandler: AuthHandler) {
    this.Auth = authHandler
  }
}

