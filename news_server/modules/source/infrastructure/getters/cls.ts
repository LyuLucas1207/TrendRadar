/**
 * 财联社新闻源获取器
 * 从 newsnow/server/sources/cls/index.ts 迁移
 * 注意：cls 需要特殊的签名算法，这里提供简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface ClsItem {
  id: number
  title?: string
  brief: string
  shareurl: string
  ctime: number
  is_ad: number
}

interface TelegraphResponse {
  data: {
    roll_data: ClsItem[]
  }
}

interface DepthResponse {
  data: {
    top_article: ClsItem[]
    depth_list: ClsItem[]
  }
}

interface HotResponse {
  data: ClsItem[]
}

// 简化版本：直接调用 API（可能需要处理签名，这里先简化）
export const clsTelegraphGetter: SourceGetter = async () => {
  const apiUrl = 'https://www.cls.cn/nodeapi/updateTelegraphList'
  
  // 注意：实际实现需要生成签名参数
  // 这里先提供一个基础版本
  const response = await fetch(apiUrl)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Cls: ${response.statusText}`)
  }

  const res = (await response.json()) as TelegraphResponse
  
  return res.data.roll_data
    .filter((k) => !k.is_ad)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.id.toString(),
        title: k.title || k.brief,
        url: `https://www.cls.cn/detail/${k.id}`,
        mobileUrl: k.shareurl,
        pubDate: k.ctime * 1000,
      })
    )
}

export const clsDepthGetter: SourceGetter = async () => {
  const apiUrl = 'https://www.cls.cn/v3/depth/home/assembled/1000'
  
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Cls: ${response.statusText}`)
  }

  const res = (await response.json()) as DepthResponse
  
  return res.data.depth_list
    .sort((m, n) => n.ctime - m.ctime)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.id.toString(),
        title: k.title || k.brief,
        url: `https://www.cls.cn/detail/${k.id}`,
        mobileUrl: k.shareurl,
        pubDate: k.ctime * 1000,
      })
    )
}

export const clsHotGetter: SourceGetter = async () => {
  const apiUrl = 'https://www.cls.cn/v2/article/hot/list'
  
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Cls: ${response.statusText}`)
  }

  const res = (await response.json()) as HotResponse
  
  return res.data.map((k) =>
    NewsItem.fromEntity({
      id: k.id.toString(),
      title: k.title || k.brief,
      url: `https://www.cls.cn/detail/${k.id}`,
      mobileUrl: k.shareurl,
    })
  )
}

