/**
 * 36氪新闻源获取器
 * 从 newsnow/server/sources/_36kr.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const _36krQuickGetter: SourceGetter = async () => {
  const baseURL = 'https://www.36kr.com'
  const url = `${baseURL}/newsflashes`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch 36kr: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<div[^>]*class="[^"]*newsflash-item[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*item-title[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?<div[^>]*class="[^"]*time[^"]*"[^>]*>([^<]+)<\/div>/g
  
  const items: Array<{ id: string; title: string; url: string; date: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    const date = match[3].trim()
    
    if (url && title && date) {
      items.push({
        id: url,
        title,
        url: `${baseURL}${url}`,
        date,
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      extra: {
        date: item.date,
      },
    })
  )
}

