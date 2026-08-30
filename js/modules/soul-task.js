// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - 最终完整版 (无报错无NaN)
//  功能：实时成本显示 + 里程碑手动结算 + 基础统计
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

    records: [],           
    history: [],           
    prices: {},            
    currentRunId: null,    
    milestoneIncome: { m15: 0, m30: 0, m45: 0, m60: 0 },

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
        this.milestoneIncome = data.milestoneIncome || { m15: 0, m30: 0, m45: 0, m60: 0 };
        
        this.currentRunId = data.currentRunId || null;
        if (!this.currentRunId) {
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }

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
            milestoneIncome: this.milestoneIncome
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

    calcStats() {
        let totalCost = 0;
        const typeCount = {};
        this.TASK_TYPES.forEach(t => typeCount[t.key] = 0);

        for (let r of this.records) {
            totalCost += parseFloat(r.payload?.cost || r.cost || 0);
            const key = r.payload?.typeKey || r.typeKey;
            if (typeCount[key] !== undefined) typeCount[key]++;
            else typeCount[key] = 1;
        }

        const totalIncome = (this.milestoneIncome.m15 || 0) + (this.milestoneIncome.m30 || 0) + (this.milestoneIncome.m45 || 0) + (this.milestoneIncome.m60 || 0);
        const profit = totalIncome - totalCost;

        return { totalCost: totalCost.toFixed(1), totalIncome: totalIncome.toFixed(1), profit: profit.toFixed(1), typeCount, ringCount: this.records.length };
    },

    buildUI() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const taskBtns = this.TASK_TYPES.map(t => `
            <div class="st-task-wrapper" data-key="${t.key}" style="display:flex;flex-direction:column;align-items:center;">
                <button class="st-task-btn" data-key="${t.key}" style="background:#4CAF50;color:#fff;border:none;border-radius:30px;padding:6px 10px;font-size:0.8rem;font-weight:700;cursor:pointer;text-align:center;width:100%;">
                    ${t.icon} ${t.label}
                </button>
                <span class="st-task-count" style="font-weight:700;color:#7a5d2e;background:#e6d7b8;padding:0 8px;border-radius:12px;margin-top:2px;min-width:20px;text-align:center;">0</span>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="stTotalCost">0</div><div class="label">💰 实时成本(万)</div></div>
                <div class="stat-item"><div class="num" id="stRingCount">0 / 60</div><div class="label">📌 当前环数</div></div>
                <div class="stat-item"><div class="num" id="stTotalIncome">0</div><div class="label">📊 实时收入(万)</div></div>
                <div class="stat-item" id="stProfitBox"><div class="num" id="stProfit">0</div><div class="label">📈 实时利润(万)</div></div>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span style="font-size:0.7rem;font-weight:400;">— 点击记录一环</span></div>
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
                    <div class="title">🏆 里程碑收入 <span style="font-size:0.7rem;font-weight:400;">— 手动输入，随时可改</span></div>
                    <button class="toggle-btn" id="stToggleMilestone" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stMilestoneBody" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                    <div style="background:#f8faff;border:1px solid #dce5ef;border-radius:12px;padding:10px;text-align:center;">
                        <div style="font-size:0.8rem;font-weight:700;color:#1f3b53;margin-bottom:4px;">15环产出</div>
                        <input type="number" id="stM15" value="${this.milestoneIncome.m15}" placeholder="价值(万)" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                    </div>
                    <div style="background:#f8faff;border:1px solid #dce5ef;border-radius:12px;padding:10px;text-align:center;">
                        <div style="font-size:0.8rem;font-weight:700;color:#1f3b53;margin-bottom:4px;">30环产出</div>
                        <input type="number" id="stM30" value="${this.milestoneIncome.m30}" placeholder="价值(万)" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                    </div>
                    <div style="background:#f8faff;border:1px solid #dce5ef;border-radius:12px;padding:10px;text-align:center;">
                        <div style="font-size:0.8rem;font-weight:700;color:#1f3b53;margin-bottom:4px;">45环产出</div>
                        <input type="number" id="stM45" value="${this.milestoneIncome.m45}" placeholder="价值(万)" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                    </div>
                    <div style="background:#f8faff;border:1px solid #dce5ef;border-radius:12px;padding:10px;text-align:center;">
                        <div style="font-size:0.8rem;font-weight:700;color:#1f3b53;margin-bottom:4px;">60环玉魄</div>
                        <input type="number" id="stM60" value="${this.milestoneIncome.m60}" placeholder="价值(万)" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:8px;font-size:0.85rem;text-align:center;">
                    </div>
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

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                <button id="stCompleteBtn" style="background:#4c7a5c;color:#fff;border:none;padding:8px 24px;border-radius:40px;font-weight:700;cursor:pointer;">✅ 结算本轮</button>
                <button id="stResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:8px 24px;border-radius:40px;font-weight:700;cursor:pointer;">🗑️ 重置本轮</button>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span id="stHistoryCountLabel">共0轮</span></div>
                    <button class="btn-analysis" id="stAnalysisBtn" style="border-radius:50px;">📊 分析</button>
                </div>
                <div class="module-body" style="max-height:300px;overflow-y:auto;">
                    <table style="width:100%;font-size:0.75rem;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#1f344b;color:#fff;">
                                <th style="padding:6px;">#</th><th>日期</th><th>成本</th>
                                <th>15环</th><th>30环</th><th>45环</th><th>60环</th>
                                <th>利润</th><th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="stHistoryTable"></tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const toggles = [
            ['stToggleTask', 'stTaskBody'], 
            ['stToggleMilestone', 'stMilestoneBody'], 
            ['stTogglePrice', 'stPriceBody'], 
            ['stToggleRecords', 'stRecordsBody']
        ];
        toggles.forEach(([btnId, bodyId]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById(bodyId).classList.toggle('hidden');
                    btn.textContent = document.getElementById(bodyId).classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
                });
            }
        });

        container.addEventListener('change', (e) => {
            const input = e.target.closest('[data-key]');
            if (input && input.id.startsWith('stPrice_')) {
                const key = input.dataset.key;
                SoulTaskModule.prices[key] = parseFloat(input.value) || 0;
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-task-btn');
            if (btn) {
                SoulTaskModule.addRecord(btn.dataset.key);
            }
        });

        ['stM15', 'stM30', 'stM45', 'stM60'].forEach(id => {
            document.getElementById(id).addEventListener('input', function() {
                const key = id.replace('stM', 'm');
                SoulTaskModule.milestoneIncome[key] = parseFloat(this.value) || 0;
                SoulTaskModule.saveData();
                SoulTaskModule.updateStats();
            });
        });

        document.getElementById('stUndoBtn').addEventListener('click', () => {
            if (SoulTaskModule.records.length > 0) {
                SoulTaskModule.records.pop();
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        document.getElementById('stCompleteBtn').addEventListener('click', () => {
            const stats = SoulTaskModule.calcStats();
            if (stats.ringCount < 60) {
                if (!confirm(`当前只有 ${stats.ringCount} 环，确定要提前结束结算吗？`)) return;
            }
            
            const profit = parseFloat(stats.totalIncome) - parseFloat(stats.totalCost);
            const entry = {
                _id: `${SoulTaskModule.storageKey}_hist_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                _createdAt: new Date().toISOString(),
                payload: {
                    totalCost: stats.totalCost,
                    totalIncome: stats.totalIncome,
                    profit: profit.toFixed(1),
                    ringCount: stats.ringCount,
                    milestoneData: { ...SoulTaskModule.milestoneIncome }
                }
            };
            
            SoulTaskModule.history.push(entry);
            
            SoulTaskModule.records = [];
            SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            SoulTaskModule.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
            
            SoulTaskModule.saveData();
            SoulTaskModule.render();
            alert('✅ 本轮结算完成！');
        });

        document.getElementById('stResetBtn').addEventListener('click', () => {
            if (confirm('确定要重置本轮全部记录吗？')) {
                SoulTaskModule.records = [];
                SoulTaskModule.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                SoulTaskModule.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
                SoulTaskModule.saveData();
                SoulTaskModule.render();
            }
        });

        document.getElementById('stAnalysisBtn').addEventListener('click', () => {
            const totalProfit = SoulTaskModule.history.reduce((s, h) => s + parseFloat(h.payload.profit || 0), 0);
            const avgProfit = SoulTaskModule.history.length > 0 ? (totalProfit / SoulTaskModule.history.length).toFixed(1) : 0;
            alert(`📊 历史数据分析\n\n已跑总轮数: ${SoulTaskModule.history.length}\n总利润: ${totalProfit.toFixed(1)} 万\n平均每轮利润: ${avgProfit} 万`);
        });

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
            alert('本轮已跑满60环，请先点击“结算本轮”！');
            return;
        }
        const cost = this.prices[key] || 0;
        const idx = this.records.length;

        this.records.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            runId: this.currentRunId,
            taskIndex: idx + 1,
            createdAt: new Date().toISOString(),
            payload: { typeKey: key, cost: cost }
        });

        this.saveData();
        this.render();
    },

    render() {
        this.updateStats();
        this.updateRecordsList();
        this.updateHistory();
        setTimeout(() => this.applyUISettings(), 100);
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost === 'NaN' ? '0' : stats.totalCost;
        document.getElementById('stRingCount').textContent = `${stats.ringCount} / 60`;
        document.getElementById('stTotalIncome').textContent = stats.totalIncome === 'NaN' ? '0' : stats.totalIncome;
        document.getElementById('stProfit').textContent = stats.profit === 'NaN' ? '0' : stats.profit;

        const profitBox = document.getElementById('stProfitBox');
        if (parseFloat(stats.profit) >= 0) {
            profitBox.className = 'stat-item profit';
        } else {
            profitBox.className = 'stat-item loss';
        }

        document.querySelectorAll('.st-task-wrapper').forEach(w => {
            const key = w.dataset.key;
            const ce = w.querySelector('.st-task-count');
            if (ce && stats.typeCount[key] !== undefined) {
                ce.textContent = stats.typeCount[key];
            }
        });
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
            const cost = r.payload?.cost || r.cost || 0;
            html += `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #eef2f7;">
                <span>${r.taskIndex || r._index}. ${label}</span>
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
            
            const totalCost = parseFloat(payload.totalCost) || 0;
            const totalIncome = parseFloat(payload.totalIncome) || 0;
            const profit = parseFloat(payload.profit) || (totalIncome - totalCost);
            const pc = profit >= 0 ? 'color:#2d6b2d;font-weight:700;' : 'color:#c0392b;font-weight:700;';
            
            const mData = payload.milestoneData || {};
            const m15 = parseFloat(mData.m15) || 0;
            const m30 = parseFloat(mData.m30) || 0;
            const m45 = parseFloat(mData.m45) || 0;
            const m60 = parseFloat(mData.m60) || 0;
            
            html += `<tr>
                <td style="padding:4px;background:#f5f8fc;font-weight:700;">${row}</td>
                <td style="padding:4px;">${h._createdAt ? h._createdAt.split('T')[0] : '-'}</td>
                <td style="padding:4px;">${totalCost.toFixed(1)}万</td>
                <td style="padding:4px;">${m15.toFixed(1)}万</td>
                <td style="padding:4px;">${m30.toFixed(1)}万</td>
                <td style="padding:4px;">${m45.toFixed(1)}万</td>
                <td style="padding:4px;">${m60.toFixed(1)}万</td>
                <td style="padding:4px;${pc}">${profit.toFixed(1)}万</td>
                <td style="padding:4px;"><button class="st-del-history" data-idx="${this.history.indexOf(h)}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 10px;color:#8f3a3a;cursor:pointer;font-size:0.7rem;">✕</button></td>
            </tr>`;
        }
        tbody.innerHTML = html;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoulTaskModule.init());
} else {
    SoulTaskModule.init();
}
window.SoulTaskModule = SoulTaskModule;
