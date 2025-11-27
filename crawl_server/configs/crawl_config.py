"""
爬虫配置模块

负责加载和管理爬虫相关配置
从环境变量读取（Docker Compose 会自动从 .env 加载）
"""
import os
from .types import CrawlConfig, PushWindowConfig, WeightConfig, PushWindowTimeRange


def load_crawl_config() -> CrawlConfig:
    """
    加载爬虫相关配置（从环境变量），返回配置对象
    
    Returns:
        CrawlConfig: 可通过 config.KEY 访问的配置对象，IDE 有完整类型提示
    """
    
    def get_env(key: str, default: str = "") -> str:
        return os.environ.get(key, default).strip()
    
    def get_bool_env(key: str, default: bool = False) -> bool:
        value = get_env(key, "")
        return value.lower() in ("true", "1") if value else default
    
    def get_int_env(key: str, default: int = 0) -> int:
        value = get_env(key, "")
        return int(value) if value else default
    
    def get_float_env(key: str, default: float = 0.0) -> float:
        value = get_env(key, "")
        return float(value) if value else default
    
    # 构建嵌套配置对象
    push_window = PushWindowConfig(
        ENABLED=get_bool_env("PUSH_WINDOW_ENABLED", False),
        TIME_RANGE=PushWindowTimeRange(
            START=get_env("PUSH_WINDOW_START", "08:00"),
            END=get_env("PUSH_WINDOW_END", "22:00"),
        ),
        ONCE_PER_DAY=get_bool_env("PUSH_WINDOW_ONCE_PER_DAY", True),
        RECORD_RETENTION_DAYS=get_int_env("PUSH_WINDOW_RETENTION_DAYS", 7),
    )
    
    weight_config = WeightConfig(
        RANK_WEIGHT=get_float_env("RANK_WEIGHT", 0.6),
        FREQUENCY_WEIGHT=get_float_env("FREQUENCY_WEIGHT", 0.3),
        HOTNESS_WEIGHT=get_float_env("HOTNESS_WEIGHT", 0.1),
    )
    
    # 直接创建 CrawlConfig 对象
    config = CrawlConfig(
        VERSION_CHECK_URL=get_env("VERSION_CHECK_URL", "https://raw.githubusercontent.com/sansan0/TrendRadar/refs/heads/master/version"),
        SHOW_VERSION_UPDATE=get_bool_env("SHOW_VERSION_UPDATE", True),
        REQUEST_INTERVAL=get_int_env("REQUEST_INTERVAL", 1000),
        REPORT_MODE=get_env("REPORT_MODE", "daily"),
        RANK_THRESHOLD=get_int_env("RANK_THRESHOLD", 5),
        SORT_BY_POSITION_FIRST=get_bool_env("SORT_BY_POSITION_FIRST", False),
        MAX_NEWS_PER_KEYWORD=get_int_env("MAX_NEWS_PER_KEYWORD", 0),
        USE_PROXY=get_bool_env("USE_PROXY", False),
        DEFAULT_PROXY=get_env("DEFAULT_PROXY", "http://127.0.0.1:10086"),
        ENABLE_CRAWLER=get_bool_env("ENABLE_CRAWLER", True),
        ENABLE_NOTIFICATION=get_bool_env("ENABLE_NOTIFICATION", True),
        MESSAGE_BATCH_SIZE=get_int_env("MESSAGE_BATCH_SIZE", 4000),
        DINGTALK_BATCH_SIZE=get_int_env("DINGTALK_BATCH_SIZE", 20000),
        FEISHU_BATCH_SIZE=get_int_env("FEISHU_BATCH_SIZE", 29000),
        BARK_BATCH_SIZE=get_int_env("BARK_BATCH_SIZE", 3600),
        BATCH_SEND_INTERVAL=get_int_env("BATCH_SEND_INTERVAL", 3),
        FEISHU_MESSAGE_SEPARATOR=get_env("FEISHU_MESSAGE_SEPARATOR", "━━━━━━━━━━━━━━━━━━━"),
        PUSH_WINDOW=push_window,
        WEIGHT_CONFIG=weight_config,
        SCHEDULE_MINUTES=get_int_env("SCHEDULE_MINUTES", 15),
        FEISHU_WEBHOOK_URL=get_env("FEISHU_WEBHOOK_URL", ""),
        DINGTALK_WEBHOOK_URL=get_env("DINGTALK_WEBHOOK_URL", ""),
        WEWORK_WEBHOOK_URL=get_env("WEWORK_WEBHOOK_URL", ""),
        WEWORK_MSG_TYPE=get_env("WEWORK_MSG_TYPE", "markdown"),
        TELEGRAM_BOT_TOKEN=get_env("TELEGRAM_BOT_TOKEN", ""),
        TELEGRAM_CHAT_ID=get_env("TELEGRAM_CHAT_ID", ""),
        EMAIL_FROM=get_env("EMAIL_FROM", ""),
        EMAIL_PASSWORD=get_env("EMAIL_PASSWORD", ""),
        EMAIL_TO=get_env("EMAIL_TO", ""),
        EMAIL_SMTP_SERVER=get_env("EMAIL_SMTP_SERVER", ""),
        EMAIL_SMTP_PORT=get_env("EMAIL_SMTP_PORT", ""),
        NTFY_SERVER_URL=get_env("NTFY_SERVER_URL", "https://ntfy.sh"),
        NTFY_TOPIC=get_env("NTFY_TOPIC", ""),
        NTFY_TOKEN=get_env("NTFY_TOKEN", ""),
        BARK_URL=get_env("BARK_URL", ""),
        SLACK_WEBHOOK_URL=get_env("SLACK_WEBHOOK_URL", ""),
    )

    print("✅ 爬虫配置加载完成")
    return config

