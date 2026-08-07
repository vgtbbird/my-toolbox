// ============================================================
//  ⚔️ 装备打造 & 熔炼查询 + 🐾 宠装查询（整合版）
//  数据来源：梦幻精灵 2026年7月 + 端游玩家社群整理
//  优化：按钮式选择 + 输入框放大 + 清除按钮 + 重置全部 + 装备评分 + 武器总伤 + 截图识别
// ============================================================
const EquipmentQueryModule = {
    id: 'equipmentQuery',

    // ========== UI设置 ==========
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
        scoreBgColor: '#1a2a3a'
    },

    // ========== 人物装备数据 ==========
    levels: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
    currentLevel: 130,
    currentPart: '武器',
    currentType: '普通',
    inputValues: {},

    // ========== 宠装数据 ==========
    petLevels: [65, 75, 85, 95, 105, 115, 125, 135, 145],
    petCurrentLevel: 115,
    petCurrentPart: '护腕',
    petInputValues: {},

    // ============================================================
    //  ✅ 装备名称映射表（用于截图识别）
    // ============================================================
    equipmentNameMap: {
        // ===== 60级武器 =====
        '孔雀羽': { level: 60, part: '武器' },
        '惊涛雪': { level: 60, part: '武器' },
        '玲珑盏': { level: 60, part: '武器' },
        '腾云杖': { level: 60, part: '武器' },
        '连珠神弓': { level: 60, part: '武器' },
        '如意宝珠': { level: 60, part: '武器' },
        '玄铁矛': { level: 60, part: '武器' },
        '乌金鬼头镰': { level: 60, part: '武器' },
        '游龙剑': { level: 60, part: '武器' },
        '赤焰双剑': { level: 60, part: '武器' },
        '七彩罗刹': { level: 60, part: '武器' },
        '青刚刺': { level: 60, part: '武器' },
        '神火扇': { level: 60, part: '武器' },
        '满天星': { level: 60, part: '武器' },
        '震天锤': { level: 60, part: '武器' },
        '青藤柳叶鞭': { level: 60, part: '武器' },
        '蛇形月': { level: 60, part: '武器' },
        '狼牙刀': { level: 60, part: '武器' },
        '飞头盔': { level: 60, part: '武器' },
        '破浪须': { level: 60, part: '武器' },
        // ===== 70级武器 =====
        '金刚伞': { level: 70, part: '武器' },
        '醉浮生': { level: 70, part: '武器' },
        '玉兔盏': { level: 70, part: '武器' },
        '游鱼戏珠': { level: 70, part: '武器' },
        '沧海明珠': { level: 70, part: '武器' },
        '金蛇信': { level: 70, part: '武器' },
        '狂魔镰': { level: 70, part: '武器' },
        '北斗七星剑': { level: 70, part: '武器' },
        '墨玉双剑': { level: 70, part: '武器' },
        '缚神绫': { level: 70, part: '武器' },
        '华光刺': { level: 70, part: '武器' },
        '阴风扇': { level: 70, part: '武器' },
        '水晶棒': { level: 70, part: '武器' },
        '巨灵神锤': { level: 70, part: '武器' },
        '雷鸣嗜血鞭': { level: 70, part: '武器' },
        '子母双月': { level: 70, part: '武器' },
        '龙鳞宝刀': { level: 70, part: '武器' },
        '竹叶青': { level: 70, part: '武器' },
        '雷公木': { level: 70, part: '武器' },
        // ===== 80级武器 =====
        '落梅伞': { level: 80, part: '武器' },
        '沉默天戊': { level: 80, part: '武器' },
        '冰心盏': { level: 80, part: '武器' },
        '碧玺杖': { level: 80, part: '武器' },
        '灵犀望月': { level: 80, part: '武器' },
        '无量玉璧': { level: 80, part: '武器' },
        '丈八点钢矛': { level: 80, part: '武器' },
        '鲛煞': { level: 80, part: '武器' },
        '碧玉剑': { level: 80, part: '武器' },
        '梅花双剑': { level: 80, part: '武器' },
        '九天仙绫': { level: 80, part: '武器' },
        '龙鳞刺': { level: 80, part: '武器' },
        '风云雷电': { level: 80, part: '武器' },
        '日月光华': { level: 80, part: '武器' },
        '天崩地裂': { level: 80, part: '武器' },
        '混元金钩': { level: 80, part: '武器' },
        '斜月狼牙': { level: 80, part: '武器' },
        '黑炎魔刀': { level: 80, part: '武器' },
        '渡魂蒿': { level: 80, part: '武器' },
        // ===== 90-150级普通打造武器 =====
        '冷月': { level: 0, part: '武器', range: '90-150' },
        '屠龙': { level: 0, part: '武器', range: '90-150' },
        '血刃': { level: 0, part: '武器', range: '90-150' },
        '鱼肠': { level: 0, part: '武器', range: '90-150' },
        '倚天': { level: 0, part: '武器', range: '90-150' },
        '湛卢': { level: 0, part: '武器', range: '90-150' },
        '蟠龙': { level: 0, part: '武器', range: '90-150' },
        '云鹤': { level: 0, part: '武器', range: '90-150' },
        '风荷': { level: 0, part: '武器', range: '90-150' },
        '暗夜': { level: 0, part: '武器', range: '90-150' },
        '梨花': { level: 0, part: '武器', range: '90-150' },
        '霹雳': { level: 0, part: '武器', range: '90-150' },
        '彩虹': { level: 0, part: '武器', range: '90-150' },
        '流云': { level: 0, part: '武器', range: '90-150' },
        '碧波': { level: 0, part: '武器', range: '90-150' },
        '撕天': { level: 0, part: '武器', range: '90-150' },
        '毒牙': { level: 0, part: '武器', range: '90-150' },
        '胭脂': { level: 0, part: '武器', range: '90-150' },
        '如意': { level: 0, part: '武器', range: '90-150' },
        '乾坤': { level: 0, part: '武器', range: '90-150' },
        '月光': { level: 0, part: '武器', range: '90-150' },
        '离火': { level: 0, part: '武器', range: '90-150' },
        '飞星': { level: 0, part: '武器', range: '90-150' },
        '月华': { level: 0, part: '武器', range: '90-150' },
        '斩海': { level: 0, part: '武器', range: '90-150' },
        '惊魔': { level: 0, part: '武器', range: '90-150' },
        '燎天': { level: 0, part: '武器', range: '90-150' },
        '鬼骨': { level: 0, part: '武器', range: '90-150' },
        '云梦': { level: 0, part: '武器', range: '90-150' },
        '枕霞': { level: 0, part: '武器', range: '90-150' },
        '太极': { level: 0, part: '武器', range: '90-150' },
        '玉龙': { level: 0, part: '武器', range: '90-150' },
        '秋风': { level: 0, part: '武器', range: '90-150' },
        '八卦': { level: 0, part: '武器', range: '90-150' },
        '鬼牙': { level: 0, part: '武器', range: '90-150' },
        '雷神': { level: 0, part: '武器', range: '90-150' },
        '非攻': { level: 0, part: '武器', range: '90-150' },
        '百鬼': { level: 0, part: '武器', range: '90-150' },
        '幽篁': { level: 0, part: '武器', range: '90-150' },
        '业焰': { level: 0, part: '武器', range: '90-150' },
        '玉辉': { level: 0, part: '武器', range: '90-150' },
        '鹿鸣': { level: 0, part: '武器', range: '90-150' },
        '破魄': { level: 0, part: '武器', range: '90-150' },
        '肃魂': { level: 0, part: '武器', range: '90-150' },
        '无敌': { level: 0, part: '武器', range: '90-150' },
        '沧海': { level: 0, part: '武器', range: '90-150' },
        '红莲': { level: 0, part: '武器', range: '90-150' },
        '盘龙': { level: 0, part: '武器', range: '90-150' },
        '昆吾': { level: 0, part: '武器', range: '90-150' },
        '弦歌': { level: 0, part: '武器', range: '90-150' },
        '鸦九': { level: 0, part: '武器', range: '90-150' },
        // ===== 120-140级强化打造武器 =====
        '秋水澄流': { level: 0, part: '武器', range: '120-140' },
        '腾蛇郁刃': { level: 0, part: '武器', range: '120-140' },
        '墨骨枯麟': { level: 0, part: '武器', range: '120-140' },
        '冥火薄天': { level: 0, part: '武器', range: '120-140' },
        '太极流光': { level: 0, part: '武器', range: '120-140' },
        '龙鸣寒水': { level: 0, part: '武器', range: '120-140' },
        '刑天之逆': { level: 0, part: '武器', range: '120-140' },
        '五虎断魂': { level: 0, part: '武器', range: '120-140' },
        '飞龙在天': { level: 0, part: '武器', range: '120-140' },
        '五丁开山': { level: 0, part: '武器', range: '120-140' },
        '元神禁锢': { level: 0, part: '武器', range: '120-140' },
        '护法灭魔': { level: 0, part: '武器', range: '120-140' },
        '魏武青虹': { level: 0, part: '武器', range: '120-140' },
        '灵犀神剑': { level: 0, part: '武器', range: '120-140' },
        '四法青云': { level: 0, part: '武器', range: '120-140' },
        '画龙点睛': { level: 0, part: '武器', range: '120-140' },
        '秋水人家': { level: 0, part: '武器', range: '120-140' },
        '逍遥江湖': { level: 0, part: '武器', range: '120-140' },
        '混元金锤': { level: 0, part: '武器', range: '120-140' },
        '九瓣莲花': { level: 0, part: '武器', range: '120-140' },
        '鬼王蚀日': { level: 0, part: '武器', range: '120-140' },
        '偃月青龙': { level: 0, part: '武器', range: '120-140' },
        '晓风残月': { level: 0, part: '武器', range: '120-140' },
        '斩妖泣血': { level: 0, part: '武器', range: '120-140' },
        '庄周梦蝶': { level: 0, part: '武器', range: '120-140' },
        '凤翼流珠': { level: 0, part: '武器', range: '120-140' },
        '雪鳞霜寒': { level: 0, part: '武器', range: '120-140' },
        '回风舞雪': { level: 0, part: '武器', range: '120-140' },
        '紫金葫芦': { level: 0, part: '武器', range: '120-140' },
        '裂云啸日': { level: 0, part: '武器', range: '120-140' },
        '架海金梁': { level: 0, part: '武器', range: '120-140' },
        '擎天玉柱': { level: 0, part: '武器', range: '120-140' },
        '随心铁杆': { level: 0, part: '武器', range: '120-140' },
        '游龙惊鸿': { level: 0, part: '武器', range: '120-140' },
        '仙人指路': { level: 0, part: '武器', range: '120-140' },
        '血之刺藤': { level: 0, part: '武器', range: '120-140' },
        '金风玉露': { level: 0, part: '武器', range: '120-140' },
        '凰火燎原': { level: 0, part: '武器', range: '120-140' },
        '风露清愁': { level: 0, part: '武器', range: '120-140' },
        '秋水落霞': { level: 0, part: '武器', range: '120-140' },
        '晃金仙绳': { level: 0, part: '武器', range: '120-140' },
        '此最相思': { level: 0, part: '武器', range: '120-140' },
        '九阴勾魂': { level: 0, part: '武器', range: '120-140' },
        '雪蚕之刺': { level: 0, part: '武器', range: '120-140' },
        '贯霜之牙': { level: 0, part: '武器', range: '120-140' },
        '别情离恨': { level: 0, part: '武器', range: '120-140' },
        '金玉双环': { level: 0, part: '武器', range: '120-140' },
        '九天金线': { level: 0, part: '武器', range: '120-140' },
        '月影星痕': { level: 0, part: '武器', range: '120-140' },
        '雪羽穿云': { level: 0, part: '武器', range: '120-140' },
        '碧火琉璃': { level: 0, part: '武器', range: '120-140' },
        '降魔玉杵': { level: 0, part: '武器', range: '120-140' },
        '青藤玉树': { level: 0, part: '武器', range: '120-140' },
        '墨玉骷髅': { level: 0, part: '武器', range: '120-140' },
        '金龙双剪': { level: 0, part: '武器', range: '120-140' },
        '连理双树': { level: 0, part: '武器', range: '120-140' },
        '祖龙对剑': { level: 0, part: '武器', range: '120-140' },
        // ===== 150级强化打造武器 =====
        '晴雪': { level: 150, part: '武器' },
        '荒尘': { level: 150, part: '武器' },
        '若木': { level: 150, part: '武器' },
        '弑星': { level: 150, part: '武器' },
        '擒龙': { level: 150, part: '武器' },
        '九霄': { level: 150, part: '武器' },
        '星瀚': { level: 150, part: '武器' },
        '碎寂': { level: 150, part: '武器' },
        '朝夕': { level: 150, part: '武器' },
        '长息': { level: 150, part: '武器' },
        '弦月': { level: 150, part: '武器' },
        '赤明': { level: 150, part: '武器' },
        '裂天': { level: 150, part: '武器' },
        '浮屠': { level: 150, part: '武器' },
        '离钩': { level: 150, part: '武器' },
        '醍醐': { level: 150, part: '武器' },
        '霜陨': { level: 150, part: '武器' },
        '鸣鸿': { level: 150, part: '武器' },
        // ===== 160级强化打造武器 =====
        '晴雪': { level: 160, part: '武器' },
        '荒尘': { level: 160, part: '武器' },
        '若木': { level: 160, part: '武器' },
        '弑皇': { level: 160, part: '武器' },
        '擒龙': { level: 160, part: '武器' },
        '九霄': { level: 160, part: '武器' },
        '星瀚': { level: 160, part: '武器' },
        '碎寂': { level: 160, part: '武器' },
        '朝夕': { level: 160, part: '武器' },
        '长息': { level: 160, part: '武器' },
        '弦月': { level: 160, part: '武器' },
        '赤明': { level: 160, part: '武器' },
        '裂天': { level: 160, part: '武器' },
        '浮犀': { level: 160, part: '武器' },
        '离钩': { level: 160, part: '武器' },
        '醍醐': { level: 160, part: '武器' },
        '霜陨': { level: 160, part: '武器' },
        '鸣鸿': { level: 160, part: '武器' },

        // ===== 60级防具 =====
        '水晶帽': { level: 60, part: '帽子' },
        '玉女发冠': { level: 60, part: '帽子' },
        '夜魔披风': { level: 60, part: '衣服' },
        '霓裳羽衣': { level: 60, part: '衣服' },
        '追星踏月': { level: 60, part: '鞋子' },
        '攫魂铃': { level: 60, part: '腰带' },
        '双魂引': { level: 60, part: '腰带' },
        '风月宝链': { level: 60, part: '项链' },
        '八卦坠': { level: 60, part: '项链' },
        // ===== 70级防具 =====
        '乾坤帽': { level: 70, part: '帽子' },
        '魔女发冠': { level: 70, part: '帽子' },
        '龙骨甲': { level: 70, part: '衣服' },
        '流云素裙': { level: 70, part: '衣服' },
        '九州履': { level: 70, part: '鞋子' },
        '兽王腰带': { level: 70, part: '腰带' },
        '百宝云': { level: 70, part: '腰带' },
        '碧水青龙': { level: 70, part: '项链' },
        '鬼牙攫魂': { level: 70, part: '项链' },
        // ===== 80级防具 =====
        '黑魔冠': { level: 80, part: '帽子' },
        '七彩花环': { level: 80, part: '帽子' },
        '死亡斗篷': { level: 80, part: '衣服' },
        '七宝天衣': { level: 80, part: '衣服' },
        '万里追云履': { level: 80, part: '鞋子' },
        '八卦锻带': { level: 80, part: '腰带' },
        '圣王坠': { level: 80, part: '腰带' },
        '万里卷云': { level: 80, part: '项链' },
        '疾风之铃': { level: 80, part: '项链' },
        // ===== 90级防具 =====
        '白玉龙冠': { level: 90, part: '帽子' },
        '凤翅金翎': { level: 90, part: '帽子' },
        '神谕披风': { level: 90, part: '衣服' },
        '飞天羽衣': { level: 90, part: '衣服' },
        '踏雪无痕': { level: 90, part: '鞋子' },
        '幻彩玉带': { level: 90, part: '腰带' },
        '七彩玲珑': { level: 90, part: '项链' },
        // ===== 100级防具 =====
        '水晶虁帽': { level: 100, part: '帽子' },
        '寒雉霜蚕': { level: 100, part: '帽子' },
        '珊瑚玉衣': { level: 100, part: '衣服' },
        '霞花翠裙': { level: 100, part: '衣服' },
        '平步青云': { level: 100, part: '鞋子' },
        '珠翠玉环': { level: 100, part: '腰带' },
        '黄玉琉佩': { level: 100, part: '项链' },
        // ===== 110级防具 =====
        '翡翠曜冠': { level: 110, part: '帽子' },
        '曜月嵌星': { level: 110, part: '帽子' },
        '金蚕披风': { level: 110, part: '衣服' },
        '金蚕丝裙': { level: 110, part: '衣服' },
        '追云逐电': { level: 110, part: '鞋子' },
        '金蟾含珠': { level: 110, part: '腰带' },
        '鸾飞凤舞': { level: 110, part: '项链' },
        // ===== 120级防具 =====
        '金丝黑玉冠': { level: 120, part: '帽子' },
        '郁金流苏簪': { level: 120, part: '帽子' },
        '乾坤护心甲': { level: 120, part: '衣服' },
        '紫香金乌裙': { level: 120, part: '衣服' },
        '乾坤天罡履': { level: 120, part: '鞋子' },
        '乾坤紫玉带': { level: 120, part: '腰带' },
        '衔珠金凤佩': { level: 120, part: '项链' },
        // ===== 130级防具 =====
        '白玉琉璃冠': { level: 130, part: '帽子' },
        '玉簪附蝉翎': { level: 130, part: '帽子' },
        '蝉翼金丝甲': { level: 130, part: '衣服' },
        '碧霞彩云衣': { level: 130, part: '衣服' },
        '七星逐月靴': { level: 130, part: '鞋子' },
        '琉璃寒玉带': { level: 130, part: '腰带' },
        '七璜珠玉佩': { level: 130, part: '项链' },
        // ===== 140级防具 =====
        '兽鬼珐琅面': { level: 140, part: '帽子' },
        '弯羽九凤冠': { level: 140, part: '帽子' },
        '金丝鱼鳞甲': { level: 140, part: '衣服' },
        '金丝蝉翼衫': { level: 140, part: '衣服' },
        '碧霞流云履': { level: 140, part: '鞋子' },
        '蝉翼鱼佩带': { level: 140, part: '腰带' },
        '鎏金点翠佩': { level: 140, part: '项链' },
        // ===== 150级防具 =====
        '紫金磐龙冠': { level: 150, part: '帽子' },
        '金珰紫焰冠': { level: 150, part: '帽子' },
        '紫金磐龙甲': { level: 150, part: '衣服' },
        '五彩凤翅衣': { level: 150, part: '衣服' },
        '金丝逐日履': { level: 150, part: '鞋子' },
        '磐龙凤翔带': { level: 150, part: '腰带' },
        '紫金碧玺佩': { level: 150, part: '项链' },
        // ===== 160级防具 =====
        '浑天玄火盔': { level: 160, part: '帽子' },
        '乾元鸣凤冕': { level: 160, part: '帽子' },
        '混元一气甲': { level: 160, part: '衣服' },
        '鎏金浣月衣': { level: 160, part: '衣服' },
        '辟尘分光履': { level: 160, part: '鞋子' },
        '紫霄云芒带': { level: 160, part: '腰带' },
        '落霞陨星坠': { level: 160, part: '项链' },
    },

    // ============================================================
//  🔍 编辑距离算法（Levenshtein Distance）
// ============================================================
levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[b.length][a.length];
},

    // ===== 计算两个字符串的相似度（0-1，1为完全匹配） =====
calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const dist = this.levenshteinDistance(str1, str2);
    return 1 - dist / maxLen;
},

    // ===== 高级模糊匹配（综合多种算法） =====
fuzzyMatchEquipmentAdvanced(ocrText) {
    const nameMap = this.equipmentNameMap;
    const results = [];
    
    // 清理OCR文本
    const cleanedText = ocrText
        .replace(/[（(][^)）]*[)）]/g, '') // 移除括号内容
        .replace(/[0-9０-９]+[点\.][0-9０-９]+/g, '') // 移除小数
        .replace(/\s+/g, '');
    
    for (let [name, info] of Object.entries(nameMap)) {
        let score = 0;
        const nameClean = name.replace(/[^一-龥a-zA-Z0-9]/g, '');
        
        // 1. 编辑距离相似度（权重40%）
        const sim = this.calculateSimilarity(cleanedText, nameClean);
        score += sim * 0.4;
        
        // 2. 逐字匹配度（权重30%）
        let matchCount = 0;
        for (let char of nameClean) {
            if (cleanedText.includes(char)) {
                matchCount++;
            }
        }
        const charMatch = matchCount / (nameClean.length || 1);
        score += charMatch * 0.3;
        
        // 3. 等级匹配（权重15%）
        const levelMatch = info.level && ocrText.includes(String(info.level));
        if (levelMatch) {
            score += 0.15;
        }
        
        // 4. 部位匹配（权重15%）
        const partMatch = info.part && ocrText.includes(info.part);
        if (partMatch) {
            score += 0.15;
        }
        
        // 额外加分：完整匹配
        if (cleanedText.includes(nameClean) || cleanedText.includes(name)) {
            score += 0.3;
        }
        
        // 阈值0.35以上才进入候选
        if (score >= 0.35) {
            results.push({ 
                name, 
                info, 
                score: Math.min(score, 1),
                matchDetails: {
                    sim: Math.round(sim * 100),
                    charMatch: Math.round(charMatch * 100),
                    levelMatch: !!levelMatch,
                    partMatch: !!partMatch
                }
            });
        }
    }
    
    // 按分数排序
    results.sort((a, b) => b.score - a.score);
    return results;
},
      // ============================================================
//  🔍 模糊匹配方法
// ============================================================

// 1. 模糊匹配装备名（OCR识别结果模糊匹配装备库）
fuzzyMatchEquipment(ocrText) {
    const nameMap = this.equipmentNameMap;
    const results = [];
    
    for (let [name, info] of Object.entries(nameMap)) {
        let score = 0;
        const nameChars = name.split('');
        let matchCount = 0;
        
        // 逐字匹配
        for (let char of nameChars) {
            if (ocrText.includes(char)) {
                matchCount++;
            }
        }
        
        // 匹配度 = 匹配字数 / 总字数
        score = matchCount / nameChars.length;
        
        // 额外加分：等级匹配
        if (info.level && ocrText.includes(String(info.level))) {
            score += 0.2;
        }
        
        // 额外加分：部位匹配
        if (info.part && ocrText.includes(info.part)) {
            score += 0.15;
        }
        
        // 40%以上匹配度就算
        if (score >= 0.4) {
            results.push({ name, info, score });
        }
    }
    
    // 按分数排序
    results.sort((a, b) => b.score - a.score);
    return results;
},

// 2. 提取等级
extractLevel(ocrText) {
    const patterns = [
        /等级\s*(\d+)/,
        /(\d+)\s*级/,
        /(\d+)[\s\n]*级/,
    ];
    for (let pattern of patterns) {
        const match = ocrText.match(pattern);
        if (match) {
            const level = parseInt(match[1]);
            if (level >= 10 && level <= 200) {
                return level;
            }
        }
    }
    return null;
},

// 3. 提取部位
extractPart(ocrText) {
    const partMap = {
        '武器': ['武器', '剑', '刀', '枪', '锤', '斧', '扇', '鞭', '爪', '刺', '杖', '棒', '幡', '钺', '戟', '锏', '槊', '弓', '弩', '盾', '神兵', '利器'],
        '衣服': ['衣服', '衣', '袍', '裙', '甲', '铠甲', '战甲', '长袍', '长裙', '霓裳', '羽衣', '法袍'],
        '项链': ['项链', '链', '坠', '佩', '环', '珠', '宝玉', '灵佩', '护符', '璎珞', '项圈'],
        '帽子': ['帽子', '帽', '冠', '盔', '头', '发冠', '头盔', '王冠', '凤冠'],
        '腰带': ['腰带', '带', '腰', '束', '绦', '环带', '玉带', '金带'],
        '鞋子': ['鞋子', '鞋', '靴', '履', '足', '踏', '履', '云履', '战靴'],
    };
    for (let [part, keywords] of Object.entries(partMap)) {
        for (let kw of keywords) {
            if (ocrText.includes(kw)) {
                return part;
            }
        }
    }
    return null;
},
    // ===== OCR常见错误修正 =====
    correctOcrErrors(text) {
   const corrections = {
        // ===== 属性名修正 =====
        // 防御
        '防 御': '防御',
        '防  御': '防御',
        '防 御 ': '防御',
        '防 御': '防御',
        '防卸': '防御',
        '防 卸': '防御',
        // 气血
        '气 血': '气血',
        '气 血 ': '气血',
        '气血': '气血',
        '气 血': '气血',
        // 伤害
        '伤 害': '伤害',
        '伤 害 ': '伤害',
        '伤害': '伤害',
        '伤 害': '伤害',
        // 命中
        '命 中': '命中',
        '命 中 ': '命中',
        '命中': '命中',
        '合中': '命中',        // OCR常见错误
        '合 中': '命中',
        // 灵力
        '灵 力': '灵力',
        '灵 力 ': '灵力',
        '灵力': '灵力',
        // 魔法
        '魔 法': '魔法',
        '魔 法 ': '魔法',
        '魔法': '魔法',
        // ===== 绿字属性修正 =====
        // 魔力
        '魔 力': '魔力',
        '大 力': '魔力',
        '大力': '魔力',
        '大 力': '魔力',
        '魔 力 ': '魔力',
        '魔力': '魔力',
        '放力': '魔力',        // OCR常见错误
        '放 力': '魔力',
        '谭力': '魔力',        // OCR常见错误
        '谭 力': '魔力',
        '摩力': '魔力',        // OCR常见错误
        '摩 力': '魔力',
        // 力量
        '力 量': '力量',
        '力 量 ': '力量',
        '力量': '力量',
        '力 量': '力量',
        // 耐力
        '耐 力': '耐力',
        '耐 力 ': '耐力',
        '耐力': '耐力',
        '奈力': '耐力',        // OCR常见错误
        '奈 力': '耐力',
        '人而力': '耐力',      // OCR常见错误
        '人 而 力': '耐力',
        '人 力': '耐力',
        // 体质
        '体 质': '体质',
        '体 质 ': '体质',
        '体质': '体质',
        '休质': '体质',        // OCR常见错误
        '休 质': '体质',
        '体 质': '体质',
        // 敏捷
        '敏 捷': '敏捷',
        '敏 捷 ': '敏捷',
        '敏捷': '敏捷',
        '敏 捷': '敏捷',
        // 耐久
        '耐 久': '耐久',
        '耐 久 ': '耐久',
        '耐久': '耐久',
        '耐 久 度': '耐久度',
        '耐久度': '耐久度',
        // ===== 装备名修正 =====
        '灵 犀 望 月': '灵犀望月',
        '灵 犀 之 形': '灵犀望月',
        '夜 魔 披 风': '夜魔披风',
        '夜魔 披风': '夜魔披风',
        '龙 骨 甲': '龙骨甲',
        '龙 骨 甲': '龙骨甲',
        '琉 璃 冠': '琉璃冠',
        '琉 璃 冠': '琉璃冠',
        // ===== 符号修正 =====
        '＋': '+',
        '－': '-',
        '—': '-',
        '＝': '=',
        '十': '+',
        '一': '-',
        '＋': '+',
        '－': '-',
        '—': '-',
        '＝': '=',
        '十': '+',
        '一': '-',
        // ===== 等级修正 =====
        '等 级': '等级',
        '等 级 ': '等级',
        '等级': '等级',
        // ===== 五行修正 =====
        '五 行': '五行',
        '五 行 ': '五行',
        '五行': '五行',
    };
        let corrected = text;
        for (let [wrong, right] of Object.entries(corrections)) {
            corrected = corrected.replace(new RegExp(wrong, 'g'), right);
        }
        return corrected;
    },
    // ============================================================
    //  ✅ 人物装备 - 基础主属性数据（已锁定 60-160级）
    // ============================================================
    equipmentData: {
        "60": {
            "武器": { "普通": { "命中": [220, 286], "伤害": [190, 247] }, "强化": { "命中": [231, 300], "伤害": [199, 259] } },
            "衣服": { "普通": { "防御": [100, 130] }, "强化": { "防御": [105, 136] } },
            "项链": { "普通": { "灵力": [77, 100] }, "强化": { "灵力": [80, 105] } },
            "帽子": { "普通": { "防御": [35, 45], "魔法": [65, 84] }, "强化": { "防御": [36, 47], "魔法": [68, 88] } },
            "腰带": { "普通": { "防御": [35, 45], "气血": [130, 169] }, "强化": { "防御": [36, 47], "气血": [136, 177] } },
            "鞋子": { "普通": { "防御": [35, 45], "敏捷": [23, 29] }, "强化": { "防御": [36, 47], "敏捷": [24, 31] } }
        },
        "70": {
            "武器": { "普通": { "命中": [255, 331], "伤害": [220, 286] }, "强化": { "命中": [267, 347], "伤害": [231, 300] } },
            "衣服": { "普通": { "防御": [115, 149] }, "强化": { "防御": [120, 156] } },
            "项链": { "普通": { "灵力": [89, 115] }, "强化": { "灵力": [93, 120] } },
            "帽子": { "普通": { "防御": [40, 52], "魔法": [75, 97] }, "强化": { "防御": [42, 54], "魔法": [78, 102] } },
            "腰带": { "普通": { "防御": [40, 52], "气血": [150, 195] }, "强化": { "防御": [42, 54], "气血": [157, 204] } },
            "鞋子": { "普通": { "防御": [40, 52], "敏捷": [26, 33] }, "强化": { "防御": [42, 54], "敏捷": [27, 35] } }
        },
        "80": {
            "武器": { "普通": { "命中": [290, 377], "伤害": [250, 325] }, "强化": { "命中": [304, 395], "伤害": [262, 341] } },
            "衣服": { "普通": { "防御": [130, 169] }, "强化": { "防御": [136, 177] } },
            "项链": { "普通": { "灵力": [101, 131] }, "强化": { "灵力": [106, 137] } },
            "帽子": { "普通": { "防御": [45, 58], "魔法": [85, 110] }, "强化": { "防御": [47, 60], "魔法": [89, 116] } },
            "腰带": { "普通": { "防御": [45, 58], "气血": [170, 221] }, "强化": { "防御": [47, 61], "气血": [178, 232] } },
            "鞋子": { "普通": { "防御": [45, 58], "敏捷": [29, 37] }, "强化": { "防御": [47, 60], "敏捷": [30, 39] } }
        },
        "90": {
            "武器": { "普通": { "命中": [325, 422], "伤害": [280, 364] }, "强化": { "命中": [341, 443], "伤害": [294, 382] } },
            "衣服": { "普通": { "防御": [145, 188] }, "强化": { "防御": [152, 197] } },
            "项链": { "普通": { "灵力": [113, 146] }, "强化": { "灵力": [118, 153] } },
            "帽子": { "普通": { "防御": [50, 65], "魔法": [95, 123] }, "强化": { "防御": [52, 68], "魔法": [99, 129] } },
            "腰带": { "普通": { "防御": [50, 65], "气血": [190, 247] }, "强化": { "防御": [52, 68], "气血": [199, 259] } },
            "鞋子": { "普通": { "防御": [50, 65], "敏捷": [32, 41] }, "强化": { "防御": [52, 68], "敏捷": [33, 42] } }
        },
        "100": {
            "武器": { "普通": { "命中": [360, 468], "伤害": [310, 403] }, "强化": { "命中": [378, 491], "伤害": [325, 423] } },
            "衣服": { "普通": { "防御": [160, 208] }, "强化": { "防御": [168, 218] } },
            "项链": { "普通": { "灵力": [125, 162] }, "强化": { "灵力": [131, 170] } },
            "帽子": { "普通": { "防御": [55, 71], "魔法": [105, 136] }, "强化": { "防御": [57, 74], "魔法": [110, 143] } },
            "腰带": { "普通": { "防御": [55, 71], "气血": [210, 273] }, "强化": { "防御": [57, 75], "气血": [220, 286] } },
            "鞋子": { "普通": { "防御": [55, 71], "敏捷": [35, 45] }, "强化": { "防御": [57, 74], "敏捷": [36, 46] } }
        },
        "110": {
            "武器": { "普通": { "命中": [395, 513], "伤害": [340, 442] }, "强化": { "命中": [414, 538], "伤害": [357, 464] } },
            "衣服": { "普通": { "防御": [175, 227] }, "强化": { "防御": [183, 238] } },
            "项链": { "普通": { "灵力": [137, 178] }, "强化": { "灵力": [143, 186] } },
            "帽子": { "普通": { "防御": [60, 78], "魔法": [115, 149] }, "强化": { "防御": [63, 81], "魔法": [120, 156] } },
            "腰带": { "普通": { "防御": [60, 78], "气血": [230, 299] }, "强化": { "防御": [63, 81], "气血": [241, 313] } },
            "鞋子": { "普通": { "防御": [60, 78], "敏捷": [38, 49] }, "强化": { "防御": [63, 81], "敏捷": [39, 50] } }
        },
        "120": {
            "武器": { "普通": { "命中": [430, 559], "伤害": [370, 481] }, "强化": { "命中": [451, 586], "伤害": [388, 505] } },
            "衣服": { "普通": { "防御": [190, 247] }, "强化": { "防御": [199, 259] } },
            "项链": { "普通": { "灵力": [149, 193] }, "强化": { "灵力": [156, 202] } },
            "帽子": { "普通": { "防御": [65, 84], "魔法": [125, 162] }, "强化": { "防御": [68, 88], "魔法": [131, 170] } },
            "腰带": { "普通": { "防御": [65, 84], "气血": [250, 325] }, "强化": { "防御": [68, 88], "气血": [262, 341] } },
            "鞋子": { "普通": { "防御": [65, 84], "敏捷": [41, 53] }, "强化": { "防御": [68, 88], "敏捷": [43, 55] } }
        },
        "130": {
            "武器": { "普通": { "命中": [465, 604], "伤害": [400, 520] }, "强化": { "命中": [488, 634], "伤害": [420, 546] } },
            "衣服": { "普通": { "防御": [205, 266] }, "强化": { "防御": [215, 279] } },
            "项链": { "普通": { "灵力": [161, 209] }, "强化": { "灵力": [169, 219] } },
            "帽子": { "普通": { "防御": [70, 91], "魔法": [135, 175] }, "强化": { "防御": [73, 95], "魔法": [141, 184] } },
            "腰带": { "普通": { "防御": [70, 91], "气血": [270, 351] }, "强化": { "防御": [73, 95], "气血": [283, 368] } },
            "鞋子": { "普通": { "防御": [70, 91], "敏捷": [44, 57] }, "强化": { "防御": [73, 95], "敏捷": [46, 59] } }
        },
        "140": {
            "武器": { "普通": { "命中": [500, 650], "伤害": [430, 559] }, "强化": { "命中": [525, 682], "伤害": [451, 586] } },
            "衣服": { "普通": { "防御": [220, 286] }, "强化": { "防御": [231, 300] } },
            "项链": { "普通": { "灵力": [173, 224] }, "强化": { "灵力": [181, 235] } },
            "帽子": { "普通": { "防御": [75, 97], "魔法": [145, 188] }, "强化": { "防御": [78, 101], "魔法": [152, 197] } },
            "腰带": { "普通": { "防御": [75, 97], "气血": [290, 377] }, "强化": { "防御": [78, 102], "气血": [304, 395] } },
            "鞋子": { "普通": { "防御": [75, 97], "敏捷": [47, 61] }, "强化": { "防御": [78, 101], "敏捷": [49, 63] } }
        },
        "150": {
            "武器": { "普通": { "命中": [535, 695], "伤害": [460, 598] }, "强化": { "命中": [561, 729], "伤害": [483, 627] } },
            "衣服": { "普通": { "防御": [235, 305] }, "强化": { "防御": [246, 320] } },
            "项链": { "普通": { "灵力": [185, 240] }, "强化": { "灵力": [194, 252] } },
            "帽子": { "普通": { "防御": [80, 104], "魔法": [155, 201] }, "强化": { "防御": [84, 109], "魔法": [162, 211] } },
            "腰带": { "普通": { "防御": [80, 104], "气血": [310, 403] }, "强化": { "防御": [84, 109], "气血": [325, 423] } },
            "鞋子": { "普通": { "防御": [80, 104], "敏捷": [50, 65] }, "强化": { "防御": [84, 109], "敏捷": [52, 67] } }
        },
        "160": {
            "武器": { "强化": { "命中": [571, 777], "伤害": [490, 667] } },
            "衣服": { "强化": { "防御": [249, 340] } },
            "项链": { "强化": { "灵力": [196, 267] } },
            "帽子": { "强化": { "防御": [84, 115], "魔法": [163, 224] } },
            "腰带": { "强化": { "防御": [84, 115], "气血": [329, 449] } },
            "鞋子": { "强化": { "防御": [84, 115], "敏捷": [52, 70] } }
        }
    },

    // ============================================================
    //  ✅ 人物装备 - 绿字附加属性上限（已锁定）
    // ============================================================
    greenLimit: {
        "60": { single: 14, plusMinus: 19, double: 11, negativeMax: -1 },
        "70": { single: 16, plusMinus: 21, double: 13, negativeMax: -1 },
        "80": { single: 19, plusMinus: 24, double: 15, negativeMax: -1 },
        "90": { single: 22, plusMinus: 27, double: 17, negativeMax: -1 },
        "100": { single: 24, plusMinus: 29, double: 19, negativeMax: -1 },
        "110": { single: 26, plusMinus: 31, double: 21, negativeMax: -1 },
        "120": { single: 29, plusMinus: 34, double: 23, negativeMax: -1 },
        "130": { single: 31, plusMinus: 36, double: 25, negativeMax: -1 },
        "140": { single: 34, plusMinus: 39, double: 27, negativeMax: -1 },
        "150": { single: 36, plusMinus: 41, double: 29, negativeMax: -1 },
        "160": { single: 39, plusMinus: 44, double: 31, negativeMax: -1 }
    },

    // ============================================================
    //  ✅ 人物装备 - 熔炼规则说明
    // ============================================================
    meltData: {
        "武器": {
            "可熔炼": ["体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": ["伤害", "命中"],
            "说明": "武器只能熔炼绿字属性，伤害和命中无法熔炼。",
            "可输入": ["伤害", "命中", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"]
        },
        "衣服": {
            "可熔炼": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": [],
            "说明": "衣服可熔炼防御和绿字属性。",
            "可输入": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"]
        },
        "项链": {
            "可熔炼": ["灵力", "耐久"],
            "不可熔炼": [],
            "说明": "",
            "可输入": ["灵力", "耐久"]
        },
        "帽子": {
            "可熔炼": ["防御", "魔法", "耐久"],
            "不可熔炼": [],
            "说明": "",
            "可输入": ["防御", "魔法", "耐久"]
        },
        "腰带": {
            "可熔炼": ["防御", "气血", "耐久"],
            "不可熔炼": [],
            "说明": "",
            "可输入": ["防御", "气血", "耐久"]
        },
        "鞋子": {
            "可熔炼": ["防御", "敏捷", "耐久"],
            "不可熔炼": [],
            "说明": "",
            "可输入": ["防御", "敏捷", "耐久"]
        }
    },

    // ============================================================
    //  ✅ 宠装 - 各等级极限属性表（端游数据）
    // ============================================================
    petLimitData: {
        65: { 速度: 27, 防御: 66, 伤害: 36, 力量: 16, 体质: 5, 气血: 56, 敏捷: 13, 耐力: 10, 灵力: 8, 法力: 10 },
        75: { 速度: 30, 防御: 75, 伤害: 41, 力量: 18, 体质: 6, 气血: 64, 敏捷: 15, 耐力: 12, 灵力: 9, 法力: 12 },
        85: { 速度: 33, 防御: 84, 伤害: 46, 力量: 21, 体质: 6, 气血: 72, 敏捷: 17, 耐力: 14, 灵力: 10, 法力: 14 },
        95: { 速度: 36, 防御: 93, 伤害: 51, 力量: 23, 体质: 7, 气血: 80, 敏捷: 19, 耐力: 15, 灵力: 11, 法力: 15 },
        105: { 速度: 39, 防御: 102, 伤害: 56, 力量: 26, 体质: 8, 气血: 88, 敏捷: 21, 耐力: 17, 灵力: 12, 法力: 17 },
        115: { 速度: 42, 防御: 111, 伤害: 60, 力量: 28, 体质: 8, 气血: 96, 敏捷: 23, 耐力: 19, 灵力: 12, 法力: 19 },
        125: { 速度: 45, 防御: 120, 伤害: 65, 力量: 31, 体质: 9, 气血: 104, 敏捷: 25, 耐力: 20, 灵力: 13, 法力: 20 },
        135: { 速度: 48, 防御: 129, 伤害: 70, 力量: 33, 体质: 10, 气血: 112, 敏捷: 27, 耐力: 22, 灵力: 14, 法力: 22 },
        145: { 速度: 51, 防御: 138, 伤害: 75, 力量: 36, 体质: 10, 气血: 120, 敏捷: 29, 耐力: 24, 灵力: 15, 法力: 24 }
    },

    petAttrList: ['伤害', '灵力', '气血', '体质', '耐力', '法力', '力量', '敏捷', '速度', '防御'],

    // ============================================================
    //  生命周期
    // ============================================================
    init() {
        this.loadUISettings();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
    },

    render() {
        this.updateMeltInputs();
        this.updateQueryResult();
        this.calculateMelt();
        this.calculateScore();
        this.calculateWeaponScore();
        this.updatePetInputs();
        this.updatePetQueryResult();
        this.updatePetValueResult();
        this.updateButtonStates();
        this.saveUISettings();
        setTimeout(() => this.applyUISettings(), 100);
    },

    // ========== UI设置 ==========
    loadUISettings() {
        const data = Storage.get('equipmentQueryUI', {});
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14,
            scoreBgColor: '#1a2a3a'
        };
    },

    saveUISettings() {
        Storage.set('equipmentQueryUI', { uiSettings: this.uiSettings });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('equipmentQueryContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        const card = container.closest('.card');
        if (card) card.style.setProperty('background', s.bgColor, 'important');

        container.querySelectorAll('.module, .eq-result-box, .eq-calc-box').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
            el.style.setProperty('background-color', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.module .title, .module .title .hint, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, .melt-tip, .melt-result, .eq-highlight').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        // 评分卡片背景
        container.querySelectorAll('.eq-score-module').forEach(el => {
            el.style.setProperty('background', s.scoreBgColor || '#1a2a3a', 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.module .title, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, select, input, button').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });

        container.querySelectorAll('.module .title').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 2) + 'px', 'important');
        });

        // 控制武器模块显示
        const weaponModule = document.getElementById('eqWeaponModule');
        if (weaponModule) {
            weaponModule.style.display = this.currentPart === '武器' ? 'block' : 'none';
        }
    },

    // ============================================================
    //  🏗️ 构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('equipmentQueryContainer');
        if (!container) return;

        const levelBtns = this.levels.map(l => 
            `<button class="eq-btn-level ${l === this.currentLevel ? 'active' : ''}" data-value="${l}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${l === this.currentLevel ? '#4CAF50' : '#f0f4f8'};color:${l === this.currentLevel ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${l}</button>`
        ).join('');

        const parts = Object.keys(this.equipmentData[this.currentLevel] || {});
        const partBtns = parts.map(p => 
            `<button class="eq-btn-part ${p === this.currentPart ? 'active' : ''}" data-value="${p}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${p === this.currentPart ? '#4CAF50' : '#f0f4f8'};color:${p === this.currentPart ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${p}</button>`
        ).join('');

        const typeBtns = ['普通', '强化'].map(t => 
            `<button class="eq-btn-type ${t === this.currentType ? 'active' : ''}" data-value="${t}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${t === this.currentType ? '#4CAF50' : '#f0f4f8'};color:${t === this.currentType ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${t}</button>`
        ).join('');

        const petLevelBtns = this.petLevels.map(l => 
            `<button class="pe-btn-level ${l === this.petCurrentLevel ? 'active' : ''}" data-value="${l}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${l === this.petCurrentLevel ? '#4CAF50' : '#f0f4f8'};color:${l === this.petCurrentLevel ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${l}</button>`
        ).join('');

        const petPartBtns = ['护腕', '项圈', '铠甲'].map(p => 
            `<button class="pe-btn-part ${p === this.petCurrentPart ? 'active' : ''}" data-value="${p}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${p === this.petCurrentPart ? '#4CAF50' : '#f0f4f8'};color:${p === this.petCurrentPart ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${p}</button>`
        ).join('');

        container.innerHTML = `
            <!-- 🎨 UI设置 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置 <span class="hint">— 自定义颜色和字体</span></div>
                    <div>
                        <button class="toggle-btn" id="eqToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="eqUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🎨 背景色</label>
                            <input type="color" id="eqBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📦 卡片色</label>
                            <input type="color" id="eqCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔘 按钮色</label>
                            <input type="color" id="eqBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📝 文字色</label>
                            <input type="color" id="eqTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">⭐ 评分卡片</label>
                            <input type="color" id="eqScoreBgColor" value="${this.uiSettings.scoreBgColor || '#1a2a3a'}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔤 字体大小</label>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" id="eqFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;">
                                <span id="eqFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="eqResetUI" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 👤 人物装备 -->
            <div style="border-bottom:2px solid #d0dce8;padding-bottom:6px;margin-bottom:14px;">
                <span style="font-weight:700;font-size:1.1rem;color:#1f3b53;">👤 人物装备</span>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">📝 装备信息输入 <span class="hint">— 点击按钮选择，输入属性值自动对比</span></div>
                    <div style="font-size:0.7rem;color:#5a7a94;">
                        <span style="background:#e8f0e8;padding:2px 12px;border-radius:30px;">💡 负值表示"一加一减"中的减项</span>
                    </div>
                </div>
                <div class="module-body">
                    <!-- 📷 截图识别 -->
                    <div style="margin-bottom:10px;padding:10px 14px;background:#f0f5fb;border-radius:12px;border:1px dashed #6b8baa;text-align:center;" id="eqOcrDropZone">
                        <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
                            <span style="font-size:0.8rem;color:#1f3b53;">📷 截图识别</span>
                            <button class="btn-small" id="eqOcrBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">📤 上传截图</button>
                            <span style="font-size:0.65rem;color:#5a7a94;">支持 JPG/PNG，拖拽、点击上传 或 Ctrl+V 粘贴</span>
                        </div>
                        <div id="eqOcrResult" style="font-size:0.75rem;color:#5a7a94;margin-top:4px;min-height:20px;">点击上传装备截图，自动识别属性</div>
                        <input type="file" id="eqOcrFileInput" accept="image/*" style="display:none;">
                    </div>

                    <div style="margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 等级</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${levelBtns}</div>
                    </div>
                    <div style="margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 部位</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${partBtns}</div>
                    </div>
                    <div style="margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 打造方式</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${typeBtns}</div>
                    </div>

                    <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
                        <button class="btn-small" id="eqResetAllBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;">🔄 重置全部</button>
                    </div>
                    <div id="eqAttrInputArea" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:8px 0;border-top:1px solid #eef2f7;"></div>
                    <div style="font-size:0.65rem;color:#5a7a94;margin-top:4px;text-align:right;">
                        💡 点击输入框自动放大 · 点击 × 清除数值
                    </div>
                </div>
            </div>

            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📊 打造属性范围 <span class="hint">— 灰色=未达下限，绿色=达标，金色=满属性</span></div>
                </div>
                <div class="module-body">
                    <div id="eqCraftResult" style="font-size:0.85rem;color:#5a7a94;">请选择装备等级和部位</div>
                </div>
            </div>

            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">🔥 熔炼上限计算 <span class="hint">— 根据当前属性自动计算可熔炼上限</span></div>
                </div>
                <div class="module-body">
                    <div id="eqMeltResult" style="font-size:0.85rem;color:#5a7a94;">请输入属性值后自动计算</div>
                </div>
            </div>

            <!-- ⭐ 装备评分 -->
            <div class="module eq-score-module" style="margin-top:14px;background:${this.uiSettings.scoreBgColor || '#1a2a3a'};border-radius:16px;border:1px solid #3a5a6a;">
                <div class="module-header">
                    <div class="title" style="color:#e8eef5;">⭐ 装备评分 <span class="hint" style="color:#8ab0c8;">— 综合评估装备价值</span></div>
                </div>
                <div class="module-body">
                    <div id="eqScoreResult" style="font-size:0.95rem;color:#b0c8e0;padding:4px 0;">
                        请输入属性值后自动评估
                    </div>
                </div>
            </div>

            <!-- ⚔️ 武器总伤评价 -->
            <div class="module eq-score-module" id="eqWeaponModule" style="margin-top:14px;background:${this.uiSettings.scoreBgColor || '#1a2a3a'};border-radius:16px;border:1px solid #3a5a6a;display:${this.currentPart === '武器' ? 'block' : 'none'};">
                <div class="module-header">
                    <div class="title" style="color:#e8eef5;">⚔️ 武器总伤 <span class="hint" style="color:#8ab0c8;">— 伤害 + 命中/3</span></div>
                </div>
                <div class="module-body">
                    <div id="eqWeaponResult" style="font-size:0.95rem;color:#b0c8e0;padding:4px 0;">
                        请输入伤害和命中后自动计算
                    </div>
                </div>
            </div>

            <!-- 🐾 宠装查询 -->
            <div style="border-bottom:2px solid #d0dce8;padding-bottom:6px;margin:24px 0 14px 0;">
                <span style="font-weight:700;font-size:1.1rem;color:#1f3b53;">🐾 召唤兽装备查询</span>
                <span style="font-size:0.7rem;color:#5a7a94;margin-left:10px;">— 逛摊时快速判断宠装价值</span>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">📝 宠装信息输入 <span class="hint">— 输入属性值，自动对比极限</span></div>
                    <div style="font-size:0.7rem;color:#5a7a94;">
                        <span style="background:#e8f0e8;padding:2px 12px;border-radius:30px;">💡 负值表示减属性</span>
                    </div>
                </div>
                <div class="module-body">
                    <div style="margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 等级</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${petLevelBtns}</div>
                    </div>
                    <div style="margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 部位</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${petPartBtns}</div>
                    </div>

                    <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
                        <button class="btn-small" id="peResetAllBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;">🔄 重置全部</button>
                    </div>
                    <div id="peAttrInputArea" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:8px 0;border-top:1px solid #eef2f7;"></div>
                    <div style="font-size:0.65rem;color:#5a7a94;margin-top:4px;text-align:right;">
                        💡 点击输入框自动放大 · 点击 × 清除数值
                    </div>
                </div>
            </div>

            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📊 属性对比 <span class="hint">— 显示当前值与极限值的差距</span></div>
                </div>
                <div class="module-body">
                    <div id="peQueryResult" style="font-size:0.85rem;color:#5a7a94;">请选择等级和部位，输入属性值</div>
                </div>
            </div>

            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">💰 价值评估 <span class="hint">— 快速判断装备价值</span></div>
                </div>
                <div class="module-body">
                    <div id="peValueResult" style="font-size:0.85rem;color:#5a7a94;">输入属性后自动评估</div>
                </div>
            </div>
        `;
    },

    // ============================================================
    //  🎨 更新按钮高亮样式
    // ============================================================
    updateButtonStates() {
        document.querySelectorAll('.eq-btn-level').forEach(btn => {
            const val = parseInt(btn.dataset.value);
            if (val === this.currentLevel) {
                btn.classList.add('active');
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
            }
        });

        document.querySelectorAll('.eq-btn-part').forEach(btn => {
            const val = btn.dataset.value;
            if (val === this.currentPart) {
                btn.classList.add('active');
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
            }
        });

        document.querySelectorAll('.eq-btn-type').forEach(btn => {
            const val = btn.dataset.value;
            if (val === this.currentType) {
                btn.classList.add('active');
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
            }
        });

        document.querySelectorAll('.pe-btn-level').forEach(btn => {
            const val = parseInt(btn.dataset.value);
            if (val === this.petCurrentLevel) {
                btn.classList.add('active');
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
            }
        });

        document.querySelectorAll('.pe-btn-part').forEach(btn => {
            const val = btn.dataset.value;
            if (val === this.petCurrentPart) {
                btn.classList.add('active');
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
            }
        });
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        // ===== UI设置 =====
        document.getElementById('eqBgColor').addEventListener('input', function() {
            EquipmentQueryModule.uiSettings.bgColor = this.value;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqCardColor').addEventListener('input', function() {
            EquipmentQueryModule.uiSettings.cardBgColor = this.value;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqBtnColor').addEventListener('input', function() {
            EquipmentQueryModule.uiSettings.btnColor = this.value;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqTextColor').addEventListener('input', function() {
            EquipmentQueryModule.uiSettings.textColor = this.value;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqScoreBgColor').addEventListener('input', function() {
            EquipmentQueryModule.uiSettings.scoreBgColor = this.value;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.calculateScore();
            EquipmentQueryModule.calculateWeaponScore();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqFontSize').addEventListener('input', function() {
            const val = parseInt(this.value);
            document.getElementById('eqFontSizeDisplay').textContent = val;
            EquipmentQueryModule.uiSettings.fontSize = val;
            EquipmentQueryModule.applyUISettings();
            EquipmentQueryModule.saveUISettings();
        });
        document.getElementById('eqResetUI').addEventListener('click', function() {
            if (confirm('重置所有UI设置为默认值？')) {
                EquipmentQueryModule.uiSettings = {
                    bgColor: '#eef2f7',
                    btnColor: '#4CAF50',
                    btnTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    textColor: '#1a1a2e',
                    fontSize: 14,
                    scoreBgColor: '#1a2a3a'
                };
                document.getElementById('eqBgColor').value = EquipmentQueryModule.uiSettings.bgColor;
                document.getElementById('eqCardColor').value = EquipmentQueryModule.uiSettings.cardBgColor;
                document.getElementById('eqBtnColor').value = EquipmentQueryModule.uiSettings.btnColor;
                document.getElementById('eqTextColor').value = EquipmentQueryModule.uiSettings.textColor;
                document.getElementById('eqScoreBgColor').value = EquipmentQueryModule.uiSettings.scoreBgColor;
                document.getElementById('eqFontSize').value = EquipmentQueryModule.uiSettings.fontSize;
                document.getElementById('eqFontSizeDisplay').textContent = EquipmentQueryModule.uiSettings.fontSize;
                EquipmentQueryModule.applyUISettings();
                EquipmentQueryModule.saveUISettings();
                alert('✅ UI设置已重置！');
            }
        });
        document.getElementById('eqToggleUISettings').addEventListener('click', function() {
            const body = document.getElementById('eqUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 人物装备按钮 =====
        document.querySelectorAll('.eq-btn-level').forEach(btn => {
            btn.addEventListener('click', function() {
                EquipmentQueryModule.currentLevel = parseInt(this.dataset.value);
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            });
        });
        document.querySelectorAll('.eq-btn-part').forEach(btn => {
            btn.addEventListener('click', function() {
                EquipmentQueryModule.currentPart = this.dataset.value;
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            });
        });
        document.querySelectorAll('.eq-btn-type').forEach(btn => {
            btn.addEventListener('click', function() {
                EquipmentQueryModule.currentType = this.dataset.value;
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            });
        });

        // ===== 宠装按钮 =====
        document.querySelectorAll('.pe-btn-level').forEach(btn => {
            btn.addEventListener('click', function() {
                EquipmentQueryModule.petCurrentLevel = parseInt(this.dataset.value);
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            });
        });
        document.querySelectorAll('.pe-btn-part').forEach(btn => {
            btn.addEventListener('click', function() {
                EquipmentQueryModule.petCurrentPart = this.dataset.value;
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            });
        });

        // ===== 属性输入 =====
        document.addEventListener('input', function(e) {
            if (e.target.classList && e.target.classList.contains('eq-attr-input')) {
                const attr = e.target.id.replace('eqAttr_', '');
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                    EquipmentQueryModule.inputValues[attr] = val;
                }
                EquipmentQueryModule.calculateMelt();
                EquipmentQueryModule.updateQueryResult();
                EquipmentQueryModule.calculateScore();
                EquipmentQueryModule.calculateWeaponScore();
            }
        });
        document.addEventListener('input', function(e) {
            if (e.target.classList && e.target.classList.contains('pe-attr-input')) {
                const attr = e.target.id.replace('peAttr_', '');
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                    EquipmentQueryModule.petInputValues[attr] = val;
                }
                EquipmentQueryModule.updatePetQueryResult();
                EquipmentQueryModule.updatePetValueResult();
            }
        });

        // ===== 重置全部 =====
        document.getElementById('eqResetAllBtn')?.addEventListener('click', function() {
            if (confirm('确定要清空当前人物装备的所有输入值吗？')) {
                const inputs = document.querySelectorAll('#eqAttrInputArea .eq-attr-input');
                inputs.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                });
                EquipmentQueryModule.inputValues = {};
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            }
        });
        document.getElementById('peResetAllBtn')?.addEventListener('click', function() {
            if (confirm('确定要清空当前宠装的所有输入值吗？')) {
                const inputs = document.querySelectorAll('#peAttrInputArea .pe-attr-input');
                inputs.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                });
                EquipmentQueryModule.petInputValues = {};
                EquipmentQueryModule.render();
                EquipmentQueryModule.bindInputEvents();
            }
        });

        // ===== 📷 截图识别 =====
        const ocrBtn = document.getElementById('eqOcrBtn');
        const fileInput = document.getElementById('eqOcrFileInput');
        const dropZone = document.getElementById('eqOcrDropZone');

        if (ocrBtn && fileInput) {
            ocrBtn.addEventListener('click', function() {
                fileInput.click();
            });

            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    EquipmentQueryModule.recognizeEquipment(ev.target.result);
                };
                reader.readAsDataURL(file);
                fileInput.value = '';
            });
        }

        if (dropZone) {
            dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#4CAF50';
                this.style.background = '#e8f5e9';
            });
            dropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.borderColor = '#6b8baa';
                this.style.background = '#f0f5fb';
            });
            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#6b8baa';
                this.style.background = '#f0f5fb';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        EquipmentQueryModule.recognizeEquipment(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

                // ===== 粘贴图片识别（Ctrl+V） =====
        document.addEventListener('paste', function(e) {
            const container = document.getElementById('equipmentQueryContainer');
            if (!container || !container.closest('.tab-content.active')) return;
            
            const items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(ev) {
                            const imageDataUrl = ev.target.result;
                            const resultEl = document.getElementById('eqOcrResult');
                            if (resultEl) {
                                resultEl.textContent = '📋 检测到粘贴图片，开始识别...';
                                resultEl.style.color = '#8ab0c8';
                            }
                            EquipmentQueryModule.recognizeEquipment(imageDataUrl);
                        };
                        reader.readAsDataURL(file);
                        break;
                    }
                }
            }
        });
    },

    // ============================================================
    //  🔧 绑定输入框事件
    // ============================================================
    bindInputEvents() {
        document.querySelectorAll('#eqAttrInputArea .eq-clear-btn').forEach(btn => {
            btn.removeEventListener('click', btn._clearHandler);
            btn._clearHandler = function() {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                    input.focus();
                }
            };
            btn.addEventListener('click', btn._clearHandler);
        });
        document.querySelectorAll('#eqAttrInputArea .eq-attr-input').forEach(input => {
            input.removeEventListener('focus', input._focusHandler);
            input.removeEventListener('blur', input._blurHandler);
            input._focusHandler = function() {
                this.style.fontSize = '1.1rem';
                this.style.padding = '8px 35px 8px 12px';
                this.style.borderColor = '#4CAF50';
                this.style.boxShadow = '0 0 8px rgba(76,175,80,0.3)';
            };
            input._blurHandler = function() {
                this.style.fontSize = '0.85rem';
                this.style.padding = '6px 30px 6px 10px';
                this.style.borderColor = '#bccad9';
                this.style.boxShadow = 'none';
            };
            input.addEventListener('focus', input._focusHandler);
            input.addEventListener('blur', input._blurHandler);
        });

        document.querySelectorAll('#peAttrInputArea .pe-clear-btn').forEach(btn => {
            btn.removeEventListener('click', btn._clearHandler);
            btn._clearHandler = function() {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                    input.focus();
                }
            };
            btn.addEventListener('click', btn._clearHandler);
        });
        document.querySelectorAll('#peAttrInputArea .pe-attr-input').forEach(input => {
            input.removeEventListener('focus', input._focusHandler);
            input.removeEventListener('blur', input._blurHandler);
            input._focusHandler = function() {
                this.style.fontSize = '1.1rem';
                this.style.padding = '8px 35px 8px 12px';
                this.style.borderColor = '#4CAF50';
                this.style.boxShadow = '0 0 8px rgba(76,175,80,0.3)';
            };
            input._blurHandler = function() {
                this.style.fontSize = '0.85rem';
                this.style.padding = '6px 30px 6px 10px';
                this.style.borderColor = '#bccad9';
                this.style.boxShadow = 'none';
            };
            input.addEventListener('focus', input._focusHandler);
            input.addEventListener('blur', input._blurHandler);
        });
    },

    // ===== 图片转灰度图（提高OCR识别率） =====
preprocessImage(imageSource) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imageSource;
    });
},
    // ============================================================
    //  📷 截图识别核心
    // ============================================================
  async recognizeEquipment(imageSource) {
    const resultEl = document.getElementById('eqOcrResult');
    if (!resultEl) return;

    if (typeof Tesseract === 'undefined') {
        resultEl.textContent = '❌ OCR库未加载，请刷新页面重试';
        resultEl.style.color = '#e06060';
        return;
    }

    resultEl.textContent = '⏳ 正在预处理图片...';
    resultEl.style.color = '#8ab0c8';

    try {
        // ✅ 灰度图预处理
        const grayImage = await this.preprocessImage(imageSource);
        
        resultEl.textContent = '⏳ 正在识别中（约3-8秒），请稍候...';
        
        const worker = await Tesseract.createWorker('chi_sim');
        const { data: { text } } = await worker.recognize(grayImage);
        await worker.terminate();

        console.log('📷 OCR原始结果:', text);

        const parsed = this.parseEquipmentText(text);
        if (!parsed || !parsed.name) {
            // 如果有多个候选，提示用户选择
            if (parsed._candidates && parsed._candidates.length > 1) {
                resultEl.textContent = `⚠️ 识别到多个可能: ${parsed._candidates.join('、')}，请确认`;
                resultEl.style.color = '#e0a060';
                this.showCandidateSelect(parsed._candidates, parsed);
                return;
            }
            resultEl.textContent = '⚠️ 未能识别出有效装备信息，请确认截图清晰或手动输入';
            resultEl.style.color = '#e0a060';
            return;
        }

        let previewText = `✅ 识别到：${parsed.name}`;
        if (parsed.level) previewText += ` | ${parsed.level}级`;
        if (parsed.part) previewText += ` | ${parsed.part}`;
        if (parsed.craftType) previewText += ` | ${parsed.craftType}打造`;
        if (Object.keys(parsed.attrs || {}).length > 0) {
            previewText += ` | ${Object.keys(parsed.attrs).length}项属性`;
        }
        resultEl.textContent = previewText;
        resultEl.style.color = '#60d080';

        this.fillRecognizedData(parsed);

        if (Object.keys(parsed.attrs || {}).length > 0) {
            this.render();
        }

    } catch (err) {
        console.error('OCR识别失败:', err);
        resultEl.textContent = '❌ 识别失败：' + err.message;
        resultEl.style.color = '#e06060';
    }
},

// ===== 智能属性提取 v3（基于上下文逻辑判断） =====
extractAllAttributes(text) {
    const result = {};
    const fullText = text.replace(/\s+/g, ' ').trim();
    
    console.log('🔍 开始智能属性提取 v3');

    // 1. 提取所有带数字的片段
    const numberPattern = /([+-]?\s*\d+)/g;
    let match;
    const numberMatches = [];
    while ((match = numberPattern.exec(fullText)) !== null) {
        const numStr = match[1].trim();
        const numValue = parseInt(numStr);
        if (isNaN(numValue) || numValue === 0) continue;
        
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        const contextBefore = fullText.substring(Math.max(0, startPos - 20), startPos);
        const contextAfter = fullText.substring(endPos, Math.min(fullText.length, endPos + 10));
        
        const isNegative = contextBefore.includes('-') || contextBefore.includes('－') || contextBefore.includes('—');
        const finalValue = isNegative ? -Math.abs(numValue) : Math.abs(numValue);
        
        numberMatches.push({
            value: finalValue,
            startPos,
            endPos,
            contextBefore,
            contextAfter,
            raw: match[0]
        });
    }

    console.log(`📊 找到 ${numberMatches.length} 个数字片段`);

    // 2. 对每个数字，通过上下文判断属性
    for (let item of numberMatches) {
        const { value, contextBefore, contextAfter } = item;
        const combinedContext = contextBefore + ' ' + contextAfter;
        
        let matchedAttr = null;
        let bestMatchScore = 0;

        // ============================================================
        // 第一优先级：精确匹配（两个字的属性名）
        // ============================================================
        const exactMatches = {
            '伤害': ['伤害', '伤 害'],
            '命中': ['命中', '命 中', '合中', '合 中'],
            '防御': ['防御', '防 御'],
            '气血': ['气血', '气 血'],
            '灵力': ['灵力', '灵 力'],
            '魔法': ['魔法', '魔 法'],
            '敏捷': ['敏捷', '敏 捷'],
            '体质': ['体质', '体 质'],
            '魔力': ['魔力', '魔 力'],
            '力量': ['力量', '力 量'],
            '耐力': ['耐力', '耐 力'],
            '耐久': ['耐久度', '耐 久 度', '耐久', '耐 久']
        };

        for (let [attr, keywords] of Object.entries(exactMatches)) {
            for (let kw of keywords) {
                if (combinedContext.includes(kw)) {
                    const score = kw.length * 2;
                    const kwPos = combinedContext.indexOf(kw);
                    const distance = Math.abs(kwPos - 20);
                    const distanceScore = Math.max(0, 20 - distance) / 20;
                    const totalScore = score * 0.6 + distanceScore * 0.4;
                    
                    if (totalScore > bestMatchScore) {
                        bestMatchScore = totalScore;
                        matchedAttr = attr;
                    }
                    break;
                }
            }
        }

        // ============================================================
        // 第二优先级：通过上下文逻辑判断
        // ============================================================
        if (!matchedAttr) {
            // ---- 判断是不是 "耐久" ----
            // 规则：数字前面有 "耐" 且有 "久" 或 "度"
            if (contextBefore.includes('耐') && (contextBefore.includes('久') || contextBefore.includes('度') || contextAfter.includes('久') || contextAfter.includes('度'))) {
                matchedAttr = '耐久';
                console.log(`🔍 逻辑判定: 耐久 (有"耐"+"久/度")`);
            }
            // ---- 判断是不是 "耐力" ----
            // 规则：数字前面有 "耐" 且有 "力"，但没有 "久" 和 "度"
            else if (contextBefore.includes('耐') && contextBefore.includes('力') && !contextBefore.includes('久') && !contextBefore.includes('度')) {
                matchedAttr = '耐力';
                console.log(`🔍 逻辑判定: 耐力 (有"耐"+"力"且无"久/度")`);
            }
            // ---- 判断是不是 "魔力" ----
            // 规则：数字前面有 "魔" / "放" / "谭" / "摩" / "大"
            else if (contextBefore.includes('魔') || contextBefore.includes('放') || contextBefore.includes('谭') || contextBefore.includes('摩') || contextBefore.includes('大')) {
                matchedAttr = '魔力';
                console.log(`🔍 逻辑判定: 魔力 (有"魔/放/谭/摩/大")`);
            }
            // ---- 判断是不是 "力量" ----
            // 规则：数字前面有 "量"，或"力"前面没有其他修饰
            else if (contextBefore.includes('量') || (contextBefore.includes('力') && !contextBefore.includes('魔') && !contextBefore.includes('耐') && !contextBefore.includes('体') && !contextBefore.includes('敏') && !contextBefore.includes('灵'))) {
                matchedAttr = '力量';
                console.log(`🔍 逻辑判定: 力量 (有"量"或无修饰的"力")`);
            }
            // ---- 判断是不是 "防御" ----
            // 规则：数字前面有 "防" 或 "御"
            else if (contextBefore.includes('防') || contextBefore.includes('御')) {
                matchedAttr = '防御';
                console.log(`🔍 逻辑判定: 防御 (有"防/御")`);
            }
            // ---- 判断是不是 "命中" ----
            // 规则：数字前面有 "中" 或 "合"
            else if (contextBefore.includes('中') || contextBefore.includes('合')) {
                matchedAttr = '命中';
                console.log(`🔍 逻辑判定: 命中 (有"中/合")`);
            }
            // ---- 判断是不是 "气血" ----
            // 规则：数字前面有 "血"
            else if (contextBefore.includes('血')) {
                matchedAttr = '气血';
                console.log(`🔍 逻辑判定: 气血 (有"血")`);
            }
            // ---- 判断是不是 "伤害" ----
            // 规则：数字前面有 "伤" 或 "害"
            else if (contextBefore.includes('伤') || contextBefore.includes('害')) {
                matchedAttr = '伤害';
                console.log(`🔍 逻辑判定: 伤害 (有"伤/害")`);
            }
            // ---- 判断是不是 "体质" ----
            // 规则：数字前面有 "体" 或 "质"
            else if (contextBefore.includes('体') || contextBefore.includes('质')) {
                matchedAttr = '体质';
                console.log(`🔍 逻辑判定: 体质 (有"体/质")`);
            }
            // ---- 判断是不是 "敏捷" ----
            // 规则：数字前面有 "敏" 或 "捷"
            else if (contextBefore.includes('敏') || contextBefore.includes('捷')) {
                matchedAttr = '敏捷';
                console.log(`🔍 逻辑判定: 敏捷 (有"敏/捷")`);
            }
            // ---- 判断是不是 "灵力" ----
            // 规则：数字前面有 "灵"
            else if (contextBefore.includes('灵')) {
                matchedAttr = '灵力';
                console.log(`🔍 逻辑判定: 灵力 (有"灵")`);
            }
        }

        // ============================================================
        // 第三优先级：兜底正则
        // ============================================================
        if (!matchedAttr) {
            const fallbackPatterns = {
                '伤害': /伤\s*害?\s*[+：:]\s*(\d+)/,
                '命中': /命?\s*中\s*[+：:]\s*(\d+)/,
                '防御': /防\s*御?\s*[+：:]\s*(\d+)/,
                '气血': /气?\s*血\s*[+：:]\s*(\d+)/,
                '灵力': /灵\s*力\s*[+：:]\s*(\d+)/,
                '魔法': /魔\s*法\s*[+：:]\s*(\d+)/,
                '敏捷': /敏\s*捷\s*[+：:]\s*(\d+)/,
                '体质': /体\s*质\s*[+：:]\s*(\d+)/,
                '魔力': /[魔放谭摩大]\s*力?\s*[+-]?\s*(\d+)/,
                '力量': /力\s*量?\s*[+-]?\s*(\d+)/,
                '耐力': /[耐奈人]\s*力?\s*[+-]?\s*(\d+)/,
                '耐久': /耐\s*久\s*度?\s*(\d+)/
            };
            for (let [attr, pattern] of Object.entries(fallbackPatterns)) {
                const match = fullText.match(pattern);
                if (match) {
                    let val = parseInt(match[1]);
                    if (!isNaN(val) && val !== 0) {
                        const fullMatch = match[0];
                        if (fullMatch.includes('-') && val > 0) {
                            val = -val;
                        }
                        matchedAttr = attr;
                        if (!result[matchedAttr] || Math.abs(val) > Math.abs(result[matchedAttr])) {
                            result[matchedAttr] = val;
                        }
                        console.log(`✅ 兜底提取到 ${attr}: ${val}`);
                        break;
                    }
                }
            }
        }

        // ============================================================
        // 如果匹配到了属性，进一步区分"力"字属性
        // ============================================================
        if (matchedAttr) {
            // 特殊处理：如果匹配到的是"力"，需要进一步区分
            if (matchedAttr === "力量" || matchedAttr === "魔力" || matchedAttr === "耐力") {
                // 检查上下文中的其他关键字
                if (contextBefore.includes('魔') || contextBefore.includes('放') || contextBefore.includes('谭') || contextBefore.includes('摩') || contextBefore.includes('大')) {
                    matchedAttr = '魔力';
                } else if (contextBefore.includes('耐') || contextBefore.includes('奈') || contextBefore.includes('人')) {
                    matchedAttr = '耐力';
                } else if (contextBefore.includes('量') || contextAfter.includes('量')) {
                    matchedAttr = '力量';
                } else if (contextBefore.includes('灵')) {
                    matchedAttr = '灵力';
                } else {
                    matchedAttr = '力量';
                }
            }

            // 特殊处理：耐久
            if (matchedAttr === '耐久' && value < 0) {
                const fixedVal = Math.abs(value);
                if (!result[matchedAttr] || fixedVal > Math.abs(result[matchedAttr])) {
                    result[matchedAttr] = fixedVal;
                    console.log(`🔄 修正耐久负值: ${value} → ${fixedVal}`);
                }
                continue;
            }

            // 赋值
            if (!result[matchedAttr] || Math.abs(value) > Math.abs(result[matchedAttr])) {
                result[matchedAttr] = value;
                console.log(`✅ 提取到 ${matchedAttr}: ${value} (上下文: "${combinedContext}")`);
            }
        }
    }

    console.log('📦 智能提取完成:', result);
    return result;
},
    // ============================================================
    //  📝 解析装备文本
    // ============================================================
parseEquipmentText(text) {
    console.log('原始OCR文本:', text);
    const correctedText = this.correctOcrErrors(text);
    console.log('修正后文本:', correctedText);
    const lines = correctedText.split('\n').map(s => s.trim()).filter(s => s);
    const fullText = lines.join(' ');
    console.log('解析文本:', fullText);

    const result = {
        name: null,
        level: null,
        part: null,
        craftType: null,
        attrs: {}
    };

    // 1. 提取等级
    const levelPatterns = [
        /等级\s*[:：]?\s*(\d+)/,
        /(\d+)\s*级/,
        /(\d+)[\s\n]*级/,
    ];
    for (let pattern of levelPatterns) {
        const match = fullText.match(pattern);
        if (match) {
            const level = parseInt(match[1]);
            if (level >= 10 && level <= 200) {
                result.level = level;
                break;
            }
        }
    }

    // 2. 提取部位
    result.part = this.extractPart(fullText);

    // 3. 提取装备名称
    const matches = this.fuzzyMatchEquipmentAdvanced(fullText);
    if (matches.length > 0) {
        const best = matches[0];
        result.name = best.name;
        if (!result.level && best.info.level) {
            result.level = best.info.level;
        }
        if (!result.part && best.info.part) {
            result.part = best.info.part;
        }
        console.log(`🔍 高级模糊匹配: ${best.name} (综合得分: ${Math.round(best.score * 100)}%)`);
        console.log(`   - 编辑距离匹配: ${best.matchDetails.sim}%`);
        console.log(`   - 逐字匹配: ${best.matchDetails.charMatch}%`);
        console.log(`   - 等级匹配: ${best.matchDetails.levelMatch ? '✅' : '❌'}`);
        console.log(`   - 部位匹配: ${best.matchDetails.partMatch ? '✅' : '❌'}`);
    }

    // 4. 提取打造方式
    if (fullText.includes('强化') || fullText.includes('强')) {
        result.craftType = '强化';
    } else if (fullText.includes('普通') || fullText.includes('普')) {
        result.craftType = '普通';
    }

// 5. ✅ 智能属性提取（调用新方法）
const allAttrs = this.extractAllAttributes(fullText);
console.log('📦 智能提取结果:', allAttrs);

// 合并到结果
for (let [key, val] of Object.entries(allAttrs)) {
    if (val !== 0) {
        result.attrs[key] = val;
    }
}
console.log('📦 最终合并到 result.attrs:', result.attrs);

    // 6. 组合查找（等级+部位）
    if (!result.name && result.level && result.part) {
        const levelStr = String(result.level);
        const partMap = {
            '武器': ['剑', '刀', '枪', '锤', '斧', '扇', '鞭', '爪', '刺', '杖', '棒', '弓', '弩'],
            '衣服': ['衣', '袍', '裙', '甲', '铠', '衫', '服'],
            '项链': ['链', '坠', '佩', '环', '珠', '璎珞', '项圈'],
            '帽子': ['帽', '冠', '盔', '头冠', '发冠'],
            '腰带': ['带', '腰', '束', '绦', '玉带'],
            '鞋子': ['鞋', '靴', '履', '踏', '云履']
        };
        const keywords = partMap[result.part] || [];
        for (let kw of keywords) {
            const pattern = new RegExp(levelStr + '[\\s\\n]*' + kw);
            if (pattern.test(fullText)) {
                for (let [name, info] of Object.entries(this.equipmentNameMap)) {
                    if (info.part === result.part && name.includes(kw) && (info.level === result.level || info.level === 0)) {
                        result.name = name;
                        console.log(`🔍 组合匹配: ${name} (等级${result.level} + 部位${result.part})`);
                        break;
                    }
                }
                if (result.name) break;
            }
        }
    }

    console.log('📦 解析结果:', result);
    return result;
},

    // ===== 显示候选装备让用户选择 =====
showCandidateSelect(candidates, parsedData) {
    // 移除旧弹窗
    const oldOverlay = document.getElementById('candidateSelectOverlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'candidateSelectOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(4px);
    `;

    let listHtml = candidates.map(name => `
        <button class="candidate-option" data-name="${name}" style="
            display: block;
            width: 100%;
            padding: 10px 16px;
            margin: 4px 0;
            border: 1px solid #d0dce8;
            border-radius: 12px;
            background: white;
            font-size: 0.95rem;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
        ">${name}</button>
    `).join('');

    overlay.innerHTML = `
        <div style="
            background: #f8faff;
            border-radius: 24px;
            padding: 24px 28px 28px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
            <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.1rem;">⚠️ 多个匹配</h3>
            <div style="font-size:0.85rem;color:#5a7a94;margin-bottom:14px;">
                OCR识别到多个可能装备，请选择正确的：
            </div>
            <div style="max-height:300px;overflow-y:auto;">
                ${listHtml}
            </div>
            <div style="margin-top:14px;text-align:right;">
                <button id="candidateCancelBtn" style="
                    padding:6px 20px;
                    border-radius:30px;
                    border:none;
                    background:#dce5ef;
                    color:#1f3b53;
                    font-weight:600;
                    cursor:pointer;
                    font-size:0.85rem;
                ">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 点击选择
    overlay.querySelectorAll('.candidate-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.dataset.name;
            // 填入选中的装备名
            const parsed = parsedData;
            parsed.name = name;
            // 从装备库获取完整信息
            const info = EquipmentQueryModule.equipmentNameMap[name];
            if (info) {
                if (!parsed.level) parsed.level = info.level;
                if (!parsed.part) parsed.part = info.part;
            }
            // 填入数据
            EquipmentQueryModule.fillRecognizedData(parsed);
            // 重新渲染
            EquipmentQueryModule.render();
            // 关闭弹窗
            overlay.remove();
            // 显示成功提示
            const resultEl = document.getElementById('eqOcrResult');
            if (resultEl) {
                resultEl.textContent = `✅ 已选择：${name}`;
                resultEl.style.color = '#60d080';
            }
        });
    });

    document.getElementById('candidateCancelBtn').addEventListener('click', function() {
        overlay.remove();
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });
},
    // ============================================================
    //  🖊️ 填入识别数据
    // ============================================================
    fillRecognizedData(parsed) {
        if (!parsed) return;

        // 自动切换等级
        if (parsed.level && this.levels.includes(parsed.level)) {
            this.currentLevel = parsed.level;
            // 更新按钮状态
            document.querySelectorAll('.eq-btn-level').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.value) === parsed.level);
            });
        }

        // 自动切换部位
        if (parsed.part) {
            const parts = Object.keys(this.equipmentData[this.currentLevel] || {});
            if (parts.includes(parsed.part)) {
                this.currentPart = parsed.part;
                document.querySelectorAll('.eq-btn-part').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.value === parsed.part);
                });
            }
        }

        // 自动切换打造方式
        if (parsed.craftType && ['普通', '强化'].includes(parsed.craftType)) {
            this.currentType = parsed.craftType;
            document.querySelectorAll('.eq-btn-type').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === parsed.craftType);
            });
        }

        // 填入属性值
        if (parsed.attrs) {
            for (let [attr, val] of Object.entries(parsed.attrs)) {
                const input = document.getElementById(`eqAttr_${attr}`);
                if (input) {
                    input.value = val;
                    this.inputValues[attr] = val;
                }
            }
        }

        // 重新渲染界面
        this.render();
    },

    // ============================================================
    //  人物装备 - 更新输入框
    // ============================================================
    updateMeltInputs() {
        const container = document.getElementById('eqAttrInputArea');
        if (!container) return;

        const part = this.currentPart;
        const meltInfo = this.meltData[part];
        if (!meltInfo) {
            container.innerHTML = '<div style="color:#6c87a0;">该部位暂无熔炼数据</div>';
            return;
        }

        const attrList = meltInfo.可输入 || meltInfo.可熔炼;
        let html = '';
        for (let attr of attrList) {
            const val = this.inputValues[attr] !== undefined ? this.inputValues[attr] : '';
            const placeholder = attr === '耐久' ? '输入耐久' : '输入数值(负值允许)';
            const isMeltable = meltInfo.可熔炼 && meltInfo.可熔炼.includes(attr);
            const hint = (!isMeltable && part === '武器' && (attr === '伤害' || attr === '命中')) ? ' ⚠️不可熔炼' : '';
            html += `
                <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;position:relative;">
                    <label style="font-weight:500;min-width:45px;color:#1f3b53;">${attr}${hint}：</label>
                    <input type="number" id="eqAttr_${attr}" class="eq-attr-input" step="0.1" value="${val}" placeholder="${placeholder}" style="flex:1;min-width:80px;padding:6px 30px 6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.85rem;text-align:center;transition:all 0.2s;">
                    <button class="eq-clear-btn" data-target="eqAttr_${attr}" style="position:absolute;right:6px;background:transparent;border:none;color:#999;cursor:pointer;font-size:0.9rem;padding:0 4px;line-height:1;">×</button>
                </div>
            `;
        }
        container.innerHTML = html;
        this.bindInputEvents();
    },

    // ============================================================
    //  人物装备 - 更新装备查询结果
    // ============================================================
    updateQueryResult() {
        const level = this.currentLevel;
        const part = this.currentPart;
        const type = this.currentType;
        const el = document.getElementById('eqCraftResult');

        const inputs = document.querySelectorAll('.eq-attr-input');
        const inputValues = {};
        for (let inp of inputs) {
            const attr = inp.id.replace('eqAttr_', '');
            const val = parseFloat(inp.value);
            if (!isNaN(val)) {
                inputValues[attr] = val;
            }
        }

        const partData = this.equipmentData[level]?.[part];
        if (!partData) {
            el.innerHTML = '<div style="color:#6c87a0;">暂无数据</div>';
            return;
        }

        let data;
        if (level === 160) {
            data = partData['强化'] || {};
        } else {
            data = partData[type] || partData['普通'] || {};
        }

        const durability = level >= 130 ? 650 : level >= 100 ? 500 : 400;
        const meltInfo = this.meltData[part];

        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">${level}级 ${part} (${type}打造)</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;

        const mainAttrs = Object.keys(data);
        for (let attr of mainAttrs) {
            const range = data[attr];
            const userVal = inputValues[attr];
            let status = '';
            let statusColor = '#5a7a94';
            let statusText = '';
            if (userVal !== undefined && !isNaN(userVal) && userVal !== 0) {
                if (userVal >= range[1]) {
                    status = ' ⭐ 满属性！';
                    statusColor = '#dbbd7c';
                } else if (userVal >= range[0]) {
                    status = ' ✅ 达标';
                    statusColor = '#2d6b2d';
                } else {
                    status = ' ⚠️ 未达下限';
                    statusColor = '#c0392b';
                }
                statusText = `(${userVal}${status})`;
            }
            html += `
                <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;background:${userVal !== undefined && !isNaN(userVal) && userVal !== 0 ? '#f8faff' : 'transparent'};border-radius:4px;">
                    <span>${attr}</span>
                    <span>
                        <span style="font-weight:600;color:#1f3b53;">${range[0]} - ${range[1]}</span>
                        ${statusText ? `<span style="color:${statusColor};font-weight:600;margin-left:6px;">${statusText}</span>` : ''}
                    </span>
                </div>
            `;
        }

        const userDur = inputValues['耐久'];
        let durStatus = '';
        let durColor = '#5a7a94';
        let durText = '';
        if (userDur !== undefined && !isNaN(userDur) && userDur > 0) {
            if (userDur >= 100) {
                durStatus = ' ✅ 可熔炼';
                durColor = '#2d6b2d';
            } else {
                durStatus = ' ⚠️ 耐久不足100';
                durColor = '#c0392b';
            }
            durText = `(${userDur}${durStatus})`;
        }
        html += `
            <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;background:${userDur !== undefined && !isNaN(userDur) && userDur > 0 ? '#f8faff' : 'transparent'};">
                <span>耐久</span>
                <span>
                    <span style="font-weight:600;color:#1f3b53;">${durability}</span>
                    ${durText ? `<span style="color:${durColor};font-weight:600;margin-left:6px;">${durText}</span>` : ''}
                </span>
            </div>
        `;

        html += `</div>`;

        if (meltInfo && meltInfo.说明) {
            html += `<div style="font-size:0.75rem;color:#5a7a94;margin-top:6px;padding-top:6px;border-top:1px solid #eef2f7;">💡 ${meltInfo.说明}</div>`;
        }

        el.innerHTML = html;
    },

    // ============================================================
    //  人物装备 - 熔炼计算
    // ============================================================
calculateMelt() {
    const level = this.currentLevel;
    const part = this.currentPart;
    const el = document.getElementById('eqMeltResult');

    const inputs = document.querySelectorAll('.eq-attr-input');
    const values = {};
    let hasValue = false;
    for (let inp of inputs) {
        const attr = inp.id.replace('eqAttr_', '');
        const val = parseFloat(inp.value);
        if (!isNaN(val) && val !== 0) {
            values[attr] = val;
            hasValue = true;
        }
    }

    if (!hasValue) {
        el.innerHTML = '<div style="color:#5a7a94;font-size:0.95rem;">请输入属性值后自动计算</div>';
        return;
    }

    const meltInfo = this.meltData[part];
    if (!meltInfo) {
        el.innerHTML = '<div style="color:#c0392b;font-size:0.95rem;">⚠️ 该部位暂无熔炼数据</div>';
        return;
    }

    const partData = this.equipmentData[level]?.[part];
    let craftData = {};
    if (partData) {
        if (level === 160) {
            craftData = partData['强化'] || {};
        } else {
            craftData = partData['强化'] || partData['普通'] || {};
        }
    }

    const green = this.greenLimit[level];
    if (!green) {
        el.innerHTML = '<div style="color:#c0392b;font-size:0.95rem;">⚠️ 该等级暂无绿字熔炼数据</div>';
        return;
    }

    const statAttrs = ['体质', '魔力', '力量', '耐力', '敏捷'];
    const isWeaponOrCloth = (part === '武器' || part === '衣服');

    let greenType = 'none';
    let positiveStats = [];
    let negativeStats = [];
    let positiveCount = 0;
    let hasNegative = false;

    if (isWeaponOrCloth) {
        for (let attr of statAttrs) {
            if (values[attr] !== undefined && values[attr] !== 0) {
                if (values[attr] > 0) {
                    positiveStats.push(attr);
                    positiveCount++;
                } else if (values[attr] < 0) {
                    negativeStats.push(attr);
                    hasNegative = true;
                }
            }
        }

        if (positiveCount === 1 && !hasNegative) {
            greenType = 'single';
        } else if (positiveCount === 1 && hasNegative) {
            greenType = 'plusMinus';
        } else if (positiveCount >= 2) {
            greenType = 'double';
        }
    }

    let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;font-size:1rem;">📊 ${level}级 ${part} 熔炼分析</div>`;

    if (isWeaponOrCloth && greenType !== 'none') {
        const typeLabels = {
            'single': '单加',
            'plusMinus': '一加一减',
            'double': '双加'
        };
        const typeColors = {
            'single': '#2d6b2d',
            'plusMinus': '#b48b3a',
            'double': '#2980b9'
        };
        html += `<div style="background:#f0f5fb;border-radius:10px;padding:6px 14px;margin-bottom:8px;font-size:0.9rem;border:1px solid #d0dce8;">
            <span style="font-weight:600;">📌 识别为：</span>
            <span style="font-weight:700;color:${typeColors[greenType]};">${typeLabels[greenType]}</span>
            ${greenType === 'plusMinus' ? `（正面: ${positiveStats.join('、')}，负面: ${negativeStats.join('、')}）` : ''}
            ${greenType === 'single' ? `（正面: ${positiveStats.join('、')}）` : ''}
            ${greenType === 'double' ? `（正面: ${positiveStats.join('、')}）` : ''}
        </div>`;
    }

    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">`;

    let hasResult = false;

    for (let [attr, val] of Object.entries(values)) {
        if (val === 0) continue;

        // 跳过伤害和命中（不可熔炼）
        if (part === '武器' && (attr === '伤害' || attr === '命中')) {
            continue;
        }

        if (statAttrs.includes(attr) && isWeaponOrCloth) {
            let maxValue = null;
            let formulaType = '';
            let limitName = '';

            if (greenType === 'single') {
                maxValue = green.single;
                formulaType = 'green';
                limitName = `单加上限 ${maxValue}`;
            } else if (greenType === 'plusMinus') {
                if (val > 0) {
                    maxValue = green.plusMinus;
                    formulaType = 'green';
                    limitName = `一加一减(正)上限 ${maxValue}`;
                } else {
                    maxValue = green.negativeMax;
                    formulaType = 'negative';
                    limitName = `一加一减(负)上限 -1`;
                }
            } else if (greenType === 'double') {
                maxValue = green.double;
                formulaType = 'green';
                limitName = `双加上限 ${maxValue}`;
            } else {
                html += `
                    <div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;color:#b45a5a;font-size:0.9rem;">
                        <span>${attr}</span>
                        <span>⚠️ 无法识别绿字类型</span>
                    </div>
                `;
                continue;
            }

            let canMelt;
            if (formulaType === 'negative') {
                canMelt = maxValue - val;
                if (canMelt < 0) canMelt = 0;
                canMelt = Math.round(canMelt * 10) / 10;
            } else {
                canMelt = maxValue - val;
                if (canMelt < 0) canMelt = 0;
                canMelt = Math.round(canMelt * 10) / 10;
            }

            const maxFinal = val + canMelt;
            const isMaxed = canMelt <= 0.1;

            let statusIcon = isMaxed ? '✅ 已达上限' : `可熔炼 +${canMelt.toFixed(1)}`;
            let statusColor = isMaxed ? '#c0392b' : '#2d6b2d';

            html += `
                <div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f4f8;border-radius:6px;background:${isMaxed ? '#f5f0e8' : '#f8faff'};font-size:0.9rem;">
                    <span style="font-weight:500;min-width:60px;">${attr}</span>
                    <span style="text-align:right;">
                        <div style="color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div>
                        <div style="color:${statusColor};font-weight:600;">${statusIcon}</div>
                        <div style="color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div>
                        <div style="font-size:0.7rem;color:#8a9aa8;">${limitName}</div>
                    </span>
                </div>
            `;
            hasResult = true;
            continue;
        }

        if (attr === '耐久') {
            html += `
                <div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;font-size:0.9rem;">
                    <span>耐久</span>
                    <span style="font-weight:600;color:#1f3b53;">当前 ${val} ${val >= 100 ? '✅ 可熔炼' : '⚠️ 不足100'}</span>
                </div>
            `;
            continue;
        }

        if (part === '武器' && (attr === '伤害' || attr === '命中')) {
            continue;
        }

        let maxCraft = null;
        if (craftData && craftData[attr]) {
            maxCraft = craftData[attr][1];
        }

        if (maxCraft === null || maxCraft === 0) {
            html += `
                <div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;color:#b45a5a;font-size:0.9rem;">
                    <span>${attr}</span>
                    <span>⚠️ 暂无熔炼数据</span>
                </div>
            `;
            continue;
        }

        let canMelt = (maxCraft - val) / 1.5;
        if (canMelt < 0) canMelt = 0;
        canMelt = Math.round(canMelt * 10) / 10;
        const maxFinal = val + canMelt;
        const isMaxed = canMelt <= 0.1;

        let statusIcon = isMaxed ? '✅ 已达上限' : `可熔炼 +${canMelt.toFixed(1)}`;
        let statusColor = isMaxed ? '#c0392b' : '#2d6b2d';

        html += `
            <div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f4f8;border-radius:6px;background:${isMaxed ? '#f5f0e8' : '#f8faff'};font-size:0.9rem;">
                <span style="font-weight:500;min-width:60px;">${attr}</span>
                <span style="text-align:right;">
                    <div style="color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div>
                    <div style="color:${statusColor};font-weight:600;">${statusIcon}</div>
                    <div style="color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div>
                    <div style="font-size:0.7rem;color:#8a9aa8;">强化最高 ${maxCraft} → 熔炼上限</div>
                </span>
            </div>
        `;
        hasResult = true;
    }

    html += `</div>`;

    if (!hasResult) {
        html += '<div style="color:#5a7a94;padding:8px 0;font-size:0.9rem;">请输入可熔炼的属性值</div>';
    }

    html += `
        <div style="font-size:0.75rem;color:#5a7a94;margin-top:8px;padding-top:6px;border-top:1px solid #eef2f7;line-height:1.6;">
            💡 <strong>绿字熔炼：</strong>上限值 - 当前值（负面属性最高到 -1）
            <br>💡 <strong>基础主属性熔炼：</strong>(强化最高 - 当前值) ÷ 1.5（差距±1）
            <br>💡 不管装备是不是强化打造，统一按强化打造的"最高属性"计算
            <br>💡 武器只能熔炼绿字属性，伤害和命中无法熔炼
            <br>💡 熔炼条件：装备等级 ≥ 60、当前耐久 ≥ 100
        </div>
    `;

    el.innerHTML = html;
},

    // ============================================================
    //  ⭐ 装备评分
    // ============================================================
    calculateScore() {
        const level = this.currentLevel;
        const part = this.currentPart;
        const el = document.getElementById('eqScoreResult');
        if (!el) return;

        const inputs = document.querySelectorAll('.eq-attr-input');
        const values = {};
        for (let inp of inputs) {
            const attr = inp.id.replace('eqAttr_', '');
            const val = parseFloat(inp.value);
            if (!isNaN(val) && val !== 0) {
                values[attr] = val;
            }
        }

        if (Object.keys(values).length === 0) {
            el.innerHTML = '<div style="color:#8ab0c8;">请输入属性值后自动评估</div>';
            return;
        }

        const partData = this.equipmentData[level]?.[part];
        if (!partData) {
            el.innerHTML = '<div style="color:#8ab0c8;">暂无数据</div>';
            return;
        }

        let craftData = {};
        if (level === 160) {
            craftData = partData['强化'] || {};
        } else {
            craftData = partData['强化'] || partData['普通'] || {};
        }

        const statAttrs = ['体质', '魔力', '力量', '耐力', '敏捷'];
        const isWeaponOrCloth = (part === '武器' || part === '衣服');

        let totalScore = 0;
        let maxScore = 0;
        let scoreDetails = [];

        for (let [attr, val] of Object.entries(values)) {
            if (attr === '耐久') continue;
            if (part === '武器' && (attr === '伤害' || attr === '命中')) continue;

            let maxVal = null;
            let attrLabel = attr;

            if (statAttrs.includes(attr) && isWeaponOrCloth) {
                let positiveCount = 0;
                let hasNegative = false;
                for (let sa of statAttrs) {
                    if (values[sa] !== undefined && values[sa] > 0) positiveCount++;
                    if (values[sa] !== undefined && values[sa] < 0) hasNegative = true;
                }
                const green = this.greenLimit[level];
                if (!green) continue;

                if (positiveCount === 1 && !hasNegative) {
                    maxVal = green.single;
                    attrLabel = attr + '(单加)';
                } else if (positiveCount === 1 && hasNegative) {
                    if (val > 0) {
                        maxVal = green.plusMinus;
                        attrLabel = attr + '(一加一减正)';
                    } else {
                        continue;
                    }
                } else if (positiveCount >= 2) {
                    maxVal = green.double;
                    attrLabel = attr + '(双加)';
                } else {
                    continue;
                }
            } else if (craftData && craftData[attr]) {
                maxVal = craftData[attr][1];
            }

            if (!maxVal || maxVal === 0) continue;

            const pct = Math.min(100, (val / maxVal) * 100);
            totalScore += pct;
            maxScore += 100;
            scoreDetails.push({
                attr: attrLabel,
                val: val,
                maxVal: maxVal,
                pct: pct
            });
        }

        let overallPct = 0;
        let rating = '';
        let ratingColor = '';
        let ratingBg = '';

        if (maxScore > 0) {
            overallPct = totalScore / maxScore;
            if (overallPct >= 0.9) {
                rating = '🌟 极品';
                ratingColor = '#f0d060';
                ratingBg = 'rgba(240,208,96,0.15)';
            } else if (overallPct >= 0.7) {
                rating = '✅ 优秀';
                ratingColor = '#60d080';
                ratingBg = 'rgba(96,208,128,0.15)';
            } else if (overallPct >= 0.5) {
                rating = '📊 中等';
                ratingColor = '#60b0e0';
                ratingBg = 'rgba(96,176,224,0.15)';
            } else if (overallPct >= 0.3) {
                rating = '⚠️ 一般';
                ratingColor = '#e0a060';
                ratingBg = 'rgba(224,160,96,0.15)';
            } else {
                rating = '❌ 较差';
                ratingColor = '#e06060';
                ratingBg = 'rgba(224,96,96,0.15)';
            }
        } else {
            overallPct = 0;
            rating = '📭 无有效属性';
            ratingColor = '#8ab0c8';
            ratingBg = 'rgba(138,176,200,0.10)';
        }

        let html = `
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:10px;padding:12px 16px;background:${ratingBg};border-radius:12px;border:1px solid ${ratingColor}40;">
                <div style="font-size:1.4rem;font-weight:700;color:${ratingColor};">${rating}</div>
                <div style="font-size:1.1rem;color:#e0e8f0;">综合评分 <span style="font-weight:700;color:#ffffff;">${(overallPct * 100).toFixed(0)}%</span></div>
                <div style="font-size:0.75rem;color:#8ab0c8;flex:1;text-align:right;">基于 ${scoreDetails.length} 项属性评估</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;">
        `;

        for (let d of scoreDetails) {
            const color = d.pct >= 80 ? '#60d080' : d.pct >= 50 ? '#60b0e0' : '#e0a060';
            html += `
                <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 10px;text-align:center;border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.7rem;color:#8ab0c8;">${d.attr}</div>
                    <div style="font-size:1rem;font-weight:600;color:#ffffff;">${d.val}</div>
                    <div style="font-size:0.6rem;color:${color};">${d.pct.toFixed(0)}%</div>
                </div>
            `;
        }

        html += `</div>`;
        el.innerHTML = html;
    },

    // ============================================================
    //  ⚔️ 武器总伤计算 & 评价
    // ============================================================
    calculateWeaponScore() {
        const level = this.currentLevel;
        const part = this.currentPart;
        const el = document.getElementById('eqWeaponResult');
        if (!el) return;

        if (part !== '武器') {
            el.innerHTML = '';
            return;
        }

        const inputs = document.querySelectorAll('.eq-attr-input');
        const values = {};
        for (let inp of inputs) {
            const attr = inp.id.replace('eqAttr_', '');
            const val = parseFloat(inp.value);
            if (!isNaN(val) && val !== 0) {
                values[attr] = val;
            }
        }

        const damage = values['伤害'] || 0;
        const hit = values['命中'] || 0;

        if (!damage && !hit) {
            el.innerHTML = '<div style="color:#8ab0c8;">请输入伤害和命中后自动计算</div>';
            return;
        }

        const type = this.currentType;
        const partData = this.equipmentData[level]?.[part];
        if (!partData) {
            el.innerHTML = '<div style="color:#8ab0c8;">暂无数据</div>';
            return;
        }

        let data;
        if (level === 160) {
            data = partData['强化'] || {};
        } else {
            data = partData[type] || partData['普通'] || {};
        }

        const damageRange = data['伤害'] || [0, 0];
        const hitRange = data['命中'] || [0, 0];

        const totalDamage = damage + hit / 3;

        const maxDamage = damageRange[1] || 0;
        const maxHit = hitRange[1] || 0;
        const maxTotalDamage = maxDamage + maxHit / 3;

        const minDamage = damageRange[0] || 0;
        const minHit = hitRange[0] || 0;
        const minTotalDamage = minDamage + minHit / 3;

        const pct = maxTotalDamage > 0 ? (totalDamage / maxTotalDamage * 100) : 0;

        let rating = '';
        let ratingColor = '';
        let ratingBg = '';
        if (pct >= 95) {
            rating = '🌟 极品';
            ratingColor = '#f0d060';
            ratingBg = 'rgba(240,208,96,0.15)';
        } else if (pct >= 85) {
            rating = '✅ 优秀';
            ratingColor = '#60d080';
            ratingBg = 'rgba(96,208,128,0.15)';
        } else if (pct >= 70) {
            rating = '📊 中等';
            ratingColor = '#60b0e0';
            ratingBg = 'rgba(96,176,224,0.15)';
        } else if (pct >= 50) {
            rating = '⚠️ 一般';
            ratingColor = '#e0a060';
            ratingBg = 'rgba(224,160,96,0.15)';
        } else {
            rating = '❌ 较差';
            ratingColor = '#e06060';
            ratingBg = 'rgba(224,96,96,0.15)';
        }

        let html = `
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:10px;padding:12px 16px;background:${ratingBg};border-radius:12px;border:1px solid ${ratingColor}40;">
                <div style="font-size:1.4rem;font-weight:700;color:${ratingColor};">${rating}</div>
                <div style="font-size:1.1rem;color:#e0e8f0;">总伤 <span style="font-weight:700;color:#ffffff;">${totalDamage.toFixed(1)}</span></div>
                <div style="font-size:0.85rem;color:#8ab0c8;">国标 <span style="color:#e0e8f0;">${minTotalDamage.toFixed(1)}</span> → 满 <span style="color:#f0d060;">${maxTotalDamage.toFixed(1)}</span></div>
                <div style="font-size:0.85rem;color:#8ab0c8;flex:1;text-align:right;">${pct.toFixed(0)}%</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
                <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;text-align:center;border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.7rem;color:#8ab0c8;">伤害</div>
                    <div style="font-size:1.1rem;font-weight:600;color:#ffffff;">${damage || '-'}</div>
                    <div style="font-size:0.6rem;color:#5a7a94;">(${damageRange[0]} - ${damageRange[1]})</div>
                </div>
                <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;text-align:center;border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.7rem;color:#8ab0c8;">命中</div>
                    <div style="font-size:1.1rem;font-weight:600;color:#ffffff;">${hit || '-'}</div>
                    <div style="font-size:0.6rem;color:#5a7a94;">(${hitRange[0]} - ${hitRange[1]})</div>
                </div>
            </div>
            <div style="font-size:0.65rem;color:#5a7a94;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                💡 总伤 = 伤害 + 命中/3（人族/魔族），仙族为 伤害 + 命中/3.6
            </div>
        `;

        el.innerHTML = html;
    },

    // ============================================================
    //  🐾 宠装 - 更新输入框
    // ============================================================
    updatePetInputs() {
        const container = document.getElementById('peAttrInputArea');
        if (!container) return;

        let html = '';
        for (let attr of this.petAttrList) {
            const val = this.petInputValues[attr] !== undefined ? this.petInputValues[attr] : '';
            html += `
                <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;position:relative;">
                    <label style="font-weight:500;min-width:40px;color:#1f3b53;">${attr}：</label>
                    <input type="number" id="peAttr_${attr}" class="pe-attr-input" step="0.1" value="${val}" placeholder="数值" style="flex:1;min-width:80px;padding:6px 30px 6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.85rem;text-align:center;transition:all 0.2s;">
                    <button class="pe-clear-btn" data-target="peAttr_${attr}" style="position:absolute;right:6px;background:transparent;border:none;color:#999;cursor:pointer;font-size:0.9rem;padding:0 4px;line-height:1;">×</button>
                </div>
            `;
        }
        container.innerHTML = html;
        this.bindInputEvents();
    },

    // ============================================================
    //  🐾 宠装 - 更新查询结果
    // ============================================================
    updatePetQueryResult() {
        const level = this.petCurrentLevel;
        const part = this.petCurrentPart;
        const el = document.getElementById('peQueryResult');

        const limits = this.petLimitData[level];
        if (!limits) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无数据</div>';
            return;
        }

        const inputs = document.querySelectorAll('.pe-attr-input');
        const values = {};
        for (let inp of inputs) {
            const attr = inp.id.replace('peAttr_', '');
            const val = parseFloat(inp.value);
            if (!isNaN(val) && val !== 0) {
                values[attr] = val;
            }
        }

        if (Object.keys(values).length === 0) {
            el.innerHTML = '<div style="color:#5a7a94;">请输入属性值</div>';
            return;
        }

        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">${level}级 ${part}</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;

        let hasResult = false;
        for (let [attr, val] of Object.entries(values)) {
            const limit = limits[attr];
            if (!limit) {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;color:#b45a5a;">
                        <span>${attr}</span>
                        <span>⚠️ 该等级无此属性数据</span>
                    </div>
                `;
                continue;
            }

            let status = '';
            let statusColor = '#5a7a94';
            let bgColor = '#f8faff';

            if (val >= limit) {
                status = '⭐ 满属性！';
                statusColor = '#dbbd7c';
                bgColor = '#f5f0e8';
            } else if (val >= limit * 0.8) {
                status = '✅ 优秀';
                statusColor = '#2d6b2d';
                bgColor = '#f0f8f0';
            } else if (val >= limit * 0.6) {
                status = '📊 中等';
                statusColor = '#b48b3a';
                bgColor = '#f8f5e8';
            } else if (val > 0) {
                status = '⚠️ 偏低';
                statusColor = '#c0392b';
                bgColor = '#f8e8e8';
            } else {
                status = '⬇️ 减属性';
                statusColor = '#8a6a8a';
                bgColor = '#f5eef5';
            }

            html += `
                <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;background:${bgColor};">
                    <span>${attr}</span>
                    <span>
                        <span style="font-weight:600;color:#1f3b53;">${val}</span>
                        <span style="font-size:0.7rem;color:#5a7a94;">/ ${limit}</span>
                        <span style="color:${statusColor};font-weight:600;margin-left:6px;font-size:0.7rem;">${status}</span>
                    </span>
                </div>
            `;
            hasResult = true;
        }

        html += `</div>`;

        if (!hasResult) {
            html = '<div style="color:#5a7a94;">请输入有效属性值</div>';
        }

        el.innerHTML = html;
    },

    // ============================================================
    //  🐾 宠装 - 价值评估
    // ============================================================
    updatePetValueResult() {
        const level = this.petCurrentLevel;
        const el = document.getElementById('peValueResult');

        const inputs = document.querySelectorAll('.pe-attr-input');
        const values = {};
        for (let inp of inputs) {
            const attr = inp.id.replace('peAttr_', '');
            const val = parseFloat(inp.value);
            if (!isNaN(val) && val !== 0) {
                values[attr] = val;
            }
        }

        if (Object.keys(values).length === 0) {
            el.innerHTML = '<div style="color:#5a7a94;">输入属性后自动评估价值</div>';
            return;
        }

        const limits = this.petLimitData[level];
        if (!limits) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无数据</div>';
            return;
        }

        const damage = values['伤害'] || 0;
        const strength = values['力量'] || 0;
        const attackValue = damage + strength;

        const mana = values['法力'] || 0;
        const spirit = values['灵力'] || 0;
        const magicValue = mana + spirit;

        const speed = values['速度'] || 0;
        const agility = values['敏捷'] || 0;
        const speedValue = speed + agility;

        const defense = values['防御'] || 0;

        const scoreBg = this.uiSettings.scoreBgColor || '#1a2a3a';

        let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">`;

        const attackLimit = (limits['伤害'] || 0) + (limits['力量'] || 0);
        let attackRating = '', attackColor = '#5a7a94';
        if (attackValue >= attackLimit * 0.9) { attackRating = '🌟 超极品！'; attackColor = '#dbbd7c'; }
        else if (attackValue >= attackLimit * 0.7) { attackRating = '🔥 极品'; attackColor = '#2d6b2d'; }
        else if (attackValue >= attackLimit * 0.5) { attackRating = '📊 优秀'; attackColor = '#b48b3a'; }
        else if (attackValue > 0) { attackRating = '📉 一般'; attackColor = '#5a7a94'; }
        else { attackRating = '⬇️ 低价值'; attackColor = '#8a6a8a'; }

        html += `
            <div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);">
                <div style="font-weight:600;color:#e0e8f0;">⚔️ 攻宠价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${attackColor};">${attackValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#8ab0c8;">伤害+力量 = ${damage.toFixed(1)} + ${strength.toFixed(1)} | 极限 ${attackLimit}</div>
                <div style="font-weight:600;color:${attackColor};">${attackRating}</div>
            </div>
        `;

        const magicLimit = (limits['法力'] || 0) + (limits['灵力'] || 0);
        let magicRating = '', magicColor = '#5a7a94';
        if (magicValue >= magicLimit * 0.9) { magicRating = '🌟 超极品！'; magicColor = '#dbbd7c'; }
        else if (magicValue >= magicLimit * 0.7) { magicRating = '🔥 极品'; magicColor = '#2d6b2d'; }
        else if (magicValue >= magicLimit * 0.5) { magicRating = '📊 优秀'; magicColor = '#b48b3a'; }
        else if (magicValue > 0) { magicRating = '📉 一般'; magicColor = '#5a7a94'; }
        else { magicRating = '⬇️ 低价值'; magicColor = '#8a6a8a'; }

        html += `
            <div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);">
                <div style="font-weight:600;color:#e0e8f0;">🔮 法宠价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${magicColor};">${magicValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#8ab0c8;">法力+灵力 = ${mana.toFixed(1)} + ${spirit.toFixed(1)} | 极限 ${magicLimit}</div>
                <div style="font-weight:600;color:${magicColor};">${magicRating}</div>
            </div>
        `;

        const speedLimit = (limits['速度'] || 0) + (limits['敏捷'] || 0);
        let speedRating = '', speedColor = '#5a7a94';
        if (speedValue >= speedLimit * 0.9) { speedRating = '🌟 超极品！'; speedColor = '#dbbd7c'; }
        else if (speedValue >= speedLimit * 0.7) { speedRating = '🔥 极品'; speedColor = '#2d6b2d'; }
        else if (speedValue >= speedLimit * 0.5) { speedRating = '📊 优秀'; speedColor = '#b48b3a'; }
        else if (speedValue > 0) { speedRating = '📉 一般'; speedColor = '#5a7a94'; }
        else { speedRating = '⬇️ 低价值'; speedColor = '#8a6a8a'; }

        html += `
            <div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);">
                <div style="font-weight:600;color:#e0e8f0;">💨 配速价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${speedColor};">${speedValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#8ab0c8;">速度+敏捷 = ${speed.toFixed(1)} + ${agility.toFixed(1)} | 极限 ${speedLimit}</div>
                <div style="font-weight:600;color:${speedColor};">${speedRating}</div>
            </div>
        `;

        const defLimit = limits['防御'] || 0;
        let defRating = '', defColor = '#5a7a94';
        if (defense >= defLimit * 0.9) { defRating = '🌟 超极品！'; defColor = '#dbbd7c'; }
        else if (defense >= defLimit * 0.7) { defRating = '🔥 极品'; defColor = '#2d6b2d'; }
        else if (defense >= defLimit * 0.5) { defRating = '📊 优秀'; defColor = '#b48b3a'; }
        else if (defense > 0) { defRating = '📉 一般'; defColor = '#5a7a94'; }
        else { defRating = '⬇️ 低价值'; defColor = '#8a6a8a'; }

        html += `
            <div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);">
                <div style="font-weight:600;color:#e0e8f0;">🛡️ 防御价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${defColor};">${defense.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#8ab0c8;">防御 = ${defense.toFixed(1)} | 极限 ${defLimit}</div>
                <div style="font-weight:600;color:${defColor};">${defRating}</div>
            </div>
        `;

        html += `</div>`;

        el.innerHTML = html;
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EquipmentQueryModule.init());
} else {
    EquipmentQueryModule.init();
}

window.EquipmentQueryModule = EquipmentQueryModule;
