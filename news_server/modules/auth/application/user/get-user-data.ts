/**
 * 获取用户数据用例
 * 类似 Sjgz-Backend 的 application/user/get.go
 */
import type { IUserRepository } from '../../domain/user/repository'

export interface UserDataResult {
  data?: any
  updatedTime: number
}

export class GetUserData {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserDataResult> {
    const { data, updated } = await this.userRepository.getData(userId)
    return {
      data: data ? JSON.parse(data) : undefined,
      updatedTime: updated,
    }
  }
}

