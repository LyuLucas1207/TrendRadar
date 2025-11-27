"""
通知发送模块

负责通知发送逻辑
"""
from typing import Dict, List, Optional

from crawl_server.configs import CrawlConfig
from crawl_server.core.connections import send_to_notifications
from crawl_server.core.analyzers.config_checker import ConfigChecker


class Notifier:
    """通知发送器"""
    
    def __init__(self, report_mode: str, proxy_url: Optional[str] = None, crawl_config: Optional[CrawlConfig] = None):
        """
        初始化通知发送器
        
        Args:
            report_mode: 报告模式
            proxy_url: 代理URL
            crawl_config: 爬虫配置对象
        """
        self.report_mode = report_mode
        self.proxy_url = proxy_url
        self.crawl_config = crawl_config

    def send_if_needed(
        self,
        stats: List[Dict],
        report_type: str,
        mode: str,
        update_info: Optional[Dict] = None,
        failed_ids: Optional[List] = None,
        new_titles: Optional[Dict] = None,
        id_to_name: Optional[Dict] = None,
        html_file_path: Optional[str] = None,
    ) -> bool:
        """统一的通知发送逻辑，包含所有判断条件"""
        if not self.crawl_config:
            raise RuntimeError("CrawlConfig 未提供，无法发送通知")
        
        has_notification = ConfigChecker.has_notification_configured(self.crawl_config)

        if (
            self.crawl_config.ENABLE_NOTIFICATION
            and has_notification
            and ConfigChecker.has_valid_content(self.report_mode, stats, new_titles)
        ):
            send_to_notifications(
                stats,
                failed_ids or [],
                report_type,
                new_titles,
                id_to_name,
                update_info,
                self.proxy_url,
                mode=mode,
                html_file_path=html_file_path,
                crawl_config=self.crawl_config,
            )
            return True
        elif self.crawl_config.ENABLE_NOTIFICATION and not has_notification:
            print("⚠️ 警告：通知功能已启用但未配置任何通知渠道，将跳过通知发送")
        elif not self.crawl_config.ENABLE_NOTIFICATION:
            print(f"跳过{report_type}通知：通知功能已禁用")
        elif (
            self.crawl_config.ENABLE_NOTIFICATION
            and has_notification
            and not ConfigChecker.has_valid_content(self.report_mode, stats, new_titles)
        ):
            mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)
            if "实时" in report_type:
                print(
                    f"跳过实时推送通知：{mode_strategy['mode_name']}下未检测到匹配的新闻"
                )
            else:
                print(
                    f"跳过{mode_strategy['summary_report_type']}通知：未匹配到有效的新闻内容"
                )

        return False

