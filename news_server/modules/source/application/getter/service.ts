/**
 * Getter Service
 * 类似 Sjgz-Backend 的 application/getter/service.go
 * 负责 getter 相关的业务逻辑
 * 
 * 当前实现：
 * - getSourceData: 使用 getter 获取源数据（不存储到数据库，仅缓存）
 * 
 * 未来扩展（在 application/source/ 目录下）：
 * - 添加新的用例用于将 fetch 到的数据存储到数据库 table
 * - 例如：saveSourceData, getSourceDataFromDB 等
 */
import { GetSourceData } from './get-source-data'
import type { IGetterRepository } from '../../domain/getter/repository'
import type { IGetterRegistry } from '../../domain/getter/registry'
import type { ICacheRepository } from '../../domain/cache/repository'

export class GetterService {
  public readonly getSourceData: GetSourceData

  constructor(
    getterRepository: IGetterRepository,
    getterRegistry: IGetterRegistry,
    cacheRepository: ICacheRepository,
    defaultTTL: number = 30 * 60 * 1000
  ) {
    this.getSourceData = new GetSourceData(
      getterRepository,
      getterRegistry,
      cacheRepository,
      defaultTTL
    )
  }
}

