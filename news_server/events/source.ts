/**
 * Source 服务事件定义
 * 类似 Sjgz-Backend 的 events/catalog.go
 */

import type { EventType } from './events'
import type { TopicKey } from './topics'
import { EventTypes } from './events'
import { TopicKeys } from './topics'

/**
 * SourceDataFetchedEvent Source 服务数据获取事件
 */
export interface SourceDataFetchedEvent {
  sourceId: string
  items: Array<{
    id: string | number
    title: string
    url: string
    mobileUrl?: string
    pubDate?: number | string
    extra?: {
      hover?: string
      date?: number | string
      info?: false | string
      diff?: number
      icon?: false | string | {
        url: string
        scale: number
      }
    }
  }>
  timestamp: number
}

/**
 * 获取事件类型
 */
export function getEventType(): EventType {
  return EventTypes.SOURCE_DATA_FETCHED
}

/**
 * 获取 TopicKey
 */
export function getTopicKey(): TopicKey {
  return TopicKeys.NEWS // Source 服务发布到 News topic
}

