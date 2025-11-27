# coding=utf-8

"""
抓取数据数据库仓库

负责从 PostgreSQL 数据库读取和写入抓取结果和会话信息（使用 SQLAlchemy ORM）
"""
import logging
from typing import Optional, List, Dict
from datetime import datetime
from crawl_server.resources.postgresql import DatabaseSession
from crawl_server.models import CrawlResult, CrawlSession

logger = logging.getLogger(__name__)


class CrawlResultDatabase:
    """抓取结果数据库（PostgreSQL，使用 SQLAlchemy ORM）"""
    
    def __init__(self, db_session: Optional[DatabaseSession] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: SQLAlchemy 数据库会话
        """
        self.db_session = db_session
    
    def save_batch(
        self,
        results: List[Dict],
        session_id: Optional[str] = None
    ) -> int:
        """
        批量保存抓取结果
        
        Args:
            results: 抓取结果列表，格式: [
                {
                    "platform_id": "toutiao",
                    "title": "新闻标题",  # 失败时可为 None
                    "rank": 1,
                    "ranks": [1, 2],
                    "url": "https://...",
                    "mobile_url": "https://...",
                    "matched_group_keys": ["新能源汽车", "电池技术"],  # 匹配到的频率词组键列表（group_key数组）
                    "is_success": 1,  # 1=成功，0=失败
                    "error_message": None,  # 失败时的错误信息
                    "fetch_time": "2025-11-27T06:18:43"
                },
                ...
            ]
            session_id: 抓取会话ID（可选）
        
        Returns:
            成功保存的数量
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return 0
        
        try:
            with self.db_session.get_session() as session:
                saved_count = 0
                for result_data in results:
                    try:
                        # 解析 fetch_time
                        fetch_time_str = result_data.get("fetch_time")
                        if isinstance(fetch_time_str, str):
                            fetch_time = datetime.fromisoformat(fetch_time_str.replace('Z', '+00:00'))
                        else:
                            fetch_time = datetime.now()
                        
                        crawl_result = CrawlResult(
                            session_id=session_id,
                            platform_id=result_data["platform_id"],
                            title=result_data.get("title"),  # 失败时可为 None
                            rank=result_data.get("rank"),
                            ranks=result_data.get("ranks", []),
                            url=result_data.get("url", ""),
                            mobile_url=result_data.get("mobile_url", ""),
                            matched_group_keys=result_data.get("matched_group_keys", []),
                            is_success=result_data.get("is_success", 1),
                            error_message=result_data.get("error_message"),
                            fetch_time=fetch_time,
                        )
                        session.add(crawl_result)
                        saved_count += 1
                    except Exception as e:
                        logger.error(f"❌ 保存单条抓取结果失败: {e}", exc_info=True)
                        continue
                
                session.commit()
                return saved_count
        except Exception as e:
            logger.error(f"❌ 批量保存抓取结果失败: {e}", exc_info=True)
            return 0


class CrawlSessionDatabase:
    """抓取会话数据库（PostgreSQL，使用 SQLAlchemy ORM）"""
    
    def __init__(self, db_session: Optional[DatabaseSession] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: SQLAlchemy 数据库会话
        """
        self.db_session = db_session
    
    def save(self, session_data: Dict) -> bool:
        """
        保存抓取会话
        
        Args:
            session_data: 会话数据，格式: {
                "session_id": "xxx",
                "trigger_source": "scheduled",
                "total_platforms": 11,
                "success_count": 10,
                "failed_count": 1,
                "failed_ids": ["xxx"],
                "platforms": ["toutiao", "baidu", "weibo", ...],  # 平台ID列表
                "word_groups": [...],
                "filter_words": [...],
                "total_news_count": 255,
                "started_at": "2025-11-27T06:18:32",
                "completed_at": "2025-11-27T06:18:43",
                "status": "completed"
            }
        
        Returns:
            是否成功
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return False
        
        try:
            with self.db_session.get_session() as session:
                # 解析时间
                started_at_str = session_data.get("started_at")
                if isinstance(started_at_str, str):
                    started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
                else:
                    started_at = datetime.now()
                
                completed_at_str = session_data.get("completed_at")
                completed_at = None
                if completed_at_str:
                    if isinstance(completed_at_str, str):
                        completed_at = datetime.fromisoformat(completed_at_str.replace('Z', '+00:00'))
                    else:
                        completed_at = datetime.now()
                
                crawl_session = CrawlSession(
                    session_id=session_data["session_id"],
                    trigger_source=session_data["trigger_source"],
                    total_platforms=session_data.get("total_platforms", 0),
                    success_count=session_data.get("success_count", 0),
                    failed_count=session_data.get("failed_count", 0),
                    failed_ids=session_data.get("failed_ids", []),
                    platforms=session_data.get("platforms", []),
                    word_groups=session_data.get("word_groups", []),
                    filter_words=session_data.get("filter_words", []),
                    total_news_count=session_data.get("total_news_count", 0),
                    started_at=started_at,
                    completed_at=completed_at,
                    status=session_data.get("status", "completed"),
                )
                session.add(crawl_session)
                session.commit()
                logger.info(f"✅ 成功保存抓取会话到数据库: session_id={session_data['session_id']}")
                return True
        except Exception as e:
            logger.error(f"❌ 保存抓取会话失败: {e}", exc_info=True)
            return False
    
    def get_by_session_id(self, session_id: str) -> Optional[Dict]:
        """
        根据会话ID获取会话信息
        
        Args:
            session_id: 会话ID
        
        Returns:
            会话数据字典，如果不存在则返回 None
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return None
        
        try:
            with self.db_session.get_session() as session:
                crawl_session = session.query(CrawlSession).filter(
                    CrawlSession.session_id == session_id
                ).first()
                
                if crawl_session:
                    return {
                        "id": crawl_session.id,
                        "session_id": crawl_session.session_id,
                        "trigger_source": crawl_session.trigger_source,
                        "total_platforms": crawl_session.total_platforms,
                        "success_count": crawl_session.success_count,
                        "failed_count": crawl_session.failed_count,
                        "failed_ids": crawl_session.failed_ids,
                        "platforms": crawl_session.platforms,
                        "word_groups": crawl_session.word_groups,
                        "filter_words": crawl_session.filter_words,
                        "total_news_count": crawl_session.total_news_count,
                        "started_at": crawl_session.started_at.isoformat() if crawl_session.started_at else None,
                        "completed_at": crawl_session.completed_at.isoformat() if crawl_session.completed_at else None,
                        "status": crawl_session.status,
                    }
                return None
        except Exception as e:
            logger.error(f"❌ 获取抓取会话失败: {e}", exc_info=True)
            return None

