# coding=utf-8

"""
平台模型

使用 SQLAlchemy ORM 定义
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Index
from sqlalchemy.sql import func
from .base import Base


class Platform(Base):
    """平台信息表"""
    __tablename__ = 'platforms'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    platform_id = Column(String(100), nullable=False, unique=True, comment='平台ID（唯一）')
    platform_name = Column(String(200), nullable=False, comment='平台名称')
    is_active = Column(Boolean, default=True, comment='是否启用')
    last_crawl_time = Column(TIMESTAMP, comment='最后抓取时间')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # 索引
    __table_args__ = (
        Index('idx_platforms_platform_id', 'platform_id'),
        Index('idx_platforms_is_active', 'is_active'),
    )

