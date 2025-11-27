/**
 * SourceGetter 接口
 * 定义新闻源数据获取器的接口
 */
import type { NewsItem } from '../newsitem/entity'

/**
 * SourceGetter 函数类型
 * 每个新闻源获取器都应该实现这个接口
 */
export type SourceGetter = () => Promise<NewsItem[]>

