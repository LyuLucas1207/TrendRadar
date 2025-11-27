/**
 * 格隆汇新闻源获取器
 * 从 newsnow/server/sources/gelonghui.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const gelonghuiGetter: SourceGetter = async () => {
  const baseURL = 'https://www.gelonghui.com'
  const response = await fetch('https://www.gelonghui.com/news/')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Gelonghui: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  // 实际实现可能需要更复杂的解析逻辑
  const regex = /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/g
  
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

