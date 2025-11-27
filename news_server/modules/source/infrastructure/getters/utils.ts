/**
 * 源获取器工具函数
 * 从 newsnow/server/utils/source.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

export interface RSSItem {
  title: string
  link: string
  created?: string
}

export interface RSSInfo {
  items: RSSItem[]
}

export interface RSSHubItem {
  id: string
  url: string
  title: string
  date_published?: string
}

export interface RSSHubInfo {
  items: RSSHubItem[]
}

export interface SourceOption {
  hiddenDate?: boolean
}

export interface RSSHubOption {
  sorted?: boolean
  limit?: number
}

/**
 * 定义 RSS 源获取器
 * 使用正则表达式解析，兼容 Node.js 和浏览器环境
 */
export function defineRSSSource(url: string, option?: SourceOption): SourceGetter {
  return async () => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.statusText}`)
    }

    // 使用正则表达式解析 RSS（兼容 Node.js 和浏览器环境）
    const text = await response.text()
    
    // 提取所有 <item> 标签
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    const items: Array<{ title: string; link: string; pubDate?: string }> = []
    let itemMatch

    while ((itemMatch = itemRegex.exec(text)) !== null) {
      const itemContent = itemMatch[1]
      
      // 提取 title（支持 CDATA）
      const titleMatch = itemContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      let title = ''
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .replace(/<[^>]+>/g, '')
          .trim()
      }
      
      // 提取 link
      let link = ''
      const linkMatch1 = itemContent.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
      const linkMatch2 = itemContent.match(/<link[^>]*href="([^"]*)"/i)
      const linkMatch3 = itemContent.match(/<link[^>]*>([^<]+)<\/link>/i)
      
      if (linkMatch1) {
        link = linkMatch1[1].trim()
      } else if (linkMatch2) {
        link = linkMatch2[1].trim()
      } else if (linkMatch3) {
        link = linkMatch3[1].trim()
      }
      
      // 提取 pubDate
      const pubDateMatch = itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                          itemContent.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : undefined

      if (title && link) {
        items.push({ title, link, pubDate })
      }
    }

    if (items.length === 0) {
      throw new Error('Cannot fetch RSS data')
    }

    return items.map((item) =>
      NewsItem.fromEntity({
        id: item.link,
        title: item.title,
        url: item.link,
        pubDate: !option?.hiddenDate && item.pubDate ? new Date(item.pubDate).getTime() : undefined,
      })
    )
  }
}

/**
 * 定义 RSSHub 源获取器
 */
export function defineRSSHubSource(
  route: string,
  RSSHubOptions?: RSSHubOption,
  sourceOption?: SourceOption
): SourceGetter {
  return async () => {
    const RSSHubBase = 'https://rsshub.rssforever.com'
    const url = new URL(route, RSSHubBase)
    url.searchParams.set('format', 'json')

    const options = {
      sorted: true,
      ...RSSHubOptions,
    }

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value.toString())
      }
    })

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch RSSHub: ${response.statusText}`)
    }

    const data = (await response.json()) as RSSHubInfo

    return data.items.map((item) =>
      NewsItem.fromEntity({
        id: item.id || item.url,
        title: item.title,
        url: item.url,
        pubDate:
          !sourceOption?.hiddenDate && item.date_published
            ? new Date(item.date_published).getTime()
            : undefined,
      })
    )
  }
}
