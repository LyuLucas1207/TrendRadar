/**
 * Source 事件处理器
 * 类似 Sjgz-Backend 的 interfaces/eventbus/handler/source.go
 */
import { consola } from 'consola'
import type { GetterService } from '../../../application/getter/service'

export class SourceHandler {
  constructor(private readonly getterService: GetterService) {}

  /**
   * 处理源数据刷新事件
   */
  async OnSourceRefreshRequested(eventData: { sourceId: string; latest?: boolean }): Promise<void> {
    consola.info('✅ [Source Worker] 已收到源刷新请求:', eventData)
    try {
      await this.getterService.getSourceData.execute({
        sourceId: eventData.sourceId,
        latest: eventData.latest || false,
      })
      consola.success(`✅ [Source Worker] 源 ${eventData.sourceId} 刷新成功`)
    } catch (error) {
      consola.error(`❌ [Source Worker] 源 ${eventData.sourceId} 刷新失败:`, error)
      throw error
    }
  }

  /**
   * 处理批量源刷新事件
   */
  async OnBatchSourceRefreshRequested(eventData: { sourceIds: string[] }): Promise<void> {
    consola.info('✅ [Source Worker] 已收到批量源刷新请求:', eventData)
    const results = await Promise.allSettled(
      eventData.sourceIds.map((sourceId) =>
        this.getterService.getSourceData.execute({
          sourceId,
          latest: false,
        })
      )
    )
    
    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length
    
    consola.info(`✅ [Source Worker] 批量刷新完成: 成功 ${successCount}, 失败 ${failCount}`)
  }
}

