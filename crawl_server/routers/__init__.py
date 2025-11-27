"""
Routers 模块

路由分发：将 Kafka 事件路由到对应的 Controller
"""
from .event_router import EventRouter, setup_routes

__all__ = ["EventRouter", "setup_routes"]

