/**
 * 雪球新闻源获取器
 * 从 newsnow/server/sources/xueqiu.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface StockResponse {
  data: {
    items: {
      code: string
      name: string
      percent: number
      exchange: string
      ad: number
    }[]
  }
}

export const xueqiuHotstockGetter: SourceGetter = async () => {
  // 先获取 cookie
  const cookieResponse = await fetch('https://xueqiu.com/hq', {
    redirect: 'follow',
  })
  const cookies = cookieResponse.headers.getSetCookie?.() || []
  const cookieString = cookies.join('; ')

  const url = 'https://stock.xueqiu.com/v5/stock/hot_stock/list.json?size=30&_type=10&type=10'
  const response = await fetch(url, {
    headers: {
      cookie: cookieString,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Xueqiu: ${response.statusText}`)
  }

  const res = (await response.json()) as StockResponse

  return res.data.items
    .filter((k) => !k.ad)
    .map((k) =>
      NewsItem.fromEntity({
        id: k.code,
        title: k.name,
        url: `https://xueqiu.com/s/${k.code}`,
        extra: {
          info: `${k.percent}% ${k.exchange}`,
        },
      })
    )
}

