/**
 * 设置用户数据用例
 * 类似 Sjgz-Backend 的 application/user/update.go
 */
import type { IUserRepository } from '../../domain/user/repository'
import type { UserUpdateWO } from '../../domain/user/write_model'

export interface SetUserDataInput {
  userId: string
  data: any
  updatedTime?: number
}

export interface SetUserDataResult {
  success: boolean
  updatedTime: number
}

export class SetUserData {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SetUserDataInput): Promise<SetUserDataResult> {
    const updatedTime = input.updatedTime || Date.now()
    
    // 创建 Write Model (WO)
    const wo: UserUpdateWO = {
      id: input.userId,
      data: JSON.stringify(input.data),
    }
    
    // WO → Repository
    await this.userRepository.setData(wo, updatedTime)
    
    return {
      success: true,
      updatedTime,
    }
  }
}

