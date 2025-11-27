/**
 * 源获取器注册入口
 * 自动注册所有源获取器
 */
import { SourceGetterRegistry } from './registry'
import { v2exGetter } from './v2ex'
import { zhihuGetter } from './zhihu'
import { weiboGetter } from './weibo'
import { hackernewsGetter } from './hackernews'
import { createProductHuntGetter } from './producthunt'
import { githubTrendingGetter } from './github'
import {
  bilibiliHotSearchGetter,
  bilibiliHotVideoGetter,
  bilibiliRankingGetter,
} from './bilibili'
import { baiduGetter } from './baidu'
import { juejinGetter } from './juejin'
import { sspaiGetter } from './sspai'
import { nowcoderGetter } from './nowcoder'
import { doubanGetter } from './douban'
import { hupuGetter } from './hupu'
import { toutiaoGetter } from './toutiao'
import { thepaperGetter } from './thepaper'
import { ifengGetter } from './ifeng'
import { tiebaGetter } from './tieba'
import {
  wallstreetcnQuickGetter,
  wallstreetcnNewsGetter,
  wallstreetcnHotGetter,
} from './wallstreetcn'
import { mktnewsFlashGetter } from './mktnews'
import { xueqiuHotstockGetter } from './xueqiu'
import {
  clsTelegraphGetter,
  clsDepthGetter,
  clsHotGetter,
} from './cls'
import { coolapkGetter } from './coolapk'
import { tencentHotGetter } from './tencent'
import { cankaoxiaoxiGetter } from './cankaoxiaoxi'
import {
  chongbuluoHotGetter,
  chongbuluoLatestGetter,
} from './chongbuluo'
import { douyinGetter } from './douyin'
import { jin10Getter } from './jin10'
import { kaopuGetter } from './kaopu'
import { gelonghuiGetter } from './gelonghui'
import { solidotGetter } from './solidot'
import { ithomeGetter } from './ithome'
import { zaobaoGetter } from './zaobao'
import {
  fastbullExpressGetter,
  fastbullNewsGetter,
} from './fastbull'
import { sputniknewscnGetter } from './sputniknewscn'
import { steamGetter } from './steam'
import { _36krQuickGetter } from './_36kr'
import {
  pcbetaWindows11Getter,
  pcbetaWindowsGetter,
} from './pcbeta'
import {
  linuxdoHotGetter,
  linuxdoLatestGetter,
} from './linuxdo'
import { ghxiGetter } from './ghxi'
import { smzdmGetter } from './smzdm'
import { kuaishouGetter } from './kuaishou'
import type { ProductHuntConfig } from '../../config/types'

export function createSourceGetterRegistry(productHuntConfig?: ProductHuntConfig): SourceGetterRegistry {
  const registry = new SourceGetterRegistry()

  // 注册所有源获取器
  registry.register('v2ex', v2exGetter)
  registry.register('v2ex-share', v2exGetter)
  registry.register('zhihu', zhihuGetter)
  registry.register('weibo', weiboGetter)
  registry.register('hackernews', hackernewsGetter)
  // ProductHunt: 使用配置创建 getter（如果没有配置会打印警告）
  registry.register('producthunt', createProductHuntGetter(productHuntConfig || {}))
  registry.register('github', githubTrendingGetter)
  registry.register('github-trending-today', githubTrendingGetter)
  registry.register('bilibili', bilibiliHotSearchGetter)
  registry.register('bilibili-hot-search', bilibiliHotSearchGetter)
  registry.register('bilibili-hot-video', bilibiliHotVideoGetter)
  registry.register('bilibili-ranking', bilibiliRankingGetter)
  
  // API 类型源
  registry.register('baidu', baiduGetter)
  registry.register('juejin', juejinGetter)
  registry.register('sspai', sspaiGetter)
  registry.register('nowcoder', nowcoderGetter)
  registry.register('douban', doubanGetter)
  registry.register('hupu', hupuGetter)
  registry.register('toutiao', toutiaoGetter)
  registry.register('thepaper', thepaperGetter)
  registry.register('ifeng', ifengGetter)
  registry.register('tieba', tiebaGetter)
  registry.register('mktnews', mktnewsFlashGetter)
  registry.register('mktnews-flash', mktnewsFlashGetter)
  registry.register('xueqiu', xueqiuHotstockGetter)
  registry.register('xueqiu-hotstock', xueqiuHotstockGetter)
  registry.register('tencent-hot', tencentHotGetter)
  registry.register('cankaoxiaoxi', cankaoxiaoxiGetter)
  registry.register('douyin', douyinGetter)
  registry.register('jin10', jin10Getter)
  registry.register('kaopu', kaopuGetter)
  
  // 华尔街见闻
  registry.register('wallstreetcn', wallstreetcnQuickGetter)
  registry.register('wallstreetcn-quick', wallstreetcnQuickGetter)
  registry.register('wallstreetcn-news', wallstreetcnNewsGetter)
  registry.register('wallstreetcn-hot', wallstreetcnHotGetter)
  
  // 财联社
  registry.register('cls', clsTelegraphGetter)
  registry.register('cls-telegraph', clsTelegraphGetter)
  registry.register('cls-depth', clsDepthGetter)
  registry.register('cls-hot', clsHotGetter)
  
  // 虫部落
  registry.register('chongbuluo', chongbuluoHotGetter)
  registry.register('chongbuluo-hot', chongbuluoHotGetter)
  registry.register('chongbuluo-latest', chongbuluoLatestGetter)
  
  // 法布财经
  registry.register('fastbull', fastbullExpressGetter)
  registry.register('fastbull-express', fastbullExpressGetter)
  registry.register('fastbull-news', fastbullNewsGetter)
  
  // 36氪
  registry.register('36kr', _36krQuickGetter)
  registry.register('36kr-quick', _36krQuickGetter)
  
  // 远景论坛
  registry.register('pcbeta-windows11', pcbetaWindows11Getter)
  registry.register('pcbeta-windows', pcbetaWindowsGetter)
  
  // LINUX DO
  registry.register('linuxdo', linuxdoLatestGetter)
  registry.register('linuxdo-latest', linuxdoLatestGetter)
  registry.register('linuxdo-hot', linuxdoHotGetter)
  
  // HTML 解析类型源
  registry.register('coolapk', coolapkGetter)
  registry.register('gelonghui', gelonghuiGetter)
  registry.register('solidot', solidotGetter)
  registry.register('ithome', ithomeGetter)
  registry.register('zaobao', zaobaoGetter)
  registry.register('sputniknewscn', sputniknewscnGetter)
  registry.register('steam', steamGetter)
  registry.register('ghxi', ghxiGetter)
  registry.register('smzdm', smzdmGetter)
  registry.register('kuaishou', kuaishouGetter)

  return registry
}
