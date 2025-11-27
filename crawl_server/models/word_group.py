# coding=utf-8

"""
词组模型

使用 SQLAlchemy ORM 定义
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class WordGroup(Base):
    """词组表"""
    __tablename__ = 'word_groups'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    group_name = Column(String(200), nullable=False, unique=True, comment='词组名称（显示用，可以是中文）')
    group_key = Column(String(200), nullable=False, unique=True, comment='组键（唯一标识符，英文，用于匹配和标识）')
    max_count = Column(Integer, default=0, comment='最大显示数量（@数字），0=不限制')
    description = Column(Text, comment='描述信息')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # 关系
    frequency_words = relationship('FrequencyWord', back_populates='word_group', cascade='all, delete-orphan')
    
    # 索引
    __table_args__ = (
        Index('idx_word_groups_name', 'group_name'),
        Index('idx_word_groups_key', 'group_key'),
    )

