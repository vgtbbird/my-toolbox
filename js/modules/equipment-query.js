// ============================================================
//  ⚔️ 装备打造 & 熔炼查询模块 - 修正版
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
    levels: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
    currentLevel: 130,
    currentPart: '武器',
    currentType: '普通',
    inputValues: {},

    // ========== 装备打造数据 ==========
    equipmentData: {
        "60": {
            "武器": { "普通": { "命中": [230, 299], "伤害": [198, 257] }, "强化": { "命中": [241, 313], "伤害": [207, 269] } },
            "衣服": { "普通": { "防御": [105, 136] }, "强化": { "防御": [110, 143] } },
            "项链": { "普通": { "灵力": [68, 88] }, "强化": { "灵力": [71, 92] } },
            "鞋子": { "普通": { "防御": [36, 46], "敏捷": [24, 31] }, "强化": { "防御": [37, 48], "敏捷": [25, 32] } },
            "帽子": { "普通": { "防御": [36, 46], "魔法": [68, 88] }, "强化": { "防御": [37, 48], "魔法": [71, 92] } },
            "腰带": { "普通": { "防御": [35, 45], "气血": [136, 176] }, "强化": { "防御": [36, 47], "气血": [142, 184] } }
        },
        "70": {
            "武器": { "普通": { "命中": [270, 351], "伤害": [231, 300] }, "强化": { "命中": [283, 368], "伤害": [242, 315] } },
            "衣服": { "普通": { "防御": [120, 156] }, "强化": { "防御": [126, 163] } },
            "项链": { "普通": { "灵力": [78, 101] }, "强化": { "灵力": [81, 105] } },
            "鞋子": { "普通": { "防御": [42, 54], "敏捷": [27, 35] }, "强化": { "防御": [44, 57], "敏捷": [28, 36] } },
            "帽子": { "普通": { "防御": [42, 54], "魔法": [78, 101] }, "强化": { "防御": [44, 57], "魔法": [81, 105] } },
            "腰带": { "普通": { "防御": [40, 52], "气血": [157, 204] }, "强化": { "防御": [42, 54], "气血": [164, 213] } }
        },
        "80": {
            "武器": { "普通": { "命中": [290, 377], "伤害": [250, 325] }, "强化": { "命中": [304, 395], "伤害": [260, 341] } },
            "衣服": { "普通": { "防御": [130, 169] }, "强化": { "防御": [136, 177] } },
            "项链": { "普通": { "灵力": [85, 110] }, "强化": { "灵力": [89, 115] } },
            "鞋子": { "普通": { "防御": [45, 58], "敏捷": [29, 37] }, "强化": { "防御": [47, 60], "敏捷": [30, 39] } },
            "帽子": { "普通": { "防御": [45, 58], "魔法": [85, 110] }, "强化": { "防御": [47, 60], "魔法": [89, 115] } },
            "腰带": { "普通": { "防御": [45, 58], "气血": [178, 231] }, "强化": { "防御": [47, 60], "气血": [186, 242] } }
        },
        "90": {
            "武器": { "普通": { "命中": [325, 422], "伤害": [280, 364] }, "强化": { "命中": [341, 443], "伤害": [294, 382] } },
            "衣服": { "普通": { "防御": [152, 197] }, "强化": { "防御": [159, 206] } },
            "项链": { "普通": { "灵力": [101, 131] }, "强化": { "灵力": [106, 137] } },
            "鞋子": { "普通": { "防御": [52, 67], "敏捷": [33, 42] }, "强化": { "防御": [54, 70], "敏捷": [34, 44] } },
            "帽子": { "普通": { "防御": [52, 67], "魔法": [101, 131] }, "强化": { "防御": [54, 70], "魔法": [106, 137] } },
            "腰带": { "普通": { "防御": [50, 65], "气血": [199, 258] }, "强化": { "防御": [52, 68], "气血": [208, 270] } }
        },
        "100": {
            "武器": { "普通": { "命中": [355, 461], "伤害": [305, 396] }, "强化": { "命中": [372, 483], "伤害": [320, 416] } },
            "衣服": { "普通": { "防御": [168, 218] }, "强化": { "防御": [176, 228] } },
            "项链": { "普通": { "灵力": [112, 145] }, "强化": { "灵力": [117, 152] } },
            "鞋子": { "普通": { "防御": [57, 74], "敏捷": [36, 46] }, "强化": { "防御": [59, 77], "敏捷": [37, 48] } },
            "帽子": { "普通": { "防御": [57, 74], "魔法": [112, 145] }, "强化": { "防御": [59, 77], "魔法": [117, 152] } },
            "腰带": { "普通": { "防御": [55, 71], "气血": [220, 286] }, "强化": { "防御": [57, 74], "气血": [231, 300] } }
        },
        "110": {
            "武器": { "普通": { "命中": [390, 507], "伤害": [335, 435] }, "强化": { "命中": [409, 532], "伤害": [351, 456] } },
            "衣服": { "普通": { "防御": [183, 238] }, "强化": { "防御": [192, 249] } },
            "项链": { "普通": { "灵力": [123, 159] }, "强化": { "灵力": [129, 167] } },
            "鞋子": { "普通": { "防御": [63, 81], "敏捷": [39, 50] }, "强化": { "防御": [66, 85], "敏捷": [41, 52] } },
            "帽子": { "普通": { "防御": [63, 81], "魔法": [123, 159] }, "强化": { "防御": [66, 85], "魔法": [129, 167] } },
            "腰带": { "普通": { "防御": [60, 78], "气血": [241, 313] }, "强化": { "防御": [63, 81], "气血": [253, 328] } }
        },
        "120": {
            "武器": { "普通": { "命中": [425, 552], "伤害": [365, 474] }, "强化": { "命中": [446, 579], "伤害": [383, 497] } },
            "衣服": { "普通": { "防御": [199, 258] }, "强化": { "防御": [208, 270] } },
            "项链": { "普通": { "灵力": [134, 174] }, "强化": { "灵力": [140, 182] } },
            "鞋子": { "普通": { "防御": [68, 88], "敏捷": [43, 55] }, "强化": { "防御": [71, 92], "敏捷": [45, 57] } },
            "帽子": { "普通": { "防御": [68, 88], "魔法": [134, 174] }, "强化": { "防御": [71, 92], "魔法": [140, 182] } },
            "腰带": { "普通": { "防御": [65, 84], "气血": [262, 340] }, "强化": { "防御": [68, 88], "气血": [275, 357] } }
        },
        "130": {
            "武器": { "普通": { "命中": [465, 604], "伤害": [400, 520] }, "强化": { "命中": [488, 634], "伤害": [420, 546] } },
            "衣服": { "普通": { "防御": [215, 279] }, "强化": { "防御": [225, 292] } },
            "项链": { "普通": { "灵力": [144, 187] }, "强化": { "灵力": [151, 196] } },
            "鞋子": { "普通": { "防御": [73, 94], "敏捷": [46, 59] }, "强化": { "防御": [76, 98], "敏捷": [48, 61] } },
            "帽子": { "普通": { "防御": [73, 94], "魔法": [144, 187] }, "强化": { "防御": [76, 98], "魔法": [151, 196] } },
            "腰带": { "普通": { "防御": [70, 91], "气血": [283, 367] }, "强化": { "防御": [73, 95], "气血": [297, 385] } }
        },
        "140": {
            "武器": { "普通": { "命中": [500, 650], "伤害": [430, 559] }, "强化": { "命中": [525, 682], "伤害": [451, 586] } },
            "衣服": { "普通": { "防御": [231, 300] }, "强化": { "防御": [242, 314] } },
            "项链": { "普通": { "灵力": [156, 202] }, "强化": { "灵力": [163, 211] } },
            "鞋子": { "普通": { "防御": [78, 101], "敏捷": [49, 63] }, "强化": { "防御": [81, 105], "敏捷": [51, 66] } },
            "帽子": { "普通": { "防御": [78, 101], "魔法": [156, 202] }, "强化": { "防御": [81, 105], "魔法": [163, 211] } },
            "腰带": { "普通": { "防御": [75, 97], "气血": [304, 395] }, "强化": { "防御": [78, 101], "气血": [319, 414] } }
        },
        "150": {
            "武器": { "普通": { "命中": [540, 702], "伤害": [465, 604] }, "强化": { "命中": [567, 737], "伤害": [488, 634] } },
            "衣服": { "普通": { "防御": [246, 319] }, "强化": { "防御": [258, 335] } },
            "项链": { "普通": { "灵力": [169, 219] }, "强化": { "灵力": [177, 229] } },
            "鞋子": { "普通": { "防御": [84, 109], "敏捷": [52, 67] }, "强化": { "防御": [88, 114], "敏捷": [54, 70] } },
            "帽子": { "普通": { "防御": [84, 109], "魔法": [169, 219] }, "强化": { "防御": [88, 114], "魔法": [177, 229] } },
            "腰带": { "普通": { "防御": [80, 104], "气血": [325, 422] }, "强化": { "防御": [84, 109], "气血": [341, 443] } }
        }
    },

    // ========== 熔炼规则说明 ==========
    meltData: {
        "武器": {
            "可熔炼": ["体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": ["伤害", "命中"],
            "说明": "武器只能熔炼绿字属性，伤害和命中无法熔炼。白板武器熔炼只影响耐久。"
        },
        "衣服": {
            "可熔炼": ["防御", "体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": [],
            "说明": "只熔炼已有的属性类型"
        },
        "项链": {
            "可熔炼": ["灵力", "耐久"],
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
        },
        "帽子": {
            "可熔炼": ["防御", "魔法", "耐久"],
            "不可熔炼": [],
            "说明": ""
        }
    },

    // ========== 熔炼国标值（按三张表格修正） ==========
    standardValues: {
        "60": {
            "武器单加": 14,
            "武器双加单项": 11,
            "武器双加总和": 22,
            "衣服防御": 105,
            "项链灵力": 80,
            "头盔魔法": 105,
            "腰带气血": 136,
            "鞋子敏捷": 24,
            "头腰鞋防御": 36
        },
        "70": {
            "武器单加": 16,
            "武器双加单项": 13,
            "武器双加总和": 26,
            "衣服防御": 120,
            "项链灵力": 93,
            "头盔魔法": 120,
            "腰带气血": 156,
            "鞋子敏捷": 27,
            "头腰鞋防御": 42
        },
        "80": {
            "武器单加": 19,
            "武器双加单项": 15,
            "武器双加总和": 30,
            "衣服防御": 136,
            "项链灵力": 106,
            "头盔魔法": 137,
            "腰带气血": 177,
            "鞋子敏捷": 30,
            "头腰鞋防御": 47
        },
        "90": {
            "武器单加": 22,
            "武器双加单项": 17,
            "武器双加总和": 34,
            "衣服防御": 152,
            "项链灵力": 118,
            "头盔魔法": 153,
            "腰带气血": 197,
            "鞋子敏捷": 33,
            "头腰鞋防御": 52
        },
        "100": {
            "武器单加": 24,
            "武器双加单项": 19,
            "武器双加总和": 38,
            "衣服防御": 168,
            "项链灵力": 131,
            "头盔魔法": 170,
            "腰带气血": 218,
            "鞋子敏捷": 36,
            "头腰鞋防御": 57
        },
        "110": {
            "武器单加": 26,
            "武器双加单项": 21,
            "武器双加总和": 42,
            "衣服防御": 183,
            "项链灵力": 143,
            "头盔魔法": 186,
            "腰带气血": 238,
            "鞋子敏捷": 39,
            "头腰鞋防御": 63
        },
        "120": {
            "武器单加": 29,
            "武器双加单项": 23,
            "武器双加总和": 46,
            "衣服防御": 199,
            "项链灵力": 156,
            "头盔魔法": 202,
            "腰带气血": 259,
            "鞋子敏捷": 43,
            "头腰鞋防御": 68
        },
        "130": {
            "武器单加": 31,
            "武器双加单项": 25,
            "武器双加总和": 50,
            "衣服防御": 215,
            "项链灵力": 169,
            "头盔魔法": 219,
            "腰带气血": 279,
            "鞋子敏捷": 46,
            "头腰鞋防御": 73
        },
        "140": {
            "武器单加": 34,
            "武器双加单项": 27,
            "武器双加总和": 54,
            "衣服防御": 231,
            "项链灵力": 181,
            "头盔魔法": 235,
            "腰带气血": 300,
            "鞋子敏捷": 49,
            "头腰鞋防御": 78
        },
        "150": {
            "武器单加": 36,
            "武器双加单项": 29,
            "武器双加总和": 58,
            "衣服防御": 246,
            "项链灵力": 194,
            "头盔魔法": 252,
            "腰带气血": 320,
            "鞋子敏捷": 52,
            "头腰鞋防御": 84
        }
    },

    // ========== 生命周期 ==========
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
        if (tabContent) {
            tabContent.style.setProperty('background', s.bgColor, 'important');
        }
        const card = container.closest('.card');
        if (card) {
            card.style.setProperty('background', s.bgColor, 'important');
        }

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
                    <div>• 熔炼上限 = (强化最高值 - 当前装备初始属性) ÷ 1.5（差距±1）</div>
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
            const val = this.inputValues[attr] || '';
            html += `
                <div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;">
                    <label style="font-weight:500;min-width:45px;color:#1f3b53;">${attr}：</label>
                    <input type="number" id="eqAttr_${attr}" class="eq-attr-input" step="0.1" min="0" value="${val}" placeholder="输入值" style="width:70px;padding:3px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;text-align:center;">
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
            if (!isNaN(val) && val >= 0) {
                inputValues[attr] = val;
            }
        }

        const partData = this.equipmentData[level]?.[part];
        if (!partData) {
            el.innerHTML = '<div style="color:#6c87a0;">暂无数据</div>';
            return;
        }

        const data = partData[type] || partData['普通'] || {};
        const durability = level >= 130 ? 650 : level >= 100 ? 500 : 400;
        const meltInfo = this.meltData[part];

        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">${level}级 ${part} (${type}打造)</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;

        for (let [attr, range] of Object.entries(data)) {
            const userVal = inputValues[attr];
            let status = '';
            let statusColor = '#5a7a94';
            let statusText = '';
            if (userVal !== undefined && !isNaN(userVal) && userVal > 0) {
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
                <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;background:${userVal !== undefined && !isNaN(userVal) && userVal > 0 ? '#f8faff' : 'transparent'};border-radius:4px;">
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

    // ========== 熔炼计算（按表格修正） ==========
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
            if (!isNaN(val) && val > 0) {
                values[attr] = val;
                hasValue = true;
            }
        }

        if (!hasValue) {
            el.innerHTML = '<div style="color:#5a7a94;">请输入属性值后自动计算</div>';
            return;
        }

        const std = this.standardValues[level];
        if (!std) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无熔炼数据</div>';
            return;
        }

        const meltInfo = this.meltData[part];
        if (!meltInfo) {
            el.innerHTML = '<div style="color:#c0392b;">⚠️ 该部位暂无熔炼数据</div>';
            return;
        }

        const statAttrs = ['体质', '魔力', '力量', '耐力'];

        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">📊 ${level}级 ${part} 熔炼分析</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;

        let hasResult = false;

        for (let [attr, val] of Object.entries(values)) {
            if (val <= 0) continue;

            let stdVal = 0;
            let isStat = statAttrs.includes(attr);
            let formulaType = 'default';
            let limitName = '';

            if (isStat) {
                // ===== 武器/衣服属性点 =====
                const statCount = Object.keys(values).filter(k => statAttrs.includes(k) && values[k] > 0).length;
                if (part === '武器' || part === '衣服') {
                    if (statCount === 1) {
                        // 单加：使用"武器单加"国标
                        stdVal = std['武器单加'] || std.武器单加 || 14;
                        limitName = '单加上限';
                    } else if (statCount >= 2) {
                        // 双加：使用"武器双加单项"国标
                        stdVal = std['武器双加单项'] || std.武器双加单项 || 11;
                        limitName = '双加单项上限';
                    }
                } else {
                    // 其他部位属性点（衣服已包含，但其他部位没有属性点熔炼）
                    stdVal = std['武器单加'] || 14;
                    limitName = '上限';
                }
                formulaType = 'default';
            } else if (attr === '防御') {
                if (part === '衣服') {
                    stdVal = std.衣服防御 || std['衣服防御'] || 105;
                    limitName = '衣服防御上限';
                } else if (part === '帽子' || part === '腰带' || part === '鞋子') {
                    stdVal = std['头腰鞋防御'] || std.头腰鞋防御 || 36;
                    limitName = '防御上限';
                } else {
                    stdVal = std['头腰鞋防御'] || 36;
                    limitName = '防御上限';
                }
                formulaType = 'default';
            } else if (attr === '灵力') {
                stdVal = std.项链灵力 || std['项链灵力'] || 80;
                limitName = '灵力上限';
                formulaType = 'default';
            } else if (attr === '气血') {
                stdVal = std.腰带气血 || std['腰带气血'] || 136;
                limitName = '气血上限';
                formulaType = 'default';
            } else if (attr === '敏捷') {
                if (part === '鞋子') {
                    stdVal = std.鞋子敏捷 || std['鞋子敏捷'] || 24;
                    limitName = '敏捷上限';
                    formulaType = 'agile';
                } else {
                    stdVal = std['头腰鞋防御'] || 36;
                    limitName = '防御上限';
                    formulaType = 'default';
                }
            } else if (attr === '魔法') {
                stdVal = std.头盔魔法 || std['头盔魔法'] || 105;
                limitName = '魔法上限';
                formulaType = 'default';
            } else if (attr === '耐久') {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;grid-column:1/-1;">
                        <span>耐久</span>
                        <span style="font-weight:600;color:#1f3b53;">当前 ${val} ${val >= 100 ? '✅ 可熔炼' : '⚠️ 不足100'}</span>
                    </div>
                `;
                continue;
            } else {
                continue;
            }

            // 计算熔炼上限： (强化最高属性 - 当前装备初始属性) / 1.5
            let maxValue;
            if (formulaType === 'agile') {
                // 鞋子敏捷特殊公式：÷1.2
                maxValue = (stdVal * 1.3 - val) / 1.2;
            } else {
                maxValue = (stdVal * 1.3 - val) / 1.5;
            }
            const canMelt = Math.max(0, Math.round(maxValue * 10) / 10);
            const maxFinal = val + canMelt;

            // 单加/双加标识
            let extraInfo = '';
            if (isStat && (part === '武器' || part === '衣服')) {
                const statCount = Object.keys(values).filter(k => statAttrs.includes(k) && values[k] > 0).length;
                if (statCount === 1) {
                    extraInfo = ' (单加)';
                } else if (statCount >= 2) {
                    extraInfo = ' (双加)';
                }
            }

            const isMaxed = canMelt <= 0.1;

            html += `
                <div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;${isStat ? 'grid-column:1/-1;' : ''}background:${isMaxed ? '#f5f0e8' : '#f8faff'};">
                    <span>${attr}${extraInfo}</span>
                    <span>
                        当前 <span style="font-weight:600;color:#1f3b53;">${val}</span>
                        → 可熔炼 <span style="font-weight:700;color:${isMaxed ? '#c0392b' : '#2d6b2d'};">${isMaxed ? '已达上限' : '+' + canMelt.toFixed(1)}</span>
                        → 上限 <span style="font-weight:700;color:#1f3b53;">${maxFinal.toFixed(1)}</span>
                        ${limitName ? `<span style="font-size:0.65rem;color:#5a7a94;margin-left:4px;">(${limitName})</span>` : ''}
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
                💡 熔炼上限 = (强化最高值 - 当前装备初始属性) ÷ 1.5（差距±1）
                <br>💡 鞋子敏捷熔炼上限 = (强化最高值 - 当前值) ÷ 1.2
                <br>💡 统一按强化打造的"最高属性"计算
            </div>
        `;

        el.innerHTML = html;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EquipmentQueryModule.init());
} else {
    EquipmentQueryModule.init();
}
