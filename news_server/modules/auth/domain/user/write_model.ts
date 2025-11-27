/**
 * User Write Model (WO - Write Object)
 * 类似 Sjgz-Backend 的 domain/user/write_model.go
 * 用于写入操作的领域模型
 */
export interface UserCreateWO {
  id: string
  email: string
  type: 'github'
  data?: string
}

export interface UserUpdateWO {
  id: string
  email?: string
  data?: string
}

export interface UserDeleteWO {
  id: string
}

