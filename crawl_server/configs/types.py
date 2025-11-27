"""
配置类型定义

使用 dataclass 定义配置类，提供完整的类型提示和 IDE 自动补全
"""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class PushWindowTimeRange:
    """推送时间窗口时间范围"""
    START: str = "08:00"
    END: str = "22:00"


@dataclass
class PushWindowConfig:
    """推送时间窗口配置"""
    ENABLED: bool = False
    TIME_RANGE: PushWindowTimeRange = field(default_factory=PushWindowTimeRange)
    ONCE_PER_DAY: bool = True
    RECORD_RETENTION_DAYS: int = 7


@dataclass
class WeightConfig:
    """权重配置"""
    RANK_WEIGHT: float = 0.6
    FREQUENCY_WEIGHT: float = 0.3
    HOTNESS_WEIGHT: float = 0.1


@dataclass
class CrawlConfig:
    """爬虫配置类"""
    VERSION_CHECK_URL: str = "https://raw.githubusercontent.com/sansan0/TrendRadar/refs/heads/master/version"
    SHOW_VERSION_UPDATE: bool = True
    REQUEST_INTERVAL: int = 1000
    REPORT_MODE: str = "daily"
    RANK_THRESHOLD: int = 5
    SORT_BY_POSITION_FIRST: bool = False
    MAX_NEWS_PER_KEYWORD: int = 0
    USE_PROXY: bool = False
    DEFAULT_PROXY: str = "http://127.0.0.1:10086"
    ENABLE_CRAWLER: bool = True
    ENABLE_NOTIFICATION: bool = True
    MESSAGE_BATCH_SIZE: int = 4000
    DINGTALK_BATCH_SIZE: int = 20000
    FEISHU_BATCH_SIZE: int = 29000
    BARK_BATCH_SIZE: int = 3600
    BATCH_SEND_INTERVAL: int = 3
    FEISHU_MESSAGE_SEPARATOR: str = "━━━━━━━━━━━━━━━━━━━"
    PUSH_WINDOW: PushWindowConfig = field(default_factory=PushWindowConfig)
    WEIGHT_CONFIG: WeightConfig = field(default_factory=WeightConfig)
    SCHEDULE_MINUTES: int = 15
    FEISHU_WEBHOOK_URL: str = ""
    DINGTALK_WEBHOOK_URL: str = ""
    WEWORK_WEBHOOK_URL: str = ""
    WEWORK_MSG_TYPE: str = "markdown"
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    EMAIL_FROM: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_TO: str = ""
    EMAIL_SMTP_SERVER: str = ""
    EMAIL_SMTP_PORT: str = ""
    NTFY_SERVER_URL: str = "https://ntfy.sh"
    NTFY_TOPIC: str = ""
    NTFY_TOKEN: str = ""
    BARK_URL: str = ""
    SLACK_WEBHOOK_URL: str = ""


@dataclass
class DatabaseConfig:
    """数据库配置类"""
    KAFKA_ENABLED: bool = False
    KAFKA_BOOTSTRAP_SERVERS: str = ""
    KAFKA_EVENT_TOPIC: str = ""
    KAFKA_EVENT_POISON_TOPIC: str = ""
    KAFKA_CONSUMER_GROUP_ID: str = ""
    POSTGRESQL_ENABLED: bool = False
    POSTGRESQL_HOST: str = ""
    POSTGRESQL_PORT: Optional[int] = None
    POSTGRESQL_DATABASE: str = ""
    POSTGRESQL_USER: str = ""
    POSTGRESQL_PASSWORD: str = ""
    REDIS_ENABLED: bool = False
    REDIS_HOST: str = ""
    REDIS_PORT: Optional[int] = None
    REDIS_DB: Optional[int] = None
    REDIS_PASSWORD: str = ""

