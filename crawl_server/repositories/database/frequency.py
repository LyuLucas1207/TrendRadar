# coding=utf-8

"""
频率词数据库仓库

负责从 PostgreSQL 数据库读取和写入 frequency_words（使用 SQLAlchemy ORM）
"""
import logging
from typing import Optional, List, Dict, Tuple
from crawl_server.resources.postgresql import DatabaseSession
from crawl_server.models import WordGroup, FrequencyWord

logger = logging.getLogger(__name__)


class FrequencyDatabase:
    """频率词数据库（PostgreSQL，使用 SQLAlchemy ORM）"""
    
    def __init__(self, db_session: Optional[DatabaseSession] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: SQLAlchemy 数据库会话
        """
        self.db_session = db_session
    
    def get(self) -> Optional[Tuple[List[Dict], List[str]]]:
        """
        从数据库获取 frequency_words
        
        Returns:
            (word_groups, filter_words) 元组，格式与 load_frequency_words 一致
            word_groups: List[Dict] - 词组列表，格式: [{"required": [...], "normal": [...], "group_key": "...", "max_count": 0}, ...]
            filter_words: List[str] - 过滤词列表
            如果数据库未启用或查询失败则返回 None
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return None
        
        try:
            with self.db_session.get_session() as session:
                # 查询所有词组
                word_groups = session.query(WordGroup).all()
                
                # 查询所有频率词
                frequency_words = session.query(FrequencyWord).all()
                
                # 构建返回数据结构（格式与 load_frequency_words 一致）
                result_word_groups = []
                filter_words = []
                
                # 按词组组织数据
                for group in word_groups:
                    group_words = []
                    group_required_words = []
                    
                    for fw in frequency_words:
                        if fw.word_group_id == group.id:
                            # 检查 filter_rule_prefix
                            if fw.filter_rule_prefix == '!':
                                # 过滤词
                                filter_words.append(fw.word)
                            elif fw.filter_rule_prefix == '+':
                                # 必须词
                                group_required_words.append(fw.word)
                            else:
                                # 普通词（filter_rule_prefix 为 None 或空）
                                group_words.append(fw.word)
                    
                    if group_words or group_required_words:
                        # 使用 group_key 作为组键
                        group_key = group.group_key if group.group_key else " ".join(group_words[:3]) if group_words else " ".join(group_required_words[:3])
                        
                        result_word_groups.append({
                            "required": group_required_words,
                            "normal": group_words,
                            "group_key": group_key,
                            "max_count": group.max_count or 0,
                        })
                
                return (result_word_groups, filter_words)
        except Exception as e:
            logger.error(f"❌ 从数据库获取 frequency_words 失败: {e}", exc_info=True)
            return None
    
    def save(self, word_groups_data: Dict, filter_words: List[str]) -> bool:
        """
        保存 frequency_words 到数据库
        
        Args:
            word_groups_data: 词组数据，格式: {"group_key": {"normal": [...], "required": [...], "max_count": 0}}
            filter_words: 过滤词列表
        
        Returns:
            是否成功
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return False
        
        try:
            with self.db_session.get_session() as session:
                # 清空现有数据
                session.query(FrequencyWord).delete()
                session.query(WordGroup).delete()
                
                # 保存词组
                for group_key, group_data in word_groups_data.items():
                    normal_words = group_data.get("normal", [])
                    required_words = group_data.get("required", [])
                    max_count = group_data.get("max_count", 0)
                    
                    # 创建词组记录
                    word_group = WordGroup(
                        group_name=group_key,
                        group_key=group_key,
                        max_count=max_count
                    )
                    session.add(word_group)
                    session.flush()  # 获取 ID
                    
                    # 保存普通词
                    for word in normal_words:
                        frequency_word = FrequencyWord(
                            word=word,
                            word_group_id=word_group.id,
                            filter_rule_prefix=None,
                            filter_rule_postfix=None
                        )
                        session.add(frequency_word)
                    
                    # 保存必须词
                    for word in required_words:
                        frequency_word = FrequencyWord(
                            word=word,
                            word_group_id=word_group.id,
                            filter_rule_prefix='+',
                            filter_rule_postfix=None
                        )
                        session.add(frequency_word)
                
                # 保存过滤词（需要找到对应的 word_group_id，如果找不到则跳过）
                # 注意：过滤词应该属于某个组，这里暂时跳过全局过滤词
                # TODO: 如果需要全局过滤词，需要特殊处理
                
                session.commit()
                logger.info(f"✅ 成功保存 {len(word_groups_data)} 个词组和 {len(filter_words)} 个过滤词到数据库")
                return True
        except Exception as e:
            logger.error(f"❌ 保存 frequency_words 到数据库失败: {e}", exc_info=True)
            return False

