/**
 * EventBus 路由注册
 * 类似 Sjgz-Backend 的 interfaces/eventbus/router.go
 */
import { Registry } from './registry'
import { consola } from 'consola'

export enum SourceEventType {
  SOURCE_REFRESH_REQUESTED = 'source.refresh.requested',
  BATCH_SOURCE_REFRESH_REQUESTED = 'source.batch_refresh.requested',
  // ... 其他 Source 领域事件
}

export class Router {
  constructor(private readonly registry: Registry) {}

  /**
   * 注册所有事件路由
   */
  RegisterRoutes(): void {
    // 注册事件处理器
    // 这里可以扩展为更灵活的路由注册机制
    consola.info('✅ EventBus 路由已注册')
  }

  /**
   * 路由事件到对应的处理器
   */
  async route(eventType: string, eventData: any): Promise<boolean> {
    try {
      switch (eventType) {
        case SourceEventType.SOURCE_REFRESH_REQUESTED:
          await this.registry.Source.OnSourceRefreshRequested(eventData)
          return true
        case SourceEventType.BATCH_SOURCE_REFRESH_REQUESTED:
          await this.registry.Source.OnBatchSourceRefreshRequested(eventData)
          return true
        default:
          consola.warn(`⚠️ 未找到事件处理器: event_type=${eventType}`)
          return false
      }
    } catch (error) {
      consola.error(`❌ 处理事件失败: event_type=${eventType}`, error)
      return false
    }
  }
}

