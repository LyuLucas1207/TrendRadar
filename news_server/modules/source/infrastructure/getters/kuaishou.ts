/**
 * 快手新闻源获取器
 * 从 newsnow/server/sources/kuaishou.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface KuaishouResponse {
  defaultClient: {
    ROOT_QUERY: {
      'visionHotRank({"page":"home"})': {
        type: string
        id: string
        typename: string
      }
      [key: string]: any
    }
    [key: string]: any
  }
}

interface HotRankData {
  result: number
  pcursor: string
  webPageArea: string
  items: {
    type: string
    generated: boolean
    id: string
    typename: string
  }[]
}

export const kuaishouGetter: SourceGetter = async () => {
  // 获取快手首页HTML
  const response = await fetch('https://www.kuaishou.com/?isHome=1')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Kuaishou: ${response.statusText}`)
  }

  const html = await response.text()
  
  // 提取window.__APOLLO_STATE__中的数据
  const matches = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{.+?\});/s)
  
  if (!matches || !matches[1]) {
    throw new Error('无法获取快手热榜数据')
  }

  // 解析JSON数据
  const data = JSON.parse(matches[1]) as KuaishouResponse

  // 获取热榜数据ID
  const hotRankId = data.defaultClient.ROOT_QUERY['visionHotRank({"page":"home"})'].id

  // 获取热榜列表数据
  const hotRankData = data.defaultClient[hotRankId] as HotRankData
  
  // 转换数据格式
  return hotRankData.items
    .filter((k) => data.defaultClient[k.id]?.tagType !== '置顶')
    .map((item) => {
      // 从id中提取实际的热搜词
      const hotSearchWord = item.id.replace('VisionHotRankItem:', '')

      // 获取具体的热榜项数据
      const hotItem = data.defaultClient[item.id]

      return NewsItem.fromEntity({
        id: hotSearchWord,
        title: hotItem.name,
        url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(hotItem.name)}`,
        extra: {
          icon: hotItem.iconUrl
            ? {
                url: hotItem.iconUrl,
                scale: 1,
              }
            : false,
        },
      })
    })
}

