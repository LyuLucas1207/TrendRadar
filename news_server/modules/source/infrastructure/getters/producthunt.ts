/**
 * Product Hunt 新闻源获取器
 * 从 newsnow/server/sources/producthunt.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { NewsItem } from '../../domain/newsitem/entity'
import type { ProductHuntConfig } from '../../config/types'
import { consola } from 'consola'

/**
 * 创建 ProductHunt 获取器
 * 需要传入 ProductHunt 配置以获取 API token
 */
export function createProductHuntGetter(config: ProductHuntConfig): SourceGetter {
  return async () => {
    const apiToken = config.apiToken || process.env.PRODUCTHUNT_API_TOKEN
    if (!apiToken) {
      consola.warn('⚠️ ProductHunt API token is not set. Please configure productHunt.apiToken in config file or set PRODUCTHUNT_API_TOKEN environment variable.')
      throw new Error('ProductHunt API token is not set. Please configure productHunt.apiToken in config file or set PRODUCTHUNT_API_TOKEN environment variable.')
    }

    const query = `
      query {
        posts(first: 30, order: VOTES) {
          edges {
            node {
              id
              name
              tagline
              votesCount
              url
              slug
            }
          }
        }
      }
    `

    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Product Hunt: ${response.statusText}`)
    }

    const data: any = await response.json()
    const posts = data?.data?.posts?.edges || []

    return posts.map((edge: any) => {
      const post = edge.node
      return NewsItem.fromEntity({
        id: post.id,
        title: post.name,
        url: post.url || `https://www.producthunt.com/posts/${post.slug}`,
        extra: {
          info: `△ ${post.votesCount || 0}`,
          hover: post.tagline,
        },
      })
    })
  }
}

