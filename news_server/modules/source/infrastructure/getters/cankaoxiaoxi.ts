/**
 * 参考消息新闻源获取器
 * 从 newsnow/server/sources/cankaoxiaoxi.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface CankaoxiaoxiItem {
  data: {
    id: string
    title: string
    url: string
    publishTime: string
  }
}

interface CankaoxiaoxiResponse {
  list: CankaoxiaoxiItem[]
}

export const cankaoxiaoxiGetter: SourceGetter = async () => {
  const channels = ['zhongguo', 'guandian', 'gj']
  const responses = await Promise.all(
    channels.map((k) =>
      fetch(`https://china.cankaoxiaoxi.com/json/channel/${k}/list.json`)
    )
  )

  const results = await Promise.all(
    responses.map(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Cankaoxiaoxi: ${response.statusText}`)
      }
      return (await response.json()) as CankaoxiaoxiResponse
    })
  )

  const allItems = results
    .flatMap((res) => res.list)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.data.id,
        title: k.data.title,
        url: k.data.url,
        extra: {
          date: k.data.publishTime,
        },
      })
    )
    .sort((m, n) => {
      const dateM = m.extra?.date ? new Date(m.extra.date as string).getTime() : 0
      const dateN = n.extra?.date ? new Date(n.extra.date as string).getTime() : 0
      return dateN - dateM
    })

  return allItems
}

