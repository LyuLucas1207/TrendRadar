/**
 * 虎扑新闻源获取器
 * 从 newsnow/server/sources/hupu.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const hupuGetter: SourceGetter = async () => {
  const response = await fetch('https://bbs.hupu.com/topic-daily-hot')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Hupu: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 正则表达式匹配热榜项
  const regex = /<li class="bbs-sl-web-post-body">[\s\S]*?<a href="(\/[^"]+?\.html)"[^>]*?class="p-title"[^>]*>([^<]+)<\/a>/g
  
  const items: Array<{ id: string; title: string; url: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const path = match[1]
    const title = match[2].trim()
    const url = `https://bbs.hupu.com${path}`

    items.push({
      id: path,
      title,
      url,
    })
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
    })
  )
}

