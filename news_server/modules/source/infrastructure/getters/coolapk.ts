/**
 * 酷安新闻源获取器
 * 从 newsnow/server/sources/coolapk/index.ts 迁移
 * 注意：需要特殊的 headers，这里提供简化版本
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'

interface CoolapkResponse {
  data: {
    id: string
    message: string
    editor_title: string
    url: string
    entityType: string
    pubDate: string
    dateline: number
    targetRow: {
      subTitle: string
    }
  }[]
}

export const coolapkGetter: SourceGetter = async () => {
  const url =
    'https://api.coolapk.com/v6/page/dataList?url=%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1'
  
  // 简化版本：不包含复杂的 headers 生成
  const response = await fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent':
        'Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM)',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Coolapk: ${response.statusText}`)
  }

  const r = (await response.json()) as CoolapkResponse
  
  if (!r.data || !r.data.length) {
    throw new Error('Failed to fetch Coolapk data')
  }

  return r.data
    .filter((k) => k.id)
    .map((i) => {
      // 简单的文本提取（不使用 cheerio）
      const title = i.editor_title || i.message.split('\n')[0].trim()
      
      return NewsItem.fromEntity({
        id: i.id,
        title,
        url: `https://www.coolapk.com${i.url}`,
        extra: {
          info: i.targetRow?.subTitle,
        },
      })
    })
}

