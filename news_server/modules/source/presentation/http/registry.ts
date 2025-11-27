/**
 * Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/http/registry.go
 */
import { SourceHandler } from './handler/source'

export class Registry {
  Source: SourceHandler

  constructor(sourceHandler: SourceHandler) {
    this.Source = sourceHandler
  }
}

