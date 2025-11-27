/**
 * Steam 新闻源获取器
 * 从 newsnow/server/sources/steam.ts 迁移
 * 注意：需要 HTML 解析，这里使用正则表达式简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export const steamGetter: SourceGetter = async () => {
  const response = await fetch('https://store.steampowered.com/stats/stats/')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Steam: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 使用正则表达式解析 HTML（简化版本）
  const regex = /<tr[^>]*class="[^"]*player_count_row[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*class="[^"]*gameLink[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?<span[^>]*class="[^"]*currentServers[^"]*"[^>]*>([^<]+)<\/span>/g
  
  const items: Array<{ id: string; title: string; url: string; players: string }> = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const gameName = match[2].trim()
    const players = match[3].trim()
    
    if (url && gameName && players) {
      items.push({
        id: url,
        title: gameName,
        url,
        players,
      })
    }
  }

  return items.map((item) =>
    NewsItem.fromEntity({
      id: item.id,
      title: item.title,
      url: item.url,
      pubDate: Date.now(),
      extra: {
        info: item.players,
      },
    })
  )
}

