/**
 * EventBus Handler 注册表
 * 类似 Sjgz-Backend 的 interfaces/eventbus/server.go 中的 Registry
 */
import { NewsHandler } from './handler/news'

export class Registry {
  News: NewsHandler

  constructor(newsHandler: NewsHandler) {
    this.News = newsHandler
  }
}

