"""
新闻分析器

负责新闻数据的分析和报告生成
"""
from typing import Optional
from crawl_server.configs import CrawlConfig, DatabaseConfig
from crawl_server.core.utils import get_beijing_time
from crawl_server.core.analyzers.base import NewsAnalyzerBase
from crawl_server.core.analyzers.config_checker import ConfigChecker
from crawl_server.core.analyzers.crawler import Crawler
from crawl_server.core.analyzers.mode_executor import ModeExecutor


class NewsAnalyzer(NewsAnalyzerBase):
    """新闻分析器"""

    def __init__(self, crawl_config: CrawlConfig, db_config: Optional[DatabaseConfig] = None):
        """
        初始化新闻分析器
        
        Args:
            crawl_config: 爬虫配置对象
            db_config: 数据库配置对象
        """
        super().__init__(crawl_config=crawl_config)
        self.crawler = Crawler(self.data_fetcher, self.request_interval, db_config=db_config)
        self.mode_executor = ModeExecutor(
            self.report_mode,
            self.rank_threshold,
            self.update_info,
            self.proxy_url,
            self._should_open_browser(),
            self.is_docker_container,
            crawl_config=crawl_config,
        )

    def _initialize_and_check_config(self) -> None:
        """通用初始化和配置检查"""
        now = get_beijing_time()
        print(f"当前北京时间: {now.strftime('%Y-%m-%d %H:%M:%S')}")

        if not self.crawl_config.ENABLE_CRAWLER:
            print("爬虫功能已禁用（ENABLE_CRAWLER=False），程序退出")
            return

        has_notification = ConfigChecker.has_notification_configured(self.crawl_config)
        if not self.crawl_config.ENABLE_NOTIFICATION:
            print("通知功能已禁用（ENABLE_NOTIFICATION=False），将只进行数据抓取")
        elif not has_notification:
            print("未配置任何通知渠道，将只进行数据抓取，不发送通知")
        else:
            print("通知功能已启用，将发送通知")

        mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)
        print(f"报告模式: {self.report_mode}")
        print(f"运行模式: {mode_strategy['description']}")

    def run(
        self, 
        platforms=None, 
        word_groups=None, 
        filter_words=None,
        trigger_source: str = "scheduled"
    ) -> None:
        """
        执行分析流程
        
        Args:
            platforms: 平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
            word_groups: 频率词组列表
            filter_words: 过滤词列表
            trigger_source: 触发来源（manual, scheduled, api）
        """
        try:
            self._initialize_and_check_config()

            mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)

            results, id_to_name, failed_ids = self.crawler.crawl(
                platforms=platforms,
                trigger_source=trigger_source,
                word_groups=word_groups,
                filter_words=filter_words
            )

            self.mode_executor.execute(
                mode_strategy, 
                results, 
                id_to_name, 
                failed_ids,
                platforms=platforms,
                word_groups=word_groups,
                filter_words=filter_words
            )

        except Exception as e:
            print(f"分析流程执行出错: {e}")
            raise
