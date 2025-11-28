/**
 * Kafka Topics 定义
 * 类似 Sjgz-Backend 的 events/topics.go
 */

/**
 * TopicKey 类型定义
 */
export type TopicKey = string

/**
 * TopicKey 常量定义
 * 用于在配置中引用 topic（作为 map 的 key）
 */
export const TopicKeys = {
  // Auth 服务
  AUTH: 'auth',
  AUTH_POISON: 'auth_poison',

  // News 服务
  NEWS: 'news',
  NEWS_POISON: 'news_poison',

  // Source 服务
  SOURCE: 'source',
  SOURCE_POISON: 'source_poison',

  // Crawl 服务
  CRAWL: 'crawl',
  CRAWL_POISON: 'crawl_poison',
} as const

/**
 * 实际的 Topic 名称映射
 * TopicKey -> Topic Name
 */
export const Topics: Record<TopicKey, string> = {
  [TopicKeys.AUTH]: 'trendradar.auth',
  [TopicKeys.AUTH_POISON]: 'trendradar.auth_poison',
  [TopicKeys.NEWS]: 'trendradar.news',
  [TopicKeys.NEWS_POISON]: 'trendradar.news_poison',
  [TopicKeys.SOURCE]: 'trendradar.source',
  [TopicKeys.SOURCE_POISON]: 'trendradar.source_poison',
  [TopicKeys.CRAWL]: 'trendradar.crawl_server',
  [TopicKeys.CRAWL_POISON]: 'trendradar.crawl_server_poison',
}

/**
 * 根据 TopicKey 获取 Topic 名称
 */
export function getTopicName(key: TopicKey): string {
  const topic = Topics[key]
  if (!topic) {
    throw new Error(`Topic not found for key: ${key}`)
  }
  return topic
}

