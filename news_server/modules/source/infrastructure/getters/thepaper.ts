/**
 * 澎湃新闻源获取器
 * 从 newsnow/server/sources/thepaper.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface ThepaperResponse {
  data: {
    hotNews: {
      contId: string
      name: string
      pubTimeLong: string
    }[]
  }
}

export const thepaperGetter: SourceGetter = async () => {
  const url = 'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Thepaper: ${response.statusText}`)
  }

  const res = (await response.json()) as ThepaperResponse
  
  return res.data.hotNews.map((k) =>
    NewsItem.fromEntity({
      id: k.contId,
      title: k.name,
      url: `https://www.thepaper.cn/newsDetail_forward_${k.contId}`,
      mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${k.contId}`,
    })
  )
}

