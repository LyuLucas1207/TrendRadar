-- ============================================
-- 插入频率词数据到 frequency_words 表
-- ============================================
-- 注意：需要先执行 insert_word_groups.sql 创建词组
-- 如果频率词已存在，可以使用 ON CONFLICT 更新或忽略

-- 方式1：直接插入（如果已存在会报错，需要先删除）
-- AI & 人工智能 (group_key: ai_artificial_intelligence)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('DeepSeek', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('梁文锋', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('chatgpt', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('openai', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('sora', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('claude', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('Anthropic', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('gemini', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('deepmind', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('ai', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('gai', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), '!', NULL),
('人工智能', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('大模型', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('LLM', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('AGI', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('机器学习', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('深度学习', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL),
('神经网络', (SELECT id FROM word_groups WHERE group_key = 'ai_artificial_intelligence'), NULL, NULL);

-- 半导体 & 芯片 (group_key: semiconductor_chip)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('芯片', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('光刻机', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('ASML', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('台积电', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('TSMC', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('中芯国际', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('SMIC', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('英伟达', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('NVIDIA', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('黄仁勋', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('AMD', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('Intel', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('高通', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('Qualcomm', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('ARM', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('RISC-V', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('存储芯片', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('DRAM', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('NAND', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('先进封装', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL),
('3D封装', (SELECT id FROM word_groups WHERE group_key = 'semiconductor_chip'), NULL, NULL);

-- 科技公司 (group_key: tech_companies)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('华为', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('鸿蒙', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('HarmonyOS', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('任正非', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('字节', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('bytedance', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('张一鸣', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('微软', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('Microsoft', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('谷歌', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('google', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('苹果', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('Apple', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('iphone', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('ipad', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('mac', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('ios', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('特斯拉', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('Tesla', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('马斯克', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('Musk', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('SpaceX', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('星链', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL),
('Starlink', (SELECT id FROM word_groups WHERE group_key = 'tech_companies'), NULL, NULL);

-- 金融 & 投资 (group_key: finance_investment)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('A股', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('上证', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('深证', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('创业板', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('科创板', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('北交所', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('港股', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('美股', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('纳斯达克', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('道琼斯', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('标普500', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('S&P500', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('美联储', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('FED', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('加息', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('降息', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('利率', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('通胀', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('CPI', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('PPI', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('GDP', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('货币政策', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('财政政策', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('央行', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('人民银行', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('证监会', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('银保监会', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('银行', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('商业银行', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('投资银行', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('券商', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('证券', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('基金', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('公募基金', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('私募基金', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('ETF', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('量化交易', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('数字货币', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('比特币', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('BTC', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('以太坊', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('ETH', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('区块链', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('Web3', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('DeFi', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL),
('加密货币', (SELECT id FROM word_groups WHERE group_key = 'finance_investment'), NULL, NULL);

-- 新能源汽车 (group_key: new_energy_vehicles)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('比亚迪', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('BYD', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('王传福', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('理想', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('Li Auto', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('蔚来', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('NIO', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('小鹏', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('XPeng', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('小米汽车', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('华为汽车', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('问界', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('M9', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('M7', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('宁德时代', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('CATL', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('电池', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('锂电池', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('固态电池', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('充电桩', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('换电', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('自动驾驶', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('智能驾驶', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('辅助驾驶', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('L3', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('L4', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL),
('FSD', (SELECT id FROM word_groups WHERE group_key = 'new_energy_vehicles'), NULL, NULL);

-- 机器人 & 智能制造 (group_key: robot_smart_manufacturing)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('机器人', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('工业机器人', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('服务机器人', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('人形机器人', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('大疆', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('DJI', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('宇树', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('Unitree', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('王兴兴', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('智元', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('灵犀', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('稚晖君', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('彭志辉', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('波士顿动力', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('Boston Dynamics', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('Figure', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('Tesla Optimus', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('智能制造', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('工业4.0', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL),
('自动化', (SELECT id FROM word_groups WHERE group_key = 'robot_smart_manufacturing'), NULL, NULL);

-- 能源 & 电力 (group_key: energy_power)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('核能', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('核电', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('核电站', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('水电站', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('雅鲁藏布江', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('光伏', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('太阳能', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('风电', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('储能', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('抽水蓄能', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('特高压', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('电网', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('国家电网', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('南方电网', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('碳中和', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('碳达峰', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('新能源', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('清洁能源', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL),
('可再生能源', (SELECT id FROM word_groups WHERE group_key = 'energy_power'), NULL, NULL);

-- 航空航天 (group_key: aerospace)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('月球', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('登月', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('火星', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('宇宙', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('飞船', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('航空', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('航天', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('SpaceX', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('星舰', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('Starship', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('火箭', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('卫星', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('北斗', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('GPS', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('NASA', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('中国航天', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('CNSA', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('天宫', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('空间站', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('国际空间站', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL),
('ISS', (SELECT id FROM word_groups WHERE group_key = 'aerospace'), NULL, NULL);

-- 新质生产力 & 科技创新 (group_key: new_productive_forces_tech_innovation)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('新质生产力', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('科技创新', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('技术突破', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('专利', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('知识产权', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('产学研', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('科技成果转化', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('孵化器', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('加速器', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('独角兽', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('硬科技', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('专精特新', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('小巨人', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL),
('隐形冠军', (SELECT id FROM word_groups WHERE group_key = 'new_productive_forces_tech_innovation'), NULL, NULL);

-- 互联网 & 平台经济 (group_key: internet_platform_economy)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('京东', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('刘强东', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('电商', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('直播电商', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('跨境电商', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('云计算', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('云服务', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('AWS', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('Azure', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('阿里云', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('腾讯云', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('华为云', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('大数据', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('数据要素', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('数据安全', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('隐私保护', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('网络安全', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('信息安全', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('量子计算', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL),
('量子通信', (SELECT id FROM word_groups WHERE group_key = 'internet_platform_economy'), NULL, NULL);

-- 生物医药 & 生命科学 (group_key: biopharma_life_sciences)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('生物医药', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('创新药', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('疫苗', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('基因编辑', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('CRISPR', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('mRNA', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('细胞治疗', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('CAR-T', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('精准医疗', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('医疗器械', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('医疗AI', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL),
('数字医疗', (SELECT id FROM word_groups WHERE group_key = 'biopharma_life_sciences'), NULL, NULL);

-- 新材料 & 高端制造 (group_key: new_materials_high_end_manufacturing)
INSERT INTO frequency_words (word, word_group_id, filter_rule_prefix, filter_rule_postfix) VALUES
('新材料', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('石墨烯', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('碳纤维', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('3D打印', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('增材制造', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('高端装备', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('精密制造', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('工业母机', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL),
('机床', (SELECT id FROM word_groups WHERE group_key = 'new_materials_high_end_manufacturing'), NULL, NULL);

-- ============================================
-- 方式2：使用 ON CONFLICT 更新（推荐，如果已存在则更新）
-- ============================================
-- 注意：由于唯一约束是 (word, word_group_id, filter_rule_prefix, filter_rule_postfix)，
-- 如果已存在相同的组合，可以使用 ON CONFLICT 更新

-- ============================================
-- 查询验证
-- ============================================
-- 查看所有频率词
-- SELECT fw.*, wg.group_name, wg.group_key 
-- FROM frequency_words fw
-- JOIN word_groups wg ON fw.word_group_id = wg.id
-- ORDER BY wg.group_key, fw.word;

-- 统计每个词组的频率词数量
-- SELECT 
--     wg.group_name,
--     wg.group_key,
--     COUNT(fw.id) as word_count
-- FROM word_groups wg
-- LEFT JOIN frequency_words fw ON fw.word_group_id = wg.id
-- GROUP BY wg.id, wg.group_name, wg.group_key
-- ORDER BY wg.group_name;

-- 查看有规则前缀的词
-- SELECT fw.*, wg.group_name 
-- FROM frequency_words fw
-- JOIN word_groups wg ON fw.word_group_id = wg.id
-- WHERE fw.filter_rule_prefix IS NOT NULL
-- ORDER BY wg.group_name, fw.filter_rule_prefix, fw.word;

