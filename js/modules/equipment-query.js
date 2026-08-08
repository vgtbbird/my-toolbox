// ============================================================
//  ⚔️ 人物装备打造 & 熔炼查询模块 - 纯净拆分版
// ============================================================
const EquipmentQueryModule = {
    id: 'equipmentQuery',

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
        scoreBgColor: '#1a2a3a'
    },

    levels: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
    currentLevel: 130,
    currentPart: '武器',
    currentType: '普通',
    inputValues: {},

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

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1;
        const dist = this.levenshteinDistance(str1, str2);
        return 1 - dist / maxLen;
    },

    fuzzyMatchEquipmentAdvanced(ocrText) {
        const nameMap = this.equipmentNameMap;
        const results = [];
        const cleanedText = ocrText
            .replace(/[（(][^)）]*[)）]/g, '')
            .replace(/[0-9０-９]+[点\.][0-9０-９]+/g, '')
            .replace(/\s+/g, '');
        for (let [name, info] of Object.entries(nameMap)) {
            let score = 0;
            const nameClean = name.replace(/[^一-龥a-zA-Z0-9]/g, '');
            const sim = this.calculateSimilarity(cleanedText, nameClean);
            score += sim * 0.4;
            let matchCount = 0;
            for (let char of nameClean) {
                if (cleanedText.includes(char)) {
                    matchCount++;
                }
            }
            const charMatch = matchCount / (nameClean.length || 1);
            score += charMatch * 0.3;
            const levelMatch = info.level && ocrText.includes(String(info.level));
            if (levelMatch) {
                score += 0.15;
            }
            const partMatch = info.part && ocrText.includes(info.part);
            if (partMatch) {
                score += 0.15;
            }
            if (cleanedText.includes(nameClean) || cleanedText.includes(name)) {
                score += 0.3;
            }
            if (score >= 0.35) {
                results.push({ name, info, score: Math.min(score, 1), matchDetails: { sim: Math.round(sim * 100), charMatch: Math.round(charMatch * 100), levelMatch: !!levelMatch, partMatch: !!partMatch } });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results;
    },

    fuzzyMatchEquipment(ocrText) {
        const nameMap = this.equipmentNameMap;
        const results = [];
        for (let [name, info] of Object.entries(nameMap)) {
            let score = 0;
            const nameChars = name.split('');
            let matchCount = 0;
            for (let char of nameChars) {
                if (ocrText.includes(char)) {
                    matchCount++;
                }
            }
            score = matchCount / nameChars.length;
            if (info.level && ocrText.includes(String(info.level))) {
                score += 0.2;
            }
            if (info.part && ocrText.includes(info.part)) {
                score += 0.15;
            }
            if (score >= 0.4) {
                results.push({ name, info, score });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results;
    },

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

    correctOcrErrors(text) {
        const corrections = {
            '防 御': '防御', '防  御': '防御', '防 御 ': '防御', '防卸': '防御', '防 卸': '防御',
            '气 血': '气血', '气 血 ': '气血', '气血': '气血',
            '伤 害': '伤害', '伤 害 ': '伤害', '伤害': '伤害',
            '命 中': '命中', '命 中 ': '命中', '命中': '命中', '合中': '命中', '合 中': '命中',
            '灵 力': '灵力', '灵 力 ': '灵力', '灵力': '灵力',
            '魔 法': '魔法', '魔 法 ': '魔法', '魔法': '魔法', '方法': '魔法', '方 法': '魔法', '法': '魔法',
            '魔 力': '魔力', '大 力': '魔力', '大力': '魔力', '放力': '魔力', '放 力': '魔力', '谭力': '魔力', '谭 力': '魔力', '摩力': '魔力', '摩 力': '魔力',
            '力 量': '力量', '力 量 ': '力量', '力量': '力量',
            '耐 力': '耐力', '耐 力 ': '耐力', '耐力': '耐力', '奈力': '耐力', '奈 力': '耐力', '人而力': '耐力', '人 而 力': '耐力', '人 力': '耐力',
            '体 质': '体质', '体 质 ': '体质', '体质': '体质', '休质': '体质', '休 质': '体质',
            '敏 捷': '敏捷', '敏 捷 ': '敏捷', '敏捷': '敏捷',
            '耐 久': '耐久', '耐 久 ': '耐久', '耐久': '耐久', '耐 久 度': '耐久度', '耐久度': '耐久度',
            '灵 犀 望 月': '灵犀望月', '灵 犀 之 形': '灵犀望月', '夜 魔 披 风': '夜魔披风', '夜魔 披风': '夜魔披风', '龙 骨 甲': '龙骨甲', '琉 璃 冠': '琉璃冠',
            '＋': '+', '－': '-', '—': '-', '＝': '=', '十': '+', '一': '-',
            '等 级': '等级', '等 级 ': '等级', '等级': '等级',
            '五 行': '五行', '五 行 ': '五行', '五行': '五行',
        };
        let corrected = text;
        for (let [wrong, right] of Object.entries(corrections)) {
            corrected = corrected.replace(new RegExp(wrong, 'g'), right);
        }
        return corrected;
    },

    equipmentData: {
        "60": { "武器": { "普通": { "命中": [220, 286], "伤害": [190, 247] }, "强化": { "命中": [231, 300], "伤害": [199, 259] } }, "衣服": { "普通": { "防御": [100, 130] }, "强化": { "防御": [105, 136] } }, "项链": { "普通": { "灵力": [77, 100] }, "强化": { "灵力": [80, 105] } }, "帽子": { "普通": { "防御": [35, 45], "魔法": [65, 84] }, "强化": { "防御": [36, 47], "魔法": [68, 88] } }, "腰带": { "普通": { "防御": [35, 45], "气血": [130, 169] }, "强化": { "防御": [36, 47], "气血": [136, 177] } }, "鞋子": { "普通": { "防御": [35, 45], "敏捷": [23, 29] }, "强化": { "防御": [36, 47], "敏捷": [24, 31] } } },
        "70": { "武器": { "普通": { "命中": [255, 331], "伤害": [220, 286] }, "强化": { "命中": [267, 347], "伤害": [231, 300] } }, "衣服": { "普通": { "防御": [115, 149] }, "强化": { "防御": [120, 156] } }, "项链": { "普通": { "灵力": [89, 115] }, "强化": { "灵力": [93, 120] } }, "帽子": { "普通": { "防御": [40, 52], "魔法": [75, 97] }, "强化": { "防御": [42, 54], "魔法": [78, 102] } }, "腰带": { "普通": { "防御": [40, 52], "气血": [150, 195] }, "强化": { "防御": [42, 54], "气血": [157, 204] } }, "鞋子": { "普通": { "防御": [40, 52], "敏捷": [26, 33] }, "强化": { "防御": [42, 54], "敏捷": [27, 35] } } },
        "80": { "武器": { "普通": { "命中": [290, 377], "伤害": [250, 325] }, "强化": { "命中": [304, 395], "伤害": [262, 341] } }, "衣服": { "普通": { "防御": [130, 169] }, "强化": { "防御": [136, 177] } }, "项链": { "普通": { "灵力": [101, 131] }, "强化": { "灵力": [106, 137] } }, "帽子": { "普通": { "防御": [45, 58], "魔法": [85, 110] }, "强化": { "防御": [47, 60], "魔法": [89, 116] } }, "腰带": { "普通": { "防御": [45, 58], "气血": [170, 221] }, "强化": { "防御": [47, 61], "气血": [178, 232] } }, "鞋子": { "普通": { "防御": [45, 58], "敏捷": [29, 37] }, "强化": { "防御": [47, 60], "敏捷": [30, 39] } } },
        "90": { "武器": { "普通": { "命中": [325, 422], "伤害": [280, 364] }, "强化": { "命中": [341, 443], "伤害": [294, 382] } }, "衣服": { "普通": { "防御": [145, 188] }, "强化": { "防御": [152, 197] } }, "项链": { "普通": { "灵力": [113, 146] }, "强化": { "灵力": [118, 153] } }, "帽子": { "普通": { "防御": [50, 65], "魔法": [95, 123] }, "强化": { "防御": [52, 68], "魔法": [99, 129] } }, "腰带": { "普通": { "防御": [50, 65], "气血": [190, 247] }, "强化": { "防御": [52, 68], "气血": [199, 259] } }, "鞋子": { "普通": { "防御": [50, 65], "敏捷": [32, 41] }, "强化": { "防御": [52, 68], "敏捷": [33, 42] } } },
        "100": { "武器": { "普通": { "命中": [360, 468], "伤害": [310, 403] }, "强化": { "命中": [378, 491], "伤害": [325, 423] } }, "衣服": { "普通": { "防御": [160, 208] }, "强化": { "防御": [168, 218] } }, "项链": { "普通": { "灵力": [125, 162] }, "强化": { "灵力": [131, 170] } }, "帽子": { "普通": { "防御": [55, 71], "魔法": [105, 136] }, "强化": { "防御": [57, 74], "魔法": [110, 143] } }, "腰带": { "普通": { "防御": [55, 71], "气血": [210, 273] }, "强化": { "防御": [57, 75], "气血": [220, 286] } }, "鞋子": { "普通": { "防御": [55, 71], "敏捷": [35, 45] }, "强化": { "防御": [57, 74], "敏捷": [36, 46] } } },
        "110": { "武器": { "普通": { "命中": [395, 513], "伤害": [340, 442] }, "强化": { "命中": [414, 538], "伤害": [357, 464] } }, "衣服": { "普通": { "防御": [175, 227] }, "强化": { "防御": [183, 238] } }, "项链": { "普通": { "灵力": [137, 178] }, "强化": { "灵力": [143, 186] } }, "帽子": { "普通": { "防御": [60, 78], "魔法": [115, 149] }, "强化": { "防御": [63, 81], "魔法": [120, 156] } }, "腰带": { "普通": { "防御": [60, 78], "气血": [230, 299] }, "强化": { "防御": [63, 81], "气血": [241, 313] } }, "鞋子": { "普通": { "防御": [60, 78], "敏捷": [38, 49] }, "强化": { "防御": [63, 81], "敏捷": [39, 50] } } },
        "120": { "武器": { "普通": { "命中": [430, 559], "伤害": [370, 481] }, "强化": { "命中": [451, 586], "伤害": [388, 505] } }, "衣服": { "普通": { "防御": [190, 247] }, "强化": { "防御": [199, 259] } }, "项链": { "普通": { "灵力": [149, 193] }, "强化": { "灵力": [156, 202] } }, "帽子": { "普通": { "防御": [65, 84], "魔法": [125, 162] }, "强化": { "防御": [68, 88], "魔法": [131, 170] } }, "腰带": { "普通": { "防御": [65, 84], "气血": [250, 325] }, "强化": { "防御": [68, 88], "气血": [262, 341] } }, "鞋子": { "普通": { "防御": [65, 84], "敏捷": [41, 53] }, "强化": { "防御": [68, 88], "敏捷": [43, 55] } } },
        "130": { "武器": { "普通": { "命中": [465, 604], "伤害": [400, 520] }, "强化": { "命中": [488, 634], "伤害": [420, 546] } }, "衣服": { "普通": { "防御": [205, 266] }, "强化": { "防御": [215, 279] } }, "项链": { "普通": { "灵力": [161, 209] }, "强化": { "灵力": [169, 219] } }, "帽子": { "普通": { "防御": [70, 91], "魔法": [135, 175] }, "强化": { "防御": [73, 95], "魔法": [141, 184] } }, "腰带": { "普通": { "防御": [70, 91], "气血": [270, 351] }, "强化": { "防御": [73, 95], "气血": [283, 368] } }, "鞋子": { "普通": { "防御": [70, 91], "敏捷": [44, 57] }, "强化": { "防御": [73, 95], "敏捷": [46, 59] } } },
        "140": { "武器": { "普通": { "命中": [500, 650], "伤害": [430, 559] }, "强化": { "命中": [525, 682], "伤害": [451, 586] } }, "衣服": { "普通": { "防御": [220, 286] }, "强化": { "防御": [231, 300] } }, "项链": { "普通": { "灵力": [173, 224] }, "强化": { "灵力": [181, 235] } }, "帽子": { "普通": { "防御": [75, 97], "魔法": [145, 188] }, "强化": { "防御": [78, 101], "魔法": [152, 197] } }, "腰带": { "普通": { "防御": [75, 97], "气血": [290, 377] }, "强化": { "防御": [78, 102], "气血": [304, 395] } }, "鞋子": { "普通": { "防御": [75, 97], "敏捷": [47, 61] }, "强化": { "防御": [78, 101], "敏捷": [49, 63] } } },
        "150": { "武器": { "普通": { "命中": [535, 695], "伤害": [460, 598] }, "强化": { "命中": [561, 729], "伤害": [483, 627] } }, "衣服": { "普通": { "防御": [235, 305] }, "强化": { "防御": [246, 320] } }, "项链": { "普通": { "灵力": [185, 240] }, "强化": { "灵力": [194, 252] } }, "帽子": { "普通": { "防御": [80, 104], "魔法": [155, 201] }, "强化": { "防御": [84, 109], "魔法": [162, 211] } }, "腰带": { "普通": { "防御": [80, 104], "气血": [310, 403] }, "强化": { "防御": [84, 109], "气血": [325, 423] } }, "鞋子": { "普通": { "防御": [80, 104], "敏捷": [50, 65] }, "强化": { "防御": [84, 109], "敏捷": [52, 67] } } },
        "160": { "武器": { "强化": { "命中": [571, 777], "伤害": [490, 667] } }, "衣服": { "强化": { "防御": [249, 340] } }, "项链": { "强化": { "灵力": [196, 267] } }, "帽子": { "强化": { "防御": [84, 115], "魔法": [163, 224] } }, "腰带": { "强化": { "防御": [84, 115], "气血": [329, 449] } }, "鞋子": { "强化": { "防御": [84, 115], "敏捷": [52, 70] } } }
    },

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

    meltData: {
        "武器": { "可熔炼": ["体质", "魔力", "力量", "耐力", "敏捷", "耐久"], "不可熔炼": ["伤害", "命中"], "说明": "武器只能熔炼绿字属性，伤害和命中无法熔炼。", "可输入": ["伤害", "命中", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"] },
        "衣服": { "可熔炼": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"], "不可熔炼": [], "说明": "衣服可熔炼防御和绿字属性。", "可输入": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"] },
        "项链": { "可熔炼": ["灵力", "耐久"], "不可熔炼": [], "说明": "", "可输入": ["灵力", "耐久"] },
        "帽子": { "可熔炼": ["防御", "魔法", "耐久"], "不可熔炼": [], "说明": "", "可输入": ["防御", "魔法", "耐久"] },
        "腰带": { "可熔炼": ["防御", "气血", "耐久"], "不可熔炼": [], "说明": "", "可输入": ["防御", "气血", "耐久"] },
        "鞋子": { "可熔炼": ["防御", "敏捷", "耐久"], "不可熔炼": [], "说明": "", "可输入": ["防御", "敏捷", "耐久"] }
    },

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
        this.updateButtonStates();
        this.saveUISettings();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadUISettings() {
        const data = Storage.get('equipmentQueryUI', {});
        this.uiSettings = data.uiSettings || { bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14, scoreBgColor: '#1a2a3a' };
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
        container.querySelectorAll('.module, .eq-result-box, .eq-calc-box').forEach(el => el.style.setProperty('background', s.cardBgColor, 'important'));
        container.querySelectorAll('.module .title, .module .title .hint, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, .melt-tip, .melt-result, .eq-highlight').forEach(el => el.style.setProperty('color', s.textColor, 'important'));
        container.querySelectorAll('.eq-score-module').forEach(el => el.style.setProperty('background', s.scoreBgColor || '#1a2a3a', 'important'));
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.module .title, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, select, input, button').forEach(el => el.style.setProperty('font-size', fontSize, 'important'));
        const weaponModule = document.getElementById('eqWeaponModule');
        if (weaponModule) weaponModule.style.display = this.currentPart === '武器' ? 'block' : 'none';
    },

    updateButtonStates() {
        document.querySelectorAll('.eq-btn-level').forEach(btn => {
            const val = parseInt(btn.dataset.value);
            if (val === this.currentLevel) { btn.classList.add('active'); btn.style.background = '#4CAF50'; btn.style.color = '#fff'; } else { btn.classList.remove('active'); btn.style.background = '#f0f4f8'; btn.style.color = '#1f3b53'; }
        });
        document.querySelectorAll('.eq-btn-part').forEach(btn => {
            const val = btn.dataset.value;
            if (val === this.currentPart) { btn.classList.add('active'); btn.style.background = '#4CAF50'; btn.style.color = '#fff'; } else { btn.classList.remove('active'); btn.style.background = '#f0f4f8'; btn.style.color = '#1f3b53'; }
        });
        document.querySelectorAll('.eq-btn-type').forEach(btn => {
            const val = btn.dataset.value;
            if (val === this.currentType) { btn.classList.add('active'); btn.style.background = '#4CAF50'; btn.style.color = '#fff'; } else { btn.classList.remove('active'); btn.style.background = '#f0f4f8'; btn.style.color = '#1f3b53'; }
        });
    },

    buildUI() {
        const container = document.getElementById('equipmentQueryContainer');
        if (!container) return;
        const levelBtns = this.levels.map(l => `<button class="eq-btn-level ${l === this.currentLevel ? 'active' : ''}" data-value="${l}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${l === this.currentLevel ? '#4CAF50' : '#f0f4f8'};color:${l === this.currentLevel ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${l}</button>`).join('');
        const parts = Object.keys(this.equipmentData[this.currentLevel] || {});
        const partBtns = parts.map(p => `<button class="eq-btn-part ${p === this.currentPart ? 'active' : ''}" data-value="${p}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${p === this.currentPart ? '#4CAF50' : '#f0f4f8'};color:${p === this.currentPart ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${p}</button>`).join('');
        const typeBtns = ['普通', '强化'].map(t => `<button class="eq-btn-type ${t === this.currentType ? 'active' : ''}" data-value="${t}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${t === this.currentType ? '#4CAF50' : '#f0f4f8'};color:${t === this.currentType ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${t}</button>`).join('');
        container.innerHTML = `
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header"><div class="title">🎨 界面设置</div><div><button class="toggle-btn" id="eqToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button></div></div>
                <div class="module-body" id="eqUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div><label>🎨 背景色</label><input type="color" id="eqBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;"></div>
                        <div><label>📦 卡片色</label><input type="color" id="eqCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;"></div>
                        <div><label>🔘 按钮色</label><input type="color" id="eqBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;"></div>
                        <div><label>📝 文字色</label><input type="color" id="eqTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;"></div>
                        <div><label>⭐ 评分卡片</label><input type="color" id="eqScoreBgColor" value="${this.uiSettings.scoreBgColor || '#1a2a3a'}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;"></div>
                        <div><label>🔤 字体大小</label><input type="range" id="eqFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;"><span id="eqFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span></div>
                        <div><button class="btn-small" id="eqResetUI" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button></div>
                    </div>
                </div>
            </div>
            <div style="border-bottom:2px solid #d0dce8;padding-bottom:6px;margin-bottom:14px;"><span style="font-weight:700;font-size:1.1rem;color:#1f3b53;">👤 人物装备</span></div>
            <div class="module">
                <div class="module-header"><div class="title">📝 装备信息输入</div><div style="font-size:0.7rem;color:#5a7a94;"><span style="background:#e8f0e8;padding:2px 12px;border-radius:30px;">💡 负值表示"一加一减"中的减项</span></div></div>
                <div class="module-body">
                    <div style="margin-bottom:10px;padding:10px 14px;background:#f0f5fb;border-radius:12px;border:1px dashed #6b8baa;text-align:center;" id="eqOcrDropZone">
                        <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
                            <span style="font-size:0.8rem;color:#1f3b53;">📷 截图识别</span>
                            <button class="btn-small" id="eqOcrBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">📤 上传截图</button>
                            <span style="font-size:0.65rem;color:#5a7a94;">支持 JPG/PNG，拖拽或 Ctrl+V 粘贴</span>
                        </div>
                        <div id="eqOcrResult" style="font-size:0.75rem;color:#5a7a94;margin-top:4px;min-height:20px;">点击上传装备截图，自动识别属性</div>
                        <input type="file" id="eqOcrFileInput" accept="image/*" style="display:none;">
                    </div>
                    <div style="margin-bottom:8px;"><div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 等级</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${levelBtns}</div></div>
                    <div style="margin-bottom:8px;"><div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 部位</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${partBtns}</div></div>
                    <div style="margin-bottom:8px;"><div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 打造方式</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${typeBtns}</div></div>
                    <div style="display:flex;justify-content:flex-end;margin-bottom:6px;"><button class="btn-small" id="eqResetAllBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;">🔄 重置全部</button></div>
                    <div id="eqAttrInputArea" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:8px 0;border-top:1px solid #eef2f7;"></div>
                    <div style="font-size:0.65rem;color:#5a7a94;margin-top:4px;text-align:right;">💡 点击输入框自动放大 · 点击 × 清除数值</div>
                </div>
            </div>
            <div class="module" style="margin-top:14px;"><div class="module-header"><div class="title">📊 打造属性范围</div></div><div class="module-body"><div id="eqCraftResult" style="font-size:0.85rem;color:#5a7a94;">请选择装备等级和部位</div></div></div>
            <div class="module" style="margin-top:14px;"><div class="module-header"><div class="title">🔥 熔炼上限计算</div></div><div class="module-body"><div id="eqMeltResult" style="font-size:0.85rem;color:#5a7a94;">请输入属性值后自动计算</div></div></div>
            <div class="module eq-score-module" style="margin-top:14px;background:${this.uiSettings.scoreBgColor || '#1a2a3a'};border-radius:16px;border:1px solid #3a5a6a;"><div class="module-header"><div class="title" style="color:#e8eef5;">⭐ 装备评分</div></div><div class="module-body"><div id="eqScoreResult" style="font-size:0.95rem;color:#b0c8e0;padding:4px 0;">请输入属性值后自动评估</div></div></div>
            <div class="module eq-score-module" id="eqWeaponModule" style="margin-top:14px;background:${this.uiSettings.scoreBgColor || '#1a2a3a'};border-radius:16px;border:1px solid #3a5a6a;display:${this.currentPart === '武器' ? 'block' : 'none'};"><div class="module-header"><div class="title" style="color:#e8eef5;">⚔️ 武器总伤</div></div><div class="module-body"><div id="eqWeaponResult" style="font-size:0.95rem;color:#b0c8e0;padding:4px 0;">请输入伤害和命中后自动计算</div></div></div>
        `;
    },

    bindEvents() {
        document.getElementById('eqBgColor').addEventListener('input', function() { EquipmentQueryModule.uiSettings.bgColor = this.value; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqCardColor').addEventListener('input', function() { EquipmentQueryModule.uiSettings.cardBgColor = this.value; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqBtnColor').addEventListener('input', function() { EquipmentQueryModule.uiSettings.btnColor = this.value; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqTextColor').addEventListener('input', function() { EquipmentQueryModule.uiSettings.textColor = this.value; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqScoreBgColor').addEventListener('input', function() { EquipmentQueryModule.uiSettings.scoreBgColor = this.value; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.calculateScore(); EquipmentQueryModule.calculateWeaponScore(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqFontSize').addEventListener('input', function() { const val = parseInt(this.value); document.getElementById('eqFontSizeDisplay').textContent = val; EquipmentQueryModule.uiSettings.fontSize = val; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); });
        document.getElementById('eqResetUI').addEventListener('click', function() { if (!confirm('重置所有UI设置为默认值？')) return; EquipmentQueryModule.uiSettings = { bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14, scoreBgColor: '#1a2a3a' }; document.getElementById('eqBgColor').value = EquipmentQueryModule.uiSettings.bgColor; document.getElementById('eqCardColor').value = EquipmentQueryModule.uiSettings.cardBgColor; document.getElementById('eqBtnColor').value = EquipmentQueryModule.uiSettings.btnColor; document.getElementById('eqTextColor').value = EquipmentQueryModule.uiSettings.textColor; document.getElementById('eqScoreBgColor').value = EquipmentQueryModule.uiSettings.scoreBgColor; document.getElementById('eqFontSize').value = EquipmentQueryModule.uiSettings.fontSize; document.getElementById('eqFontSizeDisplay').textContent = EquipmentQueryModule.uiSettings.fontSize; EquipmentQueryModule.applyUISettings(); EquipmentQueryModule.saveUISettings(); alert('✅ UI设置已重置！'); });
        document.getElementById('eqToggleUISettings').addEventListener('click', function() { const body = document.getElementById('eqUISettingsBody'); body.classList.toggle('hidden'); this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏'; });
        document.querySelectorAll('.eq-btn-level').forEach(btn => { btn.addEventListener('click', function() { EquipmentQueryModule.currentLevel = parseInt(this.dataset.value); EquipmentQueryModule.render(); EquipmentQueryModule.bindInputEvents(); }); });
        document.querySelectorAll('.eq-btn-part').forEach(btn => { btn.addEventListener('click', function() { EquipmentQueryModule.currentPart = this.dataset.value; EquipmentQueryModule.render(); EquipmentQueryModule.bindInputEvents(); }); });
        document.querySelectorAll('.eq-btn-type').forEach(btn => { btn.addEventListener('click', function() { EquipmentQueryModule.currentType = this.dataset.value; EquipmentQueryModule.render(); EquipmentQueryModule.bindInputEvents(); }); });
        document.addEventListener('input', function(e) { if (e.target.classList && e.target.classList.contains('eq-attr-input')) { const attr = e.target.id.replace('eqAttr_', ''); const val = parseFloat(e.target.value); if (!isNaN(val)) EquipmentQueryModule.inputValues[attr] = val; EquipmentQueryModule.calculateMelt(); EquipmentQueryModule.updateQueryResult(); EquipmentQueryModule.calculateScore(); EquipmentQueryModule.calculateWeaponScore(); } });
        document.getElementById('eqResetAllBtn')?.addEventListener('click', function() { if (!confirm('确定要清空当前人物装备的所有输入值吗？')) return; document.querySelectorAll('#eqAttrInputArea .eq-attr-input').forEach(input => { input.value = ''; input.dispatchEvent(new Event('input')); }); EquipmentQueryModule.inputValues = {}; EquipmentQueryModule.render(); EquipmentQueryModule.bindInputEvents(); });
        const ocrBtn = document.getElementById('eqOcrBtn'), fileInput = document.getElementById('eqOcrFileInput'), dropZone = document.getElementById('eqOcrDropZone');
        if (ocrBtn && fileInput) { ocrBtn.addEventListener('click', () => fileInput.click()); fileInput.addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => EquipmentQueryModule.recognizeEquipment(ev.target.result); reader.readAsDataURL(file); fileInput.value = ''; }); }
        if (dropZone) { dropZone.addEventListener('dragover', function(e) { e.preventDefault(); this.style.borderColor = '#4CAF50'; this.style.background = '#e8f5e9'; }); dropZone.addEventListener('dragleave', function(e) { e.preventDefault(); this.style.borderColor = '#6b8baa'; this.style.background = '#f0f5fb'; }); dropZone.addEventListener('drop', function(e) { e.preventDefault(); this.style.borderColor = '#6b8baa'; this.style.background = '#f0f5fb'; const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (ev) => EquipmentQueryModule.recognizeEquipment(ev.target.result); reader.readAsDataURL(file); } }); }
        document.addEventListener('paste', function(e) { const container = document.getElementById('equipmentQueryContainer'); if (!container || !container.closest('.tab-content.active')) return; const items = e.clipboardData && e.clipboardData.items; if (!items) return; for (let item of items) { if (item.type.startsWith('image/')) { const file = item.getAsFile(); if (file) { const reader = new FileReader(); reader.onload = (ev) => EquipmentQueryModule.recognizeEquipment(ev.target.result); reader.readAsDataURL(file); break; } } } });
        this.bindInputEvents();
    },

    bindInputEvents() {
        document.querySelectorAll('#eqAttrInputArea .eq-clear-btn').forEach(btn => {
            btn.removeEventListener('click', btn._clearHandler);
            btn._clearHandler = function() { const input = document.getElementById(this.dataset.target); if (input) { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); } };
            btn.addEventListener('click', btn._clearHandler);
        });
        document.querySelectorAll('#eqAttrInputArea .eq-attr-input').forEach(input => {
            input.removeEventListener('focus', input._focusHandler);
            input.removeEventListener('blur', input._blurHandler);
            input._focusHandler = function() { this.style.fontSize = '1.1rem'; this.style.padding = '8px 35px 8px 12px'; this.style.borderColor = '#4CAF50'; this.style.boxShadow = '0 0 8px rgba(76,175,80,0.3)'; };
            input._blurHandler = function() { this.style.fontSize = '0.85rem'; this.style.padding = '6px 30px 6px 10px'; this.style.borderColor = '#bccad9'; this.style.boxShadow = 'none'; };
            input.addEventListener('focus', input._focusHandler); input.addEventListener('blur', input._blurHandler);
        });
    },

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

    async recognizeEquipment(imageSource) {
        const resultEl = document.getElementById('eqOcrResult');
        if (!resultEl) return;
        this.inputValues = {};
        this.currentLevel = 60;
        this.currentPart = '武器';
        this.currentType = '普通';
        document.querySelectorAll('.eq-attr-input').forEach(input => input.value = '');
        document.querySelectorAll('.eq-btn-level, .eq-btn-part, .eq-btn-type').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.eq-btn-level[data-value="60"]')?.classList.add('active');
        document.querySelector('.eq-btn-part[data-value="武器"]')?.classList.add('active');
        document.querySelector('.eq-btn-type[data-value="普通"]')?.classList.add('active');
        if (typeof Tesseract === 'undefined') { resultEl.textContent = '❌ OCR库未加载，请刷新页面重试'; resultEl.style.color = '#e06060'; return; }
        resultEl.textContent = '⏳ 正在预处理图片...'; resultEl.style.color = '#8ab0c8';
        try {
            const grayImage = await this.preprocessImage(imageSource);
            resultEl.textContent = '⏳ 正在识别中（约3-8秒），请稍候...';
            const worker = await Tesseract.createWorker('chi_sim');
            const { data: { text } } = await worker.recognize(grayImage);
            await worker.terminate();
            console.log('📷 OCR原始结果:', text);
            const parsed = this.parseEquipmentText(text);
            if (!parsed || !parsed.name) {
                if (parsed._candidates && parsed._candidates.length > 1) { resultEl.textContent = `⚠️ 识别到多个可能: ${parsed._candidates.join('、')}，请确认`; resultEl.style.color = '#e0a060'; this.showCandidateSelect(parsed._candidates, parsed); return; }
                resultEl.textContent = '⚠️ 未能识别出有效装备信息，请确认截图清晰或手动输入'; resultEl.style.color = '#e0a060'; return;
            }
            let previewText = `✅ 识别到：${parsed.name}`;
            if (parsed.level) previewText += ` | ${parsed.level}级`;
            if (parsed.part) previewText += ` | ${parsed.part}`;
            if (parsed.craftType) previewText += ` | ${parsed.craftType}打造`;
            if (Object.keys(parsed.attrs || {}).length > 0) previewText += ` | ${Object.keys(parsed.attrs).length}项属性`;
            resultEl.textContent = previewText; resultEl.style.color = '#60d080';
            this.fillRecognizedData(parsed);
            if (Object.keys(parsed.attrs || {}).length > 0) { this.render(); this.fillRecognizedData(parsed); }
        } catch (err) { console.error('OCR识别失败:', err); resultEl.textContent = '❌ 识别失败：' + err.message; resultEl.style.color = '#e06060'; }
    },

    extractAllByContext(text) {
        const result = { level: null, part: null, craftType: null, attrs: {} };
        const fullText = text.replace(/\s+/g, ' ').trim();
        console.log('🔍 开始数字+前文上下文提取');
        const numberPattern = /([+-]\s*\d+|\d+)/g;
        let match; const numberMatches = [];
        while ((match = numberPattern.exec(fullText)) !== null) {
            const numStr = match[1].trim();
            const numValue = parseInt(numStr);
            if (isNaN(numValue) || numValue === 0) continue;
            const hasNegativeSign = numStr.includes('-') || numStr.includes('－') || numStr.includes('—');
            numberMatches.push({ value: numValue, startPos: match.index, endPos: match.index + match[0].length, raw: match[0], hasNegativeSign: hasNegativeSign });
        }
        console.log(`📊 找到 ${numberMatches.length} 个数字`);
        for (let i = 0; i < numberMatches.length; i++) {
            const current = numberMatches[i];
            const startPos = current.startPos;
            let prevEndPos = 0;
            if (i > 0) prevEndPos = numberMatches[i - 1].endPos;
            const contextBefore = fullText.substring(prevEndPos, startPos);
            const cleanBefore = contextBefore.replace(/\s/g, '');
            const value = current.value;
            const isNegative = current.hasNegativeSign || contextBefore.includes('-') || contextBefore.includes('－') || contextBefore.includes('—');
            const finalValue = isNegative ? -Math.abs(value) : Math.abs(value);
            console.log(`🔍 数字 ${finalValue}: 前文="${cleanBefore}"`);
            if (cleanBefore.includes('等') || cleanBefore.includes('级')) {
                if (!cleanBefore.includes('锻炼') && !cleanBefore.includes('锻') && !cleanBefore.includes('炼')) {
                    if (!cleanBefore.includes('耐') && !cleanBefore.includes('久') && !cleanBefore.includes('度')) {
                        if (Math.abs(finalValue) >= 60 && Math.abs(finalValue) <= 200) { result.level = Math.abs(finalValue); console.log(`✅ 等级: ${result.level}`); continue; }
                    }
                }
            }
            if (cleanBefore.includes('久') || cleanBefore.includes('度') || (cleanBefore.includes('耐') && (cleanBefore.includes('久') || cleanBefore.includes('度')))) {
                if (!cleanBefore.includes('速')) { result.attrs['耐久'] = Math.abs(finalValue); console.log(`✅ 耐久: ${result.attrs['耐久']}`); continue; }
            }
            if (cleanBefore.includes('防') || cleanBefore.includes('御')) { result.attrs['防御'] = finalValue; console.log(`✅ 防御: ${finalValue}`); continue; }
            if (cleanBefore.includes('血') || cleanBefore.includes('气')) { result.attrs['气血'] = Math.abs(finalValue); console.log(`✅ 气血: ${finalValue}`); continue; }
            if (cleanBefore.includes('伤') || cleanBefore.includes('害')) { result.attrs['伤害'] = Math.abs(finalValue); console.log(`✅ 伤害: ${finalValue}`); continue; }
            if (cleanBefore.includes('中') || cleanBefore.includes('合') || cleanBefore.includes('命')) { result.attrs['命中'] = Math.abs(finalValue); console.log(`✅ 命中: ${finalValue}`); continue; }
            if (cleanBefore.includes('灵')) { result.attrs['灵力'] = finalValue; console.log(`✅ 灵力: ${finalValue}`); continue; }
            if (cleanBefore.includes('魔') || cleanBefore.includes('法') || cleanBefore.includes('方')) {
                if (!cleanBefore.includes('力') && !cleanBefore.includes('御')) { result.attrs['魔法'] = Math.abs(finalValue); console.log(`✅ 魔法: ${finalValue}`); continue; }
            }
            if (cleanBefore.includes('敏') || cleanBefore.includes('捷')) { result.attrs['敏捷'] = finalValue; console.log(`✅ 敏捷: ${finalValue}`); continue; }
            if (cleanBefore.includes('体') || cleanBefore.includes('质')) { result.attrs['体质'] = finalValue; console.log(`✅ 体质: ${finalValue}`); continue; }
            if (cleanBefore.includes('魔') || cleanBefore.includes('放') || cleanBefore.includes('谭') || cleanBefore.includes('摩')) { result.attrs['魔力'] = finalValue; console.log(`✅ 魔力: ${finalValue}`); continue; }
            if (cleanBefore.includes('量') || (cleanBefore.includes('力') && !cleanBefore.includes('魔') && !cleanBefore.includes('耐') && !cleanBefore.includes('体') && !cleanBefore.includes('敏') && !cleanBefore.includes('灵'))) { result.attrs['力量'] = finalValue; console.log(`✅ 力量: ${finalValue}`); continue; }
            if ((cleanBefore.includes('耐') || cleanBefore.includes('奈') || cleanBefore.includes('人')) && !cleanBefore.includes('久') && !cleanBefore.includes('度')) { result.attrs['耐力'] = finalValue; console.log(`✅ 耐力: ${finalValue}`); continue; }
            console.log(`⏭️ 未识别: ${finalValue}，前文="${cleanBefore}"`);
        }
        console.log('📦 提取完成:', result); return result;
    },

    parseEquipmentText(text) {
        console.log('原始OCR文本:', text);
        const correctedText = this.correctOcrErrors(text);
        console.log('修正后文本:', correctedText);
        const lines = correctedText.split('\n').map(s => s.trim()).filter(s => s);
        const fullText = lines.join(' ');
        console.log('解析文本:', fullText);

        const result = { name: null, level: null, part: null, craftType: null, attrs: {} };
        const levelPatterns = [ /等级\s*[:：]?\s*(\d+)/, /(\d+)\s*级/, /〔(\d+)〕/, /【(\d+)】/ ];
        for (let pattern of levelPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                const level = parseInt(match[1]);
                if (level >= 60 && level <= 200) {
                    const contextBefore = fullText.substring(Math.max(0, match.index - 20), match.index);
                    if (!contextBefore.includes('锻炼') && !contextBefore.includes('锻') && !contextBefore.includes('炼')) {
                        result.level = level; console.log(`✅ 全文匹配等级: ${level}`); break;
                    }
                }
            }
        }
        result.part = this.extractPart(fullText);
        const matches = this.fuzzyMatchEquipmentAdvanced(fullText);
        if (matches.length > 0) {
            const best = matches[0];
            result.name = best.name;
            if (!result.level && best.info.level) result.level = best.info.level;
            if (!result.part && best.info.part) result.part = best.info.part;
            console.log(`🔍 高级模糊匹配: ${best.name}`);
        }
        if (fullText.includes('强化') || fullText.includes('强')) { result.craftType = '强化'; }
        else if (fullText.includes('普通') || fullText.includes('普')) { result.craftType = '普通'; }

        const allAttrs = {};
        const extracted = this.extractAllByContext(fullText);
        if (extracted.level) result.level = extracted.level;
        if (extracted.part) result.part = extracted.part;
        if (extracted.craftType) result.craftType = extracted.craftType;
        for (let [key, val] of Object.entries(extracted.attrs)) { if (val !== 0) allAttrs[key] = val; }
        const attrNames = ['防御', '气血', '伤害', '命中', '灵力', '魔法', '敏捷', '体质', '魔力', '力量', '耐力', '耐久'];
        const attrRegex = new RegExp(`(${attrNames.join('|')})\\s*([+-]?\\s*\\d+)`, 'g');
        let match;
        while ((match = attrRegex.exec(fullText)) !== null) {
            let name = match[1];
            let valStr = match[2].trim();
            let val = parseInt(valStr);
            if (!isNaN(val) && val !== 0) {
                if (valStr.startsWith('-') || valStr.includes('-')) { val = -Math.abs(val); } else { val = Math.abs(val); }
                if (!allAttrs[name] || Math.abs(val) > Math.abs(allAttrs[name])) { allAttrs[name] = val; console.log(`✅ 旧方法补漏提取到 ${name}: ${val}`); }
            }
        }
        // 兜底单独处理
        const defMatch = fullText.match(/防\s*御\s*[+：:]\s*(\d+)/); if (defMatch && !allAttrs['防御']) { allAttrs['防御'] = parseInt(defMatch[1]); }
        const hpMatch = fullText.match(/气\s*血\s*[+：:]\s*(\d+)/); if (hpMatch && !allAttrs['气血']) { allAttrs['气血'] = parseInt(hpMatch[1]); }
        const dmgMatch = fullText.match(/伤\s*害?\s*[+：:]\s*(\d+)/); if (dmgMatch && !allAttrs['伤害']) { allAttrs['伤害'] = parseInt(dmgMatch[1]); }
        const hitMatch = fullText.match(/命?\s*中\s*[+：:]\s*(\d+)/); if (hitMatch && !allAttrs['命中']) { allAttrs['命中'] = parseInt(hitMatch[1]); }
        const spiritMatch = fullText.match(/灵\s*力\s*[+：:]\s*(\d+)/); if (spiritMatch && !allAttrs['灵力']) { allAttrs['灵力'] = parseInt(spiritMatch[1]); }
        const manaMatch = fullText.match(/魔\s*法\s*[+：:]\s*(\d+)/); if (manaMatch && !allAttrs['魔法']) { allAttrs['魔法'] = parseInt(manaMatch[1]); }
        const agiMatch = fullText.match(/敏\s*捷\s*[+：:]\s*(\d+)/); if (agiMatch && !allAttrs['敏捷']) { allAttrs['敏捷'] = parseInt(agiMatch[1]); }
        const conMatch = fullText.match(/体\s*质\s*[+：:]\s*(\d+)/); if (conMatch && !allAttrs['体质']) { allAttrs['体质'] = parseInt(conMatch[1]); }
        const mpMatch = fullText.match(/[大魔放谭摩]\s*力\s*([+-])\s*(\d+)/); if (mpMatch && !allAttrs['魔力']) { const val = parseInt(mpMatch[2]); allAttrs['魔力'] = mpMatch[1] === '-' ? -val : val; }
        const strMatch = fullText.match(/力量\s*([+-])\s*(\d+)/); if (strMatch && !allAttrs['力量']) { const val = parseInt(strMatch[2]); allAttrs['力量'] = strMatch[1] === '-' ? -val : val; }
        const endMatch = fullText.match(/耐\s*力\s*([+-])\s*(\d+)/); if (endMatch && !allAttrs['耐力']) { const val = parseInt(endMatch[2]); allAttrs['耐力'] = endMatch[1] === '-' ? -val : val; }
        const durMatch = fullText.match(/耐\s*久\s*度?\s*(\d+)/); if (durMatch && !allAttrs['耐久']) { allAttrs['耐久'] = parseInt(durMatch[1]); }

        for (let [key, val] of Object.entries(allAttrs)) { if (val !== 0) result.attrs[key] = val; }
        console.log('📦 最终合并到 result.attrs:', result.attrs);
        if (!result.name && result.level && result.part) {
            const partMap = { '武器': ['剑', '刀', '枪', '锤', '斧', '扇', '鞭', '爪', '刺', '杖', '棒', '弓', '弩'], '衣服': ['衣', '袍', '裙', '甲', '铠', '衫', '服'], '项链': ['链', '坠', '佩', '环', '珠', '璎珞', '项圈'], '帽子': ['帽', '冠', '盔', '头冠', '发冠'], '腰带': ['带', '腰', '束', '绦', '玉带'], '鞋子': ['鞋', '靴', '履', '踏', '云履'] };
            const keywords = partMap[result.part] || [];
            for (let kw of keywords) {
                const pattern = new RegExp(result.level + '[\\s\\n]*' + kw);
                if (pattern.test(fullText)) {
                    for (let [name, info] of Object.entries(this.equipmentNameMap)) {
                        if (info.part === result.part && name.includes(kw) && (info.level === result.level || info.level === 0)) {
                            result.name = name; console.log(`🔍 组合匹配: ${name}`); break;
                        }
                    }
                    if (result.name) break;
                }
            }
        }
        if (Object.keys(result.attrs).length > 0) {
            const attrs = result.attrs;
            const greenAttrs = ['体质', '魔力', '力量', '耐力', '敏捷'];
            const hasGreen = greenAttrs.some(a => attrs[a] !== undefined);
            const hasGreenCount = greenAttrs.filter(a => attrs[a] !== undefined).length;
            let calibratedPart = null;
            if (attrs['伤害'] && attrs['命中']) calibratedPart = '武器';
            else if (attrs['防御'] && attrs['气血'] && hasGreen) calibratedPart = '衣服';
            else if (attrs['防御'] && attrs['气血'] && !hasGreen) calibratedPart = '腰带';
            else if (attrs['防御'] && attrs['魔法']) calibratedPart = '帽子';
            else if (attrs['防御'] && attrs['敏捷'] && !hasGreen) calibratedPart = '鞋子';
            else if (attrs['灵力'] && Object.keys(attrs).length === 1) calibratedPart = '项链';
            else if (attrs['防御'] && hasGreen) calibratedPart = '衣服';
            if (calibratedPart && (!result.part || result.part !== calibratedPart)) { result.part = calibratedPart; console.log(`✅ 部位已校准为: ${result.part}`); }
        }
        console.log('📦 解析结果:', result); return result;
    },

    showCandidateSelect(candidates, parsedData) {
        const oldOverlay = document.getElementById('candidateSelectOverlay'); if (oldOverlay) oldOverlay.remove();
        const overlay = document.createElement('div'); overlay.id = 'candidateSelectOverlay'; overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';
        let listHtml = candidates.map(name => `<button class="candidate-option" data-name="${name}" style="display:block;width:100%;padding:10px 16px;margin:4px 0;border:1px solid #d0dce8;border-radius:12px;background:white;font-size:0.95rem;cursor:pointer;text-align:left;transition:all 0.2s;">${name}</button>`).join('');
        overlay.innerHTML = `<div style="background:#f8faff;border-radius:24px;padding:24px 28px 28px;max-width:400px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.5);"><h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.1rem;">⚠️ 多个匹配</h3><div style="font-size:0.85rem;color:#5a7a94;margin-bottom:14px;">OCR识别到多个可能装备，请选择正确的：</div><div style="max-height:300px;overflow-y:auto;">${listHtml}</div><div style="margin-top:14px;text-align:right;"><button id="candidateCancelBtn" style="padding:6px 20px;border-radius:30px;border:none;background:#dce5ef;color:#1f3b53;font-weight:600;cursor:pointer;font-size:0.85rem;">取消</button></div></div>`;
        document.body.appendChild(overlay);
        overlay.querySelectorAll('.candidate-option').forEach(btn => {
            btn.addEventListener('click', function() { const parsed = parsedData; parsed.name = this.dataset.name; EquipmentQueryModule.fillRecognizedData(parsed); EquipmentQueryModule.render(); overlay.remove(); });
        });
        document.getElementById('candidateCancelBtn').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    fillRecognizedData(parsed) {
        if (!parsed) return;
        this.updateMeltInputs();
        if (parsed.level && this.levels.includes(parsed.level)) { this.currentLevel = parsed.level; document.querySelectorAll('.eq-btn-level').forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.value) === parsed.level)); }
        if (parsed.part) { const parts = Object.keys(this.equipmentData[this.currentLevel] || {}); if (parts.includes(parsed.part)) { this.currentPart = parsed.part; document.querySelectorAll('.eq-btn-part').forEach(btn => btn.classList.toggle('active', btn.dataset.value === parsed.part)); } }
        if (parsed.craftType && ['普通', '强化'].includes(parsed.craftType)) { this.currentType = parsed.craftType; document.querySelectorAll('.eq-btn-type').forEach(btn => btn.classList.toggle('active', btn.dataset.value === parsed.craftType)); }
        if (parsed.attrs) { for (let [attr, val] of Object.entries(parsed.attrs)) { const input = document.getElementById(`eqAttr_${attr}`); if (input) { input.value = val; this.inputValues[attr] = val; } } }
        this.render();
    },

    updateMeltInputs() {
        const container = document.getElementById('eqAttrInputArea'); if (!container) return;
        const part = this.currentPart; const meltInfo = this.meltData[part]; if (!meltInfo) { container.innerHTML = '<div style="color:#6c87a0;">该部位暂无熔炼数据</div>'; return; }
        const attrList = meltInfo.可输入 || meltInfo.可熔炼;
        let html = '';
        for (let attr of attrList) {
            const val = this.inputValues[attr] !== undefined ? this.inputValues[attr] : '';
            const placeholder = attr === '耐久' ? '输入耐久' : '输入数值(负值允许)';
            const isMeltable = meltInfo.可熔炼 && meltInfo.可熔炼.includes(attr);
            const hint = (!isMeltable && part === '武器' && (attr === '伤害' || attr === '命中')) ? ' ⚠️不可熔炼' : '';
            html += `<div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;position:relative;"><label style="font-weight:500;min-width:45px;color:#1f3b53;">${attr}${hint}：</label><input type="number" id="eqAttr_${attr}" class="eq-attr-input" step="0.1" value="${val}" placeholder="${placeholder}" style="flex:1;min-width:80px;padding:6px 30px 6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.85rem;text-align:center;transition:all 0.2s;"><button class="eq-clear-btn" data-target="eqAttr_${attr}" style="position:absolute;right:6px;background:transparent;border:none;color:#999;cursor:pointer;font-size:0.9rem;padding:0 4px;line-height:1;">×</button></div>`;
        }
        container.innerHTML = html; this.bindInputEvents();
    },

    updateQueryResult() {
        const level = this.currentLevel, part = this.currentPart, type = this.currentType, el = document.getElementById('eqCraftResult');
        const inputValues = {};
        document.querySelectorAll('.eq-attr-input').forEach(inp => { const attr = inp.id.replace('eqAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val)) inputValues[attr] = val; });
        const partData = this.equipmentData[level]?.[part]; if (!partData) { el.innerHTML = '<div style="color:#6c87a0;">暂无数据</div>'; return; }
        let data = (level === 160) ? partData['强化'] || {} : partData[type] || partData['普通'] || {};
        const durability = level >= 130 ? 650 : level >= 100 ? 500 : 400;
        const meltInfo = this.meltData[part];
        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">${level}级 ${part} (${type}打造)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;
        for (let attr of Object.keys(data)) {
            const range = data[attr]; const userVal = inputValues[attr];
            let status = '', statusColor = '#5a7a94', statusText = '';
            if (userVal !== undefined && !isNaN(userVal) && userVal !== 0) {
                if (userVal >= range[1]) { status = ' ⭐ 满属性！'; statusColor = '#dbbd7c'; }
                else if (userVal >= range[0]) { status = ' ✅ 达标'; statusColor = '#2d6b2d'; }
                else { status = ' ⚠️ 未达下限'; statusColor = '#c0392b'; }
                statusText = `(${userVal}${status})`;
            }
            html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;background:${userVal !== undefined && !isNaN(userVal) && userVal !== 0 ? '#f8faff' : 'transparent'};border-radius:4px;"><span>${attr}</span><span><span style="font-weight:600;color:#1f3b53;">${range[0]} - ${range[1]}</span>${statusText ? `<span style="color:${statusColor};font-weight:600;margin-left:6px;">${statusText}</span>` : ''}</span></div>`;
        }
        const userDur = inputValues['耐久'];
        let durStatus = '', durColor = '#5a7a94', durText = '';
        if (userDur !== undefined && !isNaN(userDur) && userDur > 0) {
            if (userDur >= 100) { durStatus = ' ✅ 可熔炼'; durColor = '#2d6b2d'; }
            else { durStatus = ' ⚠️ 耐久不足100'; durColor = '#c0392b'; }
            durText = `(${userDur}${durStatus})`;
        }
        html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;background:${userDur !== undefined && !isNaN(userDur) && userDur > 0 ? '#f8faff' : 'transparent'};"><span>耐久</span><span><span style="font-weight:600;color:#1f3b53;">${durability}</span>${durText ? `<span style="color:${durColor};font-weight:600;margin-left:6px;">${durText}</span>` : ''}</span></div>`;
        html += `</div>`;
        if (meltInfo && meltInfo.说明) html += `<div style="font-size:0.75rem;color:#5a7a94;margin-top:6px;padding-top:6px;border-top:1px solid #eef2f7;">💡 ${meltInfo.说明}</div>`;
        el.innerHTML = html;
    },

    calculateMelt() {
        const level = this.currentLevel, part = this.currentPart, el = document.getElementById('eqMeltResult');
        const values = {}; let hasValue = false;
        document.querySelectorAll('.eq-attr-input').forEach(inp => { const attr = inp.id.replace('eqAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val) && val !== 0) { values[attr] = val; hasValue = true; } });
        if (!hasValue) { el.innerHTML = '<div style="color:#5a7a94;font-size:0.95rem;">请输入属性值后自动计算</div>'; return; }
        const meltInfo = this.meltData[part]; if (!meltInfo) { el.innerHTML = '<div style="color:#c0392b;font-size:0.95rem;">⚠️ 该部位暂无熔炼数据</div>'; return; }
        const partData = this.equipmentData[level]?.[part]; let craftData = {};
        if (partData) craftData = (level === 160) ? partData['强化'] || {} : partData['强化'] || partData['普通'] || {};
        const green = this.greenLimit[level]; if (!green) { el.innerHTML = '<div style="color:#c0392b;font-size:0.95rem;">⚠️ 该等级暂无绿字熔炼数据</div>'; return; }
        const statAttrs = ['体质', '魔力', '力量', '耐力', '敏捷']; const isWeaponOrCloth = (part === '武器' || part === '衣服');
        let greenType = 'none', positiveStats = [], negativeStats = [], positiveCount = 0, hasNegative = false;
        if (isWeaponOrCloth) {
            for (let attr of statAttrs) { if (values[attr] !== undefined && values[attr] !== 0) { if (values[attr] > 0) { positiveStats.push(attr); positiveCount++; } else if (values[attr] < 0) { negativeStats.push(attr); hasNegative = true; } } }
            if (positiveCount === 1 && !hasNegative) greenType = 'single';
            else if (positiveCount === 1 && hasNegative) greenType = 'plusMinus';
            else if (positiveCount >= 2) greenType = 'double';
        }
        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;font-size:1rem;">📊 ${level}级 ${part} 熔炼分析</div>`;
        if (isWeaponOrCloth && greenType !== 'none') {
            const typeLabels = { 'single': '单加', 'plusMinus': '一加一减', 'double': '双加' };
            const typeColors = { 'single': '#2d6b2d', 'plusMinus': '#b48b3a', 'double': '#2980b9' };
            html += `<div style="background:#f0f5fb;border-radius:10px;padding:6px 14px;margin-bottom:8px;font-size:0.9rem;border:1px solid #d0dce8;"><span style="font-weight:600;">📌 识别为：</span><span style="font-weight:700;color:${typeColors[greenType]};">${typeLabels[greenType]}</span></div>`;
        }
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">`; let hasResult = false;
        for (let [attr, val] of Object.entries(values)) {
            if (val === 0) continue; if (part === '武器' && (attr === '伤害' || attr === '命中')) continue;
            if (statAttrs.includes(attr) && isWeaponOrCloth) {
                let maxValue = null, formulaType = '', limitName = '';
                if (greenType === 'single') { maxValue = green.single; formulaType = 'green'; limitName = `单加上限 ${maxValue}`; }
                else if (greenType === 'plusMinus') { if (val > 0) { maxValue = green.plusMinus; formulaType = 'green'; limitName = `一加一减(正)上限 ${maxValue}`; } else { maxValue = green.negativeMax; formulaType = 'negative'; limitName = `一加一减(负)上限 -1`; } }
                else if (greenType === 'double') { maxValue = green.double; formulaType = 'green'; limitName = `双加上限 ${maxValue}`; }
                else { html += `<div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;color:#b45a5a;font-size:0.9rem;"><span>${attr}</span><span>⚠️ 无法识别绿字类型</span></div>`; continue; }
                let canMelt = (formulaType === 'negative') ? Math.max(0, Math.round((maxValue - val) * 10) / 10) : Math.max(0, Math.round((maxValue - val) * 10) / 10);
                const maxFinal = val + canMelt; const isMaxed = canMelt <= 0.1;
                let statusIcon = isMaxed ? '✅ 已达上限' : `可熔炼 +${canMelt.toFixed(1)}`;
                let statusColor = isMaxed ? '#c0392b' : '#2d6b2d';
                html += `<div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f4f8;border-radius:6px;background:${isMaxed ? '#f5f0e8' : '#f8faff'};font-size:0.9rem;"><span style="font-weight:500;min-width:60px;">${attr}</span><span style="text-align:right;"><div style="color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div><div style="color:${statusColor};font-weight:600;">${statusIcon}</div><div style="color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div><div style="font-size:0.7rem;color:#8a9aa8;">${limitName}</div></span></div>`;
                hasResult = true; continue;
            }
            if (attr === '耐久') { html += `<div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;font-size:0.9rem;"><span>耐久</span><span style="font-weight:600;color:#1f3b53;">当前 ${val} ${val >= 100 ? '✅ 可熔炼' : '⚠️ 不足100'}</span></div>`; continue; }
            if (part === '武器' && (attr === '伤害' || attr === '命中')) continue;
            let maxCraft = (craftData && craftData[attr]) ? craftData[attr][1] : null;
            if (maxCraft === null || maxCraft === 0) { html += `<div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #f0f4f8;color:#b45a5a;font-size:0.9rem;"><span>${attr}</span><span>⚠️ 暂无熔炼数据</span></div>`; continue; }
            let canMelt = Math.max(0, Math.round((maxCraft - val) / 1.5 * 10) / 10);
            const maxFinal = val + canMelt; const isMaxed = canMelt <= 0.1;
            let statusIcon = isMaxed ? '✅ 已达上限' : `可熔炼 +${canMelt.toFixed(1)}`;
            let statusColor = isMaxed ? '#c0392b' : '#2d6b2d';
            html += `<div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f4f8;border-radius:6px;background:${isMaxed ? '#f5f0e8' : '#f8faff'};font-size:0.9rem;"><span style="font-weight:500;min-width:60px;">${attr}</span><span style="text-align:right;"><div style="color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div><div style="color:${statusColor};font-weight:600;">${statusIcon}</div><div style="color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div><div style="font-size:0.7rem;color:#8a9aa8;">强化最高 ${maxCraft} → 熔炼上限</div></span></div>`;
            hasResult = true;
        }
        html += `</div>`;
        if (!hasResult) html += '<div style="color:#5a7a94;padding:8px 0;font-size:0.9rem;">请输入可熔炼的属性值</div>';
        html += `<div style="font-size:0.75rem;color:#5a7a94;margin-top:8px;padding-top:6px;border-top:1px solid #eef2f7;line-height:1.6;">💡 <strong>绿字熔炼：</strong>上限值 - 当前值（负面属性最高到 -1）<br>💡 <strong>基础主属性熔炼：</strong>(强化最高 - 当前值) ÷ 1.5（差距±1）<br>💡 不管装备是不是强化打造，统一按强化打造的"最高属性"计算<br>💡 武器只能熔炼绿字属性，伤害和命中无法熔炼<br>💡 熔炼条件：装备等级 ≥ 60、当前耐久 ≥ 100</div>`;
        el.innerHTML = html;
    },

    calculateScore() {
        const level = this.currentLevel, part = this.currentPart, el = document.getElementById('eqScoreResult');
        if (!el) return;
        const values = {};
        document.querySelectorAll('.eq-attr-input').forEach(inp => { const attr = inp.id.replace('eqAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val) && val !== 0) values[attr] = val; });
        if (Object.keys(values).length === 0) { el.innerHTML = '<div style="color:#8ab0c8;">请输入属性值后自动评估</div>'; return; }
        const partData = this.equipmentData[level]?.[part]; if (!partData) { el.innerHTML = '<div style="color:#8ab0c8;">暂无数据</div>'; return; }
        let craftData = (level === 160) ? partData['强化'] || {} : partData['强化'] || partData['普通'] || {};
        const statAttrs = ['体质', '魔力', '力量', '耐力', '敏捷']; const isWeaponOrCloth = (part === '武器' || part === '衣服');
        let totalScore = 0, maxScore = 0, scoreDetails = [];
        for (let [attr, val] of Object.entries(values)) {
            if (attr === '耐久') continue; if (part === '武器' && (attr === '伤害' || attr === '命中')) continue;
            let maxVal = null, attrLabel = attr;
            if (statAttrs.includes(attr) && isWeaponOrCloth) {
                let positiveCount = 0, hasNegative = false;
                for (let sa of statAttrs) { if (values[sa] !== undefined && values[sa] > 0) positiveCount++; if (values[sa] !== undefined && values[sa] < 0) hasNegative = true; }
                const green = this.greenLimit[level]; if (!green) continue;
                if (positiveCount === 1 && !hasNegative) { maxVal = green.single; attrLabel = attr + '(单加)'; }
                else if (positiveCount === 1 && hasNegative) { if (val > 0) { maxVal = green.plusMinus; attrLabel = attr + '(一加一减正)'; } else continue; }
                else if (positiveCount >= 2) { maxVal = green.double; attrLabel = attr + '(双加)'; }
                else continue;
            } else if (craftData && craftData[attr]) { maxVal = craftData[attr][1]; }
            if (!maxVal || maxVal === 0) continue;
            const pct = Math.min(100, (val / maxVal) * 100); totalScore += pct; maxScore += 100;
            scoreDetails.push({ attr: attrLabel, val, maxVal, pct });
        }
        let overallPct = 0, rating = '', ratingColor = '', ratingBg = '';
        if (maxScore > 0) {
            overallPct = totalScore / maxScore;
            if (overallPct >= 0.9) { rating = '🌟 极品'; ratingColor = '#f0d060'; ratingBg = 'rgba(240,208,96,0.15)'; }
            else if (overallPct >= 0.7) { rating = '✅ 优秀'; ratingColor = '#60d080'; ratingBg = 'rgba(96,208,128,0.15)'; }
            else if (overallPct >= 0.5) { rating = '📊 中等'; ratingColor = '#60b0e0'; ratingBg = 'rgba(96,176,224,0.15)'; }
            else if (overallPct >= 0.3) { rating = '⚠️ 一般'; ratingColor = '#e0a060'; ratingBg = 'rgba(224,160,96,0.15)'; }
            else { rating = '❌ 较差'; ratingColor = '#e06060'; ratingBg = 'rgba(224,96,96,0.15)'; }
        } else { overallPct = 0; rating = '📭 无有效属性'; ratingColor = '#8ab0c8'; ratingBg = 'rgba(138,176,200,0.10)'; }
        let html = `<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:10px;padding:12px 16px;background:${ratingBg};border-radius:12px;border:1px solid ${ratingColor}40;"><div style="font-size:1.4rem;font-weight:700;color:${ratingColor};">${rating}</div><div style="font-size:1.1rem;color:#e0e8f0;">综合评分 <span style="font-weight:700;color:#ffffff;">${(overallPct * 100).toFixed(0)}%</span></div><div style="font-size:0.75rem;color:#8ab0c8;flex:1;text-align:right;">基于 ${scoreDetails.length} 项属性评估</div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;">`;
        for (let d of scoreDetails) { const color = d.pct >= 80 ? '#60d080' : d.pct >= 50 ? '#60b0e0' : '#e0a060'; html += `<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 10px;text-align:center;border:1px solid rgba(255,255,255,0.08);"><div style="font-size:0.7rem;color:#8ab0c8;">${d.attr}</div><div style="font-size:1rem;font-weight:600;color:#ffffff;">${d.val}</div><div style="font-size:0.6rem;color:${color};">${d.pct.toFixed(0)}%</div></div>`; }
        html += `</div>`; el.innerHTML = html;
    },

    calculateWeaponScore() {
        const level = this.currentLevel, part = this.currentPart, el = document.getElementById('eqWeaponResult');
        if (!el || part !== '武器') { if (el) el.innerHTML = ''; return; }
        const values = {};
        document.querySelectorAll('.eq-attr-input').forEach(inp => { const attr = inp.id.replace('eqAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val) && val !== 0) values[attr] = val; });
        const damage = values['伤害'] || 0, hit = values['命中'] || 0;
        if (!damage && !hit) { el.innerHTML = '<div style="color:#8ab0c8;">请输入伤害和命中后自动计算</div>'; return; }
        const type = this.currentType, partData = this.equipmentData[level]?.[part]; if (!partData) { el.innerHTML = '<div style="color:#8ab0c8;">暂无数据</div>'; return; }
        let data = (level === 160) ? partData['强化'] || {} : partData[type] || partData['普通'] || {};
        const damageRange = data['伤害'] || [0, 0], hitRange = data['命中'] || [0, 0];
        const totalDamage = damage + hit / 3; const maxTotalDamage = damageRange[1] + hitRange[1] / 3; const minTotalDamage = damageRange[0] + hitRange[0] / 3;
        const pct = maxTotalDamage > 0 ? (totalDamage / maxTotalDamage * 100) : 0;
        let rating = '', ratingColor = '', ratingBg = '';
        if (pct >= 95) { rating = '🌟 极品'; ratingColor = '#f0d060'; ratingBg = 'rgba(240,208,96,0.15)'; }
        else if (pct >= 85) { rating = '✅ 优秀'; ratingColor = '#60d080'; ratingBg = 'rgba(96,208,128,0.15)'; }
        else if (pct >= 70) { rating = '📊 中等'; ratingColor = '#60b0e0'; ratingBg = 'rgba(96,176,224,0.15)'; }
        else if (pct >= 50) { rating = '⚠️ 一般'; ratingColor = '#e0a060'; ratingBg = 'rgba(224,160,96,0.15)'; }
        else { rating = '❌ 较差'; ratingColor = '#e06060'; ratingBg = 'rgba(224,96,96,0.15)'; }
        let html = `<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:10px;padding:12px 16px;background:${ratingBg};border-radius:12px;border:1px solid ${ratingColor}40;"><div style="font-size:1.4rem;font-weight:700;color:${ratingColor};">${rating}</div><div style="font-size:1.1rem;color:#e0e8f0;">总伤 <span style="font-weight:700;color:#ffffff;">${totalDamage.toFixed(1)}</span></div><div style="font-size:0.85rem;color:#8ab0c8;">国标 <span style="color:#e0e8f0;">${minTotalDamage.toFixed(1)}</span> → 满 <span style="color:#f0d060;">${maxTotalDamage.toFixed(1)}</span></div><div style="font-size:0.85rem;color:#8ab0c8;flex:1;text-align:right;">${pct.toFixed(0)}%</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;"><div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;text-align:center;border:1px solid rgba(255,255,255,0.08);"><div style="font-size:0.7rem;color:#8ab0c8;">伤害</div><div style="font-size:1.1rem;font-weight:600;color:#ffffff;">${damage || '-'}</div><div style="font-size:0.6rem;color:#5a7a94;">(${damageRange[0]} - ${damageRange[1]})</div></div><div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;text-align:center;border:1px solid rgba(255,255,255,0.08);"><div style="font-size:0.7rem;color:#8ab0c8;">命中</div><div style="font-size:1.1rem;font-weight:600;color:#ffffff;">${hit || '-'}</div><div style="font-size:0.6rem;color:#5a7a94;">(${hitRange[0]} - ${hitRange[1]})</div></div></div><div style="font-size:0.65rem;color:#5a7a94;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">💡 总伤 = 伤害 + 命中/3（人族/魔族），仙族为 伤害 + 命中/3.6</div>`;
        el.innerHTML = html;
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EquipmentQueryModule.init());
} else {
    EquipmentQueryModule.init();
}

window.EquipmentQueryModule = EquipmentQueryModule;
