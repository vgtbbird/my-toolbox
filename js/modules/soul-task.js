// ============================================================
//  ✨ 跑玉魄(铸魂)模块 - 带数量交互/三选一/完美表格版
// ============================================================
const SoulTaskModule = {
    id: 'soulTask',
    storageKey: 'soulTask',

    uiSettings: { bgColor: '#eef2f7', btnColor: '#4CAF50', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14 },
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
        this.milestoneDetails = data.milestoneDetails || { m15: '', m30: '', m45: '', m60: '' };
        this.currentRunId = data.currentRunId || null;
        if (!this.currentRunId) this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        this.TASK_TYPES.forEach(t => { if (this.prices[t.key] === undefined) this.prices[t.key] = t.cost; });
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records, history: this.history, prices: this.prices,
            currentRunId: this.currentRunId, milestoneIncome: this.milestoneIncome,
            milestoneDetails: this.milestoneDetails
        });
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
            totalCost += parseFloat(r.payload?.cost || r.cost || 0);
            const key = r.payload?.typeKey || r.typeKey;
            typeCount[key] = (typeCount[key] || 0) + (r.payload?.count || r.count || 1);
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
                    <div class="title">📋 任务类型 <span style="font-size:0.7rem;font-weight:400;">— 点击后选择数量</span></div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-undo" id="stUndoBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">↩️ 撤销</button>
                        <button class="toggle-btn" id="stToggleTask" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="stTaskBody">
                    <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">${taskBtns}</div>
                </div>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🏆 里程碑结算 <span style="font-size:0.7rem;font-weight:400;">— 点击进入三选一</span></div>
                    <button class="toggle-btn" id="stToggleMilestone" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="stMilestoneBody" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                    <button id="stBtnM15" style="background:#dce5ef;border:1px solid #bccad9;border-radius:8px;padding:12px;cursor:pointer;font-weight:700;font-size:0.9rem;">15环奖励 <span id="stM15Val">(0.0万)</span></button>
                    <button id="stBtnM30" style="background:#dce5ef;border:1px solid #bccad9;border-radius:8px;padding:12px;cursor:pointer;font-weight:700;font-size:0.9rem;">30环奖励 <span id="stM30Val">(0.0万)</span></button>
                    <button id="stBtnM45" style="background:#dce5ef;border:1px solid #bccad9;border-radius:8px;padding:12px;cursor:pointer;font-weight:700;font-size:0.9rem;">45环奖励 <span id="stM45Val">(0.0万)</span></button>
                    <button id="stBtnM60" style="background:#b48b5f;color:#fff;border:1px solid #b48b5f;border-radius:8px;padding:12px;cursor:pointer;font-weight:700;font-size:0.9rem;">60环终局 <span id="stM60Val">(0.0万)</span></button>
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
                <div class="module-body" style="max-height:300px;overflow-y:auto;padding:0 12px;">
                    <div style="display:flex;justify-content:center;width:100%;">
                        <table style="width:100%;border-collapse:collapse;font-size:0.8rem;table-layout:fixed;">
                            <thead>
                                <tr style="background:#1f344b;color:#fff;">
                                    <th style="border:1px solid #d0dce8;width:4%;padding:12px 0;text-align:center;font-size:1.1rem;">#</th>
                                    <th style="border:1px solid #d0dce8;width:14%;padding:12px 0;text-align:center;font-size:1.1rem;">日期</th>
                                    <th style="border:1px solid #d0dce8;width:12%;padding:12px 0;text-align:center;font-size:1.1rem;">成本</th>
                                    <th style="border:1px solid #d0dce8;width:10%;padding:12px 0;text-align:center;font-size:1.1rem;">15环</th>
                                    <th style="border:1px solid #d0dce8;width:10%;padding:12px 0;text-align:center;font-size:1.1rem;">30环</th>
                                    <th style="border:1px solid #d0dce8;width:10%;padding:12px 0;text-align:center;font-size:1.1rem;">45环</th>
                                    <th style="border:1px solid #d0dce8;width:10%;padding:12px 0;text-align:center;font-size:1.1rem;">60环</th>
                                    <th style="border:1px solid #d0dce8;width:14%;padding:12px 0;text-align:center;font-size:1.1rem;">利润</th>
                                    <th style="border:1px solid #d0dce8;width:6%;padding:12px 0;text-align:center;font-size:1.1rem;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="stHistoryTable" style="background:#ffffff;"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const container = document.getElementById('soulTaskContainer');
        if (!container) return;

        const toggles = [
            ['stToggleTask', 'stTaskBody'], ['stToggleMilestone', 'stMilestoneBody'],
            ['stTogglePrice', 'stPriceBody'], ['stToggleRecords', 'stRecordsBody']
        ];
        toggles.forEach(([btnId, bodyId]) => {
            const btn = document.getElementById(btnId);
            if (btn) btn.addEventListener('click', () => {
                document.getElementById(bodyId).classList.toggle('hidden');
                btn.textContent = document.getElementById(bodyId).classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
            });
        });

        container.addEventListener('change', (e) => {
            const input = e.target.closest('[data-key]');
            if (input && input.id.startsWith('stPrice_')) {
                const key = input.dataset.key;
                this.prices[key] = parseFloat(input.value) || 0;
                this.saveData();
                this.render();
            }
        });

        // 点击任务 -> 打开数量弹窗
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-task-btn');
            if (btn) this.openTaskQuantityModal(btn.dataset.key);
        });

        document.getElementById('stBtnM15').addEventListener('click', () => this.openMilestoneModal(15));
        document.getElementById('stBtnM30').addEventListener('click', () => this.openMilestoneModal(30));
        document.getElementById('stBtnM45').addEventListener('click', () => this.openMilestoneModal(45));
        document.getElementById('stBtnM60').addEventListener('click', () => this.openMilestoneModal(60));

        document.getElementById('stUndoBtn').addEventListener('click', () => {
            if (this.records.length > 0) { this.records.pop(); this.saveData(); this.render(); }
        });

        document.getElementById('stCompleteBtn').addEventListener('click', () => {
            const stats = this.calcStats();
            if (stats.ringCount < 60 && !confirm(`当前只有 ${stats.ringCount} 环，确定提前结束结算吗？`)) return;
            const totalIncome = parseFloat(stats.totalIncome);
            const totalCost = parseFloat(stats.totalCost);
            const profit = totalIncome - totalCost;
            const entry = { _id: `soul_${Date.now()}`, _createdAt: new Date().toISOString(), payload: { totalCost: totalCost.toFixed(1), totalIncome: totalIncome.toFixed(1), profit: profit.toFixed(1), ringCount: stats.ringCount, milestoneData: { ...this.milestoneIncome } } };
            this.history.push(entry);
            this.records = []; this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6); this.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 }; this.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
            this.saveData(); this.render(); alert('✅ 本轮结算完成！');
        });

        document.getElementById('stResetBtn').addEventListener('click', () => {
            if (confirm('确定要重置本轮全部记录吗？')) {
                this.records = []; this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6); this.milestoneIncome = { m15: 0, m30: 0, m45: 0, m60: 0 }; this.milestoneDetails = { m15: '', m30: '', m45: '', m60: '' };
                this.saveData(); this.render();
            }
        });

        document.getElementById('stAnalysisBtn').addEventListener('click', () => {
            if (this.history.length === 0) { alert('📊 暂无历史记录'); return; }
            let totalProfit = 0;
            for (let h of this.history) totalProfit += parseFloat(h.payload?.profit || 0);
            alert(`📊 历史数据分析\n\n已跑总轮数: ${this.history.length}\n总利润: ${totalProfit.toFixed(1)} 万\n平均每轮利润: ${(totalProfit / this.history.length).toFixed(1)} 万`);
        });

        container.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.st-del-history');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                if (confirm('确定删除这条历史吗？')) { this.history.splice(idx, 1); this.saveData(); this.render(); }
            }
        });
    },

    // 任务数量弹窗
    openTaskQuantityModal(key) {
        const type = this.TASK_TYPES.find(t => t.key === key);
        if (!type) return;
        const unitPrice = this.prices[key] || 0;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:20px;width:320px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;">${type.icon} ${type.label}</div>
                <div style="font-size:0.9rem;color:#5a7a94;margin-bottom:10px;">单价: ${unitPrice}万</div>
                <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:15px;">
                    <button id="qMinus" style="width:36px;height:36px;border-radius:50%;border:1px solid #ccc;font-size:1.2rem;font-weight:700;cursor:pointer;">-</button>
                    <input type="number" id="qNum" value="1" min="1" style="width:60px;padding:6px;border:1px solid #ccc;border-radius:8px;font-size:1rem;text-align:center;">
                    <button id="qPlus" style="width:36px;height:36px;border-radius:50%;border:1px solid #ccc;font-size:1.2rem;font-weight:700;cursor:pointer;">+</button>
                </div>
                <div style="font-size:1.1rem;font-weight:700;color:#d9534f;margin-bottom:15px;">预计花费: <span id="qTotalCost">${unitPrice}</span> 万</div>
                <div style="display:flex;justify-content:space-around;">
                    <button id="qCancel" style="padding:8px 20px;border:none;border-radius:20px;background:#dce5ef;font-weight:700;cursor:pointer;">取消</button>
                    <button id="qConfirm" style="padding:8px 20px;border:none;border-radius:20px;background:#4CAF50;color:#fff;font-weight:700;cursor:pointer;">确认记录</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const updateCost = () => {
            const count = parseInt(document.getElementById('qNum').value) || 1;
            document.getElementById('qTotalCost').textContent = (count * unitPrice).toFixed(1);
        };
        document.getElementById('qMinus').addEventListener('click', () => { const input = document.getElementById('qNum'); input.value = Math.max(1, parseInt(input.value) - 1); updateCost(); });
        document.getElementById('qPlus').addEventListener('click', () => { const input = document.getElementById('qNum'); input.value = parseInt(input.value) + 1; updateCost(); });
        document.getElementById('qNum').addEventListener('input', updateCost);
        document.getElementById('qCancel').addEventListener('click', () => overlay.remove());
        document.getElementById('qConfirm').addEventListener('click', () => {
            const count = parseInt(document.getElementById('qNum').value) || 1;
            const totalCost = count * unitPrice;
            this.records.push({ id: Date.now(), runId: this.currentRunId, taskIndex: this.records.length + 1, createdAt: new Date().toISOString(), payload: { typeKey: key, cost: totalCost, count: count } });
            this.saveData(); this.render(); overlay.remove();
        });
    },

    // 里程碑弹窗（15/30/45三选一，60二选一，带数量）
    openMilestoneModal(ring) {
        const isFinal = ring === 60;
        const items = isFinal ? ['阳玉魄', '阴玉魄'] : ['女娲祝符', '五色灵尘', '女娲灵契'];
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
        const itemOptions = items.map(item => `
            <div class="msSelect" data-item="${item}" style="border:2px solid #dce5ef;border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer;font-weight:700;transition:0.2s;">
                ${item}
                <div class="msInput" style="display:none;margin-top:8px;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-bottom:8px;">
                        <button class="msMinus" style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;cursor:pointer;font-size:1rem;">-</button>
                        <input type="number" class="msCount" value="1" min="1" style="width:50px;padding:4px;border:1px solid #ccc;border-radius:6px;text-align:center;">
                        <button class="msPlus" style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;cursor:pointer;font-size:1rem;">+</button>
                    </div>
                    <input type="number" class="msValue" placeholder="总价值(万)" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;">
                </div>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:20px;width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-height:90vh;overflow-y:auto;">
                <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;text-align:center;">🏆 ${ring}环结算</div>
                <div style="font-size:0.8rem;color:#5a7a94;margin-bottom:10px;text-align:center;">请选择获得物品，并填入数量价值</div>
                <div>${itemOptions}</div>
                <div style="display:flex;justify-content:space-between;margin-top:15px;align-items:center;">
                    <span style="font-size:1rem;font-weight:700;color:#2d6b2d;">总收入: <span id="msTotal">0</span> 万</span>
                    <div>
                        <button id="msCancel" style="padding:8px 20px;border:none;border-radius:20px;background:#dce5ef;cursor:pointer;font-weight:700;">取消</button>
                        <button id="msConfirm" style="padding:8px 20px;border:none;border-radius:20px;background:#4CAF50;color:#fff;cursor:pointer;font-weight:700;">确认</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        let selectedItem = '';
        let totalVal = 0;
        const updateTotal = () => {
            totalVal = 0;
            overlay.querySelectorAll('.msSelect').forEach(sel => {
                const valueInput = sel.querySelector('.msValue');
                if (valueInput && valueInput.value) totalVal += parseFloat(valueInput.value) || 0;
            });
            document.getElementById('msTotal').textContent = totalVal.toFixed(1);
        };

        overlay.querySelectorAll('.msSelect').forEach(sel => {
            sel.addEventListener('click', () => {
                overlay.querySelectorAll('.msSelect').forEach(s => { s.style.borderColor = '#dce5ef'; s.style.background = 'transparent'; s.querySelector('.msInput').style.display = 'none'; });
                sel.style.borderColor = '#4CAF50'; sel.style.background = '#f0f8f0'; sel.querySelector('.msInput').style.display = 'block';
                selectedItem = sel.dataset.item; updateTotal();
            });
            const countInput = sel.querySelector('.msCount');
            sel.querySelector('.msMinus').addEventListener('click', (e) => { e.stopPropagation(); countInput.value = Math.max(1, parseInt(countInput.value) - 1); });
            sel.querySelector('.msPlus').addEventListener('click', (e) => { e.stopPropagation(); countInput.value = parseInt(countInput.value) + 1; });
            sel.querySelector('.msValue').addEventListener('input', updateTotal);
        });

        document.getElementById('msCancel').addEventListener('click', () => overlay.remove());
        document.getElementById('msConfirm').addEventListener('click', () => {
            if (!selectedItem) { alert('请先选择一个物品！'); return; }
            if (totalVal <= 0) { alert('请输入有效的价值！'); return; }
            const key = 'm' + ring;
            const count = parseInt(overlay.querySelector('.msSelect[data-item="' + selectedItem + '"] .msCount').value) || 1;
            this.milestoneIncome[key] = parseFloat(totalVal.toFixed(1));
            this.milestoneDetails[key] = `${selectedItem} x${count} (${totalVal.toFixed(1)}万)`;
            this.saveData(); this.render(); overlay.remove();
            alert(`✅ ${ring}环已结算！`);
        });
    },

    addRecord(key) { if (this.records.length >= 60) { alert('本轮已跑满60环，请先点击“结算本轮”！'); return; } },
    render() { this.updateStats(); this.updateRecordsList(); this.updateHistory(); setTimeout(() => this.applyUISettings(), 100); },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('stTotalCost').textContent = stats.totalCost === 'NaN' ? '0' : stats.totalCost;
        document.getElementById('stRingCount').textContent = `${stats.ringCount} / 60`;
        document.getElementById('stTotalIncome').textContent = stats.totalIncome === 'NaN' ? '0' : stats.totalIncome;
        document.getElementById('stProfit').textContent = stats.profit === 'NaN' ? '0' : stats.profit;
        const profitBox = document.getElementById('stProfitBox');
        profitBox.className = 'stat-item ' + (parseFloat(stats.profit) >= 0 ? 'profit' : 'loss');
        document.querySelectorAll('.st-task-wrapper').forEach(w => {
            const key = w.dataset.key; const ce = w.querySelector('.st-task-count');
            if (ce && stats.typeCount[key] !== undefined) ce.textContent = stats.typeCount[key];
        });
        document.getElementById('stM15Val').textContent = `(${this.milestoneIncome.m15 || 0}万)`;
        document.getElementById('stM30Val').textContent = `(${this.milestoneIncome.m30 || 0}万)`;
        document.getElementById('stM45Val').textContent = `(${this.milestoneIncome.m45 || 0}万)`;
        document.getElementById('stM60Val').textContent = `(${this.milestoneIncome.m60 || 0}万)`;
    },

    updateRecordsList() {
        const list = document.getElementById('stRecordsBody');
        if (!list) return;
        if (this.records.length === 0) { list.innerHTML = '<div style="text-align:center;padding:10px;color:#6c87a0;">暂无记录</div>'; return; }
        let html = '';
        const recent = this.records.slice(-20).reverse();
        for (let r of recent) {
            const type = this.TASK_TYPES.find(t => t.key === (r.payload?.typeKey || r.typeKey));
            const label = type ? type.label : r.payload?.typeKey;
            const count = r.payload?.count || 1;
            const cost = r.payload?.cost || 0;
            html += `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #eee;font-size:0.75rem;">
                <span>${r.taskIndex}. ${label} ×${count}</span>
                <span style="color:#c0392b;font-weight:700;">-${cost.toFixed(1)}万</span>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistory() {
        const tbody = document.getElementById('stHistoryTable');
        if (!tbody) return;
        if (this.history.length === 0) { tbody.innerHTML = '<tr><td colspan="9" style="padding:20px;text-align:center;color:#6c87a0;">暂无历史记录</td></tr>'; return; }
        let html = '';
        const list = this.history.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = list.length - i;
            const payload = h.payload || {};
            const totalCost = parseFloat(payload.totalCost) || 0;
            const totalIncome = parseFloat(payload.totalIncome) || 0;
            const profit = parseFloat(payload.profit) || (totalIncome - totalCost);
            const mData = payload.milestoneData || {};
            const m15 = parseFloat(mData.m15) || 0;
            const m30 = parseFloat(mData.m30) || 0;
            const m45 = parseFloat(mData.m45) || 0;
            const m60 = parseFloat(mData.m60) || 0;
            const pc = profit >= 0 ? 'color:#2d6b2d;font-weight:700;' : 'color:#c0392b;font-weight:700;';
            html += `<tr>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;background:#f5f8fc;">${row}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${h._createdAt ? h._createdAt.split('T')[0] : '-'}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${totalCost.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${m15.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${m30.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${m45.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;">${m60.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;${pc}">${profit.toFixed(1)}</td>
                <td style="border:1px solid #d0dce8;padding:6px;text-align:center;"><button class="st-del-history" data-idx="${this.history.indexOf(h)}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 8px;color:#8f3a3a;cursor:pointer;">✕</button></td>
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
