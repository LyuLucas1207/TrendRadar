-- ============================================
-- 数据库迁移脚本：为 crawl_results 和 crawl_sessions 表添加缺失的字段
-- ============================================
-- 说明：此脚本用于将数据库表结构与 SQLAlchemy 模型定义对齐
-- 执行时间：2025-11-27

-- ============================================
-- 1. 更新 crawl_results 表
-- ============================================

-- 1.1 添加 session_id 字段（关联 crawl_sessions 表）
ALTER TABLE crawl_results 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- 1.2 添加 word_groups 字段（JSONB 类型，存储匹配到的频率词组列表）
ALTER TABLE crawl_results 
ADD COLUMN IF NOT EXISTS word_groups JSONB;

-- 1.3 添加 is_success 字段（是否成功：1=成功，0=失败）
ALTER TABLE crawl_results 
ADD COLUMN IF NOT EXISTS is_success INTEGER DEFAULT 1;

-- 1.4 添加 error_message 字段（失败时的错误信息）
ALTER TABLE crawl_results 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 1.5 修改 title 字段为可空（失败记录可能没有 title）
ALTER TABLE crawl_results 
ALTER COLUMN title DROP NOT NULL;

-- 1.6 添加索引
CREATE INDEX IF NOT EXISTS idx_crawl_results_session_id ON crawl_results(session_id);
CREATE INDEX IF NOT EXISTS idx_crawl_results_is_success ON crawl_results(is_success);

-- 1.7 删除旧的唯一约束（因为失败记录可能没有 title）
ALTER TABLE crawl_results 
DROP CONSTRAINT IF EXISTS crawl_results_platform_id_title_fetch_time_key;

-- 1.8 添加注释
COMMENT ON COLUMN crawl_results.session_id IS '抓取会话ID（关联 crawl_sessions）';
COMMENT ON COLUMN crawl_results.word_groups IS '匹配到的频率词组列表（用于过滤和分析）';
COMMENT ON COLUMN crawl_results.is_success IS '是否成功（1=成功，0=失败）';
COMMENT ON COLUMN crawl_results.error_message IS '错误信息（失败时记录）';
COMMENT ON COLUMN crawl_results.title IS '新闻标题（失败时为空）';

-- ============================================
-- 2. 更新 crawl_sessions 表
-- ============================================

-- 2.1 添加 platforms 字段（使用的平台列表）
ALTER TABLE crawl_sessions 
ADD COLUMN IF NOT EXISTS platforms JSONB;

-- 2.2 添加 word_groups 字段（使用的频率词组列表）
ALTER TABLE crawl_sessions 
ADD COLUMN IF NOT EXISTS word_groups JSONB;

-- 2.3 添加 filter_words 字段（使用的过滤词列表）
ALTER TABLE crawl_sessions 
ADD COLUMN IF NOT EXISTS filter_words JSONB;

-- 2.4 添加 total_news_count 字段（抓取到的新闻总数）
ALTER TABLE crawl_sessions 
ADD COLUMN IF NOT EXISTS total_news_count INTEGER DEFAULT 0;

-- 2.5 添加注释
COMMENT ON COLUMN crawl_sessions.platforms IS '使用的平台ID列表，格式: ["toutiao", "baidu", "weibo", ...]';
COMMENT ON COLUMN crawl_sessions.word_groups IS '使用的频率词组列表';
COMMENT ON COLUMN crawl_sessions.filter_words IS '使用的过滤词列表';
COMMENT ON COLUMN crawl_sessions.total_news_count IS '抓取到的新闻总数';

