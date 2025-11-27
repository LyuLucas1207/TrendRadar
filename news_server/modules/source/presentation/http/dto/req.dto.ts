/**
 * Source HTTP 请求 DTO
 * 类似 Sjgz-Backend 的 interfaces/http/dto/req.go
 */
export interface GetSourceDataQuery {
  id: string
  latest?: string // 'true' | 'false'
}

