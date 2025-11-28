/**
 * 事件类型常量定义
 */

export type EventType = string

/**
 * EventType 常量定义
 */
export const EventTypes = {
  // =============== Source Events ===============
  SOURCE_DATA_FETCHED: 'source.data.fetched',

  // =============== News Events ===============
  NEWS_ITEM_CREATED: 'news.item.created',
  NEWS_ITEM_UPDATED: 'news.item.updated',

  // =============== Auth Events ===============
  AUTH_USER_CREATED: 'auth.user.created',
  AUTH_USER_UPDATED: 'auth.user.updated',
} as const

