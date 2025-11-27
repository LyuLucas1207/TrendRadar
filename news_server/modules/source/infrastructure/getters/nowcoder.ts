/**
 * 牛客新闻源获取器
 * 从 newsnow/server/sources/nowcoder.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface NowcoderResponse {
  data: {
    result: {
      id: string
      title: string
      type: number
      uuid: string
    }[]
  }
}

export const nowcoderGetter: SourceGetter = async () => {
  const timestamp = Date.now()
  const url = `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=${timestamp}&t=`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Nowcoder: ${response.statusText}`)
  }

  const res = (await response.json()) as NowcoderResponse
  
  return res.data.result
    .map((k) => {
      let url: string
      let id: string
      
      if (k.type === 74) {
        url = `https://www.nowcoder.com/feed/main/detail/${k.uuid}`
        id = k.uuid
      } else if (k.type === 0) {
        url = `https://www.nowcoder.com/discuss/${k.id}`
        id = k.id
      } else {
        url = `https://www.nowcoder.com/discuss/${k.id}`
        id = k.id
      }
      
      return NewsItem.fromEntity({
        id,
        title: k.title,
        url,
      })
    })
}

