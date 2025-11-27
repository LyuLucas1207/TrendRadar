/**
 * EventBus Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go 中的 Registry
 */
import { SourceHandler } from './handler/source'

export class Registry {
  Source: SourceHandler

  constructor(sourceHandler: SourceHandler) {
    this.Source = sourceHandler
  }
}

