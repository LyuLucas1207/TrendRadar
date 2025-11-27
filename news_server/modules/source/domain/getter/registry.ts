/**
 * Getter 注册表接口
 * 管理所有新闻源获取器的注册和获取
 */
import type { SourceGetter } from './getter'

export interface IGetterRegistry {
  /**
   * 注册源获取器
   */
  register(id: string, getter: SourceGetter): void

  /**
   * 获取源获取器
   */
  get(id: string): SourceGetter | undefined

  /**
   * 获取所有已注册的源 ID
   */
  getAllIds(): string[]

  /**
   * 检查源获取器是否存在
   */
  has(id: string): boolean
}

