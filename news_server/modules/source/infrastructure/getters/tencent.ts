/**
 * 腾讯新闻源获取器
 * 从 newsnow/server/sources/tencent.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface TencentResponse {
  ret: number
  msg: string
  data: {
    tabs: {
      id: string
      articleList: {
        id: string
        title: string
        link_info: {
          url: string
        }
        desc: string
      }[]
    }[]
  }
}

export const tencentHotGetter: SourceGetter = async () => {
  const url = 'https://i.news.qq.com/web_backend/v2/getTagInfo?tagId=aEWqxLtdgmQ%3D'
  
  const response = await fetch(url, {
    headers: {
      Referer: 'https://news.qq.com/',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Tencent: ${response.statusText}`)
  }

  const res = (await response.json()) as TencentResponse
  
  return res.data.tabs[0].articleList.map((news) =>
    NewsItem.fromEntity({
      id: news.id,
      title: news.title,
      url: news.link_info.url,
      extra: {
        hover: news.desc,
      },
    })
  )
}

