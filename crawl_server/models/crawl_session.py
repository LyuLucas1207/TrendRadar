# coding=utf-8

"""
抓取会话模型

使用 SQLAlchemy ORM 定义
"""
from sqlalchemy import Column, String, Integer, TIMESTAMP, BigInteger, JSON, Index
from sqlalchemy.sql import func
from .base import Base


class CrawlSession(Base):
    """抓取会话表"""
    __tablename__ = 'crawl_sessions'
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(100), nullable=False, unique=True, comment='会话ID（唯一标识）')
    trigger_source = Column(String(50), nullable=False, comment='触发来源（manual, scheduled, api）')
    total_platforms = Column(Integer, default=0, comment='总平台数')
    success_count = Column(Integer, default=0, comment='成功抓取的平台数量')
    failed_count = Column(Integer, default=0, comment='失败的平台数量')
    failed_ids = Column(JSON, comment='失败的平台ID列表')
    platforms = Column(JSON, comment='使用的平台ID列表，格式: ["toutiao", "baidu", "weibo", ...]')
    word_groups = Column(JSON, comment='使用的频率词组列表')
    filter_words = Column(JSON, comment='使用的过滤词列表')
    total_news_count = Column(Integer, default=0, comment='抓取到的新闻总数')
    started_at = Column(TIMESTAMP, nullable=False, comment='开始时间')
    completed_at = Column(TIMESTAMP, comment='完成时间')
    status = Column(String(20), default='running', comment='状态（running, completed, failed）')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # 索引
    __table_args__ = (
        Index('idx_crawl_sessions_session_id', 'session_id'),
        Index('idx_crawl_sessions_started_at', 'started_at'),
        Index('idx_crawl_sessions_status', 'status'),
    )

