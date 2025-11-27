# coding=utf-8

"""
抓取任务模块

负责执行单次抓取任务
"""
import logging
from typing import Optional

from crawl_server.controllers import CrawlController

logger = logging.getLogger(__name__)


def run_crawl_task(
    crawl_controller: Optional[CrawlController] = None,
    trigger: str = "scheduled",
    count: int = 1
):
    """
    执行一次抓取任务
    
    Args:
        crawl_controller: 抓取控制器实例（已在初始化时接收配置）
        trigger: 触发来源（manual, scheduled, api）
        count: 抓取次数，默认为1
    """
    if not crawl_controller:
        logger.error("❌ CrawlController 未初始化，无法执行抓取任务")
        raise RuntimeError("CrawlController 未初始化，程序无法继续运行")
    
    try:
        logger.info(f"🔄 开始执行抓取任务: trigger={trigger}, count={count}")
        
        # 直接调用 controller 的 handle_crawl（定时服务调用，不需要 event_data）
        crawl_controller.handle_crawl(trigger=trigger, count=count)
        logger.info("✅ 抓取任务完成")
            
    except Exception as e:
        logger.error(f"❌ 抓取任务失败: {e}", exc_info=True)
        raise

