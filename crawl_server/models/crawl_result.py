# coding=utf-8

"""
抓取结果模型

使用 SQLAlchemy ORM 定义
"""
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, BigInteger, JSON, UniqueConstraint, Index
from sqlalchemy.sql import func, text
from .base import Base


class CrawlResult(Base):
    """抓取结果表"""
    __tablename__ = 'crawl_results'
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(100), comment='抓取会话ID（关联 crawl_sessions）')
    platform_id = Column(String(100), nullable=False, comment='平台ID（关联 platforms 表）')
    title = Column(Text, comment='新闻标题（失败时为空）')
    rank = Column(Integer, comment='当前排名（第一条排名）')
    ranks = Column(JSON, comment='排名列表 [1, 2, 3]')
    url = Column(Text, comment='新闻链接')
    mobile_url = Column(Text, comment='移动端链接')
    matched_group_keys = Column(JSON, comment='匹配到的频率词组键列表（group_key数组），如 ["新能源汽车", "电池技术"]')
    is_success = Column(Integer, default=1, comment='是否成功（1=成功，0=失败）')
    error_message = Column(Text, comment='错误信息（失败时记录）')
    fetch_time = Column(TIMESTAMP, nullable=False, comment='抓取时间')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # 唯一约束和索引
    # 注意：失败记录可能没有 title，所以唯一约束只对成功记录生效
    __table_args__ = (
        # 索引
        Index('idx_crawl_results_session_id', 'session_id'),
        Index('idx_crawl_results_platform', 'platform_id'),
        Index('idx_crawl_results_title', 'title'),  # 添加 title 索引，方便前端按 title 聚合查询
        Index('idx_crawl_results_fetch_time', 'fetch_time'),
        Index('idx_crawl_results_created_at', 'created_at'),
        Index('idx_crawl_results_is_success', 'is_success'),
        # 复合索引：方便按 platform + title 查询排名变化
        Index('idx_crawl_results_platform_title', 'platform_id', 'title'),
        # 部分唯一索引：只对成功记录（is_success=1 且有 title）生效，防止重复插入
        # 注意：这需要在数据库层面创建，SQLAlchemy 不支持直接创建部分唯一索引
        # 需要在迁移脚本中手动执行：
        # CREATE UNIQUE INDEX uq_crawl_results_platform_title_time 
        # ON crawl_results(platform_id, title, fetch_time) 
        # WHERE is_success = 1 AND title IS NOT NULL;
    )

