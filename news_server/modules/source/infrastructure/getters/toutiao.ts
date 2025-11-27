/**
 * 今日头条新闻源获取器
 * 从 newsnow/server/sources/toutiao.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface ToutiaoResponse {
  data: {
    ClusterIdStr: string
    Title: string
    HotValue: string
    Image: {
      url: string
    }
    LabelUri?: {
      url: string
    }
  }[]
}

export const toutiaoGetter: SourceGetter = async () => {
  const url = 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Toutiao: ${response.statusText}`)
  }

  const res = (await response.json()) as ToutiaoResponse
  
  return res.data.map((k) =>
    NewsItem.fromEntity({
      id: k.ClusterIdStr,
      title: k.Title,
      url: `https://www.toutiao.com/trending/${k.ClusterIdStr}/`,
      extra: {
        icon: k.LabelUri?.url
          ? {
              url: k.LabelUri.url,
              scale: 1,
            }
          : false,
      },
    })
  )
}

