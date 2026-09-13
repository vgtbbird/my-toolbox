// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - 完整重写版
//  功能：任务记录 + 里程碑结算 + 历史统计
//  修复：去除重复声明、所有方法完整实现
// ============================================================
const SoulTaskModule = {
    id: 'soulTask',
    storageKey: 'soulTask',

    // ========== 数据 ==========
    uiSettings: { 
        bgColor: '#eef2f7', 
        cardBgColor: '#ffffff', 
        fontSize: 14 
    },
    records: [],
    history: [],
    prices: {},
    currentRunId: null,
    milestoneIncome: { m15: 0, m30: 0, m45: 0, m60: 0 },
    milestoneDetails: { m15: '', m30: '', m45: '', m60: '' },

    TASK_TYPES: [
        { key: 'find', label: '寻人', icon: '🔍', cost: 0 },
        { key: 'fight', label: '战斗', icon: '⚔️', cost: 0 },
        { key: 'game', label: '小游戏', icon: '🎮', cost: 0 },
        { key: 'ring60', label: '60环', icon: '🔵', cost: 12 },
        { key: 'ring70', label: '70环', icon: '🟠', cost: 25 },
        { key: 'ring80', label: '80环', icon: '🟣', cost: 45 },
        { key: 'medicine', label: '药品', icon: '💊', cost: 2 },
        { key: 'flower', label: '花乐', icon: '🌸', cost: 3 },
        { key: 'pet2', label: '2技能宝宝', icon: '🐾', cost: 8 },
        { key: 'pet3', label: '3技能宝宝', icon: '🐾', cost: 15 },
        { key: 'pet4', label: '4技能宝宝', icon: '🐾', cost: 30 },
        { key: 'pill', label: '炼兽丹', icon: '💊', cost: 10 },
        { key: 'dew', label: '仙露小丸子', icon: '🧪', cost: 15 }
    ],

    // ============================================================
    //  生命周期
    // ============================================================
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        if (typeof App !== 'undefined' && App.register) {
            App.register(this);
        }
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.milestoneIncome = data.milestoneIncome || { m15: 0, m30: 0, m45: 0, m60: 0 };
        this.milestoneDetails = data.milestoneDetails || { m15: '', m30: '', m45: '', m60: '' };
        this.currentRunId = data.currentRunId || Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        this.uiSettings = data.uiSettings || { bgColor: '#eef2f7', cardBgColor: '#ffffff', fontSize: 14 };
        
        this.TASK_TYPES.forEach(t => {
            if (this.prices[t.key] === undefined) this.prices[t.key] = t.cost;
        });
    },

    saveData() {
        // 🆕 生成 V3 历史锚点
        const historyV3 = this.history.map((h, idx) => {
            if (h._id && h._createdAt) {
                return { _id: h._id, _createdAt: h._createdAt, payload: h };
            }
            return {
                _id: `soulTask_hist_${(h.payload?.date || h.date || Date.now())}_${idx}_${Math.random().toString(36).substr(2,6)}`,
                _createdAt: h._createdAt || h.payload?.date || h.date || new Date().toISOString(),
                payload: h
            };
        });
        
        // 🆕 生成 V3 当前轮次锚点
        const recordsV3 = this.records.map((r, idx) => ({
            _id: r.id || r._id || `${this.currentRunId}_rec_${idx}`,
            _index: r.taskIndex || idx + 1,
            _createdAt: r._createdAt || r.date || new Date().toISOString(),
            runId: r.runId || this.currentRunId || 'unknown_run',
            payload: r
        }));
        
        const recordsLastUpdated = this.records.length > 0
            ? (this.records[this.records.length - 1].clickTimestamp 
               || new Date(this.records[this.records.length - 1].date).getTime() 
               || Date.now())
            : 0;
        
        Storage.set(this.storageKey, {
            records: this.records, 
            history: this.history, 
            prices: this.prices,
            currentRunId: this.currentRunId, 
            milestoneIncome: this.milestoneIncome,
            milestoneDetails: this.milestoneDetails,
            // 🆕 V3 结构
            __sync_v3: {
                history: historyV3,
                records: recordsV3,
                _meta: {
                    version: '3.0',
                    lastUpdated: Date.now(),
                    recordsLastUpdated: recordsLastUpdated
                }
            }
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;
        
        const tabContent = container.closest('.tab-content');
        if (tabContent) {
            tabContent.style.setProperty('background', s.bgColor, 'important');
        }
        
        container.querySelectorAll('.module, .stats-grid .stat-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });
        
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .st-task-btn, .st-task-count, input, select, button, #stHistoryTable td, #stHistoryTable th').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

    // ============================================================
    //  计算
    // ============================================================
    calcStats() {
        let totalCost = 0;
        const typeCount = {};
        this.TASK_TYPES.forEach(t => typeCount[t.key] = 0);
        
        for (let r of this.records) {
            totalCost += parseFloat(r.payload?.cost || r.cost || 0);
            const key = r.payload?.typeKey || r.typeKey;
            if (key && typeCount[key] !== undefined) {
                typeCount[key] += (r.payload?.count || r.count || 1);
            }
        }
        
        const totalIncome = (parseFloat(this.milestoneIncome.m15) || 0) + 
                           (parseFloat(this.milestoneIncome.m30) || 0) + 
                           (parseFloat(this.milestoneIncome.m45) || 0) + 
                           (parseFloat(this.milestoneIncome.m60) || 0);
        const profit = totalIncome - totalCost;
        
        return { 
            totalCost: totalCost.toFixed(1), 
            totalIncome: totalIncome.toFixed(1), 
            profit: profit.toFixed(1), 
            typeCount, 
            ringCount: this.records.length 
        };
    },

    // ============================================================
    //  构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const taskBtns = this.TASK_TYPES.map(t => `
            <div class="st-task-wrapper" data-key="${t.key}" style="display:flex;flex-direction:column;align-items:center;">
                <button class="st-task-btn" data-key="${t.key}" style="background:#4CAF50;color:#fff;border:none;border-radius:30px;padding:6px 12px;font-size:0.8rem;font-weight:700;cursor:pointer;width:100%;">
                    ${t.icon} ${t.label}
                </button>
                <span class="st-task-count" style="font-weight:700;color:#7a5d2e;background:#e6d7b8;padding:0 8px;border-radius:12px;margin-top:2px;min-width:20px;text-align:center;">0</span>
            </div>
        `).join('');

        const milestoneCards = this.buildMilestoneCards();

        container.innerHTML = `
            <!-- 界面设置 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="stToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stUISettingsBody">
                    <div style="display:flex;gap:10px;flex-wrap:wrap;padding:6px 0;">
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">🎨 背景色 <input type="color" id="stBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:30px;border-radius:4px;border:1px solid #ddd;cursor:pointer;"></label>
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">📦 卡片色 <input type="color" id="stCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:30px;border-radius:4px;border:1px solid #ddd;cursor:pointer;"></label>
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">🔤 字体 <input type="number" id="stFontSize" value="${this.uiSettings.fontSize}" min="12" max="20" style="width:50px;padding:2px 4px;border-radius:4px;border:1px solid #ddd;text-align:center;"></label>
                    </div>
                </div>
            </div>

            <!-- 顶部看板 -->
            <div class="stats-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
                <div class="stat-item"><div class="num" id="stTotalCost">0</div><div class="label">💰 实时成本</div></div>
                <div class="stat-item"><div class="num" id="stRingCount">0 / 60</div><div class="label">📌 当前环数</div></div>
                <div class="stat-item"><div class="num" id="stAvgCost">0</div><div class="label">📊 平均成本</div></div>
                <div class="stat-item" id="stProfitBox"><div class="num" id="stProfit">0</div><div class="label">📈 实时利润</div></div>
            </div>

            <!-- 任务类型 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📋 任务类型</div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-undo" id="stUndoBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 16px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.7rem;">↩️ 撤销</button>
                        <button class="toggle-btn" id="stToggleTasks" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="stTasksBody">
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">${taskBtns}</div>
                </div>
            </div>

            <!-- 里程碑 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🏆 里程碑收入</div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <span style="font-weight:700;font-size:0.85rem;">总收入: <span id="stMilestoneTotalIncome">0</span>万</span>
                        <button class="toggle-btn" id="stToggleMilestones" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="stMilestonesBody" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                    ${milestoneCards}
                </div>
            </div>

            <!-- 物品单价 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">⚙️ 物品单价 (万)</div>
                    <button class="toggle-btn" id="stTogglePrices" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stPricesBody" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${this.TASK_TYPES.filter(t => t.cost > 0).map(t => `
                        <div style="display:flex;align-items:center;gap:3px;font-size:0.7rem;">
                            <label style="font-weight:600;white-space:nowrap;color:#1f3b53;">${t.label}</label>
                            <input type="number" id="stPrice_${t.key}" value="${this.prices[t.key]}" data-key="${t.key}" style="width:55px;padding:3px 4px;border:1px solid #bccad9;border-radius:8px;text-align:center;font-weight:600;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 本轮明细 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📜 本轮记录明细</div>
                    <button class="toggle-btn" id="stToggleDetails" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stDetailsBody" style="max-height:200px;overflow-y:auto;"></div>
            </div>

            <!-- 操作按钮 -->
            <div style="display:flex;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap;">
                <button id="stCompleteBtn" style="background:#b48b5f;color:#fff;border:none;padding:8px 24px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.85rem;">🏁 完成本轮</button>
                <button id="stResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:8px 24px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.85rem;">🗑️ 重置本轮</button>
            </div>

            <!-- 历史记录 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span id="stHistoryCountLabel" style="font-weight:400;font-size:0.75rem;color:#5a7a94;">共0轮</span></div>
                    <div style="display:flex;gap:6px;">
                        <button id="stAnalysisBtn" style="background:#2b4b6a;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.65rem;">📊 分析</button>
                        <button class="toggle-btn" id="stToggleHistory" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="stHistoryBody">
                    <div style="overflow-x:auto;border-radius:12px;border:1px solid #d0dce8;">
                        <table style="width:100%;min-width:700px;border-collapse:collapse;font-size:0.8rem;">
                            <thead>
                                <tr style="background:#1f344b;color:#f0ebdd;">
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:5%;">#</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:14%;">📅 日期</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">💰 成本</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">15环</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">30环</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">45环</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">60环</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:12%;">📈 利润</th>
                                    <th style="padding:8px 6px;text-align:center;border:1px solid #3a5a7a;width:9%;">⚙️</th>
                                </tr>
                            </thead>
                            <tbody id="stHistoryTable">
                                <tr><td colspan="9" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无历史记录</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    buildMilestoneCards() {
        return [15, 30, 45, 60].map(ring => {
            const isFinal = ring === 60;
            const items = isFinal ? ['阳玉魄', '阴玉魄'] : ['女娲灵契', '女娲祝符', '五色灵尘'];
            const currentVal = this.milestoneIncome['m' + ring] || 0;
            const currentDetail = this.milestoneDetails['m' + ring] || '';

            return `
                <div style="border:1px solid #d0dce8;border-radius:12px;padding:10px;background:#f8faff;">
                    <div style="font-weight:700;font-size:0.85rem;color:#1f3b53;margin-bottom:6px;">${ring}环奖励</div>
                    <select id="stMsItem_${ring}" style="width:100%;padding:4px 6px;border:1px solid #bccad9;border-radius:8px;font-size:0.75rem;margin-bottom:6px;">
                        ${items.map(item => `<option value="${item}" ${currentDetail === item ? 'selected' : ''}>${item}</option>`).join('')}
                    </select>
                    <input type="number" id="stMsVal_${ring}" placeholder="价值(万)" value="${currentVal}" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:8px;text-align:center;font-weight:600;margin-bottom:6px;">
                    <button class="stSaveMilestone" data-ring="${ring}" style="width:100%;background:#4c7a5c;color:#fff;border:none;padding:6px;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.75rem;">💾 保存</button>
                </div>
            `;
        }).join('');
    },

    // ============================================================
    //  事件绑定
    // ============================================================
    bindEvents() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        // 折叠按钮
        const toggleMap = {
            'stToggleUISettings': 'stUISettingsBody',
            'stToggleTasks': 'stTasksBody',
            'stToggleMilestones': 'stMilestonesBody',
            'stTogglePrices': 'stPricesBody',
            'stToggleDetails': 'stDetailsBody',
            'stToggleHistory': 'stHistoryBody'
        };

        Object.keys(toggleMap).forEach(btnId => {
            const btn = document.getElementById(btnId);
            const bodyId = toggleMap[btnId];
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const body = document.getElementById(bodyId);
                    if (!body) return;
                    if (body.style.display === 'none') {
                        body.style.display = body.dataset.originalDisplay || 'block';
                        this.textContent = '👁️ 隐藏';
                    } else {
                        body.dataset.originalDisplay = body.style.display || 'block';
                        body.style.display = 'none';
                        this.textContent = '👁️ 显示';
                    }
                });
            }
        });

        // UI设置
        document.getElementById('stBgColor').addEventListener('input', function() {
            SoulTaskModule.uiSettings.bgColor = this.value;
            SoulTaskModule.applyUISettings();
            SoulTaskModule.saveData();
        });
        document.getElementById('stCardColor').addEventListener('input', function() {
            SoulTaskModule.uiSettings.cardBgColor = this.value;
            SoulTaskModule.applyUISettings();
            SoulTaskModule.saveData();
        });
        document.getElementById('stFontSize').addEventListener('change', function() {
            SoulTaskModule.uiSettings.fontSize = parseInt(this.value) || 14;
            SoulTaskModule.applyUISettings();
            SoulTaskModule.saveData();
        });

        // 里程碑保存
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.stSaveMilestone');
            if (btn) {
                const ring = parseInt(btn.dataset.ring);
                const itemSelect = document.getElementById('stMsItem_' + ring);
                const valInput = document.getElementById('stMsVal_' + ring);
                if (!itemSelect || !valInput) return;
                
                SoulTaskModule.milestoneIncome['m' + ring] = parseFloat(valInput.value) || 0;
                SoulTaskModule.milestoneDetails['m' + ring] = itemSelect.value;
                SoulTaskModule.saveData();
                SoulTaskModule.render();
                alert('✅ ' + ring + '环已保存！');
            }
        });

        // 任务点击
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.st-task-btn');
            if (btn) {
                SoulTaskModule.openTaskQuantityModal(btn.dataset.key);
            }
        });

        // 单价修改
        container.addEventListener('change', function(e) {
            const input = e.target.closest('[data-key]');
            if (input && input.id && input.id.startsWith('stPrice_')) {
                SoulTaskModule.prices[input.dataset.key] = parseFloat(input.value) || 0;
                SoulTaskModule.saveData();
            }
        });

        // 撤销
        document.getElementById('stUndoBtn').addEventListener('click', function() {
            if (SoulTaskModule.records.length > 0) {
                SoulTaskModule.records.pop();
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            } else {
                alert('没有可撤销的记录！');
            }
        });

        // 完成本轮
        document.getElementById('stCompleteBtn').addEventListener('click', function() {
            const stats = SoulTaskModule.calcStats();
            const totalIncome = parseFloat(stats.totalIncome);
            const totalCost = parseFloat(stats.totalCost);
            const profit = totalIncome - totalCost;
            
            const hasIncome = SoulTaskModule.milestoneIncome.m15 > 0 || 
                              SoulTaskModule.milestoneIncome.m30 > 0 || 
                              SoulTaskModule.milestoneIncome.m45 > 0 || 
                              SoulTaskModule.milestoneIncome.m60 > 0;
            
            if (!hasIncome && SoulTaskModule.records.length > 0) {
                if (!confirm('⚠️ 尚未保存任何里程碑收入，确定要结算吗？')) return;
            }
            
            if (SoulTaskModule.records.length === 0) {
                alert('还没有任何记录！');
                return;
            }
            
            if (!confirm(`当前 ${stats.ringCount} 环，总收入 ${totalIncome}万，总成本 ${totalCost}万，利润 ${profit.toFixed(1)}万，确认结算？`)) return;
            
            const entry = {
                _id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                _createdAt: new Date().toISOString(),
                payload: {
                    totalCost: totalCost.toFixed(1),
                    totalIncome: totalIncome.toFixed(1),
                    profit: profit.toFixed(1),
                    ringCount: stats.ringCount,
                    milestoneData: { ...SoulTaskModule.milestoneIncome },
                    milestoneDetails: { ...SoulTaskModule.milestoneDetails }
                }
            };
            
            SoulTaskModule.history.push(entry);
            SoulTaskModule.records = [];
            SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            SoulTaskModule.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
            SoulTaskModule.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
            SoulTaskModule.saveData();
            SoulTaskModule.render();
            alert('✅ 本轮已结算！');
        });

        // 重置
        document.getElementById('stResetBtn').addEventListener('click', function() {
            if (confirm('确定要重置本轮全部数据吗？')) {
                SoulTaskModule.records = [];
                SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                SoulTaskModule.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
                SoulTaskModule.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        // 分析
        document.getElementById('stAnalysisBtn').addEventListener('click', function() {
            if (SoulTaskModule.history.length === 0) {
                alert('暂无历史数据');
                return;
            }
            let totalCost = 0, totalProfit = 0, wins = 0;
            for (let h of SoulTaskModule.history) {
                const cost = parseFloat(h.payload?.totalCost || 0);
                const profit = parseFloat(h.payload?.profit || 0);
                totalCost += cost;
                totalProfit += profit;
                if (profit > 0) wins++;
            }
            const avgCost = (totalCost / SoulTaskModule.history.length).toFixed(1);
            const avgProfit = (totalProfit / SoulTaskModule.history.length).toFixed(1);
            const winRate = ((wins / SoulTaskModule.history.length) * 100).toFixed(0);
            alert(`📊 历史数据分析\n\n总轮数: ${SoulTaskModule.history.length}\n总成本: ${totalCost.toFixed(1)}万\n总利润: ${totalProfit.toFixed(1)}万\n平均成本: ${avgCost}万\n平均利润: ${avgProfit}万\n盈利轮数: ${wins}\n盈利率: ${winRate}%`);
        });

        // 删除历史
        container.addEventListener('click', function(e) {
            const delBtn = e.target.closest('.stDelHistory');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                if (!isNaN(idx) && idx >= 0 && idx < SoulTaskModule.history.length) {
                    if (confirm('确定删除这条历史记录吗？')) {
                        SoulTaskModule.history.splice(idx, 1);
                        SoulTaskModule.saveData();
                        SoulTaskModule.render();
                    }
                }
            }
        });
    },

    // ============================================================
    //  任务数量弹窗
    // ============================================================
    openTaskQuantityModal(key) {
        const type = this.TASK_TYPES.find(t => t.key === key);
        if (!type) return;
        const unitPrice = this.prices[key] || 0;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';
        
        overlay.innerHTML = `
            <div style="background:#f8faff;border-radius:24px;padding:24px;max-width:340px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <div style="text-align:center;margin-bottom:12px;">
                    <span style="font-size:2rem;">${type.icon}</span>
                    <div style="font-size:1.1rem;font-weight:700;color:#1f3b53;">${type.label}</div>
                    <div style="font-size:0.8rem;color:#5a7a94;">单价: ${unitPrice}万/个</div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `
                        <button class="stQtyBtn" data-qty="${n}" style="padding:10px 0;border:2px solid #d0dce8;border-radius:12px;background:#f0f4f8;font-size:1.1rem;font-weight:700;color:#1f3b53;cursor:pointer;transition:0.15s;">${n}</button>
                    `).join('')}
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <input type="number" id="stQtyManual" placeholder="自定义" min="1" style="flex:1;padding:8px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.9rem;text-align:center;">
                    <button id="stQtyManualBtn" style="background:#4c7a5c;color:#fff;border:none;border-radius:12px;padding:0 16px;font-weight:700;cursor:pointer;">确定</button>
                </div>
                <div style="text-align:center;font-size:0.9rem;font-weight:700;color:#c0392b;margin-bottom:12px;">总成本: <span id="stQtyTotal">0</span>万</div>
                <div style="display:flex;gap:12px;justify-content:flex-end;">
                    <button id="stQtyCancel" style="padding:8px 20px;border:none;border-radius:30px;background:#dce5ef;color:#1f3b53;font-weight:600;cursor:pointer;">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const updateTotal = () => {
            let num = parseInt(document.getElementById('stQtyManual').value) || 0;
            if (num <= 0) {
                const active = overlay.querySelector('.stQtyBtn.active');
                if (active) num = parseInt(active.dataset.qty) || 1;
                else num = 1;
            }
            document.getElementById('stQtyTotal').textContent = (num * unitPrice).toFixed(1);
        };

        overlay.querySelectorAll('.stQtyBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                overlay.querySelectorAll('.stQtyBtn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#d0dce8';
                });
                this.classList.add('active');
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
                document.getElementById('stQtyManual').value = '';
                updateTotal();
            });
        });

        document.getElementById('stQtyManual').addEventListener('input', updateTotal);
        
        document.getElementById('stQtyManualBtn').addEventListener('click', function() {
            const qty = parseInt(document.getElementById('stQtyManual').value) || 1;
            if (qty > 0) {
                SoulTaskModule.records.push({
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    runId: SoulTaskModule.currentRunId,
                    taskIndex: SoulTaskModule.records.length + 1,
                    createdAt: new Date().toISOString(),
                    payload: { typeKey: key, cost: qty * unitPrice, count: qty }
                });
                SoulTaskModule.saveData();
                SoulTaskModule.render();
                overlay.remove();
            }
        });

        document.getElementById('stQtyCancel').addEventListener('click', function() {
            overlay.remove();
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        // 默认选中1
        const firstBtn = overlay.querySelector('.stQtyBtn');
        if (firstBtn) firstBtn.click();
    },

    // ============================================================
    //  渲染
    // ============================================================
    render() {
        this.updateStats();
        this.updateDetails();
        this.updateHistory();
        setTimeout(() => this.applyUISettings(), 100);
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost;
        document.getElementById('stRingCount').textContent = `${stats.ringCount} / 60`;
        document.getElementById('stAvgCost').textContent = stats.ringCount > 0 ? (parseFloat(stats.totalCost) / stats.ringCount).toFixed(1) : '0';
        document.getElementById('stProfit').textContent = stats.profit;
        
        const profitBox = document.getElementById('stProfitBox');
        if (profitBox) {
            profitBox.className = 'stat-item ' + (parseFloat(stats.profit) >= 0 ? 'profit' : 'loss');
        }

        document.querySelectorAll('.st-task-wrapper').forEach(w => {
            const key = w.dataset.key;
            const ce = w.querySelector('.st-task-count');
            if (ce && stats.typeCount[key] !== undefined) {
                ce.textContent = stats.typeCount[key];
            }
        });

        // 更新总收入
        const total = (parseFloat(this.milestoneIncome.m15) || 0) + 
                      (parseFloat(this.milestoneIncome.m30) || 0) + 
                      (parseFloat(this.milestoneIncome.m45) || 0) + 
                      (parseFloat(this.milestoneIncome.m60) || 0);
        const el = document.getElementById('stMilestoneTotalIncome');
        if (el) el.textContent = total.toFixed(1);
    },

    updateDetails() {
        const list = document.getElementById('stDetailsBody');
        if (!list) return;
        if (this.records.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:#6c87a0;padding:10px;font-size:0.85rem;">暂无记录</div>';
            return;
        }
        let html = '';
        const recent = this.records.slice(-30).reverse();
        for (let r of recent) {
            const type = this.TASK_TYPES.find(t => t.key === (r.payload?.typeKey || r.typeKey));
            const label = type ? type.label : (r.payload?.typeKey || r.typeKey);
            const cost = r.payload?.cost || r.cost || 0;
            const count = r.payload?.count || 1;
            html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #eef2f7;font-size:0.75rem;">
                <span style="color:#1f3b53;">${r.taskIndex || '?'}. ${label} ×${count}</span>
                <span style="color:#c0392b;font-weight:700;">-${cost.toFixed(1)}万</span>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistory() {
        const tbody = document.getElementById('stHistoryTable');
        const countLabel = document.getElementById('stHistoryCountLabel');
        if (!tbody) return;

        if (countLabel) {
            countLabel.textContent = `共${this.history.length}轮`;
        }

        if (this.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无历史记录</td></tr>';
            return;
        }

        let html = '';
        const list = [...this.history].reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = i + 1;
            const payload = h.payload || {};
            const totalCost = parseFloat(payload.totalCost || 0);
            const mData = payload.milestoneData || {};
            const m15 = parseFloat(mData.m15 || 0);
            const m30 = parseFloat(mData.m30 || 0);
            const m45 = parseFloat(mData.m45 || 0);
            const m60 = parseFloat(mData.m60 || 0);
            const totalIncome = m15 + m30 + m45 + m60;
            const profit = totalIncome - totalCost;
            const profitColor = profit >= 0 ? '#2d6b2d' : '#c0392b';
            const dateStr = h._createdAt ? h._createdAt.split('T')[0] : '-';
            const originalIdx = this.history.indexOf(h);

            html += `<tr style="border-bottom:1px solid #eef2f7;">
                <td style="padding:6px 8px;text-align:center;background:#f5f8fc;font-weight:700;color:#1f3b53;border:1px solid #e8eef5;">${row}</td>
                <td style="padding:6px 8px;text-align:center;color:#1f3b53;border:1px solid #e8eef5;">${dateStr}</td>
                <td style="padding:6px 8px;text-align:center;font-weight:600;color:#1f3b53;border:1px solid #e8eef5;">${totalCost.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;color:#1f3b53;border:1px solid #e8eef5;">${m15.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;color:#1f3b53;border:1px solid #e8eef5;">${m30.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;color:#1f3b53;border:1px solid #e8eef5;">${m45.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;color:#1f3b53;border:1px solid #e8eef5;">${m60.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;font-weight:700;color:${profitColor};border:1px solid #e8eef5;">${profit.toFixed(1)}</td>
                <td style="padding:6px 8px;text-align:center;border:1px solid #e8eef5;">
                    <button class="stDelHistory" data-idx="${originalIdx}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html;

        // 绑定删除事件
        tbody.querySelectorAll('.stDelHistory').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.dataset.idx);
                if (!isNaN(idx) && idx >= 0 && idx < SoulTaskModule.history.length) {
                    if (confirm('确定删除这条历史记录吗？')) {
                        SoulTaskModule.history.splice(idx, 1);
                        SoulTaskModule.saveData();
                        SoulTaskModule.render();
                    }
                }
            };
        });
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoulTaskModule.init());
} else {
    SoulTaskModule.init();
}

window.SoulTaskModule = SoulTaskModule;
