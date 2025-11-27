/**
 * 百度贴吧新闻源获取器
 * 从 newsnow/server/sources/tieba.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface TiebaResponse {
  data: {
    bang_topic: {
      topic_list: {
        topic_id: string
        topic_name: string
        create_time: number
        topic_url: string
      }[]
    }
  }
}

export const tiebaGetter: SourceGetter = async () => {
  const url = 'https://tieba.baidu.com/hottopic/browse/topicList'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Tieba: ${response.statusText}`)
  }

  const res = (await response.json()) as TiebaResponse
  
  return res.data.bang_topic.topic_list.map((k) =>
    NewsItem.fromEntity({
      id: k.topic_id,
      title: k.topic_name,
      url: k.topic_url,
    })
  )
}

