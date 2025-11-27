/**
 * 哔哩哔哩新闻源获取器
 * 从 newsnow/server/sources/bilibili.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface BilibiliHotSearchResponse {
  code: number
  list: {
    keyword: string
    show_name: string
    icon?: string
  }[]
}

interface BilibiliHotVideoResponse {
  code: number
  data: {
    list: {
      bvid: string
      title: string
      pic: string
      owner: {
        name: string
      }
      stat: {
        view: number
        like: number
      }
      desc: string
      pubdate: number
    }[]
  }
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${Math.floor(num / 10000)}w+`
  }
  return num.toString()
}

export const bilibiliHotSearchGetter: SourceGetter = async () => {
  const url = 'https://s.search.bilibili.com/main/hotword?limit=30'
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Bilibili hot search: ${response.statusText}`)
  }

  const res = (await response.json()) as BilibiliHotSearchResponse

  return res.list.map((item) =>
    NewsItem.fromEntity({
      id: item.keyword,
      title: item.show_name,
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(item.keyword)}`,
      extra: {
        icon: item.icon || false,
      },
    })
  )
}

export const bilibiliHotVideoGetter: SourceGetter = async () => {
  const url = 'https://api.bilibili.com/x/web-interface/popular'
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Bilibili hot video: ${response.statusText}`)
  }

  const res = (await response.json()) as BilibiliHotVideoResponse

  return res.data.list.map((video) =>
    NewsItem.fromEntity({
      id: video.bvid,
      title: video.title,
      url: `https://www.bilibili.com/video/${video.bvid}`,
      pubDate: video.pubdate * 1000,
      extra: {
        info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
        hover: video.desc,
        icon: video.pic
          ? {
              url: video.pic,
              scale: 1,
            }
          : false,
      },
    })
  )
}

export const bilibiliRankingGetter: SourceGetter = async () => {
  const url = 'https://api.bilibili.com/x/web-interface/ranking/v2'
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Bilibili ranking: ${response.statusText}`)
  }

  const res = (await response.json()) as BilibiliHotVideoResponse

  return res.data.list.map((video) =>
    NewsItem.fromEntity({
      id: video.bvid,
      title: video.title,
      url: `https://www.bilibili.com/video/${video.bvid}`,
      pubDate: video.pubdate * 1000,
      extra: {
        info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
        hover: video.desc,
        icon: video.pic
          ? {
              url: video.pic,
              scale: 1,
            }
          : false,
      },
    })
  )
}

