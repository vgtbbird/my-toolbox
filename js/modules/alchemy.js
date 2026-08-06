// ============================================================
//  🧬 炼妖助手模块 - 完整版 v3
//  功能：胚子管理 + 炼妖记录 + 技能模拟 + 统计看板
//  优化：必带技能标记 + 合成模拟结果展示 + 重置按钮
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
        '慧根', '高级慧根', '神迹', '高级神迹',
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
    //  获取宠物的必带技能（从图鉴查）
    // ============================================================
    getMustSkills(petName) {
        const type = this.petTypes[petName];
        return type ? type.mustSkills : [];
    },

    // ============================================================
    //  构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('alchemyContainer');
        if (!container) return;

        const petTypeOptions = Object.keys(this.petTypes).map(name =>
            `<option value="${name}">${name}（${this.petTypes[name].mustSkills.join('、')}）</option>`
        ).join('');

        const skillBtns = this.skillLibrary.map(skill =>
            `<button class="al-skill-quick-btn" data-skill="${skill}" style="padding:2px 8px;border-radius:12px;border:1px solid #d0dce8;background:#f5f8fc;cursor:pointer;font-size:0.6rem;margin:2px;">${skill}</button>`
        ).join('');

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
                    <div>
                        <button class="btn-small" id="alResetSimBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;font-weight:600;">🔄 重置</button>
                        <button class="toggle-btn" id="alToggleSimBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
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
                <div class="modal-box" style="max-width:560px;max-height:90vh;overflow-y:auto;">
                    <h3>➕ 添加胚子</h3>
                    <div class="modal-desc">从图鉴选择自动填充必带技能，或手动输入</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;">

                        <!-- 图鉴选择 -->
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📖 从图鉴选择</label>
                            <select id="alNewPetType" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;background:white;">
                                <option value="">— 手动输入 —</option>
                                ${petTypeOptions}
                            </select>
                        </div>

                        <!-- 宠物名 -->
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 宠物名 *</label>
                            <input type="text" id="alNewPetName" placeholder="如：吸血鬼" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>

                        <!-- 技能数 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📊 技能数</label>
                            <div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center;">
                                <button class="al-skill-quick-btn" data-value="0" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">0</button>
                                <button class="al-skill-quick-btn" data-value="3" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">3</button>
                                <button class="al-skill-quick-btn" data-value="4" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">4</button>
                                <button class="al-skill-quick-btn" data-value="5" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">5</button>
                                <button class="al-skill-quick-btn" data-value="6" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">6</button>
                                <button class="al-skill-quick-btn" data-value="7" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">7</button>
                                <button class="al-skill-quick-btn" data-value="8" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;">8</button>
                                <input type="number" id="alNewPetSkillCount" min="0" max="12" placeholder="5" style="width:50px;padding:4px 4px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;text-align:center;">
                            </div>
                        </div>

                        <!-- 成本 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💰 成本(万)</label>
                            <input type="number" id="alNewPetCost" min="0" step="0.1" placeholder="50" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 攻击 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">⚔️ 攻击</label>
                            <input type="number" id="alNewPetAttack" min="0" placeholder="1450" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 防御 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🛡️ 防御</label>
                            <input type="number" id="alNewPetDefense" min="0" placeholder="1200" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 体力 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">❤️ 体力</label>
                            <input type="number" id="alNewPetHealth" min="0" placeholder="1100" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 法力 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💙 法力</label>
                            <input type="number" id="alNewPetMana" min="0" placeholder="1000" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 速度 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💨 速度</label>
                            <input type="number" id="alNewPetSpeed" min="0" placeholder="1100" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 躲避 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🌀 躲避</label>
                            <input type="number" id="alNewPetDodge" min="0" placeholder="900" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 成长 -->
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📈 成长</label>
                            <input type="number" id="alNewPetGrowth" step="0.001" placeholder="1.254" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        </div>

                        <!-- 技能列表 -->
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📜 技能列表（逗号分隔，必带技能自动标记 🟡）</label>
                            <input type="text" id="alNewPetSkills" placeholder="如：鬼魂术,夜战,弱点雷" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                            <div id="alNewPetSkillTags" style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;padding:4px;border:1px solid #eef2f7;border-radius:8px;min-height:30px;"></div>
                            <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;max-height:80px;overflow-y:auto;padding:4px;border:1px solid #eef2f7;border-radius:8px;">
                                ${skillBtns}
                            </div>
                        </div>

                        <!-- 稀有 -->
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
            document.getElementById('alNewPetDefense').value = '';
            document.getElementById('alNewPetHealth').value = '';
            document.getElementById('alNewPetMana').value = '';
            document.getElementById('alNewPetSpeed').value = '';
            document.getElementById('alNewPetDodge').value = '';
            document.getElementById('alNewPetGrowth').value = '';
            document.getElementById('alNewPetSkills').value = '';
            document.getElementById('alNewPetSkillTags').innerHTML = '';
            document.getElementById('alNewPetRare').checked = false;
            document.getElementById('alNewPetType').value = '';
            document.getElementById('alAddPetModal').classList.add('show');
        });
        document.getElementById('alAddPetCancel').addEventListener('click', function() {
            document.getElementById('alAddPetModal').classList.remove('show');
        });
        document.getElementById('alAddPetModal').addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('show');
        });

        // ===== 图鉴选择自动填充 =====
        document.getElementById('alNewPetType').addEventListener('change', function() {
            const name = this.value;
            if (!name) return;
            const type = AlchemyModule.petTypes[name];
            if (!type) return;
            document.getElementById('alNewPetName').value = name;
            document.getElementById('alNewPetSkills').value = type.mustSkills.join(',');
            // 触发技能标签更新
            document.getElementById('alNewPetSkills').dispatchEvent(new Event('input'));
        });

        // ===== 技能输入实时更新标签 =====
        document.getElementById('alNewPetSkills').addEventListener('input', function() {
            const container = document.getElementById('alNewPetSkillTags');
            const mustSkills = AlchemyModule.getMustSkills(document.getElementById('alNewPetName').value.trim());
            const skills = this.value.split(',').map(s => s.trim()).filter(s => s);
            let html = '';
            for (let skill of skills) {
                const isMust = mustSkills.includes(skill);
                html += `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.65rem;margin:2px;background:${isMust ? '#f0d060' : '#e8eef5'};color:${isMust ? '#1f344b' : '#0a1a2a'};border:1px solid ${isMust ? '#dbbd7c' : '#d0dce8'};">${skill}${isMust ? ' 🟡' : ''}</span>`;
            }
            container.innerHTML = html || '<span style="color:#aaa;font-size:0.65rem;">输入技能后自动识别必带技能 🟡</span>';
        });

        // ===== 技能快速选择按钮 =====
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.al-skill-quick-btn');
            if (!btn) return;
            if (btn.dataset.skill) {
                const skill = btn.dataset.skill;
                const input = document.getElementById('alNewPetSkills');
                const current = input.value.trim();
                const skills = current ? current.split(',').map(s => s.trim()).filter(s => s) : [];
                if (!skills.includes(skill)) {
                    skills.push(skill);
                    input.value = skills.join(',');
                    input.dispatchEvent(new Event('input'));
                }
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
                setTimeout(() => {
                    btn.style.background = '#f5f8fc';
                    btn.style.color = '#0a1a2a';
                }, 300);
                return;
            }
            if (btn.dataset.value !== undefined) {
                const val = btn.dataset.value;
                document.getElementById('alNewPetSkillCount').value = val;
                document.querySelectorAll('.al-skill-quick-btn[data-value]').forEach(b => {
                    b.style.background = '#f0f4f8';
                    b.style.color = '#0a1a2a';
                });
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
            }
        });

        // ===== 保存胚子 =====
        document.getElementById('alAddPetConfirm').addEventListener('click', function() {
            const name = document.getElementById('alNewPetName').value.trim();
            if (!name) { alert('请输入宠物名！'); return; }
            const skillCount = parseInt(document.getElementById('alNewPetSkillCount').value) || 0;
            const cost = parseFloat(document.getElementById('alNewPetCost').value) || 0;
            const attack = parseInt(document.getElementById('alNewPetAttack').value) || 0;
            const defense = parseInt(document.getElementById('alNewPetDefense').value) || 0;
            const health = parseInt(document.getElementById('alNewPetHealth').value) || 0;
            const mana = parseInt(document.getElementById('alNewPetMana').value) || 0;
            const speed = parseInt(document.getElementById('alNewPetSpeed').value) || 0;
            const dodge = parseInt(document.getElementById('alNewPetDodge').value) || 0;
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
                defense,
                health,
                mana,
                speed,
                dodge,
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

        // ===== 重置合成模拟 =====
        document.getElementById('alResetSimBtn').addEventListener('click', function() {
            document.getElementById('alSimPet1').value = '';
            document.getElementById('alSimPet2').value = '';
            document.getElementById('alSimResult').innerHTML = '💡 选择两只胚子后点击「模拟合成」';
            document.getElementById('alSimResult').style.color = '#5a7a94';
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
            const mustSkills = this.getMustSkills(p.name);
            const rareText = p.isRare ? '⭐' : '';
            const skillsText = p.skills && p.skills.length > 0 ? p.skills.map(s => {
                const isMust = mustSkills.includes(s);
                return isMust ? `<span style="color:#dbbd7c;font-weight:700;">${s}🟡</span>` : s;
            }).join('、') : '无';
            html += `
                <div class="pet-item" style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-bottom:1px solid #f0f4f8;font-size:0.75rem;flex-wrap:wrap;">
                    <span style="font-weight:600;min-width:50px;">${p.name}</span>
                    <span style="color:#5a7a94;min-width:32px;">${rareText} ${p.skillCount}技</span>
                    <span style="color:#5a7a94;min-width:40px;">⚔️${p.attack || '-'}</span>
                    <span style="color:#5a7a94;min-width:40px;">🛡️${p.defense || '-'}</span>
                    <span style="color:#5a7a94;min-width:40px;">💨${p.speed || '-'}</span>
                    <span style="color:#5a7a94;min-width:44px;">📈${p.growth || '-'}</span>
                    <span style="color:#5a7a94;min-width:40px;">💰${p.cost || 0}万</span>
                    <span style="color:#5a7a94;font-size:0.6rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">技能:${skillsText}</span>
                    <button class="al-del-pet" data-id="${p.id}" style="background:#f5d0d0;border:none;border-radius:30px;padding:1px 10px;font-size:0.6rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
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
                <div class="record-item" style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-bottom:1px solid #f0f4f8;font-size:0.75rem;flex-wrap:wrap;">
                    <span style="color:#5a7a94;min-width:60px;">${r.date || '未知'}</span>
                    <span style="font-weight:600;min-width:70px;">${r.pet1?.name || '?'} + ${r.pet2?.name || '?'}</span>
                    <span style="color:#5a7a94;min-width:32px;">→ ${r.resultName}</span>
                    <span style="color:#5a7a94;min-width:32px;">${r.resultSkills}技</span>
                    <span style="color:#5a7a94;min-width:40px;">💰${r.cost?.toFixed(1) || 0}万</span>
                    <span style="color:#5a7a94;min-width:40px;">📊${r.income?.toFixed(1) || 0}万</span>
                    <span class="${pc}" style="font-weight:700;min-width:50px;">${profitText}</span>
                    ${r.note ? `<span style="color:#5a7a94;font-size:0.65rem;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.note}</span>` : ''}
                    <button class="al-del-record" data-id="${r.id}" style="background:#f5d0d0;border:none;border-radius:30px;padding:1px 10px;font-size:0.6rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
                </div>
            `;
        }
        list.innerHTML = html;
    },

    renderSkillSimulator() {
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
    //  合成模拟核心（优化版）
    // ============================================================
    runSimulation(pet1Id, pet2Id) {
        const pet1 = this.pets.find(p => p.id === pet1Id);
        const pet2 = this.pets.find(p => p.id === pet2Id);
        if (!pet1 || !pet2) { alert('胚子不存在！'); return; }

        const result = document.getElementById('alSimResult');

        // 确定结果宠物（随机取一个作为造型）
        const resultName = Math.random() > 0.5 ? pet1.name : pet2.name;

        // 获取结果宠物的必带技能
        const mustSkills = this.getMustSkills(resultName);

        // 所有技能池（父母技能 + 必带技能）
        const allSkills = [...new Set([...pet1.skills, ...pet2.skills, ...mustSkills])];

        // 统计每个技能的来源
        const skillSources = {};
        for (let skill of allSkills) {
            const fromPet1 = pet1.skills.includes(skill);
            const fromPet2 = pet2.skills.includes(skill);
            const isMust = mustSkills.includes(skill);
            const isRemovedMust = isMust && !fromPet1 && !fromPet2;
            skillSources[skill] = { fromPet1, fromPet2, isMust, isRemovedMust };
        }

        // 计算继承概率
        const skillProb = {};
        for (let [skill, source] of Object.entries(skillSources)) {
            let prob = 0;
            const count = (source.fromPet1 ? 1 : 0) + (source.fromPet2 ? 1 : 0);
            if (source.isMust && !source.isRemovedMust) {
                // 必带技能且没有被垫书打掉 → 必出
                prob = 1.0;
            } else if (source.isRemovedMust) {
                // 必带技能被打掉了 → 作为普通技能参与
                prob = 0.30;
            } else if (count === 2) {
                // 父母共有 → 高概率
                prob = 0.70;
            } else if (count === 1) {
                // 单方有 → 中等概率
                prob = 0.40;
            } else {
                prob = 0.15;
            }
            skillProb[skill] = prob;
        }

        // 计算预计技能数
        const totalSkillCount = pet1.skillCount + pet2.skillCount;
        const baseSkills = Math.floor(totalSkillCount * 0.5);
        const bonusSkills = Math.floor(totalSkillCount * 0.2);
        const minResult = Math.max(mustSkills.length, baseSkills);
        const maxResult = Math.min(Math.floor(totalSkillCount * 0.7), 12);

        // 模拟多次，取平均
        let avgCount = 0;
        let bestSkills = [];
        let worstSkills = [];
        let allSimResults = [];

        for (let sim = 0; sim < 50; sim++) {
            const selected = [];
            const available = Object.entries(skillProb);
            // 必带技能优先
            for (let [skill, prob] of available) {
                if (prob === 1.0 && !selected.includes(skill)) {
                    selected.push(skill);
                }
            }
            // 其他技能按概率抽取
            for (let [skill, prob] of available) {
                if (prob < 1.0 && Math.random() < prob && !selected.includes(skill) && selected.length < 12) {
                    selected.push(skill);
                }
            }
            // 随机打乱顺序
            selected.sort(() => Math.random() - 0.5);
            // 限制最大技能数
            while (selected.length > 12) selected.pop();
            avgCount += selected.length;
            allSimResults.push(selected);
        }

        avgCount = Math.round(avgCount / 50);

        // 找最佳和最差结果
        allSimResults.sort((a, b) => a.length - b.length);
        worstSkills = allSimResults[0] || [];
        bestSkills = allSimResults[allSimResults.length - 1] || [];

        // 计算最可能的技能组合（出现频率最高的技能）
        const skillFreq = {};
        for (let sim of allSimResults) {
            for (let skill of sim) {
                skillFreq[skill] = (skillFreq[skill] || 0) + 1;
            }
        }
        const sortedSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]);
        const mostLikelySkills = sortedSkills.slice(0, Math.min(8, sortedSkills.length)).map(s => s[0]);

        // 生成结果HTML
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
                    <div style="font-weight:700;color:#2d6b2d;font-size:1.1rem;">${avgCount}技能</div>
                    <div style="font-size:0.6rem;color:#5a7a94;">${resultName}</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
                <div style="background:#f5f8fc;border-radius:8px;padding:6px 10px;border:1px solid #dce5ef;">
                    <div style="font-size:0.6rem;color:#5a7a94;">最可能技能</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;">
                        ${mostLikelySkills.map(s => {
                            const isMust = mustSkills.includes(s);
                            return `<span style="padding:1px 6px;border-radius:8px;font-size:0.65rem;background:${isMust ? '#f0d060' : '#e8eef5'};border:1px solid ${isMust ? '#dbbd7c' : '#d0dce8'};">${s}</span>`;
                        }).join('') || '<span style="color:#aaa;font-size:0.65rem;">无</span>'}
                    </div>
                </div>
                <div style="background:#f5f8fc;border-radius:8px;padding:6px 10px;border:1px solid #dce5ef;">
                    <div style="font-size:0.6rem;color:#5a7a94;">技能范围</div>
                    <div style="font-weight:700;color:#1f3b53;font-size:1rem;">${minResult} - ${maxResult} 技能</div>
                    <div style="font-size:0.6rem;color:#5a7a94;">基础 ${baseSkills} + 浮动 ${bonusSkills}</div>
                </div>
            </div>
            <div style="font-size:0.75rem;color:#5a7a94;margin-bottom:4px;">📊 技能继承概率</div>
            <div style="display:flex;flex-wrap:wrap;gap:3px;">
        `;

        const sortedProb = Object.entries(skillProb).sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < Math.min(12, sortedProb.length); i++) {
            const [skill, prob] = sortedProb[i];
            const color = prob >= 0.8 ? '#2d6b2d' : prob >= 0.5 ? '#b48b3a' : '#5a7a94';
            const isMust = mustSkills.includes(skill);
            html += `
                <span style="background:white;border:1px solid #dce5ef;border-radius:12px;padding:2px 8px;font-size:0.65rem;">
                    ${skill}
                    ${isMust ? '🟡' : ''}
                    <span style="color:${color};font-weight:700;">${Math.round(prob * 100)}%</span>
                </span>
            `;
        }

        html += `</div>`;

        if (mustSkills.length > 0) {
            html += `
                <div style="margin-top:6px;font-size:0.65rem;color:#5a7a94;">
                    📌 ${resultName}必带技能：${mustSkills.join('、')}（🟡标记，未打掉则必出）
                </div>
            `;
        }

        result.innerHTML = html;
        result.style.color = '#1a1a2e';
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
