/**
 * 华尔街见闻新闻源获取器
 * 从 newsnow/server/sources/wallstreetcn.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface WallstreetcnItem {
  uri: string
  id: number
  title?: string
  content_text: string
  content_short: string
  display_time: number
  type?: string
}

interface LiveResponse {
  data: {
    items: WallstreetcnItem[]
  }
}

interface NewsResponse {
  data: {
    items: {
      resource_type?: string
      resource: WallstreetcnItem
    }[]
  }
}

interface HotResponse {
  data: {
    day_items: WallstreetcnItem[]
  }
}

export const wallstreetcnQuickGetter: SourceGetter = async () => {
  const apiUrl = 'https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30'
  
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Wallstreetcn: ${response.statusText}`)
  }

  const res = (await response.json()) as LiveResponse
  
  return res.data.items.map((k) =>
    NewsItem.fromEntity({
      id: k.id.toString(),
      title: k.title || k.content_text,
      url: k.uri,
      extra: {
        date: k.display_time * 1000,
      },
    })
  )
}

export const wallstreetcnNewsGetter: SourceGetter = async () => {
  const apiUrl = 'https://api-one.wallstcn.com/apiv1/content/information-flow?channel=global-channel&accept=article&limit=30'
  
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Wallstreetcn: ${response.statusText}`)
  }

  const res = (await response.json()) as NewsResponse
  
  return res.data.items
    .filter(
      (k) =>
        k.resource_type !== 'theme' &&
        k.resource_type !== 'ad' &&
        k.resource.type !== 'live' &&
        k.resource.uri
    )
    .map(({ resource: h }) =>
      NewsItem.fromEntity({
        id: h.id.toString(),
        title: h.title || h.content_short,
        url: h.uri,
        extra: {
          date: h.display_time * 1000,
        },
      })
    )
}

export const wallstreetcnHotGetter: SourceGetter = async () => {
  const apiUrl = 'https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all'
  
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Wallstreetcn: ${response.statusText}`)
  }

  const res = (await response.json()) as HotResponse
  
  return res.data.day_items.map((h) =>
    NewsItem.fromEntity({
      id: h.id.toString(),
      title: h.title!,
      url: h.uri,
    })
  )
}

