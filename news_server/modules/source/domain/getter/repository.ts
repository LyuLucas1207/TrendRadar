/**
 * Getter 仓储接口
 * 类似 Sjgz-Backend 的 domain/getter/repository.go
 */
import type { Source } from './entity'

export interface IGetterRepository {
  /**
   * 根据 ID 获取源配置
   */
  getSource(id: string): Promise<Source | null>

  /**
   * 获取所有源配置
   */
  getAllSources(): Promise<Source[]>

  /**
   * 检查源是否存在
   */
  exists(id: string): Promise<boolean>
}

