/**
 * News 事件处理器
 * 类似 Sjgz-Backend 的 interfaces/eventbus/handler/news.go
 */
import { consola } from 'consola'
import type { NewsService } from '../../../application/news/service'
import type { SourceDataFetchedEvent } from '@events/source'

export class NewsHandler {
  constructor(private readonly newsService: NewsService) {}

  /**
   * 处理源数据已获取事件
   * 将 Source 服务获取的数据存储到数据库
   */
  async OnSourceDataFetched(eventData: SourceDataFetchedEvent): Promise<void> {
    consola.info('✅ [News Worker] 已收到源数据获取事件:', {
      sourceId: eventData.sourceId,
      itemsCount: eventData.items.length,
    })

    try {
      // 转换为 NewsCreateWO 格式
      const items = eventData.items.map(item => ({
        sourceId: eventData.sourceId,
        originalId: item.id,
        title: item.title,
        url: item.url,
        mobileUrl: item.mobileUrl,
        pubDate: item.pubDate,
        extra: item.extra,
      }))

      // 批量创建新闻
      await this.newsService.createNewsBatch.execute({ items })
      
      consola.success(`✅ [News Worker] 源 ${eventData.sourceId} 的 ${items.length} 条新闻已存储`)
    } catch (error) {
      consola.error(`❌ [News Worker] 处理源数据失败:`, error)
      throw error
    }
  }
}

