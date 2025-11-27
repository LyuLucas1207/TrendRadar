/**
 * 靠谱新闻源获取器
 * 从 newsnow/server/sources/kaopu.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface KaopuItem {
  description: string
  link: string
  pub_date: string
  publisher: string
  title: string
}

export const kaopuGetter: SourceGetter = async () => {
  const url = 'https://kaopustorage.blob.core.windows.net/news-prod/news_list_hans_0.json'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Kaopu: ${response.statusText}`)
  }

  const res = (await response.json()) as KaopuItem[]

  return res
    .filter((k) => !['财新', '公视'].includes(k.publisher))
    .map((k) =>
      NewsItem.fromEntity({
        id: k.link,
        title: k.title,
        url: k.link,
        pubDate: k.pub_date,
        extra: {
          hover: k.description,
          info: k.publisher,
        },
      })
    )
}

