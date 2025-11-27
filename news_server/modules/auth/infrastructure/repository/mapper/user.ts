/**
 * User Mapper
 * 类似 Sjgz-Backend 的 infrastructure/repository/mapper/user.go
 * 负责 Model (数据库) ↔ RO (Read Model) 转换
 */
import type { User as UserModel } from '@models/auth/user'
import type { UserRO } from '../../../domain/user/read_model'

/**
 * 将数据库 Model 转换为 Domain Read Model (RO)
 */
export function ToUserRO(model: UserModel): UserRO {
  return {
    id: model.id,
    email: model.email || '',
    type: model.type as 'github',
    data: model.data || '',
    created: model.created,
    updated: model.updated,
  }
}

/**
 * 将数据库 Model 列表转换为 Domain Read Model 列表
 */
export function ToUserROList(models: UserModel[]): UserRO[] {
  return models.map(ToUserRO)
}

