/**
 * Cache 仓储接口
 * 定义缓存操作的抽象接口
 */
export interface ICacheRepository {
  /**
   * 获取缓存值
   */
  get(key: string): Promise<string | null>

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），可选
   */
  set(key: string, value: string, ttl?: number): Promise<boolean>

  /**
   * 删除缓存
   */
  delete(key: string): Promise<boolean>

  /**
   * 检查键是否存在
   */
  exists(key: string): Promise<boolean>

  /**
   * 设置过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  expire(key: string, ttl: number): Promise<boolean>

  /**
   * 获取剩余过期时间（秒）
   * @returns 剩余秒数，-1 表示永不过期，-2 表示键不存在
   */
  ttl(key: string): Promise<number>
}

