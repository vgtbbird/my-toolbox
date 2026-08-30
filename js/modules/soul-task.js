// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - 全新架构V4
//  UI：从上到下全模块化，所有表格严格居中带线
//  同步：基于全新 V3 绝对ID + 轮次标签
// ============================================================

const SoulTaskModule = {
    id: 'soulTask',
    storageKey: 'soulTask',

    // ========== 基础数据 ==========
    records: [],
    history: [],
    prices: {},
    currentRunId: null,
    milestoneIncome: { m15: 0, m30: 0, m45: 0, m60: 0 },
    milestoneDetails: { m15: '', m30: '', m45: '', m60: '' },

    // 任务类型（带单价）
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

    // ========== 生命周期 ==========
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.milestoneIncome = data.milestoneIncome || { m15: 0, m30: 0, m45: 0, m60: 0 };
        this.milestoneDetails = data.milestoneDetails || { m15: '', m30: '', m45: '', m60: '' };
        this.currentRunId = data.currentRunId || null;

        if (!this.currentRunId) {
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }

        // 初始化默认价格
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
            milestoneIncome: this.milestoneIncome,
            milestoneDetails: this.milestoneDetails
        });
    },

    // ========== 统计数据 ==========
    calcStats() {
        let totalCost = 0;
        const typeCount = {};

        for (let r of this.records) {
            totalCost += parseFloat(r.cost || 0);
            const key = r.typeKey;
            typeCount[key] = (typeCount[key] || 0) + (r.count || 1);
        }

        const totalIncome = (this.milestoneIncome.m15 || 0) + (this.milestoneIncome.m30 || 0) + (this.milestoneIncome.m45 || 0) + (this.milestoneIncome.m60 || 0);
        const profit = totalIncome - totalCost;

        return {
            totalCost: totalCost.toFixed(1),
            totalIncome: totalIncome.toFixed(1),
            profit: profit.toFixed(1),
            typeCount,
            ringCount: this.records.length,
            avgCost: this.records.length > 0 ? (totalCost / this.records.length).toFixed(1) : '0.0'
        };
    },

    // ========== 构建UI ==========
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

        container.innerHTML = `
            <!-- 1. 界面设置 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="toggleUISettings">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="bodyUISettings">
                    <div style="display:flex;gap:10px;">
                        <label>🎨 背景 <input type="color" id="bgColor" value="#eef2f7" style="width:40px;height:24px;"></label>
                        <label>📦 卡片 <input type="color" id="cardColor" value="#ffffff" style="width:40px;height:24px;"></label>
                    </div>
                </div>
            </div>

            <!-- 2. 顶部实时看板 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="stTotalCost">0.0</div><div class="label">💰 实时成本</div></div>
                <div class="stat-item"><div class="num" id="stRingCount">0/60</div><div class="label">📌 当前环数</div></div>
                <div class="stat-item"><div class="num" id="stAvgCost">0.0</div><div class="label">📊 平均成本</div></div>
                <div class="stat-item" id="stProfitBox"><div class="num" id="stProfit">0.0</div><div class="label">📈 实时利润</div></div>
            </div>

            <!-- 3. 任务记录区 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📋 任务类型</div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-undo" id="stUndoBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;">↩️ 撤销</button>
                        <button class="toggle-btn" id="toggleTasks">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="bodyTasks">
                    <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">${taskBtns}</div>
                </div>
            </div>

            <!-- 4. 里程碑结算区（4个独立卡片，输入互不干扰） -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🏆 里程碑收入（独立保存，互不干扰）</div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <span style="font-weight:700;color:#2d6b2d;">总收入: <span id="milestoneTotalIncome">0.0</span> 万</span>
                        <button class="toggle-btn" id="toggleMilestones">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="bodyMilestones">
                    <!-- 15/30/45/60 四个独立卡片 -->
                    ${this.buildMilestoneCard(15, '女娲灵契', '女娲祝符', '五色灵尘')}
                    ${this.buildMilestoneCard(30, '女娲灵契', '女娲祝符', '五色灵尘')}
                    ${this.buildMilestoneCard(45, '女娲灵契', '女娲祝符', '五色灵尘')}
                    ${this.buildMilestoneCard(60, '阳玉魄', '阴玉魄')}
                </div>
            </div>

            <!-- 5. 物品单价模块 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">⚙️ 物品单价 (万)</div>
                    <button class="toggle-btn" id="togglePrices">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="bodyPrices" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${this.TASK_TYPES.filter(t => t.cost > 0).map(t => `
                        <div style="display:flex;align-items:center;gap:2px;font-size:0.7rem;">
                            <label style="white-space:nowrap;">${t.label}</label>
                            <input type="number" id="price_${t.key}" value="${this.prices[t.key]}" data-key="${t.key}" style="width:50px;padding:2px;border:1px solid #bccad9;border-radius:4px;text-align:center;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 6. 本轮记录明细 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header"><div class="title">📜 本轮明细</div><button class="toggle-btn" id="toggleDetails">👁️ 隐藏</button></div>
                <div class="module-body" id="bodyDetails" style="max-height:200px;overflow-y:auto;"></div>
            </div>

            <!-- 7. 底部快捷操作 -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                <button id="stCompleteBtn" style="background:#b48b5f;color:#fff;border:none;padding:10px 24px;border-radius:40px;font-weight:700;cursor:pointer;">🏁 完成本轮</button>
                <button id="stResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:10px 24px;border-radius:40px;font-weight:700;cursor:pointer;">🗑️ 重置本轮</button>
            </div>

            <!-- 8. 历史轮次统计（严格 Excel 居中带线表格） -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span id="historyCountLabel">共0轮</span></div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-analysis" id="analysisBtn">📊 数据分析</button>
                        <button class="toggle-btn" id="toggleHistory">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="bodyHistory">
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:0.8rem;">
                            <thead>
                                <tr style="background:#1f344b;color:#fff;">
                                    <th style="border:1px solid #ccc;width:4%;padding:8px 0;text-align:center;">#</th>
                                    <th style="border:1px solid #ccc;width:13%;padding:8px 0;text-align:center;">日期</th>
                                    <th style="border:1px solid #ccc;width:11%;padding:8px 0;text-align:center;">成本</th>
                                    <th style="border:1px solid #ccc;width:10%;padding:8px 0;text-align:center;">15环</th>
                                    <th style="border:1px solid #ccc;width:10%;padding:8px 0;text-align:center;">30环</th>
                                    <th style="border:1px solid #ccc;width:10%;padding:8px 0;text-align:center;">45环</th>
                                    <th style="border:1px solid #ccc;width:10%;padding:8px 0;text-align:center;">60环</th>
                                    <th style="border:1px solid #ccc;width:12%;padding:8px 0;text-align:center;">利润</th>
                                    <th style="border:1px solid #ccc;width:5%;padding:8px 0;text-align:center;">删除</th>
                                </tr>
                            </thead>
                            <tbody id="historyTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 里程碑卡片生成（15/30/45三选一，60二选一，独立保存）
    buildMilestoneCard(ring, item1, item2, item3) {
        const isFinal = ring === 60;
        const items = isFinal ? [item1, item2] : [item1, item2, item3];
        const itemOptions = items.map((item, idx) => `
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.75rem;">
                <input type="radio" name="ms_${ring}" value="${item}" ${idx === 0 ? 'checked' : ''}> ${item}
            </label>
        `).join('');

        return `
            <div style="border:1px solid #d0dce8;border-radius:8px;padding:10px;background:#f8faff;">
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:6px;">${ring}环奖励</div>
                <div style="margin-bottom:6px;">${itemOptions}</div>
                <input type="number" id="ms_value_${ring}" placeholder="输入价值(万)" value="${this.milestoneIncome['m' + ring] || ''}" style="width:100%;padding:6px;border:1px solid #bccad9;border-radius:6px;font-size:0.85rem;text-align:center;margin-bottom:6px;">
                <button class="btn-small" id="save_m${ring}" data-ring="${ring}" style="width:100%;background:#4c7a5c;color:#fff;border:none;padding:4px;border-radius:6px;font-weight:700;cursor:pointer;">💾 保存</button>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        // 隐藏/显示切换（所有模块）
        const toggles = [
            ['toggleUISettings', 'bodyUISettings'], ['toggleTasks', 'bodyTasks'],
            ['toggleMilestones', 'bodyMilestones'], ['togglePrices', 'bodyPrices'],
            ['toggleDetails', 'bodyDetails'], ['toggleHistory', 'bodyHistory']
        ];
        toggles.forEach(([btnId, bodyId]) => {
            const btn = document.getElementById(btnId);
            if (btn) btn.addEventListener('click', () => {
                document.getElementById(bodyId).classList.toggle('hidden');
                btn.textContent = document.getElementById(bodyId).classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
            });
        });

        // 任务点击（弹出1-9快捷数量）
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-task-btn');
            if (btn) this.openTaskQuantityModal(btn.dataset.key);
        });

        // 修改单价
        container.addEventListener('change', (e) => {
            const input = e.target.closest('[data-key]');
            if (input && input.id.startsWith('price_')) {
                this.prices[input.dataset.key] = parseFloat(input.value) || 0;
                this.saveData();
                this.render();
            }
        });

        // 保存里程碑
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.save_m');
            if (btn) {
                const ring = btn.dataset.ring;
                const val = parseFloat(document.getElementById(`ms_value_${ring}`).value) || 0;
                const selected = document.querySelector(`input[name="ms_${ring}"]:checked`).value;
                
                this.milestoneIncome['m' + ring] = val;
                this.milestoneDetails['m' + ring] = selected;
                this.saveData();
                this.render();
                alert(`✅ ${ring}环已保存！`);
            }
        });

        document.getElementById('stUndoBtn').addEventListener('click', () => {
            if (this.records.length > 0) {
                this.records.pop();
                this.saveData();
                this.render();
            }
        });

        // 完成本轮（主动结束）
        document.getElementById('stCompleteBtn').addEventListener('click', () => {
            const stats = this.calcStats();
            if (stats.ringCount < 60) {
                if (!confirm(`当前只有 ${stats.ringCount} 环，确定要主动完成本轮吗？`)) return;
            }
            
            const income = parseFloat(stats.totalIncome);
            const cost = parseFloat(stats.totalCost);
            const profit = income - cost;

            const entry = {
                _id: `${this.storageKey}_hist_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                _createdAt: new Date().toISOString(),
                payload: {
                    totalCost: cost.toFixed(1),
                    totalIncome: income.toFixed(1),
                    profit: profit.toFixed(1),
                    ringCount: stats.ringCount,
                    milestoneData: { ...this.milestoneIncome },
                    milestoneDetails: { ...this.milestoneDetails }
                }
            };

            this.history.push(entry);
            
            // 清空当前轮
            this.records = [];
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            this.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
            this.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
            
            this.saveData();
            this.render();
            alert('✅ 本轮已完成结算！');
        });

        document.getElementById('stResetBtn').addEventListener('click', () => {
            if (confirm('确定要重置本轮全部数据吗？')) {
                this.records = [];
                this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                this.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 };
                this.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
                this.saveData();
                this.render();
            }
        });

        document.getElementById('analysisBtn').addEventListener('click', () => {
            if (this.history.length === 0) { alert('暂无数据'); return; }
            
            let totalCost = 0, totalProfit = 0, wins = 0;
            for (let h of this.history) {
                const cost = parseFloat(h.payload?.totalCost || 0);
                const profit = parseFloat(h.payload?.profit || 0);
                totalCost += cost;
                totalProfit += profit;
                if (profit > 0) wins++;
            }
            const avgCost = (totalCost / this.history.length).toFixed(1);
            const avgProfit = (totalProfit / this.history.length).toFixed(1);
            const winRate = ((wins / this.history.length) * 100).toFixed(0);

            alert(`📊 历史数据分析\n\n总轮数: ${this.history.length}\n总成本: ${totalCost.toFixed(1)} 万\n总利润: ${totalProfit.toFixed(1)} 万\n平均成本: ${avgCost} 万\n平均利润: ${avgProfit} 万\n盈利率: ${winRate}%`);
        });

        // 删除历史
        container.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.st-del-history');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                if (confirm('确定删除这条历史吗？')) {
                    this.history.splice(idx, 1);
                    this.saveData();
                    this.render();
                }
            }
        });
    },

    // 任务数量弹窗（1-9 + 手输）
    openTaskQuantityModal(key) {
        const type = this.TASK_TYPES.find(t => t.key === key);
        if (!type) return;
        const unitPrice = this.prices[key] || 0;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:20px;width:300px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <div style="font-size:1.2rem;font-weight:700;margin-bottom:8px;">${type.icon} ${type.label}</div>
                <div style="font-size:0.9rem;color:#5a7a94;margin-bottom:12px;">单价: ${unitPrice}万 / 个</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `
                        <button class="qty-btn" data-num="${n}" style="width:40px;height:40px;border-radius:8px;border:1px solid #ccc;background:#f0f4f8;cursor:pointer;font-size:1rem;font-weight:700;">${n}</button>
                    `).join('')}
                </div>
                <div style="margin-bottom:12px;">
                    <input type="number" id="qtyInput" min="1" placeholder="或手动输入数量" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:8px;font-size:0.9rem;text-align:center;">
                </div>
                <div style="font-size:1rem;font-weight:700;color:#d9534f;margin-bottom:12px;">总成本: <span id="qtyTotal">0</span>万</div>
                <div style="display:flex;justify-content:space-around;">
                    <button id="qtyCancel" style="padding:8px 20px;border:none;border-radius:20px;background:#dce5ef;cursor:pointer;font-weight:700;">取消</button>
                    <button id="qtyConfirm" style="padding:8px 20px;border:none;border-radius:20px;background:#4CAF50;color:#fff;cursor:pointer;font-weight:700;">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const updateTotal = () => {
            let num = parseInt(document.getElementById('qtyInput').value) || 0;
            if (num <= 0) num = parseInt(document.querySelector('.qty-btn.active')?.dataset.num) || 1;
            document.getElementById('qtyTotal').textContent = (num * unitPrice).toFixed(1);
        };

        overlay.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('qtyInput').value = '';
                updateTotal();
            });
        });
        document.getElementById('qtyInput').addEventListener('input', updateTotal);
        document.getElementById('qtyCancel').addEventListener('click', () => overlay.remove());
        document.getElementById('qtyConfirm').addEventListener('click', () => {
            const num = parseInt(document.getElementById('qtyInput').value) || parseInt(document.querySelector('.qty-btn.active')?.dataset.num) || 1;
            const totalCost = num * unitPrice;
            this.records.push({
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                runId: this.currentRunId,
                taskIndex: this.records.length + 1,
                createdAt: new Date().toISOString(),
                typeKey: key, cost: totalCost, count: num
            });
            this.saveData();
            this.render();
            overlay.remove();
        });
    },

    // ========== 渲染 ==========
    render() {
        this.updateStats();
        this.updateDetails();
        this.updateHistory();
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost;
        document.getElementById('stRingCount').textContent = `${stats.ringCount}/60`;
        document.getElementById('stAvgCost').textContent = stats.avgCost;
        document.getElementById('stProfit').textContent = stats.profit;

        // 颜色区分
        const profitBox = document.getElementById('stProfitBox');
        profitBox.className = 'stat-item ' + (parseFloat(stats.profit) >= 0 ? 'profit' : 'loss');

        // 任务计数
        document.querySelectorAll('.st-task-wrapper').forEach(w => {
            const key = w.dataset.key;
            const countEl = w.querySelector('.st-task-count');
            if (countEl && stats.typeCount[key]) countEl.textContent = stats.typeCount[key];
        });

        // 总收入
        const totalIncome = (this.milestoneIncome.m15 || 0) + (this.milestoneIncome.m30 || 0) + (this.milestoneIncome.m45 || 0) + (this.milestoneIncome.m60 || 0);
        document.getElementById('milestoneTotalIncome').textContent = totalIncome.toFixed(1);
    },

    updateDetails() {
        const list = document.getElementById('bodyDetails');
        if (!list) return;
        if (this.records.length === 0) { list.innerHTML = '<div style="text-align:center;color:#6c87a0;padding:10px;">暂无记录</div>'; return; }
        
        let html = '';
        const recent = this.records.slice(-20).reverse();
        for (let r of recent) {
            const type = this.TASK_TYPES.find(t => t.key === r.typeKey);
            const label = type ? type.label : r.typeKey;
            const cost = r.cost;
            html += `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:4px 0;">
                <span>${r.taskIndex}. ${label} ×${r.count}</span>
                <span style="color:#c0392b;font-weight:700;">-${cost.toFixed(1)}万</span>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistory() {
        const tbody = document.getElementById('historyTable');
        if (!tbody) return;
        if (this.history.length === 0) { tbody.innerHTML = '<tr><td colspan="9" style="border:1px solid #ccc;text-align:center;padding:20px;">暂无记录</td></tr>'; return; }

        let html = '';
        const list = this.history.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = list.length - i;
            const payload = h.payload || {};

            const totalCost = parseFloat(payload.totalCost) || 0;
            const m15 = parseFloat(payload.milestoneData?.m15 || 0);
            const m30 = parseFloat(payload.milestoneData?.m30 || 0);
            const m45 = parseFloat(payload.milestoneData?.m45 || 0);
            const m60 = parseFloat(payload.milestoneData?.m60 || 0);
            const totalIncome = m15 + m30 + m45 + m60;
            const profit = totalIncome - totalCost;
            const pc = profit >= 0 ? 'color:#2d6b2d;' : 'color:#c0392b;';

            html += `<tr>
                <td style="border:1px solid #ccc;text-align:center;background:#f5f8fc;font-weight:700;">${row}</td>
                <td style="border:1px solid #ccc;text-align:center;">${h._createdAt ? h._createdAt.split('T')[0] : '-'}</td>
                <td style="border:1px solid #ccc;text-align:center;">${totalCost.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;">${m15.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;">${m30.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;">${m45.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;">${m60.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;${pc}">${profit.toFixed(1)}</td>
                <td style="border:1px solid #ccc;text-align:center;"><button class="st-del-history" data-idx="${this.history.indexOf(h)}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 8px;color:#8f3a3a;cursor:pointer;">✕</button></td>
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
