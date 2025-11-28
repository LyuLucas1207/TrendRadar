/**
 * HTTP 响应 DTO
 */
import type { NewsRO } from '../../../domain/news/read_model'

export interface NewsResponse {
  success: boolean
  data: NewsRO[]
}

export interface ErrorResponse {
  error: string
}

