/**
 * 少数派新闻源获取器
 * 从 newsnow/server/sources/sspai.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface SspaiResponse {
  data: {
    id: number
    title: string
  }[]
}

export const sspaiGetter: SourceGetter = async () => {
  const timestamp = Date.now()
  const limit = 30
  const url = `https://sspai.com/api/v1/article/tag/page/get?limit=${limit}&offset=0&created_at=${timestamp}&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0&released=false`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Sspai: ${response.statusText}`)
  }

  const res = (await response.json()) as SspaiResponse
  
  return res.data.map((k) =>
    NewsItem.fromEntity({
      id: k.id.toString(),
      title: k.title,
      url: `https://sspai.com/post/${k.id}`,
    })
  )
}

