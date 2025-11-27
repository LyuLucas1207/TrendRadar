/**
 * 凤凰网新闻源获取器
 * 从 newsnow/server/sources/ifeng.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface IfengHotNews {
  url: string
  title: string
  newsTime: string
}

export const ifengGetter: SourceGetter = async () => {
  const response = await fetch('https://www.ifeng.com/')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Ifeng: ${response.statusText}`)
  }

  const html = await response.text()
  const regex = /var\s+allData\s*=\s*(\{[\s\S]*?\});/
  const match = regex.exec(html)
  
  if (!match) {
    throw new Error('Failed to parse Ifeng data')
  }

  const realData = JSON.parse(match[1]) as { hotNews1: IfengHotNews[] }
  const rawNews = realData.hotNews1 || []

  return rawNews.map((hotNews) =>
    NewsItem.fromEntity({
      id: hotNews.url,
      title: hotNews.title,
      url: hotNews.url,
      extra: {
        date: hotNews.newsTime,
      },
    })
  )
}

