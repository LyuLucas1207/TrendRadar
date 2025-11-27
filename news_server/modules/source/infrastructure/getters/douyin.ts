/**
 * 抖音新闻源获取器
 * 从 newsnow/server/sources/douyin.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface DouyinResponse {
  data: {
    word_list: {
      sentence_id: string
      word: string
      event_time: string
      hot_value: string
    }[]
  }
}

export const douyinGetter: SourceGetter = async () => {
  // 先获取 cookie
  const cookieResponse = await fetch(
    'https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383',
    { redirect: 'follow' }
  )
  const cookies = cookieResponse.headers.getSetCookie?.() || []
  const cookieString = cookies.join('; ')

  const url =
    'https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1'
  
  const response = await fetch(url, {
    headers: {
      cookie: cookieString,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Douyin: ${response.statusText}`)
  }

  const res = (await response.json()) as DouyinResponse

  return res.data.word_list.map((k) =>
    NewsItem.fromEntity({
      id: k.sentence_id,
      title: k.word,
      url: `https://www.douyin.com/hot/${k.sentence_id}`,
    })
  )
}

