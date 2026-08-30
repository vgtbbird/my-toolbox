// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - V4 完整版
//  功能：任务记录(快捷数量弹窗) + 里程碑结算 + 成本统计
// ============================================================
const SoulTaskModule = {
    id: 'soulTask',
    storageKey: 'soulTask',
    uiSettings: { bgColor: '#eef2f7', btnColor: '#4CAF50', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14 },
    records: [],           // 当前轮次记录
    history: [],           // 已结算的历史轮次
    prices: {},            // 物品价格设置
    currentRunId: null,    // 当前轮次ID
    currentMilestone: 0,   // 当前已结算里程碑
    pendingSettle: {},     // 待结算数据

    // ========== 任务类型定义 ==========
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

    // 里程碑定义
    MILESTONES: [
        { ring: 15, label: '15环奖励', defaultItems: ['五色灵尘', '女娲灵契'] },
        { ring: 30, label: '30环奖励', defaultItems: ['五色灵尘', '女娲祝符'] },
        { ring: 45, label: '45环奖励', defaultItems: ['五色灵尘', '女娲灵契', '女娲祝符'] },
        { ring: 60, label: '60环终局', defaultItems: ['上古玉魄', '五色灵尘'] }
    ],

    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.currentMilestone = data.currentMilestone || 0;
        this.pendingSettle = data.pendingSettle || {};
        this.currentRunId = data.currentRunId || null;
        if (!this.currentRunId) this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        this.TASK_TYPES.forEach(t => { if (this.prices[t.key] === undefined) this.prices[t.key] = t.cost; });
    },

    saveData() {
        Storage.set(this.storageKey, { records: this.records, history: this.history, prices: this.prices, currentRunId: this.currentRunId, currentMilestone: this.currentMilestone, pendingSettle: this.pendingSettle });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;
        container.querySelectorAll('.module, .stats-grid .stat-item').forEach(el => el.style.setProperty('background', s.cardBgColor, 'important'));
    },

    calcStats() {
        let totalCost = 0;
        const typeCount = {};
        this.TASK_TYPES.forEach(t => typeCount[t.key] = 0);
        for (let r of this.records) {
            const payload = r.payload || {};
            totalCost += parseFloat(payload.cost || 0);
            const key = payload.typeKey || '';
            if (typeCount[key] !== undefined) typeCount[key]++;
        }
        return { totalCost: totalCost.toFixed(1), typeCount, ringCount: this.records.length };
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const taskBtns = this.TASK_TYPES.map(t => `
            <div class="st-task-wrapper" data-key="${t.key}" style="display:flex;flex-direction:column;align-items:center;">
                <button class="st-task-btn" data-key="${t.key}" style="background:#4CAF50;color:#fff;border:none;border-radius:30px;padding:8px 10px;font-size:0.8rem;font-weight:700;cursor:pointer;text-align:center;width:100%;">
                    ${t.icon} ${t.label}
                </button>
                <span class="st-task-count" style="font-weight:700;color:#7a5d2e;background:#e6d7b8;padding:0 8px;border-radius:12px;margin-top:2px;min-width:20px;text-align:center;">0</span>
            </div>
        `).join('');

        const milestoneBtns = this.MILESTONES.map((m, idx) => {
            const isDone = this.currentMilestone >= m.ring;
            const isNext = this.currentMilestone + 15 === m.ring;
            const bg = isDone ? '#4c7a5c' : (isNext ? '#dbbd7c' : '#bccad9');
            return `<button class="st-milestone-btn" data-ring="${m.ring}" style="background:${bg};color:#fff;border:none;border-radius:20px;padding:8px 20px;font-size:0.75rem;font-weight:700;cursor:${isNext ? 'pointer' : 'not-allowed'};margin:2px;">${m.label}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="stToggleUI" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stUIBody" style="display:flex;gap:10px;flex-wrap:wrap;">
                    <label>🎨 背景色 <input type="color" id="stBgColor" value="${this.uiSettings.bgColor}" style="width:40px;height:24px;"></label>
                    <label>📦 卡片色 <input type="color" id="stCardColor" value="${this.uiSettings.cardBgColor}" style="width:40px;height:24px;"></label>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="stTotalCost">0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="stRingCount">0 / 60</div><div class="label">📌 当前环数</div></div>
                <div class="stat-item"><div class="num" id="stCurrentMilestone">0</div><div class="label">🏁 当前里程碑</div></div>
                <div class="stat-item"><div class="num" id="stHistoryCount">0</div><div class="label">📜 历史轮次</div></div>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span style="font-size:0.7rem;font-weight:400;">— 点击弹出数量选择</span></div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-undo" id="stUndoBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">↩️ 撤销</button>
                        <button class="toggle-btn" id="stToggleTask" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="stTaskBody">
                    <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:4px;">${taskBtns}</div>
                </div>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🏆 里程碑结算与收益</div>
                    <button class="toggle-btn" id="stToggleMilestone" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stMilestoneBody">
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">${milestoneBtns}</div>
                    <table style="width:100%;font-size:0.8rem;border-collapse:collapse;background:#f8faff;">
                        <thead><tr style="background:#1f344b;color:#fff;"><th style="padding:6px;">里程碑</th><th>获得物品</th><th>收入(万)</th><th>操作</th></tr></thead>
                        <tbody id="stMilestoneTable"><tr><td colspan="4" style="text-align:center;padding:10px;color:#6c87a0;">暂无数据</td></tr></tbody>
                    </table>
                </div>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header"><div class="title">⚙️ 物品单价 (万)</div><button class="toggle-btn" id="stTogglePrice" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button></div>
                <div class="module-body" id="stPriceBody" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${this.TASK_TYPES.filter(t => t.cost > 0).map(t => `
                        <div style="display:flex;align-items:center;gap:2px;font-size:0.7rem;">
                            <label style="white-space:nowrap;">${t.label}</label>
                            <input type="number" id="stPrice_${t.key}" value="${this.prices[t.key]}" data-key="${t.key}" style="width:50px;padding:2px;border:1px solid #bccad9;border-radius:4px;text-align:center;font-weight:700;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header"><div class="title">📜 本轮记录明细</div><button class="toggle-btn" id="stToggleRecords" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button></div>
                <div class="module-body" id="stRecordsBody" style="max-height:200px;overflow-y:auto;font-size:0.75rem;padding:0 4px;"></div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
                <button id="stResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:8px 24px;border-radius:40px;font-weight:700;cursor:pointer;">🗑️ 重置本轮</button>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span id="stHistoryCountLabel">共0轮</span></div>
                    <button class="btn-analysis" id="stAnalysisBtn" style="border-radius:50px;">📊 分析</button>
                </div>
                <div class="module-body" style="max-height:300px;overflow-y:auto;">
                    <table style="width:100%;font-size:0.75rem;border-collapse:collapse;">
                        <thead><tr style="background:#1f344b;color:#fff;"><th>#</th><th>日期</th><th>成本</th><th>15环</th><th>30环</th><th>45环</th><th>60环</th><th>利润</th><th>操作</th></tr></thead>
                        <tbody id="stHistoryTable"></tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const toggles = [['stToggleUI', 'stUIBody'], ['stToggleTask', 'stTaskBody'], ['stToggleMilestone', 'stMilestoneBody'], ['stTogglePrice', 'stPriceBody'], ['stToggleRecords', 'stRecordsBody']];
        toggles.forEach(([btnId, bodyId]) => {
            const btn = document.getElementById(btnId);
            if (btn) btn.addEventListener('click', () => { document.getElementById(bodyId).classList.toggle('hidden'); btn.textContent = document.getElementById(bodyId).classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏'; });
        });

        document.getElementById('stBgColor').addEventListener('input', function() { SoulTaskModule.uiSettings.bgColor = this.value; SoulTaskModule.applyUISettings(); });
        document.getElementById('stCardColor').addEventListener('input', function() { SoulTaskModule.uiSettings.cardBgColor = this.value; SoulTaskModule.applyUISettings(); });

        // 修改物品价格
        container.addEventListener('change', (e) => {
            const input = e.target.closest('[data-key]');
            if (input && input.id.startsWith('stPrice_')) {
                const key = input.dataset.key;
                SoulTaskModule.prices[key] = parseFloat(input.value) || 0;
                SoulTaskModule.saveData();
                SoulTaskModule.updateStats();
            }
        });

        // 点击任务卡片，弹出数量快捷选择
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-task-btn');
            if (btn) {
                SoulTaskModule.showQuantityModal(btn.dataset.key);
            }
        });

        // 点击里程碑
        container.addEventListener('click', (e) => {
             const btn = e.target.closest('.st-milestone-btn');
            if (btn) {
                const ring = parseInt(btn.dataset.ring);
                // 🛠️ 允许点击所有还没结算的里程碑，方便您随时补录！
                if (SoulTaskModule.currentMilestone < ring && !SoulTaskModule.pendingSettle[`m${ring}`]) {
                    SoulTaskModule.showMilestoneModal(ring);
                }
            }
        });

        // 撤销
        document.getElementById('stUndoBtn').addEventListener('click', () => {
            if (SoulTaskModule.records.length > 0) {
                SoulTaskModule.records.pop();
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        // 重置
        document.getElementById('stResetBtn').addEventListener('click', () => {
            if (confirm('确定要重置本轮全部记录吗？')) {
                SoulTaskModule.records = [];
                SoulTaskModule.currentMilestone = 0;
                SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                SoulTaskModule.pendingSettle = {};
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        // 分析
        document.getElementById('stAnalysisBtn').addEventListener('click', () => {
            const avgProfit = SoulTaskModule.history.length > 0 ? (SoulTaskModule.history.reduce((s, h) => s + h.payload.profit, 0) / SoulTaskModule.history.length).toFixed(1) : 0;
            alert(`📊 历史数据分析\n\n已跑总轮数: ${SoulTaskModule.history.length}\n平均每轮利润: ${avgProfit} 万`);
        });

        // 历史删除
        container.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.st-del-history');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                if (confirm('确定删除这条历史吗？')) {
                    SoulTaskModule.history.splice(idx, 1);
                    SoulTaskModule.saveData();
                    SoulTaskModule.render();
                }
            }
        });
    },

    // 🆕 数量快捷选择弹窗
    showQuantityModal(taskKey) {
        const type = this.TASK_TYPES.find(t => t.key === taskKey);
        if (!type) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
        
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:24px;padding:20px;width:320px;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
                <div style="text-align:center;margin-bottom:15px;">
                    <span style="font-size:2rem;">${type.icon}</span>
                    <h3 style="color:#1f3b53;margin:5px 0;font-size:1.1rem;">${type.label}</h3>
                    <div style="font-size:0.8rem;color:#5a7a94;">当前单价：${this.prices[taskKey]}万/个</div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;margin-bottom:15px;">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `
                        <button class="qty-btn" data-qty="${n}" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:12px;padding:10px 0;font-size:1.2rem;font-weight:700;color:#1f3b53;cursor:pointer;">${n}</button>
                    `).join('')}
                </div>
                <div style="display:flex;gap:6px;margin-bottom:15px;">
                    <input type="number" id="manualQty" placeholder="自定义数量" min="1" style="flex:1;padding:8px;border:1px solid #bccad9;border-radius:8px;font-size:0.9rem;text-align:center;">
                    <button id="manualQtyBtn" style="background:#4c7a5c;color:#fff;border:none;border-radius:8px;padding:0 15px;font-weight:700;cursor:pointer;">确定</button>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:6px;">
                    <button id="qtyCancelBtn" style="background:#dce5ef;border:none;border-radius:30px;padding:8px 20px;color:#1f3b53;font-weight:700;cursor:pointer;">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 点击快捷数量
        overlay.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const qty = parseInt(btn.dataset.qty);
                overlay.remove();
                this.addRecord(taskKey, qty);
            });
        });

        // 手动输入数量
        document.getElementById('manualQtyBtn').addEventListener('click', () => {
            const qty = parseInt(document.getElementById('manualQty').value);
            if (qty > 0) {
                overlay.remove();
                this.addRecord(taskKey, qty);
            }
        });

        document.getElementById('qtyCancelBtn').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    },

    // 记录任务（支持数量）
    addRecord(key, qty) {
        if (this.records.length >= 60) { alert('本轮已跑满60环，请先完成终局结算！'); return; }
        
        qty = qty || 1; // 默认1个
        const type = this.TASK_TYPES.find(t => t.key === key);
        const unitPrice = this.prices[key] || 0;
        const totalCost = unitPrice * qty; // 总成本 = 单价 * 数量
        const idx = this.records.length;

        this.records.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            runId: this.currentRunId,
            taskIndex: idx + 1,
            createdAt: new Date().toISOString(),
            payload: {
                typeKey: key,
                qty: qty,
                unitPrice: unitPrice,
                cost: totalCost
            }
        });

        this.saveData();
        this.render();

        // 自动触发里程碑
        if (this.records.length === 15 || this.records.length === 30 || this.records.length === 45) this.showMilestoneModal(this.records.length);
        if (this.records.length === 60) this.showMilestoneModal(60);
    },

    // 里程碑结算弹窗（15/30/45 三选一固定产物；60 阴阳玉魄点选）
    showMilestoneModal(ring) {
        const stats = this.calcStats();
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;justify-content:center;align-items:center;';
        
        const m = this.MILESTONES.find(m => m.ring === ring);
        if (!m) return;
        
        const totalCost = stats.totalCost;
        const isFinal = ring === 60;

        // 🌟 15/30/45环：固定三种产物选项
        const stageItems = ['女娲祝符', '五色灵尘', '女娲灵契'];
        
        // 🌟 60环：阴阳玉魄固定选项（额外带五色灵尘作为辅助收入）
        const finalItems = ['阳玉魄', '阴玉魄'];

        let optionsHtml = '';
        
        if (!isFinal) {
            // 15/30/45 循环生成三选一按钮
            optionsHtml = stageItems.map(item => `
                <div class="ms-item-selector" data-item="${item}" style="border:2px solid #dce5ef;border-radius:12px;padding:10px;margin-bottom:8px;cursor:pointer;transition:0.2s;">
                    <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;">${item}</div>
                    <div class="ms-input-wrap" style="display:none;margin-top:8px;">
                        <label style="font-size:0.75rem;color:#5a7a94;">请输入价值 (万)</label>
                        <input type="number" class="ms-value-input" placeholder="价值" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:6px;font-size:0.85rem;text-align:center;margin-top:4px;">
                    </div>
                </div>
            `).join('');
        } else {
            // 60环：阴阳玉魄两选一
            optionsHtml = finalItems.map(item => `
                <div class="ms-item-selector" data-item="${item}" style="border:2px solid #dce5ef;border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;transition:0.2s;">
                    <div style="font-weight:700;font-size:1rem;color:${item === '阳玉魄' ? '#b45a3a' : '#3a5a9e'};">
                        ${item === '阳玉魄' ? '☀️' : '🌙'} ${item}
                    </div>
                    <div class="ms-input-wrap" style="display:none;margin-top:8px;">
                        <label style="font-size:0.75rem;color:#5a7a94;">请输入价值 (万)</label>
                        <input type="number" class="ms-value-input" placeholder="价值" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:6px;font-size:0.85rem;text-align:center;margin-top:4px;">
                    </div>
                </div>
            `).join('');
        }

        modal.innerHTML = `
            <div style="background:#f8faff;border-radius:24px;padding:24px;max-width:520px;width:95%;box-shadow:0 10px 40px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto;">
                <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">🏆 ${m.label}</h3>
                <div style="font-size:0.85rem;color:#5a7a94;margin-bottom:12px;">当前已到第 <b>${ring}</b> 环。</div>
                <div style="background:#f0f5fb;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:0.9rem;font-weight:700;color:#0a1a2a;">当前累计成本：<span style="color:#c0392b;">${totalCost}</span> 万</div>
                
                <div style="font-weight:600;font-size:0.9rem;color:#1f3b53;margin-bottom:10px;">🎁 点击获得以下产物之一：</div>
                <div>${optionsHtml}</div>

                <!-- 自定义额外产出（可选） -->
                <div style="background:#f8faff;border-top:1px dashed #ccc;padding-top:10px;margin-top:10px;">
                    <label style="font-weight:700;font-size:0.85rem;color:#1f3b53;">➕ 自定义额外物品(可空)：</label>
                    <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                        <input type="text" id="newItemName" placeholder="物品名称" style="flex:1;padding:4px;border:1px solid #bccad9;border-radius:6px;font-size:0.8rem;">
                        <input type="number" id="newItemVal" placeholder="价值(万)" style="width:80px;padding:4px;border:1px solid #bccad9;border-radius:6px;font-size:0.8rem;">
                        <button id="addItemBtn" style="background:#6b8baa;color:#fff;border:none;border-radius:6px;padding:0 12px;font-weight:700;cursor:pointer;">添加</button>
                    </div>
                    <div id="customItemsList" style="margin-top:6px;font-size:0.75rem;color:#5a7a94;"></div>
                </div>

                <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.9rem;font-weight:700;color:#2d6b2d;" id="msTotalIncomeDisplay">总收入: 0万</span>
                    <div style="display:flex;gap:10px;">
                        <button id="milestone_cancel" style="background:#dce5ef;border:none;border-radius:30px;padding:8px 24px;color:#1f3b53;font-weight:600;cursor:pointer;">取消</button>
                        <button id="milestone_confirm" style="background:${isFinal ? '#b48b5f' : '#4c7a5c'};border:none;border-radius:30px;padding:8px 24px;color:#fff;font-weight:600;cursor:pointer;">${isFinal ? '✅ 完成本轮' : '✅ 确认结算'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        let totalIncome = 0;
        let selectedItem = '';

        // 点击选择物品展开输入框
        modal.querySelectorAll('.ms-item-selector').forEach(selector => {
            selector.addEventListener('click', () => {
                // 清空其他选择
                modal.querySelectorAll('.ms-item-selector').forEach(s => {
                    s.style.borderColor = '#dce5ef';
                    s.style.background = 'transparent';
                    s.querySelector('.ms-input-wrap').style.display = 'none';
                });
                
                // 高亮当前选择
                selector.style.borderColor = '#4CAF50';
                selector.style.background = '#f0f8f0';
                selector.querySelector('.ms-input-wrap').style.display = 'block';
                selectedItem = selector.dataset.item;
                
                updateTotal();
            });
        });

        // 监听所有价值输入框变化
        modal.querySelectorAll('.ms-value-input').forEach(input => {
            input.addEventListener('input', updateTotal);
        });

        // 自定义物品累加逻辑
        let customTotal = 0;
        document.getElementById('addItemBtn').addEventListener('click', () => {
            const name = document.getElementById('newItemName').value.trim();
            const val = parseFloat(document.getElementById('newItemVal').value) || 0;
            if (name) {
                customTotal += val;
                document.getElementById('customItemsList').innerHTML += `<div style="padding:2px;">✅ ${name}: ${val} 万</div>`;
                updateTotal();
                document.getElementById('newItemName').value = '';
                document.getElementById('newItemVal').value = '';
            }
        });

        function updateTotal() {
            let total = customTotal;
            // 获取选中的物品价值
            modal.querySelectorAll('.ms-item-selector').forEach(selector => {
                const input = selector.querySelector('.ms-value-input');
                if (input && input.value) {
                    total += parseFloat(input.value) || 0;
                }
            });
            totalIncome = total;
            document.getElementById('msTotalIncomeDisplay').textContent = `总收入: ${totalIncome}万`;
        }

        document.getElementById('milestone_cancel').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('milestone_confirm').addEventListener('click', () => {
            if (totalIncome <= 0 && !selectedItem) {
                alert('请先点击选择一个产出物品，并输入价值！');
                return;
            }

            // 记录产出详情
            const details = [];
            modal.querySelectorAll('.ms-item-selector').forEach(selector => {
                const item = selector.dataset.item;
                const input = selector.querySelector('.ms-value-input');
                if (input && input.value && parseFloat(input.value) > 0) {
                    details.push(`${item}: ${parseFloat(input.value)}万`);
                }
            });
            if (customTotal > 0) details.push(`自定义物品: ${customTotal}万`);

            // 保存里程碑产出到数据结构
            if (!SoulTaskModule.pendingSettle) SoulTaskModule.pendingSettle = {};
            SoulTaskModule.pendingSettle[`m${ring}`] = {
                income: totalIncome,
                details: details.join('、')
            };

             // 只在当前数字更大时才更新，防止连续补录时把后面的数字覆盖掉
            if (ring > SoulTaskModule.currentMilestone) {
                SoulTaskModule.currentMilestone = ring;
            }

            if (isFinal) {
                // 终局结算，写入历史
                const profit = totalIncome - parseFloat(totalCost);
                const entry = {
                    _id: `${SoulTaskModule.storageKey}_hist_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                    _createdAt: new Date().toISOString(),
                    payload: {
                        totalCost: parseFloat(totalCost),
                        totalIncome: totalIncome,
                        profit: profit.toFixed(1),
                        ringCount: 60,
                        milestoneData: { ...SoulTaskModule.pendingSettle }
                    }
                };
                SoulTaskModule.history.push(entry);
                
                // 重置本轮
                SoulTaskModule.records = [];
                SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                SoulTaskModule.currentMilestone = 0;
                SoulTaskModule.pendingSettle = {};
            }

            SoulTaskModule.saveData();
            SoulTaskModule.render();
            modal.remove();
            alert(isFinal ? '✅ 本轮结算完成！' : `✅ ${m.label}已结算！收入 ${totalIncome} 万`);
        });
    },

    // ========== 渲染方法 ==========
    render() {
        this.updateStats();
        this.updateMilestoneTable();
        this.updateRecordsList();
        this.updateHistory();
        setTimeout(() => this.applyUISettings(), 100);
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost === 'NaN' ? '0' : stats.totalCost;
        document.getElementById('stRingCount').textContent = `${stats.ringCount} / 60`;
        document.getElementById('stCurrentMilestone').textContent = this.currentMilestone;
        document.getElementById('stHistoryCount').textContent = this.history.length;
        document.getElementById('stHistoryCountLabel').textContent = `共${this.history.length}轮`;

        document.querySelectorAll('.st-task-wrapper').forEach(w => {
            const key = w.dataset.key;
            const ce = w.querySelector('.st-task-count');
            if (ce && stats.typeCount[key] !== undefined) {
                ce.textContent = stats.typeCount[key];
            }
        });
    },

    updateMilestoneTable() {
        const tbody = document.getElementById('stMilestoneTable');
        if (!tbody) return;
        let html = '';
        for (let m of this.MILESTONES) {
            const data = this.pendingSettle[`m${m.ring}`];
            const income = data ? data.income : 0;
            const details = data ? data.details : '未结算';
            const isSettled = this.currentMilestone >= m.ring;
            html += `<tr style="border-bottom:1px solid #eef2f7;${isSettled ? 'background:#e8f0e8;' : ''}">
                <td style="padding:4px;font-weight:700;">${m.label}</td>
                <td style="padding:4px;font-size:0.7rem;">${details}</td>
                <td style="padding:4px;font-weight:700;">${income}万</td>
                <td style="padding:4px;">${isSettled ? '✅ 已结算' : '⏳ 未结算'}</td>
            </tr>`;
        }
        tbody.innerHTML = html;
    },

    updateRecordsList() {
        const list = document.getElementById('stRecordsBody');
        if (!list) return;
        if (this.records.length === 0) {
            list.innerHTML = '<div style="color:#6c87a0;text-align:center;padding:10px;">暂无记录</div>';
            return;
        }
        let html = '';
        const recent = this.records.slice(-30).reverse();
        for (let r of recent) {
            const type = this.TASK_TYPES.find(t => t.key === (r.payload?.typeKey || r.typeKey));
            const label = type ? type.label : (r.payload?.typeKey || r.typeKey);
            const cost = r.payload?.cost || 0;
            const qty = r.payload?.qty || 1;
            html += `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #eef2f7;">
                <span>${r.taskIndex || r._index}. ${label} ${qty > 1 ? `× ${qty}` : ''}</span>
                <span style="color:#5a7a94;">💰${cost.toFixed(1)}万</span>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistory() {
        const tbody = document.getElementById('stHistoryTable');
        if (!tbody) return;
        if (this.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="padding:20px;text-align:center;color:#6c87a0;">暂无历史记录</td></tr>';
            return;
        }
        let html = '';
        const list = this.history.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = list.length - i;
            const payload = h.payload || {};
            const profit = parseFloat(payload.profit || 0);
            const pc = profit >= 0 ? 'color:#2d6b2d;font-weight:700;' : 'color:#c0392b;font-weight:700;';
            const mData = payload.milestoneData || {};
            html += `<tr>
                <td style="padding:4px;background:#f5f8fc;font-weight:700;">${row}</td>
                <td style="padding:4px;">${h._createdAt ? h._createdAt.split('T')[0] : '-'}</td>
                <td style="padding:4px;">${parseFloat(payload.totalCost || 0).toFixed(1)}万</td>
                <td style="padding:4px;">${parseFloat(mData.m15?.income || 0).toFixed(1)}万</td>
                <td style="padding:4px;">${parseFloat(mData.m30?.income || 0).toFixed(1)}万</td>
                <td style="padding:4px;">${parseFloat(mData.m45?.income || 0).toFixed(1)}万</td>
                <td style="padding:4px;">${parseFloat(mData.m60?.income || 0).toFixed(1)}万</td>
                <td style="padding:4px;${pc}">${profit.toFixed(1)}万</td>
                <td style="padding:4px;"><button class="st-del-history" data-idx="${this.history.indexOf(h)}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 10px;color:#8f3a3a;cursor:pointer;font-size:0.7rem;">✕</button></td>
            </tr>`;
        }
        tbody.innerHTML = html;
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoulTaskModule.init());
} else {
    SoulTaskModule.init();
}
window.SoulTaskModule = SoulTaskModule;
