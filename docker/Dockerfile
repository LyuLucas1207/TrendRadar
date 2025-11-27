FROM python:3.10-slim

WORKDIR /app

# 安装 crawl_server 依赖
COPY crawl_server/requirements.txt ./crawl_server/
RUN pip install --no-cache-dir -r crawl_server/requirements.txt && \
    mkdir -p /app/config /app/output

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    CONFIG_PATH=/app/config/config.yaml \
    FREQUENCY_WORDS_PATH=/app/config/frequency_words.txt

CMD ["python", "-m", "crawl_server.main"]