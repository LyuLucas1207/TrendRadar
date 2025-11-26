"""
新闻分析器

负责新闻数据的分析和报告生成
"""
from fetch_server.configs import CONFIG
from fetch_server.utils import get_beijing_time
from fetch_server.analyzers.base import NewsAnalyzerBase
from fetch_server.analyzers.config_checker import ConfigChecker
from fetch_server.analyzers.crawler import Crawler
from fetch_server.analyzers.mode_executor import ModeExecutor


class NewsAnalyzer(NewsAnalyzerBase):
    """新闻分析器"""

    def __init__(self):
        """初始化新闻分析器"""
        super().__init__()
        self.crawler = Crawler(self.data_fetcher, self.request_interval)
        self.mode_executor = ModeExecutor(
            self.report_mode,
            self.rank_threshold,
            self.update_info,
            self.proxy_url,
            self._should_open_browser(),
            self.is_docker_container,
        )

    def _initialize_and_check_config(self) -> None:
        """通用初始化和配置检查"""
        now = get_beijing_time()
        print(f"当前北京时间: {now.strftime('%Y-%m-%d %H:%M:%S')}")

        if not CONFIG["ENABLE_CRAWLER"]:
            print("爬虫功能已禁用（ENABLE_CRAWLER=False），程序退出")
            return

        has_notification = ConfigChecker.has_notification_configured()
        if not CONFIG["ENABLE_NOTIFICATION"]:
            print("通知功能已禁用（ENABLE_NOTIFICATION=False），将只进行数据抓取")
        elif not has_notification:
            print("未配置任何通知渠道，将只进行数据抓取，不发送通知")
        else:
            print("通知功能已启用，将发送通知")

        mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)
        print(f"报告模式: {self.report_mode}")
        print(f"运行模式: {mode_strategy['description']}")

    def run(self) -> None:
        """执行分析流程"""
        try:
            self._initialize_and_check_config()

            mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)

            results, id_to_name, failed_ids = self.crawler.crawl()

            self.mode_executor.execute(mode_strategy, results, id_to_name, failed_ids)

        except Exception as e:
            print(f"分析流程执行出错: {e}")
            raise
