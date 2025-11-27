# coding=utf-8

"""
Redis 客户端

提供 Redis 连接池
"""
import logging
from typing import Optional, Any, Union
import json

try:
    import redis
    from redis import ConnectionPool
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("redis 未安装，Redis 功能将不可用")


class RedisClient:
    """Redis 客户端封装类"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        max_connections: int = 50,
        enable_redis: bool = False
    ):
        """
        初始化 Redis 客户端
        
        Args:
            host: Redis 主机
            port: Redis 端口
            db: 数据库编号
            password: 密码
            max_connections: 连接池最大连接数
            enable_redis: 是否启用 Redis
        """
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.max_connections = max_connections
        self.enable_redis = enable_redis and REDIS_AVAILABLE
        self.connection_pool: Optional[ConnectionPool] = None
        self.client: Optional[redis.Redis] = None
        self.logger = logging.getLogger(__name__)
        
        if self.enable_redis:
            try:
                self.connection_pool = ConnectionPool(
                    host=host,
                    port=port,
                    db=db,
                    password=password,
                    max_connections=max_connections,
                    decode_responses=True  # 自动解码为字符串
                )
                self.client = redis.Redis(connection_pool=self.connection_pool)
                # 测试连接
                self.client.ping()
                self.logger.info(f"✅ Redis 连接成功: {host}:{port}/{db}")
            except Exception as e:
                self.logger.error(f"❌ Redis 连接池初始化失败: {e}")
                self.enable_redis = False
        else:
            if not REDIS_AVAILABLE:
                self.logger.warning("⚠️  redis 未安装，请运行: pip install redis")
    
    def get(self, key: str) -> Optional[str]:
        """获取值"""
        if not self.enable_redis or not self.client:
            return None
        try:
            return self.client.get(key)
        except Exception as e:
            self.logger.error(f"❌ Redis GET 失败: {e}")
            return None
    
    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """
        设置值
        
        Args:
            key: 键
            value: 值（会自动序列化为 JSON）
            ex: 过期时间（秒）
        
        Returns:
            是否成功
        """
        if not self.enable_redis or not self.client:
            return False
        try:
            # 如果是字典或列表，序列化为 JSON
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=False)
            return self.client.set(key, value, ex=ex)
        except Exception as e:
            self.logger.error(f"❌ Redis SET 失败: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """删除键"""
        if not self.enable_redis or not self.client:
            return False
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            self.logger.error(f"❌ Redis DELETE 失败: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """检查键是否存在"""
        if not self.enable_redis or not self.client:
            return False
        try:
            return bool(self.client.exists(key))
        except Exception as e:
            self.logger.error(f"❌ Redis EXISTS 失败: {e}")
            return False
    
    def get_frequency_words(self) -> Optional[list]:
        """
        从 Redis 获取 frequency_words
        
        Returns:
            frequency_words 列表，如果不存在或过期则返回 None
        """
        if not self.enable_redis:
            return None
        
        try:
            value = self.get("trendradar:frequency_words")
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            self.logger.error(f"❌ 获取 frequency_words 失败: {e}")
            return None
    
    def set_frequency_words(self, words: list, ex: Optional[int] = None) -> bool:
        """
        设置 frequency_words 到 Redis
        
        Args:
            words: frequency_words 列表
            ex: 过期时间（秒），None 表示不过期
        
        Returns:
            是否成功
        """
        if not self.enable_redis:
            return False
        
        try:
            return self.set("trendradar:frequency_words", words, ex=ex)
        except Exception as e:
            self.logger.error(f"❌ 设置 frequency_words 失败: {e}")
            return False
    
    def close(self):
        """关闭连接"""
        if self.connection_pool:
            try:
                self.connection_pool.disconnect()
                self.logger.debug("✅ Redis 连接池已关闭")
            except Exception as e:
                self.logger.error(f"❌ 关闭连接池时出错: {e}")

