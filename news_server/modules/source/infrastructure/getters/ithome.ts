/**
 * IT之家新闻源获取器
 * 从 newsnow/server/sources/ithome.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const ithomeGetter: SourceGetter = async () => {
  const response = await fetch('https://www.ithome.com/list/')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Ithome: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<li[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*t[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?<i[^>]*>([^<]+)<\/i>/g
  
  const items: Array<{ id: string; title: string; url: string; date: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    const date = match[3].trim()
    
    // 过滤广告
    const isAd = url?.includes('lapin') || ['神券', '优惠', '补贴', '京东'].some((k) => title.includes(k))
    
    if (url && title && date && !isAd) {
      items.push({
        id: url,
        title,
        url,
        date,
      })
    }
  }

  return items
    .map((item) =>
      NewsItem.fromEntity({
        id: item.id,
        title: item.title,
        url: item.url,
        pubDate: new Date(item.date).getTime(),
      })
    )
    .sort((m, n) => (n.pubDate || 0) - (m.pubDate || 0))
}

