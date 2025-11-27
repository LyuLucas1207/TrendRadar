/**
 * Auth 请求 DTO
 * 类似 Sjgz-Backend 的 interfaces/http/dto/reqdto/user.go
 */
import { z } from 'zod'
import type { UserCreateWO, UserUpdateWO } from '../../../domain/user/write_model'

/**
 * GitHub OAuth 回调请求
 */
export const GitHubCallbackQuerySchema = z.object({
  code: z.string().min(1, 'code is required'),
})

export type GitHubCallbackQuery = z.infer<typeof GitHubCallbackQuerySchema>

/**
 * 获取用户数据请求
 */
export const GetUserDataParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
})

export type GetUserDataParams = z.infer<typeof GetUserDataParamsSchema>

/**
 * 设置用户数据请求
 */
export const SetUserDataParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
})

export const SetUserDataBodySchema = z.object({
  data: z.any(),
  updatedTime: z.number().optional(),
})

export type SetUserDataParams = z.infer<typeof SetUserDataParamsSchema>
export type SetUserDataBody = z.infer<typeof SetUserDataBodySchema>

/**
 * DTO → WO 转换方法
 * 类似 Sjgz-Backend 的 reqdto.ToCreateWO()
 */
export function ToUserCreateWO(id: string, email: string, type: 'github'): UserCreateWO {
  return {
    id,
    email,
    type,
  }
}

export function ToUserUpdateWO(id: string, data?: string): UserUpdateWO {
  return {
    id,
    data,
  }
}

