// ============================================================
//  ⚔️ 装备打造 & 熔炼查询 + 🐾 宠装查询（整合版）
//  数据来源：梦幻精灵 2026年7月 + 端游玩家社群整理
//  优化：按钮式选择 + 输入框放大 + 清除按钮 + 重置全部 + 装备评分
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
            "说明": "武器只能熔炼绿字属性，伤害和命中无法熔炼。"
        },
        "衣服": {
            "可熔炼": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": [],
            "说明": "衣服可熔炼防御和绿字属性。"
        },
        "项链": {
            "可熔炼": ["灵力", "耐久"],
            "不可熔炼": [],
            "说明": ""
        },
        "帽子": {
            "可熔炼": ["防御", "魔法", "耐久"],
            "不可熔炼": [],
            "说明": ""
        },
        "腰带": {
            "可熔炼": ["防御", "气血", "耐久"],
            "不可熔炼": [],
            "说明": ""
        },
        "鞋子": {
            "可熔炼": ["防御", "敏捷", "耐久"],
            "不可熔炼": [],
            "说明": ""
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

        const attrList = meltInfo.可熔炼;
        let html = '';
        for (let attr of attrList) {
            const val = this.inputValues[attr] !== undefined ? this.inputValues[attr] : '';
            const placeholder = attr === '耐久' ? '输入耐久' : '输入数值(负值允许)';
            html += `
                <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;position:relative;">
                    <label style="font-weight:500;min-width:45px;color:#1f3b53;">${attr}：</label>
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
            el.innerHTML = '<div style="color:#5a7a94;">请输入属性值后自动计算</div>';
            return;
        }

        const meltInfo = this.meltData[part];
        if (!meltInfo) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该部位暂无熔炼数据</div>';
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
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无绿字熔炼数据</div>';
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

        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">📊 ${level}级 ${part} 熔炼分析</div>`;

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
            html += `<div style="background:#f0f5fb;border-radius:10px;padding:4px 12px;margin-bottom:8px;font-size:0.8rem;border:1px solid #d0dce8;">
                <span style="font-weight:600;">📌 识别为：</span>
                <span style="font-weight:700;color:${typeColors[greenType]};">${typeLabels[greenType]}</span>
                ${greenType === 'plusMinus' ? `（正面: ${positiveStats.join('、')}，负面: ${negativeStats.join('、')}）` : ''}
                ${greenType === 'single' ? `（正面: ${positiveStats.join('、')}）` : ''}
                ${greenType === 'double' ? `（正面: ${positiveStats.join('、')}）` : ''}
            </div>`;
        }

        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;

        let hasResult = false;

        for (let [attr, val] of Object.entries(values)) {
            if (val === 0) continue;

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
                        <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;color:#b45a5a;">
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
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;grid-column:1/-1;background:${isMaxed ? '#f5f0e8' : '#f8faff'};">
                        <span style="font-weight:500;">${attr}</span>
                        <span style="text-align:right;">
                            <div style="font-size:0.75rem;color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div>
                            <div style="font-size:0.75rem;color:${statusColor};font-weight:600;">${statusIcon}</div>
                            <div style="font-size:0.7rem;color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div>
                            <div style="font-size:0.6rem;color:#8a9aa8;">${limitName}</div>
                        </span>
                    </div>
                `;
                hasResult = true;
                continue;
            }

            if (attr === '耐久') {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;">
                        <span>耐久</span>
                        <span style="font-weight:600;color:#1f3b53;">当前 ${val} ${val >= 100 ? '✅ 可熔炼' : '⚠️ 不足100'}</span>
                    </div>
                `;
                continue;
            }

            if (part === '武器' && (attr === '伤害' || attr === '命中')) {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;color:#b45a5a;">
                        <span>${attr}</span>
                        <span>⚠️ 该属性无法熔炼</span>
                    </div>
                `;
                continue;
            }

            let maxCraft = null;
            if (craftData && craftData[attr]) {
                maxCraft = craftData[attr][1];
            }

            if (maxCraft === null || maxCraft === 0) {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;color:#b45a5a;">
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
                <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;background:${isMaxed ? '#f5f0e8' : '#f8faff'};">
                    <span style="font-weight:500;">${attr}</span>
                    <span style="text-align:right;">
                        <div style="font-size:0.75rem;color:#5a7a94;">当前: <span style="font-weight:600;color:#1f3b53;">${val}</span></div>
                        <div style="font-size:0.75rem;color:${statusColor};font-weight:600;">${statusIcon}</div>
                        <div style="font-size:0.7rem;color:#5a7a94;">上限: <span style="font-weight:600;color:#1f3b53;">${maxFinal.toFixed(1)}</span></div>
                        <div style="font-size:0.6rem;color:#8a9aa8;">强化最高 ${maxCraft} → 熔炼上限</div>
                    </span>
                </div>
            `;
            hasResult = true;
        }

        html += `</div>`;

        if (!hasResult) {
            html += '<div style="color:#5a7a94;padding:8px 0;">请输入可熔炼的属性值</div>';
        }

        html += `
            <div style="font-size:0.7rem;color:#5a7a94;margin-top:8px;padding-top:6px;border-top:1px solid #eef2f7;">
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

        let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">`;

        const attackLimit = (limits['伤害'] || 0) + (limits['力量'] || 0);
        let attackRating = '', attackColor = '#5a7a94';
        if (attackValue >= attackLimit * 0.9) { attackRating = '🌟 超极品！'; attackColor = '#dbbd7c'; }
        else if (attackValue >= attackLimit * 0.7) { attackRating = '🔥 极品'; attackColor = '#2d6b2d'; }
        else if (attackValue >= attackLimit * 0.5) { attackRating = '📊 优秀'; attackColor = '#b48b3a'; }
        else if (attackValue > 0) { attackRating = '📉 一般'; attackColor = '#5a7a94'; }
        else { attackRating = '⬇️ 低价值'; attackColor = '#8a6a8a'; }

        html += `
            <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                <div style="font-weight:600;color:#1f3b53;">⚔️ 攻宠价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${attackColor};">${attackValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#5a7a94;">伤害+力量 = ${damage.toFixed(1)} + ${strength.toFixed(1)} | 极限 ${attackLimit}</div>
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
            <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                <div style="font-weight:600;color:#1f3b53;">🔮 法宠价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${magicColor};">${magicValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#5a7a94;">法力+灵力 = ${mana.toFixed(1)} + ${spirit.toFixed(1)} | 极限 ${magicLimit}</div>
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
            <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                <div style="font-weight:600;color:#1f3b53;">💨 配速价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${speedColor};">${speedValue.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#5a7a94;">速度+敏捷 = ${speed.toFixed(1)} + ${agility.toFixed(1)} | 极限 ${speedLimit}</div>
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
            <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                <div style="font-weight:600;color:#1f3b53;">🛡️ 防御价值</div>
                <div style="font-size:1.2rem;font-weight:700;color:${defColor};">${defense.toFixed(1)}</div>
                <div style="font-size:0.7rem;color:#5a7a94;">防御 = ${defense.toFixed(1)} | 极限 ${defLimit}</div>
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
