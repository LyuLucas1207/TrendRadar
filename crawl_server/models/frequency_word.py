# coding=utf-8

"""
频率词模型

使用 SQLAlchemy ORM 定义
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class FrequencyWord(Base):
    """频率词表"""
    __tablename__ = 'frequency_words'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    word = Column(String(255), nullable=False, comment='频率词')
    word_group_id = Column(Integer, ForeignKey('word_groups.id', ondelete='CASCADE'), nullable=False, comment='所属词组ID（外键，必填）')
    filter_rule_prefix = Column(String(50), comment='规则前缀（用于未来扩展，如：+, !, @）')
    filter_rule_postfix = Column(String(50), comment='规则后缀（用于未来扩展）')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # 关系
    word_group = relationship('WordGroup', back_populates='frequency_words')
    
    # 唯一约束和索引
    __table_args__ = (
        UniqueConstraint('word', 'word_group_id', 'filter_rule_prefix', 'filter_rule_postfix', name='uq_frequency_words_word_group_prefix_postfix'),
        Index('idx_frequency_words_word', 'word'),
        Index('idx_frequency_words_group_id', 'word_group_id'),
        Index('idx_frequency_words_filter_rule_prefix', 'filter_rule_prefix'),
        Index('idx_frequency_words_filter_rule_postfix', 'filter_rule_postfix'),
    )

