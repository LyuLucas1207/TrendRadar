/**
 * Solidot 新闻源获取器
 * 从 newsnow/server/sources/solidot.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const solidotGetter: SourceGetter = async () => {
  const baseURL = 'https://www.solidot.org'
  const response = await fetch(baseURL)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Solidot: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<div[^>]*class="[^"]*block_m[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g
  
  const items: Array<{ id: string; title: string; url: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    
    if (url && title) {
      items.push({
        id: url,
        title,
        url: baseURL + url,
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

