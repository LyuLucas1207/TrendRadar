/**
 * NewsItem 领域实体
 * 类似 Sjgz-Backend 的 domain/news/entity.go
 */
export interface NewsItemEntity {
  id: string | number
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
}

export class NewsItem {
  constructor(
    public readonly id: string | number,
    public readonly title: string,
    public readonly url: string,
    public readonly mobileUrl?: string,
    public readonly pubDate?: number | string,
    public readonly extra?: NewsItemEntity['extra']
  ) {}

  toEntity(): NewsItemEntity {
    return {
      id: this.id,
      title: this.title,
      url: this.url,
      mobileUrl: this.mobileUrl,
      pubDate: this.pubDate,
      extra: this.extra,
    }
  }

  static fromEntity(entity: NewsItemEntity): NewsItem {
    return new NewsItem(
      entity.id,
      entity.title,
      entity.url,
      entity.mobileUrl,
      entity.pubDate,
      entity.extra
    )
  }
}

