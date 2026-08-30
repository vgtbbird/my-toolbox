// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - 完整版
//  功能：任务记录 + 物品单价调整 + 15/30/45/60环强制结算
//  数据架构：V3 (绝对ID + 轮次标签 + 版本锚点)
// ============================================================
const SoulTaskModule = {
    id: 'soulTask',
    storageKey: 'soulTask',

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

    records: [],           // 当前轮次记录
    history: [],           // 已结算的历史轮次
    prices: {},            // 物品价格设置
    currentRunId: null,    // 当前轮次ID
    currentMilestone: 0,   // 当前已结算到的里程碑 (0, 15, 30, 45)
    pendingSettle: null,   // 待结算的数据

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
        { ring: 15, label: '15环奖励', items: ['五色灵尘'] },
        { ring: 30, label: '30环奖励', items: ['五色灵尘', '女娲灵契'] },
        { ring: 45, label: '45环奖励', items: ['五色灵尘', '女娲祝符'] },
        { ring: 60, label: '60环终局', items: ['上古玉魄'] }
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
        this.pendingSettle = data.pendingSettle || null;
        
        // 生成当前轮次 ID
        this.currentRunId = data.currentRunId || null;
        if (!this.currentRunId) {
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }

        // 默认物品价格
        this.TASK_TYPES.forEach(t => {
            if (this.prices[t.key] === undefined) this.prices[t.key] = t.cost;
        });
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            history: this.history,
            prices: this.prices,
            currentRunId: this.currentRunId,
            currentMilestone: this.currentMilestone,
            pendingSettle: this.pendingSettle
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;
        container.querySelectorAll('.module, .stats-grid .stat-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });
    },

    // ========== 计算逻辑 ==========
    calcStats() {
        let totalCost = 0;
        const typeCount = {};
        this.TASK_TYPES.forEach(t => typeCount[t.key] = 0);

        for (let r of this.records) {
            totalCost += r.cost;
            if (typeCount[r.typeKey] !== undefined) typeCount[r.typeKey]++;
            else typeCount[r.typeKey] = 1;
        }
        return { totalCost, typeCount, ringCount: this.records.length };
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const taskBtns = this.TASK_TYPES.map(t => `
            <button class="st-task-btn" data-key="${t.key}" style="background:#4CAF50;color:#fff;border:none;border-radius:30px;padding:8px 10px;font-size:0.8rem;font-weight:700;cursor:pointer;text-align:center;margin:2px;">
                ${t.icon} ${t.label}
            </button>
        `).join('');

        const milestoneBtns = this.MILESTONES.map((m, idx) => {
            const isDone = this.currentMilestone >= m.ring;
            const isNext = this.currentMilestone + 15 === m.ring;
            const bg = isDone ? '#4c7a5c' : (isNext ? '#dbbd7c' : '#bccad9');
            return `
                <button class="st-milestone-btn" data-ring="${m.ring}" style="background:${bg};color:#fff;border:none;border-radius:20px;padding:8px 20px;font-size:0.75rem;font-weight:700;cursor:${isNext ? 'pointer' : 'not-allowed'};margin:2px;">
                    ${m.label}
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <!-- 界面设置 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                </div>
                <div class="module-body">
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <label>🎨 背景色 <input type="color" id="stBgColor" value="${this.uiSettings.bgColor}" style="width:40px;height:24px;"></label>
                        <label>📦 卡片色 <input type="color" id="stCardColor" value="${this.uiSettings.cardBgColor}" style="width:40px;height:24px;"></label>
                    </div>
                </div>
            </div>

            <!-- 顶部统计 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="stTotalCost">0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="stRingCount">0 / 60</div><div class="label">📌 当前环数</div></div>
                <div class="stat-item"><div class="num" id="stCurrentMilestone">0</div><div class="label">🏁 当前里程碑</div></div>
                <div class="stat-item"><div class="num" id="stHistoryCount">0</div><div class="label">📜 历史轮次</div></div>
            </div>

            <!-- 任务记录 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span style="font-size:0.7rem;font-weight:400;">— 点击记录一环</span></div>
                    <button class="btn-undo" id="stUndoBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">↩️ 撤销</button>
                </div>
                <div class="module-body">
                    <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:4px;">${taskBtns}</div>
                </div>
            </div>

            <!-- 里程碑控制 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🏆 里程碑结算 <span style="font-size:0.7rem;font-weight:400;">— 强制弹窗输入产出</span></div>
                </div>
                <div class="module-body" style="display:flex;gap:10px;flex-wrap:wrap;">${milestoneBtns}</div>
            </div>

            <!-- 价格设置 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header"><div class="title">⚙️ 物品单价 (万)</div></div>
                <div class="module-body" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${this.TASK_TYPES.filter(t => t.cost > 0).map(t => `
                        <div style="display:flex;align-items:center;gap:2px;font-size:0.7rem;">
                            <label style="white-space:nowrap;">${t.label}</label>
                            <input type="number" id="stPrice_${t.key}" value="${this.prices[t.key]}" data-key="${t.key}" style="width:50px;padding:2px;border:1px solid #bccad9;border-radius:4px;text-align:center;font-weight:700;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 当前环节明细 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header"><div class="title">📜 本环节明细</div></div>
                <div class="module-body" id="stRecordsList" style="max-height:150px;overflow-y:auto;font-size:0.75rem;"></div>
            </div>

            <!-- 历史记录 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span id="stHistoryCountLabel">共0轮</span></div>
                    <button class="btn-analysis" id="stAnalysisBtn" style="border-radius:50px;">📊 分析</button>
                </div>
                <div class="module-body" style="max-height:250px;overflow-y:auto;">
                    <table style="width:100%;font-size:0.75rem;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#1f344b;color:#fff;">
                                <th style="padding:6px;">#</th><th>日期</th><th>成本</th><th>收入</th><th>利润</th><th>操作</th>
                            </tr>
                        </thead>
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

        // 界面设置
        document.getElementById('stBgColor').addEventListener('input', function() {
            SoulTaskModule.uiSettings.bgColor = this.value;
            SoulTaskModule.applyUISettings();
        });
        document.getElementById('stCardColor').addEventListener('input', function() {
            SoulTaskModule.uiSettings.cardBgColor = this.value;
            SoulTaskModule.applyUISettings();
        });

        // 物品价格修改
        container.addEventListener('change', (e) => {
            const input = e.target.closest('[data-key]');
            if (input && input.id.startsWith('stPrice_')) {
                const key = input.dataset.key;
                SoulTaskModule.prices[key] = parseFloat(input.value) || 0;
                SoulTaskModule.saveData();
                SoulTaskModule.updateStats();
            }
        });

        // 任务记录
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-task-btn');
            if (btn) {
                SoulTaskModule.addRecord(btn.dataset.key);
            }
        });

        // 里程碑按钮
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-milestone-btn');
            if (btn) {
                const ring = parseInt(btn.dataset.ring);
                if (ring === SoulTaskModule.currentMilestone + 15 || (ring === 60 && SoulTaskModule.currentMilestone === 45)) {
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

        // 分析
        document.getElementById('stAnalysisBtn').addEventListener('click', () => {
            const avgProfit = SoulTaskModule.history.length > 0 
                ? (SoulTaskModule.history.reduce((s, h) => s + h.profit, 0) / SoulTaskModule.history.length).toFixed(1) 
                : 0;
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

    addRecord(key) {
        if (this.records.length >= 60) {
            alert('本轮已跑满60环，请先完成终局结算！');
            return;
        }
        const type = this.TASK_TYPES.find(t => t.key === key);
        const cost = this.prices[key] || 0;
        const idx = this.records.length;

        this.records.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            runId: this.currentRunId,
            taskIndex: idx + 1,
            createdAt: new Date().toISOString(),
            payload: {
                typeKey: key,
                cost: cost
            }
        });

        this.saveData();
        this.render();

        // 自动触发里程碑结算
        if (this.records.length === 15 || this.records.length === 30 || this.records.length === 45) {
            this.showMilestoneModal(this.records.length);
        }
        if (this.records.length === 60) {
            this.showMilestoneModal(60);
        }
    },

    // 里程碑结算弹窗
    showMilestoneModal(ring) {
        const stats = this.calcStats();
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;justify-content:center;align-items:center;';
        
        const m = this.MILESTONES.find(m => m.ring === ring);
        const itemsInput = m.items.map(item => `
            <div style="margin-bottom:8px;">
                <label style="font-weight:600;font-size:0.85rem;color:#1f3b53;">${item} 数量与总价值</label>
                <div style="display:flex;gap:8px;margin-top:4px;">
                    <input type="number" id="milestone_count_${item}" placeholder="数量" style="width:80px;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                    <input type="number" id="milestone_value_${item}" placeholder="总价值(万)" style="flex:1;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                </div>
            </div>
        `).join('');

        const totalCost = stats.totalCost.toFixed(1);
        const isFinal = ring === 60;

        modal.innerHTML = `
            <div style="background:#f8faff;border-radius:24px;padding:24px;max-width:480px;width:95%;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
                <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">🏆 ${m.label}</h3>
                <div style="font-size:0.85rem;color:#5a7a94;margin-bottom:12px;">当前已到第 <b>${ring}</b> 环。请输入产出价值。</div>
                <div style="background:#f0f5fb;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:0.9rem;font-weight:700;color:#0a1a2a;">当前累计成本：<span style="color:#c0392b;">${totalCost}</span> 万</div>
                <div style="max-height:250px;overflow-y:auto;">
                    <div style="font-weight:600;font-size:0.85rem;color:#1f3b53;margin-bottom:8px;">🎁 获得产出：</div>
                    ${itemsInput}
                </div>
                <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:10px;">
                    <button id="milestone_cancel" style="background:#dce5ef;border:none;border-radius:30px;padding:8px 24px;color:#1f3b53;font-weight:600;cursor:pointer;">取消</button>
                    <button id="milestone_confirm" style="background:${isFinal ? '#b48b5f' : '#4c7a5c'};border:none;border-radius:30px;padding:8px 24px;color:#fff;font-weight:600;cursor:pointer;">${isFinal ? '✅ 完成本轮' : '✅ 确认结算'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('milestone_cancel').addEventListener('click', () => {
            modal.remove();
            // 取消后允许继续记录
        });

        document.getElementById('milestone_confirm').addEventListener('click', () => {
            let totalIncome = 0;
            for (let item of m.items) {
                const val = parseFloat(document.getElementById(`milestone_value_${item}`).value) || 0;
                totalIncome += val;
            }

            // 更新当前里程碑进度
            SoulTaskModule.currentMilestone = ring;

            if (isFinal) {
                // 终局结算
                const profit = totalIncome - stats.totalCost;
                const entry = {
                    _id: `${SoulTaskModule.storageKey}_hist_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                    _createdAt: new Date().toISOString(),
                    payload: {
                        totalCost: stats.totalCost,
                        totalIncome: totalIncome,
                        profit: profit,
                        ringCount: 60,
                        milestoneData: { 15: SoulTaskModule.pendingSettle?.milestone15 || 0, 30: SoulTaskModule.pendingSettle?.milestone30 || 0, 45: SoulTaskModule.pendingSettle?.milestone45 || 0, 60: totalIncome }
                    }
                };
                SoulTaskModule.history.push(entry);
                
                // 重置本轮
                SoulTaskModule.records = [];
                SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                SoulTaskModule.currentMilestone = 0;
                SoulTaskModule.pendingSettle = null;
            } else {
                // 保存里程碑的产出到当前轮记录里（防丢）
                if (!SoulTaskModule.pendingSettle) SoulTaskModule.pendingSettle = {};
                SoulTaskModule.pendingSettle[`milestone${ring}`] = totalIncome;
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
        this.updateRecordsList();
        this.updateHistory();
        setTimeout(() => this.applyUISettings(), 100);
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost.toFixed(1);
        document.getElementById('stRingCount').textContent = `${stats.ringCount} / 60`;
        document.getElementById('stCurrentMilestone').textContent = this.currentMilestone;
        document.getElementById('stHistoryCount').textContent = this.history.length;
        document.getElementById('stHistoryCountLabel').textContent = `共${this.history.length}轮`;
    },

    updateRecordsList() {
        const list = document.getElementById('stRecordsList');
        if (!list) return;
        if (this.records.length === 0) {
            list.innerHTML = '<div style="color:#6c87a0;text-align:center;">暂无记录</div>';
            return;
        }
        let html = '';
        const recent = this.records.slice(-20).reverse();
        for (let r of recent) {
            const type = this.TASK_TYPES.find(t => t.key === r.payload.typeKey);
            const label = type ? type.label : r.payload.typeKey;
            html += `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #eef2f7;">
                <span>${r.taskIndex}. ${label}</span>
                <span style="color:#5a7a94;">💰${r.payload.cost.toFixed(1)}万</span>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistory() {
        const tbody = document.getElementById('stHistoryTable');
        if (!tbody) return;
        if (this.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:#6c87a0;">暂无历史记录</td></tr>';
            return;
        }
        let html = '';
        const list = this.history.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = list.length - i;
            const pc = h.payload.profit >= 0 ? 'color:#2d6b2d;font-weight:700;' : 'color:#c0392b;font-weight:700;';
            html += `<tr>
                <td style="padding:6px;background:#f5f8fc;font-weight:700;">${row}</td>
                <td style="padding:6px;">${h._createdAt.split('T')[0]}</td>
                <td style="padding:6px;">${h.payload.totalCost.toFixed(1)}万</td>
                <td style="padding:6px;">${h.payload.totalIncome.toFixed(1)}万</td>
                <td style="padding:6px;${pc}">${h.payload.profit.toFixed(1)}万</td>
                <td style="padding:6px;"><button class="st-del-history" data-idx="${this.history.indexOf(h)}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 10px;color:#8f3a3a;cursor:pointer;font-size:0.7rem;">✕</button></td>
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
