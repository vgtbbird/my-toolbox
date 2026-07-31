// ============================================================
//  ⚔️ 装备打造 & 熔炼查询模块
// ============================================================
const EquipmentQueryModule = {
    id: 'equipmentQuery',

    // ========== 数据 ==========
    // 等级选择
    levels: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
    currentLevel: 130,
    currentPart: '武器',
    currentType: '强化', // '普通' 或 '强化'

    // ========== 装备数据 ==========
    equipmentData: {
        // 格式: 等级 -> 部位 -> 打造方式 -> {属性: [最小值, 最大值]}
        "60": {
            "武器": {
                "普通": { "命中": [230, 299], "伤害": [198, 257] },
                "强化": { "命中": [241, 313], "伤害": [207, 269] }
            },
            "衣服": {
                "普通": { "防御": [105, 136] },
                "强化": { "防御": [110, 143] }
            },
            "项链": {
                "普通": { "灵力": [68, 88] },
                "强化": { "灵力": [71, 92] }
            },
            "鞋子": {
                "普通": { "防御": [36, 46], "敏捷": [24, 31] },
                "强化": { "防御": [37, 48], "敏捷": [25, 32] }
            },
            "帽子": {
                "普通": { "防御": [36, 46], "魔法": [68, 88] },
                "强化": { "防御": [37, 48], "魔法": [71, 92] }
            },
            "腰带": {
                "普通": { "防御": [35, 45], "气血": [136, 176] },
                "强化": { "防御": [36, 47], "气血": [142, 184] }
            }
        },
        "70": {
            "武器": {
                "普通": { "命中": [270, 351], "伤害": [231, 300] },
                "强化": { "命中": [283, 368], "伤害": [242, 315] }
            },
            "衣服": {
                "普通": { "防御": [120, 156] },
                "强化": { "防御": [126, 163] }
            },
            "项链": {
                "普通": { "灵力": [78, 101] },
                "强化": { "灵力": [81, 105] }
            },
            "鞋子": {
                "普通": { "防御": [42, 54], "敏捷": [27, 35] },
                "强化": { "防御": [44, 57], "敏捷": [28, 36] }
            },
            "帽子": {
                "普通": { "防御": [42, 54], "魔法": [78, 101] },
                "强化": { "防御": [44, 57], "魔法": [81, 105] }
            },
            "腰带": {
                "普通": { "防御": [40, 52], "气血": [157, 204] },
                "强化": { "防御": [42, 54], "气血": [164, 213] }
            }
        },
        "80": {
            "武器": {
                "普通": { "命中": [290, 377], "伤害": [250, 325] },
                "强化": { "命中": [304, 395], "伤害": [260, 341] }
            },
            "衣服": {
                "普通": { "防御": [130, 169] },
                "强化": { "防御": [136, 177] }
            },
            "项链": {
                "普通": { "灵力": [85, 110] },
                "强化": { "灵力": [89, 115] }
            },
            "鞋子": {
                "普通": { "防御": [45, 58], "敏捷": [29, 37] },
                "强化": { "防御": [47, 60], "敏捷": [30, 39] }
            },
            "帽子": {
                "普通": { "防御": [45, 58], "魔法": [85, 110] },
                "强化": { "防御": [47, 60], "魔法": [89, 115] }
            },
            "腰带": {
                "普通": { "防御": [45, 58], "气血": [178, 231] },
                "强化": { "防御": [47, 60], "气血": [186, 242] }
            }
        },
        "90": {
            "武器": {
                "普通": { "命中": [325, 422], "伤害": [280, 364] },
                "强化": { "命中": [341, 443], "伤害": [294, 382] }
            },
            "衣服": {
                "普通": { "防御": [152, 197] },
                "强化": { "防御": [159, 206] }
            },
            "项链": {
                "普通": { "灵力": [101, 131] },
                "强化": { "灵力": [106, 137] }
            },
            "鞋子": {
                "普通": { "防御": [52, 67], "敏捷": [33, 42] },
                "强化": { "防御": [54, 70], "敏捷": [34, 44] }
            },
            "帽子": {
                "普通": { "防御": [52, 67], "魔法": [101, 131] },
                "强化": { "防御": [54, 70], "魔法": [106, 137] }
            },
            "腰带": {
                "普通": { "防御": [50, 65], "气血": [199, 258] },
                "强化": { "防御": [52, 68], "气血": [208, 270] }
            }
        },
        "100": {
            "武器": {
                "普通": { "命中": [355, 461], "伤害": [305, 396] },
                "强化": { "命中": [372, 483], "伤害": [320, 416] }
            },
            "衣服": {
                "普通": { "防御": [168, 218] },
                "强化": { "防御": [176, 228] }
            },
            "项链": {
                "普通": { "灵力": [112, 145] },
                "强化": { "灵力": [117, 152] }
            },
            "鞋子": {
                "普通": { "防御": [57, 74], "敏捷": [36, 46] },
                "强化": { "防御": [59, 77], "敏捷": [37, 48] }
            },
            "帽子": {
                "普通": { "防御": [57, 74], "魔法": [112, 145] },
                "强化": { "防御": [59, 77], "魔法": [117, 152] }
            },
            "腰带": {
                "普通": { "防御": [55, 71], "气血": [220, 286] },
                "强化": { "防御": [57, 74], "气血": [231, 300] }
            }
        },
        "130": {
            "武器": {
                "普通": { "命中": [465, 604], "伤害": [400, 520] },
                "强化": { "命中": [488, 634], "伤害": [420, 546] }
            },
            "衣服": {
                "普通": { "防御": [215, 279] },
                "强化": { "防御": [225, 292] }
            },
            "项链": {
                "普通": { "灵力": [144, 187] },
                "强化": { "灵力": [151, 196] }
            },
            "鞋子": {
                "普通": { "防御": [73, 94], "敏捷": [46, 59] },
                "强化": { "防御": [76, 98], "敏捷": [48, 61] }
            },
            "帽子": {
                "普通": { "防御": [73, 94], "魔法": [144, 187] },
                "强化": { "防御": [76, 98], "魔法": [151, 196] }
            },
            "腰带": {
                "普通": { "防御": [70, 91], "气血": [283, 367] },
                "强化": { "防御": [73, 95], "气血": [297, 385] }
            }
        }
    },

    // ========== 熔炼数据 ==========
    meltData: {
        "武器": {
            "可熔炼": ["体质", "魔力", "力量", "耐力", "敏捷", "耐久"],
            "不可熔炼": ["伤害", "命中"],
            "说明": "武器必须带绿字属性才有效，白板武器熔炼只影响耐久"
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

    // 强化国标值（用于熔炼上限计算）
    standardValues: {
        "60": { "灵力": 80, "防御": 36, "敏捷": 24, "气血": 136, "衣服防御": 105, "帽子防御": 36 },
        "70": { "灵力": 93, "防御": 42, "敏捷": 27, "气血": 157, "衣服防御": 120, "帽子防御": 42 },
        "80": { "灵力": 106, "防御": 47, "敏捷": 30, "气血": 178, "衣服防御": 136, "帽子防御": 47 },
        "90": { "灵力": 118, "防御": 52, "敏捷": 33, "气血": 199, "衣服防御": 152, "帽子防御": 52 },
        "100": { "灵力": 131, "防御": 57, "敏捷": 36, "气血": 220, "衣服防御": 168, "帽子防御": 57 },
        "130": { "灵力": 169, "防御": 73, "敏捷": 46, "气血": 283, "衣服防御": 215, "帽子防御": 73 }
    },

    // ========== 生命周期 ==========
    init() {
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
    },

    render() {
        this.updateResult();
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('equipmentQueryContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="module">
                <div class="module-header">
                    <div class="title">⚔️ 装备打造 & 熔炼查询</div>
                </div>
                <div class="module-body">
                    <!-- 筛选栏 -->
                    <div style="display:flex;flex-wrap:wrap;gap:8px 12px;margin-bottom:12px;padding:10px 0;border-bottom:1px solid #dce5ef;">
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

                    <!-- 结果区域 -->
                    <div id="eqResult" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <!-- 打造属性 -->
                        <div style="background:#f8faff;border-radius:12px;padding:12px 16px;border:1px solid #dce5ef;">
                            <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;margin-bottom:8px;">📊 打造属性范围</div>
                            <div id="eqCraftResult" style="font-size:0.85rem;color:#5a7a94;">
                                请选择等级和部位
                            </div>
                        </div>

                        <!-- 熔炼属性 -->
                        <div style="background:#f8faff;border-radius:12px;padding:12px 16px;border:1px solid #dce5ef;">
                            <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;margin-bottom:8px;">🔥 熔炼属性范围</div>
                            <div id="eqMeltResult" style="font-size:0.85rem;color:#5a7a94;">
                                请选择等级和部位
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 说明 -->
            <div class="module" style="margin-top:12px;">
                <div class="module-header">
                    <div class="title">💡 使用说明</div>
                </div>
                <div class="module-body" style="font-size:0.8rem;color:#5a7a94;line-height:1.8;">
                    <div>• 选择装备等级和部位，自动显示对应的打造属性范围</div>
                    <div>• 熔炼属性仅对已有的属性类型生效</div>
                    <div>• 白板武器熔炼只影响耐久，不影响伤害和命中</div>
                    <div>• 熔炼条件：装备等级≥60、当前耐久≥100、打造装备</div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        document.getElementById('eqLevel').addEventListener('change', (e) => {
            this.currentLevel = parseInt(e.target.value);
            // 更新部位下拉选项
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
    },

    // ========== 更新结果 ==========
    updateResult() {
        const level = this.currentLevel;
        const part = this.currentPart;
        const type = this.currentType;

        // 打造属性
        const craftEl = document.getElementById('eqCraftResult');
        const partData = this.equipmentData[level]?.[part];
        if (!partData) {
            craftEl.innerHTML = '<div style="color:#6c87a0;">暂无数据</div>';
        } else {
            const data = partData[type] || partData['普通'] || {};
            let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:6px;">${level}级 ${part} (${type}打造)</div>`;
            for (let [attr, range] of Object.entries(data)) {
                html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f4f8;">
                    <span>${attr}</span>
                    <span style="font-weight:600;color:#1f3b53;">${range[0]} - ${range[1]}</span>
                </div>`;
            }
            // 添加耐久
            const durability = level >= 130 ? 650 : level >= 100 ? 500 : 400;
            html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f4f8;">
                <span>耐久</span>
                <span style="font-weight:600;color:#1f3b53;">${durability}</span>
            </div>`;
            craftEl.innerHTML = html;
        }

        // 熔炼属性
        const meltEl = document.getElementById('eqMeltResult');
        const meltInfo = this.meltData[part];
        if (!meltInfo) {
            meltEl.innerHTML = '<div style="color:#6c87a0;">暂无熔炼数据</div>';
        } else {
            let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:6px;">${level}级 ${part}</div>`;
            html += `<div style="margin-bottom:6px;">
                <span style="color:#2d6b2d;">✅ 可熔炼：</span>
                <span style="color:#1f3b53;font-weight:500;">${meltInfo.可熔炼.join('、')}</span>
            </div>`;
            if (meltInfo.不可熔炼.length > 0) {
                html += `<div style="margin-bottom:6px;">
                    <span style="color:#c0392b;">❌ 不可熔炼：</span>
                    <span style="color:#5a7a94;">${meltInfo.不可熔炼.join('、')}</span>
                </div>`;
            }
            if (meltInfo.说明) {
                html += `<div style="font-size:0.75rem;color:#5a7a94;margin-top:6px;padding-top:6px;border-top:1px solid #eef2f7;">
                    💡 ${meltInfo.说明}
                </div>`;
            }
            meltEl.innerHTML = html;
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EquipmentQueryModule.init());
} else {
    EquipmentQueryModule.init();
}
