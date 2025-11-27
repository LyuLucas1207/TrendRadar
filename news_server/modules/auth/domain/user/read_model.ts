/**
 * User Read Model (RO - Read Object)
 * 类似 Sjgz-Backend 的 domain/user/read_model.go
 * 用于读取操作的领域模型
 */
export interface UserRO {
  id: string
  email: string
  type: 'github'
  data: string
  created: number
  updated: number
}

