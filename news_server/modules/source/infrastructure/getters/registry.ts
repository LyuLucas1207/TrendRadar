/**
 * SourceGetter 注册表实现
 * 管理所有新闻源获取器的注册和获取
 */
import type { IGetterRegistry } from '../../domain/getter/registry'
import type { SourceGetter } from '../../domain/getter/getter'

export class SourceGetterRegistry implements IGetterRegistry {
  private readonly getters = new Map<string, SourceGetter>()

  register(id: string, getter: SourceGetter): void {
    this.getters.set(id, getter)
  }

  get(id: string): SourceGetter | undefined {
    return this.getters.get(id)
  }

  getAllIds(): string[] {
    return Array.from(this.getters.keys())
  }

  has(id: string): boolean {
    return this.getters.has(id)
  }
}

