/**
 * User Service
 * 类似 Sjgz-Backend 的 application/user/service.go
 * 负责用户数据操作相关的业务逻辑
 */
import type { IUserRepository } from '../../domain/user/repository'
import { GetUserData } from './get-user-data'
import { SetUserData } from './set-user-data'

export class UserService {
  public readonly getUserData: GetUserData
  public readonly setUserData: SetUserData

  constructor(private readonly userRepository: IUserRepository) {
    this.getUserData = new GetUserData(userRepository)
    this.setUserData = new SetUserData(userRepository)
  }
}

