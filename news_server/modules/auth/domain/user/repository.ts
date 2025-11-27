/**
 * User 仓储接口
 * 类似 Sjgz-Backend 的 domain/user/repository.go
 */
import type { UserRO } from './read_model'
import type { UserCreateWO, UserUpdateWO } from './write_model'

export interface IUserRepository {
  /**
   * 初始化表（如果不存在则创建）
   */
  init(): Promise<void>

  /**
   * 添加或更新用户
   * 返回 Read Model (RO)
   */
  addUser(wo: UserCreateWO): Promise<UserRO>

  /**
   * 根据 ID 获取用户
   * 返回 Read Model (RO)
   */
  getUser(id: string): Promise<UserRO | null>

  /**
   * 设置用户数据
   */
  setData(wo: UserUpdateWO, updatedTime?: number): Promise<void>

  /**
   * 获取用户数据
   */
  getData(id: string): Promise<{ data: string; updated: number }>

  /**
   * 删除用户
   */
  deleteUser(id: string): Promise<void>
}

