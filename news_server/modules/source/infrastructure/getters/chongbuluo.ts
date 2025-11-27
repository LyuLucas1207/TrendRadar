/**
 * 虫部落新闻源获取器
 * 从 newsnow/server/sources/chongbuluo.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'
import { defineRSSSource } from './utils'

export const chongbuluoHotGetter: SourceGetter = async () => {
  const baseUrl = 'https://www.chongbuluo.com/'
  const response = await fetch(`${baseUrl}forum.php?mod=guide&view=hot`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Chongbuluo: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML
  const regex = /<tr[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*xst[^"]*"[^>]*>([^<]+)<\/a>/g
  
  const items: Array<{ id: string; title: string; url: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    
    if (url && title) {
      items.push({
        id: baseUrl + url,
        title,
        url: baseUrl + url,
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      extra: {
        hover: item.title,
      },
    })
  )
}

export const chongbuluoLatestGetter = defineRSSSource(
  'https://www.chongbuluo.com/forum.php?mod=rss&view=newthread'
)

