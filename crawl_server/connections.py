# coding=utf-8

"""
连接管理模块

负责初始化和清理所有外部资源连接（PostgreSQL, Redis, Kafka）
"""
import logging
from typing import Optional, NamedTuple

from crawl_server.configs import DatabaseConfig, CrawlConfig
from crawl_server.resources.postgresql import DatabaseSession
from crawl_server.resources.redis import RedisClient
from crawl_server.resources.kafka import (
    KafkaEventConsumer,
    KafkaConsumerThread,
)
from crawl_server.resources.kafka.client import KafkaClient
from crawl_server.controllers import CrawlController, FrequencyController, DataController
from crawl_server.services import CrawlService, FrequencyService, PlatformService, DataService
from crawl_server.repositories import (
    FrequencyCache,
    FrequencyDatabase,
    CrawlPipeline,
    PlatformCache,
    PlatformDatabase,
    CrawlResultDatabase,
    CrawlSessionDatabase,
)
from crawl_server.routers import setup_routes

logger = logging.getLogger(__name__)


class Connections(NamedTuple):
    """连接对象集合"""
    db_session: Optional[DatabaseSession]
    redis_client: Optional[RedisClient]
    kafka_consumer: Optional[KafkaEventConsumer]
    kafka_consumer_thread: Optional[KafkaConsumerThread]
    crawl_controller: Optional[CrawlController]
    frequency_controller: Optional[FrequencyController]
    data_controller: Optional[DataController]
    event_router: Optional[object]


def init_connections(db_config: DatabaseConfig, crawl_config: CrawlConfig) -> Connections:
    """
    初始化所有连接（PostgreSQL, Redis, Kafka）和 MVC Controllers
    
    Args:
        db_config: 数据库配置对象
        crawl_config: 爬虫配置对象
    
    Returns:
        Connections: 包含所有初始化对象的命名元组
    """
    
    db_session: Optional[DatabaseSession] = None
    redis_client: Optional[RedisClient] = None
    kafka_consumer: Optional[KafkaEventConsumer] = None
    kafka_consumer_thread: Optional[KafkaConsumerThread] = None
    platform_service: Optional[PlatformService] = None
    frequency_service: Optional[FrequencyService] = None
    data_service: Optional[DataService] = None
    crawl_controller: Optional[CrawlController] = None
    frequency_controller: Optional[FrequencyController] = None
    data_controller: Optional[DataController] = None
    event_router: Optional[object] = None
    
    # 初始化 PostgreSQL（使用 SQLAlchemy ORM）
    if db_config.POSTGRESQL_ENABLED:
        try:
            db_session = DatabaseSession(
                host=db_config.POSTGRESQL_HOST,
                port=db_config.POSTGRESQL_PORT,
                database=db_config.POSTGRESQL_DATABASE,
                user=db_config.POSTGRESQL_USER,
                password=db_config.POSTGRESQL_PASSWORD,
                enable_postgresql=True
            )
            # 创建数据库表（如果不存在）
            db_session.create_tables()
            logger.info("✅ SQLAlchemy 数据库会话已初始化，表已创建")
        except Exception as e:
            logger.error(f"❌ SQLAlchemy 数据库会话初始化失败: {e}")
    
    # 初始化 Redis
    if db_config.REDIS_ENABLED:
        try:
            redis_client = RedisClient(
                host=db_config.REDIS_HOST,
                port=db_config.REDIS_PORT,
                db=db_config.REDIS_DB,
                password=db_config.REDIS_PASSWORD or None,
                enable_redis=True
            )
            logger.info("✅ Redis 连接已初始化")
        except Exception as e:
            logger.error(f"❌ Redis 初始化失败: {e}")
    
    # 初始化 MVC Controllers（必须在 Kafka Consumer 之前初始化，因为注册处理器时需要用到）
    # 1. 初始化 Repositories
    frequency_cache_repo = FrequencyCache(redis_client=redis_client)
    frequency_database_repo = FrequencyDatabase(db_session=db_session)
    pipeline_repo = CrawlPipeline(db_config=db_config)
    
    # Platform Repositories
    platform_cache_repo = PlatformCache(redis_client=redis_client)
    platform_database_repo = PlatformDatabase(db_session=db_session)
    
    # 2. 初始化 Services
    frequency_service = FrequencyService(
        cache_repo=frequency_cache_repo,
        database_repo=frequency_database_repo
    )
    
    platform_service = PlatformService(
        cache_repo=platform_cache_repo,
        database_repo=platform_database_repo,
    )
    
    crawl_service = CrawlService(
        pipeline_repo=pipeline_repo,
        crawl_config=crawl_config,
        db_config=db_config
    )
    
    # Data Repositories
    crawl_result_repo = CrawlResultDatabase(db_session=db_session)
    crawl_session_repo = CrawlSessionDatabase(db_session=db_session)
    
    # Data Service
    data_service = DataService(
        crawl_result_repo=crawl_result_repo,
        crawl_session_repo=crawl_session_repo
    )
    
    # 3. 初始化 Controllers（Controller 依赖多个 Service 和配置）
    crawl_controller = CrawlController(
        crawl_service=crawl_service,
        platform_service=platform_service,
        frequency_service=frequency_service,
        crawl_config=crawl_config,
        db_config=db_config
    )
    frequency_controller = FrequencyController(frequency_service=frequency_service)
    data_controller = DataController(data_service=data_service)
    
    logger.info("✅ MVC Controllers 初始化完成")
    
    # 4. 初始化路由分发器
    event_router = setup_routes(
        crawl_controller=crawl_controller,
        frequency_controller=frequency_controller,
        data_controller=data_controller
    )
    logger.info("✅ 事件路由分发器初始化完成")
    
    # 初始化 Kafka Consumer（在 Controllers 和 Router 初始化之后）
    if db_config.KAFKA_ENABLED:
        try:
            bootstrap_servers = db_config.KAFKA_BOOTSTRAP_SERVERS or "Resources-Kafka:9092"
            event_topic = db_config.KAFKA_EVENT_TOPIC or "trendradar.crawl_server"
            group_id = db_config.KAFKA_CONSUMER_GROUP_ID or "trendradar-crawl-server"
            
            # 确保 Kafka topic 存在
            kafka_client = KafkaClient(
                bootstrap_servers=bootstrap_servers,
                enable_kafka=True
            )
            if kafka_client.ensure_topic_exists(event_topic):
                logger.info(f"✅ Kafka topic 已存在或创建成功: {event_topic}")
            else:
                logger.warning(f"⚠️  Kafka topic 创建失败: {event_topic}")
            
            kafka_consumer = KafkaEventConsumer(
                bootstrap_servers=bootstrap_servers,
                topic=event_topic,
                group_id=group_id
            )
            
            # 使用路由分发器注册事件处理器（将 controller 的方法注册到 Kafka consumer）
            for event_type, handler in event_router.routes.items():
                kafka_consumer.register_handler(event_type, handler)
                logger.debug(f"✅ 注册 Kafka 事件处理器: {event_type}")
            
            # 注意：Kafka Consumer 线程在 main.py 中启动，这里只初始化
            logger.info("✅ Kafka Consumer 已初始化（等待在 main.py 中启动线程）")
        except Exception as e:
            logger.error(f"❌ Kafka Consumer 初始化失败: {e}")
    
    return Connections(
        db_session=db_session,
        redis_client=redis_client,
        kafka_consumer=kafka_consumer,
        kafka_consumer_thread=kafka_consumer_thread,
        crawl_controller=crawl_controller,
        frequency_controller=frequency_controller,
        data_controller=data_controller,
        event_router=event_router
    )


def cleanup_connections(connections: Connections):
    """清理所有连接
    
    Args:
        connections: 连接对象集合
    """
    logger.info("🧹 正在清理连接...")
    
    if connections.kafka_consumer:
        connections.kafka_consumer.stop()
    
    if connections.redis_client:
        connections.redis_client.close()
    
    if connections.db_session:
        connections.db_session.close()
    
    logger.info("✅ 所有连接已清理")

