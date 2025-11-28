/**
 * HTTP 请求 DTO
 */
export interface GetNewsQuery {
  id?: string
  sourceId?: string
  limit?: string
  offset?: string
}

export interface SearchNewsQuery {
  q: string
  limit?: string
  offset?: string
}

