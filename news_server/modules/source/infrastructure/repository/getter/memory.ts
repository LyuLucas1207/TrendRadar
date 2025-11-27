/**
 * Getter 仓储实现（内存）
 * 从预定义的源配置中加载
 * 类似 Sjgz-Backend 的 infrastructure/repository/getter/memory.go
 */
import type { IGetterRepository } from '../../../domain/getter/repository'
import { Source } from '../../../domain/getter/entity'
import { generateSources } from './sources-config'

export class MemoryGetterRepository implements IGetterRepository {
  private readonly sourcesMap: Map<string, Source>

  constructor() {
    this.sourcesMap = new Map()
    // 初始化时加载所有源配置（动态生成，支持环境变量过滤）
    const allSources = generateSources()
    Object.entries(allSources).forEach(([id, config]) => {
      this.sourcesMap.set(
        id,
        Source.fromEntity({
          id,
          ...config,
        })
      )
    })
  }

  async getSource(id: string): Promise<Source | null> {
    return this.sourcesMap.get(id) || null
  }

  async getAllSources(): Promise<Source[]> {
    return Array.from(this.sourcesMap.values())
  }

  async exists(id: string): Promise<boolean> {
    return this.sourcesMap.has(id)
  }
}

