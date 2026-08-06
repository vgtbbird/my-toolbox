// ============================================================
//  🧬 炼妖助手模块 - 完整版
//  功能：胚子管理 + 炼妖记录 + 技能模拟 + 统计看板
// ============================================================
const AlchemyModule = {
    id: 'alchemy',

    storageKey: 'alchemy',

    // ===== UI设置 =====
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
    },

    // ===== 数据 =====
    pets: [],
    records: [],
    currentPet: null,

    // ===== 宠物类型库 =====
    petTypes: {
        '吸血鬼': { level: 95, mustSkills: ['鬼魂术', '夜战', '弱点雷'], icon: '🧛' },
        '雷鸟人': { level: 45, mustSkills: ['飞行', '弱点雷', '高级雷属性吸收'], icon: '🐣' },
        '持国巡守': { level: 125, mustSkills: ['须弥真言', '高级魔之心'], icon: '🐉' },
        '泪妖': { level: 85, mustSkills: ['法术暴击'], icon: '💧' },
        '画魂': { level: 105, mustSkills: ['地狱烈火', '高级魔之心'], icon: '🎨' },
        '毗舍童子': { level: 175, mustSkills: ['连击', '高级神佑复生'], icon: '🧒' },
        '大力金刚': { level: '飞升', mustSkills: ['高级强力', '高级防御'], icon: '💪' },
        '龙龟': { level: '飞升', mustSkills: ['水攻', '法术防御'], icon: '🐢' },
        '夜罗刹': { level: '飞升', mustSkills: ['夜舞倾城', '高级敏捷'], icon: '🗡️' },
        '鬼将': { level: 105, mustSkills: ['鬼魂术'], icon: '👹' },
        '律法女娲': { level: 95, mustSkills: ['高级反震'], icon: '⚖️' },
        '幽灵': { level: 95, mustSkills: ['鬼魂术', '夜战'], icon: '👻' },
        '蝴蝶仙子': { level: 45, mustSkills: ['飞行', '弱点雷'], icon: '🦋' },
        '鼠先锋': { level: 85, mustSkills: ['高级敏捷', '夜战'], icon: '🐭' },
        '犀牛将军': { level: 75, mustSkills: ['高级必杀'], icon: '🦏' },
    },

    // ===== 常用技能库 =====
    skillLibrary: [
        '鬼魂术', '夜战', '弱点雷', '飞行', '高级雷属性吸收',
        '须弥真言', '高级魔之心', '法术暴击', '地狱烈火', '高级神佑复生',
        '连击', '高级连击', '必杀', '高级必杀', '偷袭', '高级偷袭',
        '强力', '高级强力', '防御', '高级防御', '敏捷', '高级敏捷',
        '法术连击', '高级法术连击', '法术波动', '高级法术波动',
        '神佑复生', '高级神佑复生', '再生', '高级再生',
        '吸血', '高级吸血', '夜舞倾城', '水攻', '法术防御',
        '反震', '高级反震', '感知', '高级感知', '驱鬼', '高级驱鬼',
        '毒', '高级毒', '永恒', '高级永恒', '冥思', '高级冥思',
        '慧根', '高级慧根', '再生', '高级再生', '神迹', '高级神迹',
        '精神集中', '高级精神集中', '否定信仰', '高级否定信仰',
    ],

    // ============================================================
    //  生命周期
    // ============================================================
        init() {
            this.loadData();
            this.buildUI();
            this.bindEvents();
            App.register(this);
            // ✅ 延迟渲染，确保容器可见后再填充内容
            setTimeout(() => {
                this.render();
            }, 200);
            setTimeout(() => this.applyUISettings(), 350);
        },

    render() {
        this.renderStats();
        this.renderPets();
        this.renderRecords();
        this.renderSkillSimulator();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.pets = data.pets || [];
        this.records = data.records || [];
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14,
        };
    },

    saveData() {
        Storage.set(this.storageKey, {
            pets: this.pets,
            records: this.records,
            uiSettings: this.uiSettings,
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('alchemyContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');

        container.querySelectorAll('.module, .stats-grid .stat-item, .pet-item, .record-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .pet-item, .record-item, .skill-tag, .al-btn').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .pet-item, .record-item, .al-btn, input, select, button').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

    // ============================================================
    //  统计计算
    // ============================================================
    calcStats() {
        let total = this.records.length;
        let totalCost = 0, totalIncome = 0, winCount = 0;
        for (let r of this.records) {
            totalCost += r.cost || 0;
            totalIncome += r.income || 0;
            if (r.profit > 0) winCount++;
        }
        return {
            total,
            totalCost,
            totalIncome,
            totalProfit: totalIncome - totalCost,
            winRate: total > 0 ? (winCount / total * 100) : 0,
            avgProfit: total > 0 ? (totalIncome - totalCost) / total : 0,
            winCount,
            loseCount: total - winCount,
        };
    },

    // ============================================================
    //  构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('alchemyContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- 界面设置 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置 <span class="hint">— 自定义颜色和字体</span></div>
                    <div>
                        <button class="toggle-btn" id="alToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="alUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🎨 背景色</label>
                            <input type="color" id="alBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📦 卡片色</label>
                            <input type="color" id="alCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔘 按钮色</label>
                            <input type="color" id="alBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📝 文字色</label>
                            <input type="color" id="alTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔤 字体大小</label>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" id="alFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;">
                                <span id="alFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="alResetUI" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="alTotalCount">0</div><div class="label">🧬 总炼妖</div></div>
                <div class="stat-item"><div class="num" id="alTotalCost">0</div><div class="label">💰 总投入(万)</div></div>
                <div class="stat-item"><div class="num" id="alTotalIncome">0</div><div class="label">📊 总收入(万)</div></div>
                <div class="stat-item" id="alProfitStat"><div class="num" id="alTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="alWinRate">0%</div><div class="label">🏆 胜率</div></div>
                <div class="stat-item"><div class="num" id="alAvgProfit">0</div><div class="label">📊 平均利润/次</div></div>
            </div>

            <!-- 胚子库 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📝 胚子库 <span class="hint" id="alPetCount">共 0 只</span></div>
                    <div>
                        <button class="btn-small" id="alAddPetBtn" style="background:#4c7a5c;color:#fff;border:none;padding:2px 16px;border-radius:30px;cursor:pointer;font-size:0.65rem;font-weight:600;">➕ 添加胚子</button>
                        <button class="toggle-btn" id="alTogglePetsBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="alPetsBody">
                    <div id="alPetsList" style="max-height:200px;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;padding:4px 0;"></div>
                </div>
            </div>

            <!-- 合成模拟 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">⚗️ 合成模拟 <span class="hint">— 选择两只胚子模拟合成结果</span></div>
                    <button class="toggle-btn" id="alToggleSimBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="alSimBody">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                        <select id="alSimPet1" style="flex:1;min-width:120px;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;background:white;">
                            <option value="">选择主宠</option>
                        </select>
                        <select id="alSimPet2" style="flex:1;min-width:120px;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;background:white;">
                            <option value="">选择副宠</option>
                        </select>
                        <button class="btn-complete" id="alSimBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 20px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.75rem;">🔮 模拟合成</button>
                    </div>
                    <div id="alSimResult" style="background:#f5f8fc;border-radius:12px;padding:10px 14px;border:1px solid #dce5ef;font-size:0.85rem;color:#5a7a94;">
                        💡 选择两只胚子后点击「模拟合成」
                    </div>
                </div>
            </div>

            <!-- 炼妖记录 -->
            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📋 炼妖记录 <span class="hint" id="alRecordCount">共 0 条</span></div>
                    <div>
                        <button class="btn-small" id="alAddRecordBtn" style="background:#4c7a5c;color:#fff;border:none;padding:2px 16px;border-radius:30px;cursor:pointer;font-size:0.65rem;font-weight:600;">📥 记录炼妖</button>
                        <button class="toggle-btn" id="alToggleRecordsBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="alRecordsBody">
                    <div id="alRecordsList" style="max-height:300px;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;padding:4px 0;"></div>
                </div>
            </div>

            <!-- 弹窗：添加胚子 -->
            <div class="modal-overlay" id="alAddPetModal">
                <div class="modal-box" style="max-width:480px;">
                    <h3>➕ 添加胚子</h3>
                    <div class="modal-desc">输入胚子信息，用于炼妖记录和合成模拟</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 宠物名 *</label>
                            <input type="text" id="alNewPetName" placeholder="如：吸血鬼" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📊 技能数</label>
                            <input type="number" id="alNewPetSkillCount" min="0" max="12" placeholder="5" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💰 成本(万)</label>
                            <input type="number" id="alNewPetCost" min="0" step="0.1" placeholder="50" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">⚔️ 攻击</label>
                            <input type="number" id="alNewPetAttack" min="0" placeholder="1450" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📈 成长</label>
                            <input type="number" id="alNewPetGrowth" step="0.001" placeholder="1.254" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📜 技能列表（用逗号分隔）</label>
                            <input type="text" id="alNewPetSkills" placeholder="如：鬼魂术,夜战,弱点雷" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;grid-column:1/-1;padding:4px 0;">
                            <input type="checkbox" id="alNewPetRare">
                            <label style="font-size:0.8rem;color:#1f3b53;">⭐ 稀有宠物</label>
                        </div>
                    </div>
                    <div class="modal-actions" style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                        <button class="btn-cancel" id="alAddPetCancel" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">取消</button>
                        <button class="btn-confirm" id="alAddPetConfirm" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#4c7a5c;color:white;">✅ 保存</button>
                    </div>
                </div>
            </div>

            <!-- 弹窗：记录炼妖 -->
            <div class="modal-overlay" id="alAddRecordModal">
                <div class="modal-box" style="max-width:520px;">
                    <h3>📥 记录炼妖</h3>
                    <div class="modal-desc">记录一次炼妖的投入和产出</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 主宠</label>
                            <select id="alRecordPet1" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;background:white;">
                                <option value="">选择胚子</option>
                            </select>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 副宠</label>
                            <select id="alRecordPet2" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;background:white;">
                                <option value="">选择胚子</option>
                            </select>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💰 胚子总成本(万)</label>
                            <input type="number" id="alRecordCost" min="0" step="0.1" placeholder="0" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📊 成品估价(万)</label>
                            <input type="number" id="alRecordIncome" min="0" step="0.1" placeholder="0" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🎯 成品技能数</label>
                            <input type="number" id="alRecordResultSkills" min="0" placeholder="8" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 成品名</label>
                            <input type="text" id="alRecordResultName" placeholder="吸血鬼" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📝 备注</label>
                            <input type="text" id="alRecordNote" placeholder="出了高必高连" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                    </div>
                    <div class="modal-actions" style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                        <button class="btn-cancel" id="alAddRecordCancel" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">取消</button>
                        <button class="btn-confirm" id="alAddRecordConfirm" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#4c7a5c;color:white;">✅ 记录</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ============================================================
    //  绑定事件
    // ============================================================
    bindEvents() {
        const container = document.getElementById('alchemyContainer');
        if (!container) return;

        // ===== UI设置 =====
        document.getElementById('alBgColor').addEventListener('input', function() {
            AlchemyModule.uiSettings.bgColor = this.value;
            AlchemyModule.applyUISettings();
            AlchemyModule.saveData();
        });
        document.getElementById('alCardColor').addEventListener('input', function() {
            AlchemyModule.uiSettings.cardBgColor = this.value;
            AlchemyModule.applyUISettings();
            AlchemyModule.saveData();
        });
        document.getElementById('alBtnColor').addEventListener('input', function() {
            AlchemyModule.uiSettings.btnColor = this.value;
            AlchemyModule.applyUISettings();
            AlchemyModule.saveData();
        });
        document.getElementById('alTextColor').addEventListener('input', function() {
            AlchemyModule.uiSettings.textColor = this.value;
            AlchemyModule.applyUISettings();
            AlchemyModule.saveData();
        });
        document.getElementById('alFontSize').addEventListener('input', function() {
            const val = parseInt(this.value);
            document.getElementById('alFontSizeDisplay').textContent = val;
            AlchemyModule.uiSettings.fontSize = val;
            AlchemyModule.applyUISettings();
            AlchemyModule.saveData();
        });
        document.getElementById('alResetUI').addEventListener('click', function() {
            if (confirm('重置所有UI设置为默认值？')) {
                AlchemyModule.uiSettings = {
                    bgColor: '#eef2f7',
                    btnColor: '#4CAF50',
                    btnTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    textColor: '#1a1a2e',
                    fontSize: 14,
                };
                document.getElementById('alBgColor').value = AlchemyModule.uiSettings.bgColor;
                document.getElementById('alCardColor').value = AlchemyModule.uiSettings.cardBgColor;
                document.getElementById('alBtnColor').value = AlchemyModule.uiSettings.btnColor;
                document.getElementById('alTextColor').value = AlchemyModule.uiSettings.textColor;
                document.getElementById('alFontSize').value = AlchemyModule.uiSettings.fontSize;
                document.getElementById('alFontSizeDisplay').textContent = AlchemyModule.uiSettings.fontSize;
                AlchemyModule.applyUISettings();
                AlchemyModule.saveData();
                alert('✅ UI设置已重置！');
            }
        });
        document.getElementById('alToggleUISettings').addEventListener('click', function() {
            document.getElementById('alUISettingsBody').classList.toggle('hidden');
            this.textContent = document.getElementById('alUISettingsBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 添加胚子 =====
        document.getElementById('alAddPetBtn').addEventListener('click', function() {
            document.getElementById('alNewPetName').value = '';
            document.getElementById('alNewPetSkillCount').value = '';
            document.getElementById('alNewPetCost').value = '';
            document.getElementById('alNewPetAttack').value = '';
            document.getElementById('alNewPetGrowth').value = '';
            document.getElementById('alNewPetSkills').value = '';
            document.getElementById('alNewPetRare').checked = false;
            document.getElementById('alAddPetModal').classList.add('show');
        });
        document.getElementById('alAddPetCancel').addEventListener('click', function() {
            document.getElementById('alAddPetModal').classList.remove('show');
        });
        document.getElementById('alAddPetModal').addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('show');
        });
        document.getElementById('alAddPetConfirm').addEventListener('click', function() {
            const name = document.getElementById('alNewPetName').value.trim();
            if (!name) { alert('请输入宠物名！'); return; }
            const skillCount = parseInt(document.getElementById('alNewPetSkillCount').value) || 0;
            const cost = parseFloat(document.getElementById('alNewPetCost').value) || 0;
            const attack = parseInt(document.getElementById('alNewPetAttack').value) || 0;
            const growth = parseFloat(document.getElementById('alNewPetGrowth').value) || 1.2;
            const skillsStr = document.getElementById('alNewPetSkills').value.trim();
            const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s) : [];
            const isRare = document.getElementById('alNewPetRare').checked;

            const pet = {
                id: Date.now(),
                name,
                skillCount,
                cost,
                attack,
                growth,
                skills,
                isRare,
                date: new Date().toLocaleString(),
            };
            AlchemyModule.pets.push(pet);
            AlchemyModule.saveData();
            AlchemyModule.render();
            document.getElementById('alAddPetModal').classList.remove('show');
            alert('✅ 胚子已添加！');
        });

        // ===== 删除胚子 =====
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.al-del-pet');
            if (btn) {
                const id = parseInt(btn.dataset.id);
                if (confirm('确定要删除这只胚子吗？')) {
                    AlchemyModule.pets = AlchemyModule.pets.filter(p => p.id !== id);
                    AlchemyModule.saveData();
                    AlchemyModule.render();
                }
            }
        });

        // ===== 折叠 =====
        document.getElementById('alTogglePetsBtn').addEventListener('click', function() {
            document.getElementById('alPetsBody').classList.toggle('hidden');
            this.textContent = document.getElementById('alPetsBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('alToggleSimBtn').addEventListener('click', function() {
            document.getElementById('alSimBody').classList.toggle('hidden');
            this.textContent = document.getElementById('alSimBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('alToggleRecordsBtn').addEventListener('click', function() {
            document.getElementById('alRecordsBody').classList.toggle('hidden');
            this.textContent = document.getElementById('alRecordsBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 合成模拟 =====
        document.getElementById('alSimBtn').addEventListener('click', function() {
            const pet1Id = parseInt(document.getElementById('alSimPet1').value);
            const pet2Id = parseInt(document.getElementById('alSimPet2').value);
            if (!pet1Id || !pet2Id) { alert('请选择两只胚子！'); return; }
            if (pet1Id === pet2Id) { alert('请选择不同的胚子！'); return; }
            AlchemyModule.runSimulation(pet1Id, pet2Id);
        });

        // ===== 记录炼妖 =====
        document.getElementById('alAddRecordBtn').addEventListener('click', function() {
            AlchemyModule.populateRecordSelects();
            document.getElementById('alRecordCost').value = '';
            document.getElementById('alRecordIncome').value = '';
            document.getElementById('alRecordResultSkills').value = '';
            document.getElementById('alRecordResultName').value = '';
            document.getElementById('alRecordNote').value = '';
            document.getElementById('alAddRecordModal').classList.add('show');
        });
        document.getElementById('alAddRecordCancel').addEventListener('click', function() {
            document.getElementById('alAddRecordModal').classList.remove('show');
        });
        document.getElementById('alAddRecordModal').addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('show');
        });
        document.getElementById('alAddRecordConfirm').addEventListener('click', function() {
            const pet1Id = parseInt(document.getElementById('alRecordPet1').value);
            const pet2Id = parseInt(document.getElementById('alRecordPet2').value);
            const cost = parseFloat(document.getElementById('alRecordCost').value) || 0;
            const income = parseFloat(document.getElementById('alRecordIncome').value) || 0;
            const resultSkills = parseInt(document.getElementById('alRecordResultSkills').value) || 0;
            const resultName = document.getElementById('alRecordResultName').value.trim() || '未知';
            const note = document.getElementById('alRecordNote').value.trim() || '';

            const pet1 = AlchemyModule.pets.find(p => p.id === pet1Id);
            const pet2 = AlchemyModule.pets.find(p => p.id === pet2Id);

            const record = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                pet1: pet1 ? { name: pet1.name, id: pet1.id } : { name: '未知', id: null },
                pet2: pet2 ? { name: pet2.name, id: pet2.id } : { name: '未知', id: null },
                cost: cost,
                income: income,
                profit: income - cost,
                resultSkills: resultSkills,
                resultName: resultName,
                note: note,
            };
            AlchemyModule.records.push(record);
            AlchemyModule.saveData();
            AlchemyModule.render();
            document.getElementById('alAddRecordModal').classList.remove('show');
            alert('✅ 炼妖记录已保存！');
        });

        // ===== 删除记录 =====
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.al-del-record');
            if (btn) {
                const id = parseInt(btn.dataset.id);
                if (confirm('确定要删除这条记录吗？')) {
                    AlchemyModule.records = AlchemyModule.records.filter(r => r.id !== id);
                    AlchemyModule.saveData();
                    AlchemyModule.render();
                }
            }
        });
    },

    // ============================================================
    //  渲染方法
    // ============================================================
    renderStats() {
        const stats = this.calcStats();
        document.getElementById('alTotalCount').textContent = stats.total;
        document.getElementById('alTotalCost').textContent = stats.totalCost.toFixed(1);
        document.getElementById('alTotalIncome').textContent = stats.totalIncome.toFixed(1);
        document.getElementById('alTotalProfit').textContent = stats.totalProfit.toFixed(1);
        document.getElementById('alWinRate').textContent = stats.winRate.toFixed(0) + '%';
        document.getElementById('alAvgProfit').textContent = stats.avgProfit.toFixed(1);

        const ps = document.getElementById('alProfitStat');
        ps.className = 'stat-item' + (stats.totalProfit > 0 ? ' profit' : stats.totalProfit < 0 ? ' loss' : '');
    },

    renderPets() {
        const list = document.getElementById('alPetsList');
        const countEl = document.getElementById('alPetCount');
        countEl.textContent = `共 ${this.pets.length} 只`;

        if (this.pets.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:#6c87a0;font-size:0.85rem;">暂无胚子，点击「添加胚子」创建</div>';
            return;
        }

        let html = '';
        for (let p of this.pets) {
            const rareText = p.isRare ? '⭐' : '';
            const skillsText = p.skills && p.skills.length > 0 ? p.skills.join('、') : '无';
            html += `
                <div class="pet-item" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid #f0f4f8;font-size:0.8rem;flex-wrap:wrap;">
                    <span style="font-weight:600;min-width:60px;">${p.name}</span>
                    <span style="color:#5a7a94;min-width:40px;">${rareText} ${p.skillCount}技能</span>
                    <span style="color:#5a7a94;min-width:50px;">⚔️${p.attack || '-'}</span>
                    <span style="color:#5a7a94;min-width:50px;">📈${p.growth || '-'}</span>
                    <span style="color:#5a7a94;min-width:50px;">💰${p.cost || 0}万</span>
                    <span style="color:#5a7a94;font-size:0.65rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">技能:${skillsText}</span>
                    <button class="al-del-pet" data-id="${p.id}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
                </div>
            `;
        }
        list.innerHTML = html;
    },

    renderRecords() {
        const list = document.getElementById('alRecordsList');
        const countEl = document.getElementById('alRecordCount');
        countEl.textContent = `共 ${this.records.length} 条`;

        if (this.records.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:#6c87a0;font-size:0.85rem;">暂无炼妖记录</div>';
            return;
        }

        let html = '';
        const sorted = [...this.records].reverse();
        for (let r of sorted) {
            const pc = r.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const profitText = r.profit >= 0 ? `+${r.profit.toFixed(1)}万` : `${r.profit.toFixed(1)}万`;
            html += `
                <div class="record-item" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid #f0f4f8;font-size:0.8rem;flex-wrap:wrap;">
                    <span style="color:#5a7a94;min-width:70px;">${r.date || '未知'}</span>
                    <span style="font-weight:600;min-width:80px;">${r.pet1?.name || '?'} + ${r.pet2?.name || '?'}</span>
                    <span style="color:#5a7a94;min-width:40px;">→ ${r.resultName}</span>
                    <span style="color:#5a7a94;min-width:40px;">${r.resultSkills}技</span>
                    <span style="color:#5a7a94;min-width:50px;">💰${r.cost?.toFixed(1) || 0}万</span>
                    <span style="color:#5a7a94;min-width:50px;">📊${r.income?.toFixed(1) || 0}万</span>
                    <span class="${pc}" style="font-weight:700;min-width:60px;">${profitText}</span>
                    ${r.note ? `<span style="color:#5a7a94;font-size:0.7rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.note}</span>` : ''}
                    <button class="al-del-record" data-id="${r.id}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
                </div>
            `;
        }
        list.innerHTML = html;
    },

    renderSkillSimulator() {
        // 更新下拉列表
        const select1 = document.getElementById('alSimPet1');
        const select2 = document.getElementById('alSimPet2');
        if (!select1 || !select2) return;

        const current1 = select1.value;
        const current2 = select2.value;

        const options = this.pets.map(p =>
            `<option value="${p.id}">${p.name} (${p.skillCount}技能${p.isRare ? '⭐' : ''})</option>`
        ).join('');

        select1.innerHTML = `<option value="">选择主宠</option>${options}`;
        select2.innerHTML = `<option value="">选择副宠</option>${options}`;

        if (current1) select1.value = current1;
        if (current2) select2.value = current2;
    },

    populateRecordSelects() {
        const select1 = document.getElementById('alRecordPet1');
        const select2 = document.getElementById('alRecordPet2');
        if (!select1 || !select2) return;

        const options = this.pets.map(p =>
            `<option value="${p.id}">${p.name} (${p.skillCount}技能)</option>`
        ).join('');

        select1.innerHTML = `<option value="">选择胚子</option>${options}`;
        select2.innerHTML = `<option value="">选择胚子</option>${options}`;
    },

    // ============================================================
    //  合成模拟核心
    // ============================================================
    runSimulation(pet1Id, pet2Id) {
        const pet1 = this.pets.find(p => p.id === pet1Id);
        const pet2 = this.pets.find(p => p.id === pet2Id);
        if (!pet1 || !pet2) { alert('胚子不存在！'); return; }

        const result = document.getElementById('alSimResult');

        // 获取结果宠物的必带技能
        const resultName = pet1.name;
        const petTypeInfo = this.petTypes[resultName] || { mustSkills: [] };
        const mustSkills = petTypeInfo.mustSkills || [];

        // 检查父母身上哪些必带技能被打掉了
        const allSkills = [...pet1.skills, ...pet2.skills];
        const removedSkills = mustSkills.filter(skill => !allSkills.includes(skill));

        // 技能池
        const skillPool = [...new Set(allSkills)];

        // 计算预计技能数
        const totalSkills = pet1.skillCount + pet2.skillCount;
        const minResult = Math.floor(totalSkills * 0.5) + mustSkills.length;
        const maxResult = Math.min(Math.floor(totalSkills * 0.7) + mustSkills.length, 12);

        // 计算每个技能的继承概率（简化版）
        const skillProb = {};
        for (let skill of skillPool) {
            let count = 0;
            if (pet1.skills.includes(skill)) count++;
            if (pet2.skills.includes(skill)) count++;
            // 共有技能概率更高
            if (count === 2) skillProb[skill] = 0.75;
            else if (count === 1) skillProb[skill] = 0.45;
            else skillProb[skill] = 0.2;
        }

        // 已打掉的必带技能作为普通技能参与
        for (let skill of removedSkills) {
            skillProb[skill] = 0.35;
        }

        // 排序
        const sorted = Object.entries(skillProb).sort((a, b) => b[1] - a[1]);

        let html = `
            <div style="font-weight:600;color:#1f3b53;margin-bottom:6px;">🔮 模拟结果</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
                <div style="background:white;border-radius:8px;padding:6px 10px;text-align:center;border:1px solid #dce5ef;">
                    <div style="font-size:0.6rem;color:#5a7a94;">主宠</div>
                    <div style="font-weight:700;color:#1f3b53;">${pet1.name}</div>
                    <div style="font-size:0.65rem;color:#5a7a94;">${pet1.skillCount}技能</div>
                </div>
                <div style="background:white;border-radius:8px;padding:6px 10px;text-align:center;border:1px solid #dce5ef;">
                    <div style="font-size:0.6rem;color:#5a7a94;">副宠</div>
                    <div style="font-weight:700;color:#1f3b53;">${pet2.name}</div>
                    <div style="font-size:0.65rem;color:#5a7a94;">${pet2.skillCount}技能</div>
                </div>
                <div style="background:#e8f0e8;border-radius:8px;padding:6px 10px;text-align:center;border:1px solid #5f8f5f;">
                    <div style="font-size:0.6rem;color:#5a7a94;">预计结果</div>
                    <div style="font-weight:700;color:#2d6b2d;font-size:1.1rem;">${minResult}-${maxResult}技能</div>
                    <div style="font-size:0.6rem;color:#5a7a94;">${resultName}</div>
                </div>
            </div>
            <div style="font-size:0.75rem;color:#5a7a94;margin-bottom:6px;">📊 技能继承概率（前10个）</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
        `;

        for (let i = 0; i < Math.min(10, sorted.length); i++) {
            const [skill, prob] = sorted[i];
            const color = prob >= 0.7 ? '#2d6b2d' : prob >= 0.4 ? '#b48b3a' : '#5a7a94';
            html += `
                <span style="background:white;border:1px solid #dce5ef;border-radius:12px;padding:2px 10px;font-size:0.7rem;">
                    ${skill}
                    <span style="color:${color};font-weight:700;">${Math.round(prob * 100)}%</span>
                </span>
            `;
        }

        if (removedSkills.length > 0) {
            html += `
                <div style="width:100%;margin-top:4px;font-size:0.65rem;color:#5a7a94;">
                    💡 已打掉必带技能：${removedSkills.join('、')}（已加入技能池）
                </div>
            `;
        }

        if (mustSkills.length > 0) {
            html += `
                <div style="width:100%;margin-top:4px;font-size:0.65rem;color:#5a7a94;">
                    📌 ${resultName}必带技能：${mustSkills.join('、')}（未打掉则必出）
                </div>
            `;
        }

        html += `</div>`;
        result.innerHTML = html;
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AlchemyModule.init());
} else {
    AlchemyModule.init();
}

window.AlchemyModule = AlchemyModule;
