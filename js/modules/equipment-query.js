// ============================================================
//  ⚔️ 装备打造 & 熔炼查询模块 - 最终版
//  数据来源：梦幻精灵 2026年7月
//  所有数据已锁定，不再变动
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
        fontSize: 14
    },

    // ========== 数据 ==========
    levels: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
    currentLevel: 130,
    currentPart: '武器',
    currentType: '普通',
    inputValues: {},

    // ============================================================
    //  ✅ 基础主属性数据（已锁定 60-160级）
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
    //  ✅ 绿字附加属性上限（已锁定）
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
    //  ✅ 熔炼规则说明
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
            fontSize: 14
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

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.module .title, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, select, input, button').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });

        container.querySelectorAll('.module .title').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 2) + 'px', 'important');
        });
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('equipmentQueryContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- UI设置 -->
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

            <!-- 装备信息输入 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📝 装备信息输入 <span class="hint">— 选择装备，输入属性值自动对比</span></div>
                    <div style="font-size:0.7rem;color:#5a7a94;">
                        <span style="background:#e8f0e8;padding:2px 12px;border-radius:30px;">💡 负值表示"一加一减"中的减项</span>
                    </div>
                </div>
                <div class="module-body">
                    <div style="display:flex;flex-wrap:wrap;gap:8px 12px;margin-bottom:10px;">
                        <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;color:#1f3b53;">
                            <label style="font-weight:600;">等级：</label>
                            <select id="eqLevel" style="padding:4px 8px;border:1px solid #bccad9;border-radius:16px;font-size:0.75rem;background:white;">
                                ${this.levels.map(l => `<option value="${l}" ${l === this.currentLevel ? 'selected' : ''}>${l}级</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;color:#1f3b53;">
                            <label style="font-weight:600;">部位：</label>
                            <select id="eqPart" style="padding:4px 8px;border:1px solid #bccad9;border-radius:16px;font-size:0.75rem;background:white;">
                                ${Object.keys(this.equipmentData[this.currentLevel] || {}).map(p => 
                                    `<option value="${p}" ${p === this.currentPart ? 'selected' : ''}>${p}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;color:#1f3b53;">
                            <label style="font-weight:600;">打造：</label>
                            <select id="eqType" style="padding:4px 8px;border:1px solid #bccad9;border-radius:16px;font-size:0.75rem;background:white;">
                                <option value="普通" ${this.currentType === '普通' ? 'selected' : ''}>普通打造</option>
                                <option value="强化" ${this.currentType === '强化' ? 'selected' : ''}>强化打造</option>
                            </select>
                        </div>
                    </div>

                    <div id="eqAttrInputArea" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;padding:8px 0;border-top:1px solid #eef2f7;">
                        <!-- 由 updateMeltInputs 动态生成 -->
                    </div>
                    <div style="font-size:0.65rem;color:#5a7a94;margin-top:4px;text-align:right;">
                        💡 输入负数表示"一加一减"中的减项（如 -1）
                    </div>
                </div>
            </div>

            <!-- 打造属性范围 -->
            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📊 打造属性范围 <span class="hint">— 灰色=未达下限，绿色=达标，金色=满属性</span></div>
                </div>
                <div class="module-body">
                    <div id="eqCraftResult" style="font-size:0.85rem;color:#5a7a94;">
                        请选择装备等级和部位
                    </div>
                </div>
            </div>

            <!-- 熔炼计算 -->
            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">🔥 熔炼上限计算 <span class="hint">— 根据当前属性自动计算可熔炼上限</span></div>
                </div>
                <div class="module-body">
                    <div id="eqMeltResult" style="font-size:0.85rem;color:#5a7a94;">
                        请输入属性值后自动计算
                    </div>
                </div>
            </div>

            <!-- 说明 -->
            <div class="module" style="margin-top:12px;">
                <div class="module-header">
                    <div class="title">💡 使用说明</div>
                </div>
                <div class="module-body" style="font-size:0.8rem;color:#5a7a94;line-height:1.8;">
                    <div>• 选择装备等级和部位，自动显示可输入属性</div>
                    <div>• 输入属性值后，自动对比打造范围（高亮显示是否达标）</div>
                    <div>• <strong>绿字属性区分三种情况：</strong></div>
                    <div style="padding-left:20px;">
                        <span style="color:#2d6b2d;">单加</span>：只有1个正面属性（如 体质+14）
                        <br>
                        <span style="color:#b48b3a;">一加一减</span>：1个正面 + 1个负面（如 体质+19，耐力-1）
                        <br>
                        <span style="color:#2980b9;">双加</span>：2个或以上正面属性（如 体质+11，耐力+11）
                    </div>
                    <div>• <strong>绿字熔炼公式：</strong>上限值 - 当前值（负面属性最高到 -1）</div>
                    <div>• <strong>基础主属性熔炼公式：</strong>(强化最高 - 当前值) / 1.5（差距±1）</div>
                    <div>• 武器只能熔炼绿字属性，伤害和命中无法熔炼</div>
                    <div>• 熔炼条件：装备等级 ≥ 60、当前耐久 ≥ 100</div>
                    <div>• 💡 不管装备是不是强化打造，统一按强化打造的"最高属性"计算</div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        // UI设置
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
                    fontSize: 14
                };
                document.getElementById('eqBgColor').value = EquipmentQueryModule.uiSettings.bgColor;
                document.getElementById('eqCardColor').value = EquipmentQueryModule.uiSettings.cardBgColor;
                document.getElementById('eqBtnColor').value = EquipmentQueryModule.uiSettings.btnColor;
                document.getElementById('eqTextColor').value = EquipmentQueryModule.uiSettings.textColor;
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

        // 选择事件
        document.getElementById('eqLevel').addEventListener('change', (e) => {
            this.currentLevel = parseInt(e.target.value);
            const partSelect = document.getElementById('eqPart');
            const parts = Object.keys(this.equipmentData[this.currentLevel] || {});
            partSelect.innerHTML = parts.map(p => 
                `<option value="${p}" ${p === this.currentPart ? 'selected' : ''}>${p}</option>`
            ).join('');
            if (!parts.includes(this.currentPart)) {
                this.currentPart = parts[0] || '武器';
                partSelect.value = this.currentPart;
            }
            this.render();
        });

        document.getElementById('eqPart').addEventListener('change', (e) => {
            this.currentPart = e.target.value;
            this.render();
        });

        document.getElementById('eqType').addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.render();
        });

        // 属性输入变化时只更新结果，不重新渲染
        document.addEventListener('input', function(e) {
            if (e.target.classList && e.target.classList.contains('eq-attr-input')) {
                const attr = e.target.id.replace('eqAttr_', '');
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                    EquipmentQueryModule.inputValues[attr] = val;
                }
                EquipmentQueryModule.calculateMelt();
                EquipmentQueryModule.updateQueryResult();
            }
        });
    },

    // ========== 更新输入框 ==========
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
                <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;">
                    <label style="font-weight:500;min-width:45px;color:#1f3b53;">${attr}：</label>
                    <input type="number" id="eqAttr_${attr}" class="eq-attr-input" step="0.1" value="${val}" placeholder="${placeholder}" style="width:80px;padding:3px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;text-align:center;">
                </div>
            `;
        }
        container.innerHTML = html;
    },

    // ========== 更新装备查询结果 ==========
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

        // 160级只有强化打造
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

        // 显示耐久
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
    //  ✅ 熔炼计算（核心逻辑）
    //  规则：
    //  1. 绿字（武器/衣服）：单加/一加一减/双加，用 greenLimit 上限
    //  2. 负面属性：最高到 -1
    //  3. 基础主属性：(强化最高 - 当前值) / 1.5
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

        // 获取该等级强化打造的最高值（用于基础主属性熔炼）
        const partData = this.equipmentData[level]?.[part];
        let craftData = {};
        if (partData) {
            if (level === 160) {
                craftData = partData['强化'] || {};
            } else {
                craftData = partData['强化'] || partData['普通'] || {};
            }
        }

        // 获取绿字上限
        const green = this.greenLimit[level];
        if (!green) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无绿字熔炼数据</div>';
            return;
        }

        const statAttrs = ['体质', '魔力', '力量', '耐力', '敏捷'];
        const isWeaponOrCloth = (part === '武器' || part === '衣服');

        // 分析绿字类型（仅对武器/衣服）
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

        // 显示绿字类型判断
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

            // ===== 1. 绿字属性（武器/衣服的属性点） =====
            if (statAttrs.includes(attr) && isWeaponOrCloth) {
                let maxValue = null;
                let formulaType = '';
                let limitName = '';

                if (greenType === 'single') {
                    // 单加
                    maxValue = green.single;
                    formulaType = 'green';
                    limitName = `单加上限 ${maxValue}`;
                } else if (greenType === 'plusMinus') {
                    if (val > 0) {
                        // 正面属性
                        maxValue = green.plusMinus;
                        formulaType = 'green';
                        limitName = `一加一减(正)上限 ${maxValue}`;
                    } else {
                        // 负面属性：上限 -1
                        maxValue = green.negativeMax;
                        formulaType = 'negative';
                        limitName = `一加一减(负)上限 -1`;
                    }
                } else if (greenType === 'double') {
                    // 双加
                    maxValue = green.double;
                    formulaType = 'green';
                    limitName = `双加上限 ${maxValue}`;
                } else {
                    // 没有识别到类型（全负面等），跳过
                    html += `
                        <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;color:#b45a5a;">
                            <span>${attr}</span>
                            <span>⚠️ 无法识别绿字类型</span>
                        </div>
                    `;
                    continue;
                }

                // 计算可熔炼值
                let canMelt;
                if (formulaType === 'negative') {
                    // 负面属性：计算到 -1 还差多少
                    canMelt = maxValue - val;  // maxValue = -1
                    if (canMelt < 0) canMelt = 0;
                    canMelt = Math.round(canMelt * 10) / 10;
                } else {
                    // 正面属性：上限值 - 当前值
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

            // ===== 2. 耐久 =====
            if (attr === '耐久') {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;">
                        <span>耐久</span>
                        <span style="font-weight:600;color:#1f3b53;">当前 ${val} ${val >= 100 ? '✅ 可熔炼' : '⚠️ 不足100'}</span>
                    </div>
                `;
                continue;
            }

            // ===== 3. 基础主属性（非绿字） =====
            // 使用公式：(强化最高 - 当前值) / 1.5
            // 但武器/衣服的绿字已经在上面处理了，这里只处理非绿字属性
            // 对于武器，伤害和命中不可熔炼
            if (part === '武器' && (attr === '伤害' || attr === '命中')) {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;color:#b45a5a;">
                        <span>${attr}</span>
                        <span>⚠️ 该属性无法熔炼</span>
                    </div>
                `;
                continue;
            }

            // 检查是否有强化最高值
            let maxCraft = null;
            if (craftData && craftData[attr]) {
                maxCraft = craftData[attr][1];  // 取最高值
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

            // ✅ 基础主属性熔炼公式：(强化最高 - 当前值) / 1.5
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
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EquipmentQueryModule.init());
} else {
    EquipmentQueryModule.init();
}

window.EquipmentQueryModule = EquipmentQueryModule;
