/**
 * Source 领域实体
 * 类似 Sjgz-Backend 的 domain/getter/entity.go
 */
export type SourceType = 'hottest' | 'realtime'
export type Color = 'primary' | 'slate' | 'blue' | 'red' | 'green' | 'indigo' | 'yellow' | 'orange' | 'purple' | 'pink' | 'gray' | 'cyan' | 'teal' | 'lime' | 'amber' | 'emerald' | 'violet' | 'fuchsia' | 'rose' | 'sky'

export interface SourceEntity {
  id: string
  name: string
  interval: number
  color: Color
  title?: string
  desc?: string
  type?: SourceType
  column?: string
  home?: string
  disable?: boolean | 'cf'
  redirect?: string
}

export class Source {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly interval: number,
    public readonly color: Color,
    public readonly title?: string,
    public readonly desc?: string,
    public readonly type?: SourceType,
    public readonly column?: string,
    public readonly home?: string,
    public readonly disable?: boolean | 'cf',
    public readonly redirect?: string
  ) {}

  isEnabled(): boolean {
    return this.disable !== true && this.disable !== 'cf'
  }

  getEffectiveId(): string {
    return this.redirect || this.id
  }

  toEntity(): SourceEntity {
    return {
      id: this.id,
      name: this.name,
      interval: this.interval,
      color: this.color,
      title: this.title,
      desc: this.desc,
      type: this.type,
      column: this.column,
      home: this.home,
      disable: this.disable,
      redirect: this.redirect,
    }
  }

  static fromEntity(entity: SourceEntity): Source {
    return new Source(
      entity.id,
      entity.name,
      entity.interval,
      entity.color,
      entity.title,
      entity.desc,
      entity.type,
      entity.column,
      entity.home,
      entity.disable,
      entity.redirect
    )
  }
}

