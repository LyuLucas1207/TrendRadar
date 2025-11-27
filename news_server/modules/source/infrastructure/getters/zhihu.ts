/**
 * 知乎新闻源获取器
 * 从 newsnow/server/sources/zhihu.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface ZhihuResponse {
  data: {
    type: 'hot_list_feed'
    style_type: '1'
    feed_specific: {
      answer_count: number
    }
    target: {
      title_area: {
        text: string
      }
      excerpt_area: {
        text: string
      }
      image_area: {
        url: string
      }
      metrics_area: {
        text: string
        font_color: string
        background: string
        weight: string
      }
      label_area: {
        type: 'trend'
        trend: number
        night_color: string
        normal_color: string
      }
      link: {
        url: string
      }
    }
  }[]
}

export const zhihuGetter: SourceGetter = async () => {
  const url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true'
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Zhihu feed: ${response.statusText}`)
  }

  const res: ZhihuResponse = await response.json()

  return res.data.map((item) => {
    const urlMatch = item.target.link.url.match(/(\d+)$/)
    const id = urlMatch ? urlMatch[1] : item.target.link.url

    return NewsItem.fromEntity({
      id,
      title: item.target.title_area.text,
      url: item.target.link.url,
      extra: {
        info: item.target.metrics_area.text,
        hover: item.target.excerpt_area.text,
      },
    })
  })
}

