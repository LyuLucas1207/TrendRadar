"""
TrendRadar Web Server - 主入口

使用 MVC 三层架构的 FastAPI 应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import config
from .controllers import root_controller, health_controller, report_controller


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    app = FastAPI(
        title="TrendRadar Web Server",
        description="TrendRadar HTML 报告服务 - MVC 架构",
        version="1.0.0",
        docs_url="/docs" if config.debug else None,
        redoc_url="/redoc" if config.debug else None,
    )
    
    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    app.include_router(root_controller.router)
    app.include_router(health_controller.router)
    app.include_router(report_controller.router)
    
    return app


# 创建应用实例
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("  TrendRadar Web Server - MVC Architecture")
    print("=" * 60)
    print(f"  监听地址: http://{config.host}:{config.port}")
    print(f"  HTML报告: http://{config.host}:{config.port}/report")
    print(f"  项目目录: {config.project_root}")
    print(f"  输出目录: {config.output_path}")
    print(f"  调试模式: {config.debug}")
    print("=" * 60)
    print()
    
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level="debug" if config.debug else "info"
    )

