/**
 * GitHub 新闻源获取器
 * 从 newsnow/server/sources/github.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const githubTrendingGetter: SourceGetter = async () => {
  const baseURL = 'https://github.com'
  const response = await fetch('https://github.com/trending?spoken_language_code=')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub trending: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 简单的 HTML 解析（实际项目中应该使用 cheerio）
  // 使用正则表达式作为简化版本
  const articleRegex = /<article[^>]*data-hpc[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<a[^>]*href="([^"]*stargazers[^"]*)"[^>]*>([\s\S]*?)<\/a>/g
  
  const items: Array<{ url: string; title: string; desc: string; star: string }> = []
  let match
  
  while ((match = articleRegex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].replace(/\n+/g, '').trim()
    const desc = match[3].replace(/\n+/g, '').trim()
    const star = match[5].replace(/\s+/g, '').trim()
    
    if (url && title) {
      items.push({
        url: url.startsWith('/') ? `${baseURL}${url}` : url,
        title,
        desc,
        star,
      })
    }
  }
  
  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.url,
      title: item.title,
      url: item.url,
      extra: {
        info: `✰ ${item.star}`,
        hover: item.desc,
      },
    })
  )
}

