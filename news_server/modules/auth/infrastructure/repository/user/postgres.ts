/**
 * User 仓储实现（PostgreSQL）
 * 类似 Sjgz-Backend 的 infrastructure/repository/writerepo/postgres.go
 * 
 * 注意：所有业务逻辑都提取到 operations/ 目录下的独立函数中
 * Repository 类只负责协调和接口实现，保持简洁
 */
import { PostgreSQLClient } from '@packages/postgresqlx/client'
import type { IUserRepository } from '../../../domain/user/repository'
import type { UserRO } from '../../../domain/user/read_model'
import type { UserCreateWO, UserUpdateWO } from '../../../domain/user/write_model'
import { initUserTable } from './init-table'
import { addUser as addUserOp } from './operations/add-user'
import { upsertUser as upsertUserOp } from './operations/upsert-user'
import { getUser as getUserOp } from './operations/get-user'
import { setUserData as setUserDataOp } from './operations/set-data'
import { getUserData as getUserDataOp } from './operations/get-data'
import { deleteUser as deleteUserOp } from './operations/delete-user'

export class UserRepository implements IUserRepository {
  constructor(private readonly db: ReturnType<PostgreSQLClient['getDb']>) {}

  async init(): Promise<void> {
    await initUserTable(this.db)
  }

  async addUser(wo: UserCreateWO): Promise<UserRO> {
    return addUserOp(this.db, wo)
  }

  async upsertUser(wo: UserCreateWO): Promise<UserRO> {
    return upsertUserOp(this.db, wo)
  }

  async getUser(id: string): Promise<UserRO | null> {
    return getUserOp(this.db, id)
  }

  async setData(wo: UserUpdateWO, updatedTime: number = Date.now()): Promise<void> {
    return setUserDataOp(this.db, wo, updatedTime)
  }

  async getData(id: string): Promise<{ data: string; updated: number }> {
    return getUserDataOp(this.db, id)
  }

  async deleteUser(id: string): Promise<void> {
    return deleteUserOp(this.db, id)
  }
}

