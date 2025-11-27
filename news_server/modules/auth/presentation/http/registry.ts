/**
 * Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/http/registry.go
 */
import { AuthHandler } from './handler/auth'

export class Registry {
  Auth: AuthHandler

  constructor(authHandler: AuthHandler) {
    this.Auth = authHandler
  }
}

