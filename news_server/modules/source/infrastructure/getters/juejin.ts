/**
 * 稀土掘金新闻源获取器
 * 从 newsnow/server/sources/juejin.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface JuejinResponse {
  data: {
    content: {
      title: string
      content_id: string
    }
  }[]
}

export const juejinGetter: SourceGetter = async () => {
  const url = 'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot&spider=0'
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Juejin: ${response.statusText}`)
  }

  const res = (await response.json()) as JuejinResponse
  
  return res.data.map((k) =>
    NewsItem.fromEntity({
      id: k.content.content_id,
      title: k.content.title,
      url: `https://juejin.cn/post/${k.content.content_id}`,
    })
  )
}

