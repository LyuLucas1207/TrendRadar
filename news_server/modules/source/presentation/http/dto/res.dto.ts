/**
 * Source HTTP 响应 DTO
 * 类似 Sjgz-Backend 的 interfaces/http/dto/res.go
 */
import type { NewsItem } from '../../../domain/newsitem/entity'

export interface SourceDataResponse {
  status: 'success' | 'cache'
  id: string
  updatedTime: number
  items: NewsItem[]
}

export interface ErrorResponse {
  error: string
}

