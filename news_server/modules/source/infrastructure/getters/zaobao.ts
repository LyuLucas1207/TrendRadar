/**
 * 联合早报新闻源获取器
 * 从 newsnow/server/sources/zaobao.ts 迁移
 * 注意：需要编码转换和 HTML 解析，这里提供简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const zaobaoGetter: SourceGetter = async () => {
  const base = 'https://www.zaochenbao.com'
  const response = await fetch('https://www.zaochenbao.com/realtime/', {
    headers: {
      'Accept-Charset': 'gb2312',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Zaobao: ${response.statusText}`)
  }

  // 注意：实际实现需要处理 GB2312 编码转换
  // 这里提供简化版本，假设响应已经是 UTF-8
  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*eps[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class="[^"]*pdt10[^"]*"[^>]*>([^<]+)<\/div>/g
  
  const items: Array<{ id: string; title: string; url: string; date: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    const date = match[3].trim().replace(/-\s/g, ' ')
    
    if (url && title && date) {
      items.push({
        id: url,
        title,
        url: base + url,
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

