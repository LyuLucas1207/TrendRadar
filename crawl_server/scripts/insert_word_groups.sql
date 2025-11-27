-- ============================================
-- 插入词组数据到 word_groups 表
-- ============================================
-- 注意：如果词组已存在，可以使用 ON CONFLICT 更新或忽略

-- 方式1：直接插入（如果已存在会报错，需要先删除）
INSERT INTO word_groups (group_name, group_key, max_count, description) VALUES
('AI & 人工智能', 'ai_artificial_intelligence', 50, 'AI、人工智能、大模型相关关键词'),
('半导体 & 芯片', 'semiconductor_chip', 50, '半导体、芯片、光刻机相关关键词'),
('科技公司', 'tech_companies', 50, '科技公司相关关键词'),
('金融 & 投资', 'finance_investment', 50, '金融、投资、股市相关关键词'),
('新能源汽车', 'new_energy_vehicles', 50, '新能源汽车、电池、充电相关关键词'),
('机器人 & 智能制造', 'robot_smart_manufacturing', 50, '机器人、智能制造相关关键词'),
('能源 & 电力', 'energy_power', 50, '能源、电力、新能源相关关键词'),
('航空航天', 'aerospace', 50, '航空航天、太空探索相关关键词'),
('新质生产力 & 科技创新', 'new_productive_forces_tech_innovation', 50, '新质生产力、科技创新相关关键词'),
('互联网 & 平台经济', 'internet_platform_economy', 50, '互联网、平台经济、云计算相关关键词'),
('生物医药 & 生命科学', 'biopharma_life_sciences', 50, '生物医药、生命科学相关关键词'),
('新材料 & 高端制造', 'new_materials_high_end_manufacturing', 50, '新材料、高端制造相关关键词');

-- 方式2：使用 ON CONFLICT 更新（推荐，如果已存在则更新）
INSERT INTO word_groups (group_name, group_key, max_count, description) VALUES
('AI & 人工智能', 'ai_artificial_intelligence', 50, 'AI、人工智能、大模型相关关键词'),
('半导体 & 芯片', 'semiconductor_chip', 50, '半导体、芯片、光刻机相关关键词'),
('科技公司', 'tech_companies', 50, '科技公司相关关键词'),
('金融 & 投资', 'finance_investment', 50, '金融、投资、股市相关关键词'),
('新能源汽车', 'new_energy_vehicles', 50, '新能源汽车、电池、充电相关关键词'),
('机器人 & 智能制造', 'robot_smart_manufacturing', 50, '机器人、智能制造相关关键词'),
('能源 & 电力', 'energy_power', 50, '能源、电力、新能源相关关键词'),
('航空航天', 'aerospace', 50, '航空航天、太空探索相关关键词'),
('新质生产力 & 科技创新', 'new_productive_forces_tech_innovation', 50, '新质生产力、科技创新相关关键词'),
('互联网 & 平台经济', 'internet_platform_economy', 50, '互联网、平台经济、云计算相关关键词'),
('生物医药 & 生命科学', 'biopharma_life_sciences', 50, '生物医药、生命科学相关关键词'),
('新材料 & 高端制造', 'new_materials_high_end_manufacturing', 50, '新材料、高端制造相关关键词')
ON CONFLICT (group_name) 
DO UPDATE SET 
    group_key = EXCLUDED.group_key,
    max_count = EXCLUDED.max_count,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 方式3：先删除再插入（如果表是空的）
-- DELETE FROM word_groups;
-- 然后执行方式1的 INSERT 语句

-- ============================================
-- 查询验证
-- ============================================
-- 查看所有词组
SELECT * FROM word_groups ORDER BY id;

-- 查看词组详情
SELECT 
    id,
    group_name,
    group_key,
    max_count,
    description,
    created_at,
    updated_at
FROM word_groups 
ORDER BY group_name;

-- 统计每个词组的频率词数量（需要先插入 frequency_words）
-- SELECT 
--     wg.id,
--     wg.group_name,
--     COUNT(fw.id) as word_count
-- FROM word_groups wg
-- LEFT JOIN frequency_words fw ON fw.word_group_id = wg.id
-- GROUP BY wg.id, wg.group_name
-- ORDER BY wg.group_name;

