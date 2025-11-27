/**
 * Auth 响应 DTO
 * 类似 Sjgz-Backend 的 interfaces/http/dto/respdto/user.go
 */
import type { UserRO } from '../../../domain/user/read_model'

/**
 * GitHub 登录响应
 */
export interface GitHubLoginResponse {
  jwt: string
  user: {
    id: string
    avatar: string
    name: string
  }
}

/**
 * 用户数据响应
 */
export interface UserDataResponse {
  data?: any
  updatedTime: number
}

/**
 * 设置用户数据响应
 */
export interface SetUserDataResponse {
  success: boolean
  updatedTime: number
}

/**
 * 用户响应 DTO
 */
export interface UserDTO {
  id: string
  email: string
  type: 'github'
  data: string
  created: number
  updated: number
}

/**
 * RO → DTO 转换方法
 * 类似 Sjgz-Backend 的 respdto.UserROToDTO()
 */
export function UserROToDTO(ro: UserRO): UserDTO {
  return {
    id: ro.id,
    email: ro.email,
    type: ro.type,
    data: ro.data,
    created: ro.created,
    updated: ro.updated,
  }
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  error: string
}

