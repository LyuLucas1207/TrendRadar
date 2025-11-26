"""
基础功能模块

负责初始化、环境检测等基础功能
"""
import os
from typing import Optional

from fetch_server.configs import CONFIG, VERSION
from fetch_server.data import DataFetcher
from fetch_server.utils import check_version_update


class NewsAnalyzerBase:
    """新闻分析器基础类"""
    
    def __init__(self):
        """初始化基础配置"""
        self.request_interval = CONFIG["REQUEST_INTERVAL"]
        self.report_mode = CONFIG["REPORT_MODE"]
        self.rank_threshold = CONFIG["RANK_THRESHOLD"]
        self.is_github_actions = os.environ.get("GITHUB_ACTIONS") == "true"
        self.is_docker_container = self._detect_docker_environment()
        self.update_info: Optional[dict] = None
        self.proxy_url: Optional[str] = None
        self._setup_proxy()
        self.data_fetcher = DataFetcher(self.proxy_url)

        if self.is_github_actions:
            self._check_version_update()

    def _detect_docker_environment(self) -> bool:
        """检测是否运行在 Docker 容器中"""
        try:
            if os.environ.get("DOCKER_CONTAINER") == "true":
                return True

            if os.path.exists("/.dockerenv"):
                return True

            return False
        except Exception:
            return False

    def _should_open_browser(self) -> bool:
        """判断是否应该打开浏览器"""
        return not self.is_github_actions and not self.is_docker_container

    def _setup_proxy(self) -> None:
        """设置代理配置"""
        if not self.is_github_actions and CONFIG["USE_PROXY"]:
            self.proxy_url = CONFIG["DEFAULT_PROXY"]
            print("本地环境，使用代理")
        elif not self.is_github_actions and not CONFIG["USE_PROXY"]:
            print("本地环境，未启用代理")
        else:
            print("GitHub Actions环境，不使用代理")

    def _check_version_update(self) -> None:
        """检查版本更新"""
        try:
            need_update, remote_version = check_version_update(
                VERSION, CONFIG["VERSION_CHECK_URL"], self.proxy_url
            )

            if need_update and remote_version:
                self.update_info = {
                    "current_version": VERSION,
                    "remote_version": remote_version,
                }
                print(f"发现新版本: {remote_version} (当前: {VERSION})")
            else:
                print("版本检查完成，当前为最新版本")
        except Exception as e:
            print(f"版本检查出错: {e}")

