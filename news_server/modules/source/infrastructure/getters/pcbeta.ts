/**
 * 远景论坛新闻源获取器
 * 从 newsnow/server/sources/pcbeta.ts 迁移
 */
import type { SourceGetter } from '../../domain/getter/getter'
import { defineRSSSource } from './utils'

export const pcbetaWindows11Getter = defineRSSSource(
  'https://bbs.pcbeta.com/forum.php?mod=rss&fid=563&auth=0'
)

export const pcbetaWindowsGetter = defineRSSSource(
  'https://bbs.pcbeta.com/forum.php?mod=rss&fid=521&auth=0'
)

