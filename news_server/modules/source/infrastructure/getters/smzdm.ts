/**
 * 什么值得买新闻源获取器
 * 从 newsnow/server/sources/smzdm.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const smzdmGetter: SourceGetter = async () => {
  const baseURL = 'https://post.smzdm.com/hot_1/'
  const response = await fetch(baseURL)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Smzdm: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<div[^>]*id="[^"]*feed-main-list[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*z-feed-title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g
  
  const items: Array<{ id: string; title: string; url: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    
    if (url && title) {
      items.push({
        id: url,
        title,
        url,
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
    })
  )
}

