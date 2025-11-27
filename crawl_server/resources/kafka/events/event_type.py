# coding=utf-8

"""
事件类型常量
"""


class EventType:
    """事件类型常量"""
    # 数据事件
    DATA_CRAWL = "data.crawl"  # 数据抓取成功（每条新闻）
    DATA_CRAWL_SESSION = "data.crawl.session"  # 抓取会话完成（包含统计信息）
    
    # 操作事件
    OPERATION_CRAWL = "operation.crawl"  # 执行抓取操作（需要监听，次数由 count 参数决定）
    OPERATION_CLEAR = "operation.clear"  # 刷新 frequency_words

