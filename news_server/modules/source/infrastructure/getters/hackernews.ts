/**
 * Hacker News 新闻源获取器
 * 从 newsnow/server/sources/hackernews.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const hackernewsGetter: SourceGetter = async () => {
  const baseURL = 'https://news.ycombinator.com'
  const response = await fetch(baseURL)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Hacker News: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 简单的 HTML 解析（实际项目中应该使用 cheerio 或类似库）
  // 这里使用正则表达式作为简化版本
  const itemRegex = /<tr class="athing" id="(\d+)">[\s\S]*?<a[^>]*class="titleline"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g
  const scoreRegex = /<span class="score" id="score_(\d+)">(\d+) points<\/span>/g
  
  const items: Array<{ id: string; url: string; title: string; score?: string }> = []
  let match
  
  // 提取所有新闻项
  while ((match = itemRegex.exec(html)) !== null) {
    const id = match[1]
    let url = match[2]
    const title = match[3].trim()
    
    // 处理相对 URL
    if (url.startsWith('item?')) {
      url = `${baseURL}/${url}`
    } else if (url.startsWith('/')) {
      url = `${baseURL}${url}`
    }
    
    items.push({ id, url, title })
  }
  
  // 提取分数
  const scores = new Map<string, string>()
  while ((match = scoreRegex.exec(html)) !== null) {
    scores.set(match[1], match[2])
  }
  
  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      extra: {
        info: scores.get(item.id) ? `${scores.get(item.id)} points` : undefined,
      },
    })
  )
}

