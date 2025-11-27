/**
 * 法布财经新闻源获取器
 * 从 newsnow/server/sources/fastbull.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const fastbullExpressGetter: SourceGetter = async () => {
  const baseURL = 'https://www.fastbull.com'
  const response = await fetch(`${baseURL}/cn/express-news`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Fastbull: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<div[^>]*class="[^"]*news-list[^"]*"[^>]*data-date="(\d+)"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*title_name[^"]*"[^>]*>([^<]+)<\/a>/g
  
  const items: Array<{ id: string; title: string; url: string; pubDate: number }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const date = match[1]
    const url = match[2]
    const titleText = match[3].trim()
    const titleMatch = titleText.match(/【(.+)】/)
    const title = titleMatch ? titleMatch[1] : titleText
    
    if (url && title && date) {
      items.push({
        id: url,
        title: title.length < 4 ? titleText : title,
        url: baseURL + url,
        pubDate: Number(date),
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      pubDate: item.pubDate,
    })
  )
}

export const fastbullNewsGetter: SourceGetter = async () => {
  const baseURL = 'https://www.fastbull.com'
  const response = await fetch(`${baseURL}/cn/news`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Fastbull: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*trending_type[^"]*"[^>]*data-date="(\d+)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/g
  
  const items: Array<{ id: string; title: string; url: string; pubDate: number }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const date = match[2]
    const title = match[3].trim()
    
    if (url && title && date) {
      items.push({
        id: url,
        title,
        url: baseURL + url,
        pubDate: Number(date),
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      pubDate: item.pubDate,
    })
  )
}

