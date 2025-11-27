/**
 * Kafka Topics 定义
 * 类似 Sjgz-Backend 的 events/topics.go
 */
export const Topics = {
  /**
   * Auth 服务相关 Topics
   */
  AUTH: 'trendradar.auth',
  AUTH_POISON: 'trendradar.auth_poison',

  /**
   * News 服务相关 Topics
   */
  NEWS: 'trendradar.news',
  NEWS_POISON: 'trendradar.news_poison',

  /**
   * Source 服务相关 Topics
   */
  SOURCE: 'trendradar.source',
  SOURCE_POISON: 'trendradar.source_poison',

  /**
   * Crawl 服务相关 Topics
   */
  CRAWL: 'trendradar.crawl_server',
  CRAWL_POISON: 'trendradar.crawl_server_poison',
} as const

export type Topic = typeof Topics[keyof typeof Topics]

