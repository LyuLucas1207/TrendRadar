/**
 * HTTP Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/http/registry.go
 */
import { NewsHandler } from './handler/news'

export class Registry {
  public readonly News: NewsHandler

  constructor(newsHandler: NewsHandler) {
    this.News = newsHandler
  }
}

