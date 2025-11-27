/**
 * 金十数据新闻源获取器
 * 从 newsnow/server/sources/jin10.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface Jin10Item {
  id: string
  time: string
  type: number
  data: {
    pic?: string
    title?: string
    source?: string
    content?: string
    source_link?: string
    vip_title?: string
    lock?: boolean
    vip_level?: number
    vip_desc?: string
  }
  important: number
  tags: string[]
  channel: number[]
  remark: any[]
}

export const jin10Getter: SourceGetter = async () => {
  const timestamp = Date.now()
  const url = `https://www.jin10.com/flash_newest.js?t=${timestamp}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Jin10: ${response.statusText}`)
  }

  const rawData = await response.text()

  // 解析 JavaScript 变量
  const jsonStr = rawData
    .replace(/^var\s+newest\s*=\s*/, '')
    .replace(/;*$/, '')
    .trim()

  const data = JSON.parse(jsonStr) as Jin10Item[]

  return data
    .filter((k) => (k.data.title || k.data.content) && !k.channel?.includes(5))
    .map((k) => {
      const text = (k.data.title || k.data.content)!.replace(/<\/?b>/g, '')
      const match = text.match(/^【([^】]*)】(.*)$/)
      const title = match ? match[1] : text
      const desc = match ? match[2] : undefined

      return NewsItem.fromEntity({
        id: k.id,
        title,
        url: `https://flash.jin10.com/detail/${k.id}`,
        pubDate: new Date(k.time).getTime(),
        extra: {
          hover: desc,
          info: k.important ? '✰' : false,
        },
      })
    })
}

