/**
 * V2EX 新闻源获取器
 * 从 newsnow/server/sources/v2ex.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface V2EXFeedResponse {
  version: string
  title: string
  description: string
  home_page_url: string
  feed_url: string
  icon: string
  favicon: string
  items: {
    url: string
    date_modified?: string
    content_html: string
    date_published: string
    title: string
    id: string
  }[]
}

async function fetchV2EXFeed(category: string): Promise<V2EXFeedResponse> {
  const response = await fetch(`https://www.v2ex.com/feed/${category}.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch V2EX feed: ${response.statusText}`)
  }
  return (await response.json()) as V2EXFeedResponse
}

export const v2exGetter: SourceGetter = async () => {
  const categories = ['create', 'ideas', 'programmer', 'share']
  const responses = await Promise.all(
    categories.map((cat) => fetchV2EXFeed(cat))
  )

  const allItems = responses
    .flatMap((res) => res.items)
    .map((item) => {
      return NewsItem.fromEntity({
        id: item.id,
        title: item.title,
        url: item.url,
        pubDate: item.date_modified || item.date_published,
        extra: {
          date: item.date_modified || item.date_published,
        },
      })
    })
    .sort((a, b) => {
      const dateA = a.pubDate ? (typeof a.pubDate === 'string' ? new Date(a.pubDate).getTime() : a.pubDate) : 0
      const dateB = b.pubDate ? (typeof b.pubDate === 'string' ? new Date(b.pubDate).getTime() : b.pubDate) : 0
      return dateB - dateA
    })

  return allItems
}

