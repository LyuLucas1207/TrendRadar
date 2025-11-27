/**
 * 豆瓣新闻源获取器
 * 从 newsnow/server/sources/douban.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface HotMoviesResponse {
  category: string
  items: MovieItem[]
  total: number
}

interface MovieItem {
  rating: {
    count: number
    value: number
  }
  title: string
  pic: {
    large: string
  }
  uri: string
  card_subtitle: string
  id: string
}

export const doubanGetter: SourceGetter = async () => {
  const baseURL = 'https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie'
  
  const response = await fetch(baseURL, {
    headers: {
      Referer: 'https://movie.douban.com/',
      Accept: 'application/json, text/plain, */*',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Douban: ${response.statusText}`)
  }

  const res = (await response.json()) as HotMoviesResponse
  
  return res.items.map((movie) =>
    NewsItem.fromEntity({
      id: movie.id,
      title: movie.title,
      url: `https://movie.douban.com/subject/${movie.id}`,
      extra: {
        info: movie.card_subtitle.split(' / ').slice(0, 3).join(' / '),
        hover: movie.card_subtitle,
        icon: movie.pic.large
          ? {
              url: movie.pic.large,
              scale: 1,
            }
          : false,
      },
    })
  )
}

