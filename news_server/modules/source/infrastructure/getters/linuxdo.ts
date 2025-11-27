/**
 * LINUX DO 新闻源获取器
 * 从 newsnow/server/sources/linuxdo.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface LinuxdoTopic {
  id: number
  title: string
  fancy_title: string
  posts_count: number
  reply_count: number
  created_at: string
  last_posted_at: string
  visible: boolean
  archived: boolean
  pinned: boolean
}

interface LinuxdoResponse {
  topic_list: {
    topics: LinuxdoTopic[]
  }
}

export const linuxdoHotGetter: SourceGetter = async () => {
  const response = await fetch('https://linux.do/top/daily.json')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Linuxdo: ${response.statusText}`)
  }

  const res = (await response.json()) as LinuxdoResponse

  return res.topic_list.topics
    .filter((k) => k.visible && !k.archived && !k.pinned)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.id.toString(),
        title: k.title,
        url: `https://linux.do/t/topic/${k.id}`,
      })
    )
}

export const linuxdoLatestGetter: SourceGetter = async () => {
  const response = await fetch('https://linux.do/latest.json?order=created')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Linuxdo: ${response.statusText}`)
  }

  const res = (await response.json()) as LinuxdoResponse

  return res.topic_list.topics
    .filter((k) => k.visible && !k.archived && !k.pinned)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.id.toString(),
        title: k.title,
        url: `https://linux.do/t/topic/${k.id}`,
        pubDate: new Date(k.created_at).getTime(),
      })
    )
}

