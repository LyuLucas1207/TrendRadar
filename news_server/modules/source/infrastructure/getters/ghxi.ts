/**
 * 果核剥壳新闻源获取器
 * 从 newsnow/server/sources/ghxi.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const ghxiGetter: SourceGetter = async () => {
  const response = await fetch('https://www.ghxi.com/category/all')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Ghxi: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<li[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*item-title[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?<div[^>]*class="[^"]*item-excerpt[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class="[^"]*date[^"]*"[^>]*>([^<]+)<\/div>/g
  
  const items: Array<{ id: string; title: string; url: string; desc: string; date: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    const desc = match[3].trim()
    const date = match[4].trim()
    
    if (url && title) {
      items.push({
        id: url,
        title,
        url,
        desc,
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
        hover: item.desc,
        date: item.date,
      },
    })
  )
}

