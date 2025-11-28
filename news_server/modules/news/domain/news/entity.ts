/**
 * News 领域实体
 * 类似 Sjgz-Backend 的 domain/news/entity.go
 * 
 * News 实体扩展了 NewsItem，添加了 sourceId 和数据库相关字段
 */
export interface NewsEntity {
  id: string // 主键：sourceId + originalId 的组合，确保唯一性
  sourceId: string // 来源 ID（如 v2ex, zhihu）
  originalId: string | number // 原始 ID（从源获取的 ID）
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: {
    hover?: string
    date?: number | string
    info?: false | string
    diff?: number
    icon?: false | string | {
      url: string
      scale: number
    }
  }
  createdAt: number // 创建时间（毫秒时间戳）
  updatedAt: number // 更新时间（毫秒时间戳）
}

export class News {
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly originalId: string | number,
    public readonly title: string,
    public readonly url: string,
    public readonly mobileUrl?: string,
    public readonly pubDate?: number | string,
    public readonly extra?: NewsEntity['extra'],
    public readonly createdAt: number = Date.now(),
    public readonly updatedAt: number = Date.now()
  ) {}

  toEntity(): NewsEntity {
    return {
      id: this.id,
      sourceId: this.sourceId,
      originalId: this.originalId,
      title: this.title,
      url: this.url,
      mobileUrl: this.mobileUrl,
      pubDate: this.pubDate,
      extra: this.extra,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  static fromEntity(entity: NewsEntity): News {
    return new News(
      entity.id,
      entity.sourceId,
      entity.originalId,
      entity.title,
      entity.url,
      entity.mobileUrl,
      entity.pubDate,
      entity.extra,
      entity.createdAt,
      entity.updatedAt
    )
  }

  /**
   * 生成 News ID
   * 格式：{sourceId}:{originalId}
   */
  static generateId(sourceId: string, originalId: string | number): string {
    return `${sourceId}:${String(originalId)}`
  }
}

