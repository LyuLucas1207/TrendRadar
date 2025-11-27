"""
配置检查模块

负责配置验证和模式策略管理
"""
from typing import Dict

from crawl_server.configs import CrawlConfig


class ConfigChecker:
    """配置检查器"""
    
    # 模式策略定义
    MODE_STRATEGIES = {
        "incremental": {
            "mode_name": "增量模式",
            "description": "增量模式（只关注新增新闻，无新增时不推送）",
            "realtime_report_type": "实时增量",
            "summary_report_type": "当日汇总",
            "should_send_realtime": True,
            "should_generate_summary": True,
            "summary_mode": "daily",
        },
        "current": {
            "mode_name": "当前榜单模式",
            "description": "当前榜单模式（当前榜单匹配新闻 + 新增新闻区域 + 按时推送）",
            "realtime_report_type": "实时当前榜单",
            "summary_report_type": "当前榜单汇总",
            "should_send_realtime": True,
            "should_generate_summary": True,
            "summary_mode": "current",
        },
        "daily": {
            "mode_name": "当日汇总模式",
            "description": "当日汇总模式（所有匹配新闻 + 新增新闻区域 + 按时推送）",
            "realtime_report_type": "",
            "summary_report_type": "当日汇总",
            "should_send_realtime": False,
            "should_generate_summary": True,
            "summary_mode": "daily",
        },
    }

    @staticmethod
    def get_mode_strategy(report_mode: str) -> Dict:
        """获取当前模式的策略配置"""
        return ConfigChecker.MODE_STRATEGIES.get(
            report_mode, ConfigChecker.MODE_STRATEGIES["daily"]
        )

    @staticmethod
    def has_notification_configured(crawl_config: CrawlConfig) -> bool:
        """
        检查是否配置了任何通知渠道
        
        Args:
            crawl_config: 爬虫配置对象
        """
        return any(
            [
                crawl_config.FEISHU_WEBHOOK_URL,
                crawl_config.DINGTALK_WEBHOOK_URL,
                crawl_config.WEWORK_WEBHOOK_URL,
                (crawl_config.TELEGRAM_BOT_TOKEN and crawl_config.TELEGRAM_CHAT_ID),
                (
                    crawl_config.EMAIL_FROM
                    and crawl_config.EMAIL_PASSWORD
                    and crawl_config.EMAIL_TO
                ),
                (crawl_config.NTFY_SERVER_URL and crawl_config.NTFY_TOPIC),
                crawl_config.BARK_URL,
            ]
        )

    @staticmethod
    def has_valid_content(
        report_mode: str, stats: list, new_titles: dict = None
    ) -> bool:
        """检查是否有有效的新闻内容"""
        if report_mode in ["incremental", "current"]:
            # 增量模式和current模式下，只要stats有内容就说明有匹配的新闻
            return any(stat["count"] > 0 for stat in stats)
        else:
            # 当日汇总模式下，检查是否有匹配的频率词新闻或新增新闻
            has_matched_news = any(stat["count"] > 0 for stat in stats)
            has_new_news = bool(
                new_titles and any(len(titles) > 0 for titles in new_titles.values())
            )
            return has_matched_news or has_new_news

