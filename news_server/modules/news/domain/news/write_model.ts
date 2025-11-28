/**
 * News 写模型（Write Model）
 * 用于创建和更新 News
 */
import type { NewsEntity } from './entity'

/**
 * 创建 News 的写模型
 */
export interface NewsCreateWO {
  sourceId: string
  originalId: string | number
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: NewsEntity['extra']
}

/**
 * 更新 News 的写模型
 */
export interface NewsUpdateWO {
  id: string
  title?: string
  url?: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: NewsEntity['extra']
}

