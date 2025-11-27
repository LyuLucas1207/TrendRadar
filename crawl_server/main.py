# coding=utf-8

"""
TrendRadar Crawl Server - 主入口

服务器模式：持续运行，支持：
- 定时任务（定期抓取）
- Kafka 事件监听（operation.crawl, operation.clear）
- 连接池管理（PostgreSQL, Kafka, Redis）
"""
import os
import time
import signal
import logging

from crawl_server.configs import load_config, VERSION
from crawl_server.connections import init_connections, cleanup_connections
from crawl_server.crawl_task import run_crawl_task

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局运行状态
running = True

def signal_handler(sig, frame):
    """信号处理器（优雅关闭）"""
    global running
    logger.info("\n🛑 收到停止信号，正在优雅关闭...")
    running = False


def run_server_mode():
    """服务器模式：持续运行，定时执行 + 事件监听"""
    global running
    
    # 注册信号处理器
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # 加载配置
    crawl_config, db_config = load_config()
    
    logger.info("=" * 60)
    logger.info(f"  Crawl Server Version: {VERSION}")
    logger.info("=" * 60)
    logger.info(f"🚀 启动服务器模式")
    logger.info(f"⏰ 定时执行间隔: {crawl_config.SCHEDULE_MINUTES} 分钟")
    
    # 初始化连接（PostgreSQL, Redis, Kafka）和 Controllers
    connections = init_connections(db_config=db_config, crawl_config=crawl_config)
    
    # 启动 Kafka 监听线程（controller 已经通过 event_router 注册到 kafka_consumer）
    if connections.kafka_consumer:
        from crawl_server.resources.kafka import KafkaConsumerThread
        if connections.kafka_consumer.start():
            kafka_consumer_thread = KafkaConsumerThread(connections.kafka_consumer)
            kafka_consumer_thread.start()
            logger.info("✅ Kafka Consumer 监听线程已启动（controller 已注册）")
        else:
            logger.error("❌ Kafka Consumer 启动失败")
    

    # 主循环：定时执行（Kafka 监听在后台线程运行）
    logger.info(f"🔄 进入主循环，立即执行第一次抓取任务...")
    
    interval_seconds = crawl_config.SCHEDULE_MINUTES * 60
    
    while running:
        try:
            # 先执行抓取任务
            if connections.crawl_controller:
                run_crawl_task(
                    crawl_controller=connections.crawl_controller,
                    trigger="scheduled",
                    count=1
                )
            else:
                logger.error("❌ CrawlController 未初始化，无法执行抓取任务")
            
            # 如果收到停止信号，退出循环
            if not running:
                break
            
            # 等待指定时间
            logger.info(f"⏰ 等待 {crawl_config.SCHEDULE_MINUTES} 分钟后执行下次任务...")
            time.sleep(interval_seconds)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"❌ 主循环出错: {e}", exc_info=True)
            logger.info(f"⏰ {crawl_config.SCHEDULE_MINUTES} 分钟后重试...")
            # 即使出错也要等待，避免频繁重试
            time.sleep(interval_seconds)
    
    # 清理连接
    cleanup_connections(connections)
    logger.info("👋 服务器已停止")


def main():
    """主函数"""
    # 只支持服务器模式（依赖数据库和 Redis）
    logger.info("🚀 启动 Crawl Server（服务器模式）")
    logger.info("📌 注意：此模式依赖 PostgreSQL 和 Redis，请确保已正确配置")
    
    try:
        run_server_mode()
    except FileNotFoundError as e:
        logger.error(f"❌ 配置文件错误: {e}")
        logger.error("\n请确保以下文件存在:")
        logger.error("  • config/config.yaml")
        logger.error("  • config/frequency_words.txt")
    except Exception as e:
        logger.error(f"❌ 程序运行错误: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
