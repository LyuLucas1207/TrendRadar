/**
 * 百度热搜新闻源获取器
 * 从 newsnow/server/sources/baidu.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface BaiduResponse {
  data: {
    cards: {
      content: {
        isTop?: boolean
        word: string
        rawUrl: string
        desc?: string
      }[]
    }[]
  }
}

export const baiduGetter: SourceGetter = async () => {
  const response = await fetch('https://top.baidu.com/board?tab=realtime')
  if (!response.ok) {
    throw new Error(`Failed to fetch Baidu: ${response.statusText}`)
  }

  const rawData = await response.text()
  const jsonMatch = rawData.match(/<!--s-data:(.*?)-->/s)
  
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Failed to parse Baidu data')
  }

  const data: BaiduResponse = JSON.parse(jsonMatch[1])

  return data.data.cards[0].content
    .filter((k) => !k.isTop)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.rawUrl,
        title: k.word,
        url: k.rawUrl,
        extra: {
          hover: k.desc,
        },
      })
    )
}

