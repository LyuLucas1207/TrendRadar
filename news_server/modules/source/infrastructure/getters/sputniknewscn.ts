/**
 * 卫星通讯社新闻源获取器
 * 从 newsnow/server/sources/sputniknewscn.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const sputniknewscnGetter: SourceGetter = async () => {
  const response = await fetch('https://sputniknews.cn/services/widget/lenta/')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Sputniknewscn: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<div[^>]*class="[^"]*lenta__item[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*lenta__item-text[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class="[^"]*lenta__item-date[^"]*"[^>]*data-unixtime="(\d+)"/g
  
  const items: Array<{ id: string; title: string; url: string; date: number }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    const date = match[3]
    
    if (url && title && date) {
      items.push({
        id: url,
        title,
        url: `https://sputniknews.cn${url}`,
        date: Number(`${date}000`),
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      extra: {
        date: item.date,
      },
    })
  )
}

