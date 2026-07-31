// ============================================================
//  🏃 跑宠环模块 - 完整版（奖励可删除）
// ============================================================
const PetRingModule = {
    id: 'petRing',

    // ========== 数据 ==========
    storageKey: 'petRing',
    records: [],
    history: [],
    prices: {},
    deductSettings: {},
    bookRewards: [],
    extraRewards: { points: 0, fruits: 0, furnitures: 0 },
    pendingSettle: null,
    exchangeRate: 0.08,

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

    ITEM_TYPES: [
        { key: 'find', label: '找人', score: 1, defaultPrice: 0, color: '#2d6b9e' },
        { key: 'ring60', label: '60环', score: 2, defaultPrice: 1.5, color: '#3a7a4a' },
        { key: 'ring70', label: '70环', score: 3, defaultPrice: 3, color: '#b87a3a' },
        { key: 'ring80', label: '80环', score: 5, defaultPrice: 8, color: '#8f3a8f' },
        { key: 'flower', label: '花卉乐器', score: 4, defaultPrice: 2, color: '#c45a7a' },
        { key: 'cook', label: '烹饪三药', score: 2, defaultPrice: 1, color: '#3a9e7a' },
        { key: 'furn1', label: '1级家具', score: 2, defaultPrice: 1, color: '#7a8a3a' },
        { key: 'furn2', label: '2级家具', score: 5, defaultPrice: 3, color: '#8a6a3a' },
        { key: 'var_common', label: '非指定变异', score: 5, defaultPrice: 30, color: '#b45a3a' },
        { key: 'var_spec', label: '指定变异', score: 10, defaultPrice: 80, color: '#b43a7a' },
    ],
    DEDUCT_TYPES: [
        { key: 'skip', label: '跳过任务', defaultDeduct: 20, defaultCost: 0 },
        { key: 'normal_pet', label: '交普通召唤兽', defaultDeduct: 15, defaultCost: 0.5 },
        { key: 'low_quality', label: '不足品质烹饪/三药', defaultDeduct: 4, defaultCost: 0.3 },
    ],
    INITIAL_COST: 10,
    filterState: { dateFrom: '', dateTo: '', ringsMin: '', ringsMax: '', profitType: 'all' },

    // ========== 生命周期 ==========
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
    },

   render() {
    this.updateStats();
    this.updateHistory();
    this.updateAdvice();
    this.updateBookList();
    this.updateHistoryTable();  // ← 确保这行存在
    this.saveData();
    setTimeout(() => this.applyUISettings(), 100);
    this.checkAutoSettle();
},

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.deductSettings = data.deductSettings || {};
        this.bookRewards = data.bookRewards || [];
        this.extraRewards = data.extraRewards || { points: 0, fruits: 0, furnitures: 0 };
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14
        };
        this.pendingSettle = data.pendingSettle || null;
        this.exchangeRate = data.exchangeRate || 0.08;

        this.ITEM_TYPES.forEach(t => {
            if (this.prices[t.key] === undefined) this.prices[t.key] = t.defaultPrice;
        });
        this.DEDUCT_TYPES.forEach(d => {
            if (!this.deductSettings[d.key]) {
                this.deductSettings[d.key] = { deduct: d.defaultDeduct, cost: d.defaultCost };
            }
        });
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            history: this.history,
            prices: this.prices,
            deductSettings: this.deductSettings,
            bookRewards: this.bookRewards,
            extraRewards: this.extraRewards,
            uiSettings: this.uiSettings,
            pendingSettle: this.pendingSettle,
            exchangeRate: this.exchangeRate
        });
    },

    // ========== 应用UI设置 ==========
    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('petRingContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) {
            tabContent.style.setProperty('background', s.bgColor, 'important');
        }
        const card = container.closest('.card');
        if (card) {
            card.style.setProperty('background', s.bgColor, 'important');
        }

        container.querySelectorAll('.module, .income-section, .analysis-panel, .stats-grid .stat-item, .history-section, .table-wrap, .advice-box, .income-reward-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
            el.style.setProperty('background-color', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .income-item label, .income-item .fixed-val, .flex-between span, .footer-note, .history-item, .price-item label, .price-item input, .task-count, .ds-item label, .ds-item input, .filter-item label, .filter-item input, .filter-item select, .table-wrap td, .table-wrap th').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        container.querySelectorAll('.task-btn:not(.deduct), .btn-complete, .btn-end, .btn-reset, .btn-undo, .btn-analysis, .btn-import, .btn-toggle-history, .btn-small, .sync-btn, .btn-filter, .toggle-btn, .detail-toggle').forEach(el => {
            if (!el.classList.contains('task-btn') || !el.classList.contains('deduct')) {
                el.style.setProperty('background', s.btnColor, 'important');
                el.style.setProperty('background-color', s.btnColor, 'important');
                el.style.setProperty('color', s.btnTextColor, 'important');
            }
        });

        container.querySelectorAll('.task-btn:not(.deduct)').forEach(el => {
            el.style.setProperty('background', s.btnColor, 'important');
            el.style.setProperty('background-color', s.btnColor, 'important');
            el.style.setProperty('color', s.btnTextColor, 'important');
            el.style.setProperty('border', '1px solid ' + s.btnColor, 'important');
        });

        container.querySelectorAll('.task-btn.deduct').forEach(el => {
            el.style.setProperty('background', '#c0392b', 'important');
            el.style.setProperty('background-color', '#c0392b', 'important');
            el.style.setProperty('color', '#ffffff', 'important');
            el.style.setProperty('border', '1px solid #c0392b', 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .income-item label, .income-item .fixed-val, .history-item, .task-btn, .btn-complete, .btn-end, .btn-reset, .btn-undo, .filter-item label, .filter-item input, .filter-item select, .table-wrap td, .table-wrap th, .advice-text, .ds-item label, .ds-item input, .price-item label, .price-item input').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });

        container.querySelectorAll('.module .title, .section-label, .advice-title').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 2) + 'px', 'important');
        });
        container.querySelectorAll('.stat-item .num').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 6) + 'px', 'important');
        });
    },

    // ========== 检查自动结算 ==========
    checkAutoSettle() {
        const stats = this.calcStats();
        if (stats.ringCount >= 100 && !this.pendingSettle) {
            this.prepareSettle();
        }
    },

    // ========== 结算准备 ==========
    prepareSettle() {
        const stats = this.calcStats();
        const income = this.calcIncome(stats);

        const isFull = stats.ringCount >= 100;

        if (isFull) {
            this.pendingSettle = {
                stats: stats,
                income: income,
                rewards: this.bookRewards.map(b => `${b.name}(${b.value}万)`).join(' + ')
            };
            this.saveData();

            const incomeBody = document.getElementById('prIncomeBody');
            if (incomeBody) incomeBody.classList.remove('hidden');
            const incomeBtn = document.getElementById('prToggleIncomeBtn');
            if (incomeBtn) incomeBtn.textContent = '👁️ 隐藏';

            const incomeModule = document.getElementById('prModuleIncome');
            if (incomeModule) {
                incomeModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            alert(`🎯 第 ${this.history.length + 1} 轮已完成100环！\n📌 总积分: ${stats.totalScore}\n📈 修炼点: ${stats.totalPoints}\n💰 当前成本: ${stats.totalCost.toFixed(1)}万\n\n请在下方的「收入 & 利润设置」模块中，\n输入本轮获得的书铁等物品价值，\n然后点击「✅ 确认结算」按钮。`);
        } else {
            this.quickSettle(stats, income);
        }
    },

    // ========== 快速结算（提前结束） ==========
    quickSettle(stats, income) {
        const rewards = this.bookRewards.map(b => `${b.name}(${b.value}万)`).join(' + ');

        const entry = {
            date: new Date().toLocaleString(),
            ringCount: stats.ringCount,
            totalCost: stats.totalCost,
            totalScore: stats.totalScore,
            totalPoints: stats.totalPoints,
            totalIncome: income.totalIncome,
            profit: income.profit,
            bookIncome: income.bookIncome,
            furnitureIncome: income.furnitureIncome,
            fruitIncome: income.fruitIncome,
            isComplete: true,
            typeCount: stats.typeCount,
            rewards: rewards || (income.bookIncome > 0 ? `书铁${income.bookIncome.toFixed(1)}万` : ''),
            exchangeRate: this.exchangeRate  // ✅ 保存当时汇率
        };
        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.saveData();

        this.updateStats();
        this.updateHistory();
        this.updateAdvice();
        this.updateBookList();
        this.updateHistoryTable();

        this.showSettleModal(entry);

        const container = document.getElementById('petRingContainer');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    // ========== 确认结算（满100环） ==========
    confirmSettle() {
        if (!this.pendingSettle) {
            alert('没有待结算的数据！');
            return;
        }

        const { stats, rewards } = this.pendingSettle;

        // 重新计算收入
        const fp = parseFloat(document.getElementById('prFruitPrice')?.value) || 80;
        const fup = parseFloat(document.getElementById('prFurniturePrice')?.value) || 3.5;

        // 修炼点 = 基础跑环点 + 手动添加的200修炼点 + 修炼果
        const totalPoints = stats.totalPoints;
        const fruitCount = totalPoints / 170;
        const fruitIncome = fruitCount * fp;
        const bookIncome = this.bookRewards.reduce((s, b) => s + (b.value || 0), 0);
        const furnitureIncome = this.extraRewards.furnitures * fup;
        const totalIncome = fruitIncome + bookIncome + furnitureIncome;
        const profit = totalIncome - stats.totalCost;

        const entry = {
            date: new Date().toLocaleString(),
            ringCount: stats.ringCount,
            totalCost: stats.totalCost,
            totalScore: stats.totalScore,
            totalPoints: totalPoints,
            totalIncome: totalIncome,
            profit: profit,
            bookIncome: bookIncome,
            furnitureIncome: furnitureIncome,
            fruitIncome: fruitIncome,
            isComplete: true,
            typeCount: stats.typeCount,
            rewards: rewards || (bookIncome > 0 ? `书铁${bookIncome.toFixed(1)}万` : '')
        };

        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.saveData();

        this.updateStats();
        this.updateHistory();
        this.updateAdvice();
        this.updateBookList();
        this.updateHistoryTable();

        this.showSettleModal(entry);

        const container = document.getElementById('petRingContainer');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    // ========== 显示结算弹窗 ==========
    showSettleModal(entry) {
        const profit = entry.profit;
        const rmb = profit * this.exchangeRate;
        const fruitCount = entry.totalPoints / 170;
        document.getElementById('settleModalTitle').textContent = entry.isComplete ? '🎯 100环结算报告' : '⏹️ 提前结束结算';
        document.getElementById('settleModalDesc').textContent =
            `💰 总成本 ${entry.totalCost.toFixed(1)}万 | 📈 利润 ${profit.toFixed(1)}万 (≈${rmb.toFixed(2)}元) | 📌 ${entry.ringCount}环 | ⭐ 总积分 ${entry.totalScore}`;
        document.getElementById('settleModalBody').innerHTML =
            `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:8px 0;">
                <span>📌 总环数: <strong>${entry.ringCount}</strong></span>
                <span>⭐ 总积分: <strong>${entry.totalScore}</strong></span>
                <span>💰 总成本: <strong>${entry.totalCost.toFixed(1)}万</strong></span>
                <span>📈 修炼点: <strong>${entry.totalPoints}</strong></span>
                <span>💎 修炼果: <strong>${fruitCount.toFixed(2)}个</strong></span>
                <span>📊 总收入: <strong>${entry.totalIncome.toFixed(1)}万</strong></span>
                <span style="grid-column:1/-1;text-align:center;font-size:1.1rem;padding:6px 0;border-top:1px solid #dce5ef;color:${profit>=0?'#2d6b2d':'#c0392b'};">
                    ${profit >= 0 ? '✅' : '❌'} 利润: <strong>${profit.toFixed(1)}万</strong> (≈${rmb.toFixed(2)}元)
                </span>
                <span style="grid-column:1/-1;text-align:center;font-size:0.85rem;color:#5a7a94;padding:4px 0;">
                    🎁 获得物品: ${entry.rewards || '无'}
                </span>
            </div>`;
        document.getElementById('settleModal').classList.add('show');
    },

    // ========== 计算 ==========
    getRingPoints(index) {
        if (index < 9) return 3;
        if (index < 19) return 4;
        if (index < 29) return 5;
        if (index < 39) return 6;
        if (index < 49) return 7;
        if (index < 59) return 8;
        if (index < 69) return 9;
        if (index < 79) return 10;
        if (index < 89) return 11;
        if (index < 99) return 12;
        return 13;
    },

    calcStats() {
        let totalCost = this.INITIAL_COST, totalScore = 0, totalPoints = 0;
        const typeCount = {};
        this.ITEM_TYPES.forEach(t => typeCount[t.key] = 0);
        this.DEDUCT_TYPES.forEach(d => typeCount[d.key] = 0);

        for (let r of this.records) {
            totalCost += r.cost;
            totalScore += r.score;
            totalPoints += r.ringPoints;
            if (typeCount[r.typeKey] !== undefined) typeCount[r.typeKey]++;
            else typeCount[r.typeKey] = 1;
        }

        const count = this.records.length;
        // 修炼点 = 基础跑环点 + 额外200修炼点 + 修炼果(170点/个)
        let totalPointsAll = totalPoints + this.extraRewards.points + this.extraRewards.fruits * 170;

        return {
            totalCost,
            totalScore,
            totalPoints: totalPointsAll,
            ringCount: count,
            remaining: Math.max(0, 100 - count),
            avgCost: count > 0 ? totalCost / count : 0,
            typeCount,
            fruitCount: totalPointsAll / 170
        };
    },

    calcIncome(stats) {
        const fp = parseFloat(document.getElementById('prFruitPrice')?.value) || 80;
        const fup = parseFloat(document.getElementById('prFurniturePrice')?.value) || 3.5;
        const fruitIncome = stats.fruitCount * fp;
        const bookIncome = this.bookRewards.reduce((s, b) => s + (b.value || 0), 0);
        const furnitureIncome = this.extraRewards.furnitures * fup;
        const totalIncome = fruitIncome + bookIncome + furnitureIncome;
        return { fruitIncome, bookIncome, furnitureIncome, totalIncome, profit: totalIncome - stats.totalCost };
    },

    getFilteredData() {
        let data = this.history.slice();
        const f = this.filterState;
        if (f.dateFrom) { const from = new Date(f.dateFrom); data = data.filter(h => new Date(h.date) >= from); }
        if (f.dateTo) { const to = new Date(f.dateTo); to.setHours(23, 59, 59); data = data.filter(h => new Date(h.date) <= to); }
        if (f.ringsMin) data = data.filter(h => h.ringCount >= parseInt(f.ringsMin));
        if (f.ringsMax) data = data.filter(h => h.ringCount <= parseInt(f.ringsMax));
        if (f.profitType === 'positive') data = data.filter(h => h.profit > 0);
        else if (f.profitType === 'negative') data = data.filter(h => h.profit < 0);
        return data;
    },

    // ========== 删除奖励条目 ==========
    removeRewardItem(type, idx) {
        switch(type) {
            case 'book':
                if (idx >= 0 && idx < this.bookRewards.length) {
                    this.bookRewards.splice(idx, 1);
                }
                break;
            case 'points':
                if (this.extraRewards.points >= 200) {
                    this.extraRewards.points -= 200;
                }
                break;
            case 'fruit':
                if (this.extraRewards.fruits > 0) {
                    this.extraRewards.fruits -= 1;
                }
                break;
            case 'furniture':
                if (this.extraRewards.furnitures > 0) {
                    this.extraRewards.furnitures -= 1;
                }
                break;
            default:
                return;
        }
        this.saveData();
        this.render();
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('petRingContainer');
        if (!container) return;

        container.innerHTML = `

            <!-- 🎨 界面设置 -->
            <div class="module" id="prModuleUISettings" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置 <span class="hint">— 自定义颜色和字体</span></div>
                    <div>
                        <button class="toggle-btn" id="prToggleUISettingsBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="prUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🎨 背景色</label>
                            <input type="color" id="prBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📦 卡片色</label>
                            <input type="color" id="prCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔘 按钮色</label>
                            <input type="color" id="prBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📝 文字色</label>
                            <input type="color" id="prTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔤 字体大小</label>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" id="prFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;">
                                <span id="prFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="prResetUIBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="prTotalCost">10.0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="prTotalScore">0</div><div class="label">⭐ 总积分</div></div>
                <div class="stat-item"><div class="num" id="prRingCount">0 <span class="remaining" id="prRingRemaining">/100</span></div><div class="label">📌 当前/剩余环数</div></div>
                <div class="stat-item"><div class="num" id="prAvgCost">0</div><div class="label">📊 平均成本</div></div>
                <div class="stat-item"><div class="num" id="prTotalPoints">0</div><div class="label">📈 修炼点</div></div>
                <div class="stat-item" id="prProfitStat"><div class="num" id="prProfitDisplay">0</div><div class="label">💰 利润(万)</div></div>
            </div>

            <!-- 任务类型 -->
            <div class="module" id="prModuleTask">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span class="hint">— 点击记录一环</span></div>
                    <div>
                        <button class="btn-undo" id="prUndoBtn">↩️ 撤销</button>
                        <button class="toggle-btn" id="prToggleTaskBtn">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="prTaskBody">
                    <div class="task-grid" id="prTaskGrid"></div>
                    <div class="deduct-settings-inline" id="prDeductSettings"></div>
                </div>
            </div>

            <!-- 决策建议 -->
            <div class="module" id="prModuleAdvice">
                <div class="module-header">
                    <div class="title">🧠 决策建议 <span class="tag" id="prAdviceTag" style="background:#4c7a5c;color:#fff;font-size:0.55rem;padding:2px 12px;border-radius:30px;">实时分析</span></div>
                    <button class="toggle-btn" id="prToggleAdviceBtn">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="prAdviceBody">
                    <div class="advice-text" style="background:#1f344b;border-radius:14px;padding:8px 14px;color:#f2eee4;">
                        <div><span class="advice-label" style="color:#b9cfde;font-weight:600;">📊 当前状态：</span><span id="prAdviceStatus" style="color:#f2eee4;">点击下方任务按钮，开始记录本轮跑环数据。</span></div>
                        <div id="prAdvicePrediction" style="display:none;margin-top:4px;"><span class="advice-label" style="color:#b9cfde;font-weight:600;">🔮 积分预测：</span><span id="prAdvicePredictionText" style="color:#f2eee4;">-</span></div>
                        <div id="prAdviceStrategy" style="display:none;margin-top:4px;"><span class="advice-label" style="color:#b9cfde;font-weight:600;">🎯 策略建议：</span><span id="prAdviceStrategyText" style="color:#f2eee4;">-</span></div>
                    </div>
                </div>
            </div>

            <!-- 物品单价 + 汇率 -->
            <div class="module" id="prModulePrice">
                <div class="module-header">
                    <div class="title">⚙️ 物品单价 & 汇率 <span class="hint">— 根据服务器物价调整</span></div>
                    <button class="toggle-btn" id="prTogglePriceBtn">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="prPriceBody">
                    <div class="price-row" id="prPriceInputs"></div>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:6px;border-top:1px solid #dce5ef;">
                        <label style="font-weight:600;font-size:0.8rem;color:#1f3b53;">💱 1万梦幻币 = </label>
                        <input type="number" step="0.001" min="0" id="prExchangeRate" value="${this.exchangeRate}" style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:20px;font-size:0.8rem;text-align:center;">
                        <span style="font-size:0.8rem;color:#1f3b53;">元 RMB</span>
                        <span style="font-size:0.65rem;color:#5a7a94;margin-left:8px;">💡 例：0.08 = 1万梦幻币=0.08元</span>
                    </div>
                </div>
            </div>

            <!-- 收入 & 利润 -->
            <div class="module" id="prModuleIncome">
                <div class="module-header">
                    <div class="title">💰 收入 & 利润设置 <span class="badge" style="background:#4c7a5c;color:#fff;font-size:0.6rem;padding:2px 12px;border-radius:30px;">实时计算</span></div>
                    <div>
                        <button class="btn-complete" id="prConfirmSettleBtn" style="background:#4CAF50;color:#fff;border:none;padding:4px 16px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.7rem;">✅ 确认结算</button>
                        <button class="toggle-btn" id="prToggleIncomeBtn">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="prIncomeBody">
                    <div class="income-row">
                        <div class="income-item"><label>💎 修炼果单价</label><input type="number" step="0.1" min="0" id="prFruitPrice" value="80"><span class="unit">万</span></div>
                        <div class="income-item"><label>📐 家具图册</label><input type="number" step="0.1" min="0" id="prFurniturePrice" value="3.5"><span class="unit">万</span></div>
                        <div class="income-item"><label>📊 总收入</label><span class="fixed-val" id="prTotalIncomeDisplay">0</span><span class="unit">万</span></div>
                        <div class="income-item profit-box" id="prProfitBox"><label>🏆 利润</label><span class="fixed-val" id="prProfitDisplay2">0</span><span class="unit">万</span></div>
                    </div>
                    <div class="income-reward-grid">
                        <div class="income-reward-item" style="flex-wrap:wrap;">
                            <label>📘 书铁名称</label>
                            <input type="text" id="prBookName" placeholder="如: 130项链" style="width:70px;">
                            <label>价值</label>
                            <input type="number" step="0.1" min="0" id="prBookValue" value="0" style="width:50px;">
                            <span class="unit">万</span>
                            <button class="btn-small" id="prAddBookBtn">+添加</button>
                        </div>
                        <div class="income-reward-item" style="flex-wrap:wrap;grid-column:span 2;">
                            <label>📦 已添加</label>
                            <span class="fixed-val" id="prBookListDisplay" style="font-size:0.7rem;color:#5a7a94;">无</span>
                        </div>
                        <div class="income-reward-item"><label>⚡ 200修炼点</label><button class="btn-small" id="prAdd200PointsBtn">+ 获得</button></div>
                        <div class="income-reward-item"><label>🍎 修炼果</label><button class="btn-small" id="prAddFruitBtn">+ 1个</button></div>
                        <div class="income-reward-item"><label>📐 家具图册</label><button class="btn-small" id="prAddFurnitureBtn">+ 1个</button></div>
                    </div>
                    <div style="font-size:0.65rem;color:#5a7a94;margin-top:8px;padding-top:6px;border-top:1px solid #eef2f7;">💡 修炼果收入 = 修炼点 ÷ 170 × 单价 &nbsp;|&nbsp; 利润 = 总收入 − 总成本 &nbsp;|&nbsp; 初始成本固定10万</div>
                </div>
            </div>

            <!-- 本轮记录 -->
            <div class="module" id="prModuleHistory">
                <div class="module-header">
                    <div class="title">📜 本轮记录 <span class="hint" id="prRingInfo">共0环</span></div>
                    <button class="toggle-btn" id="prToggleHistoryBtn">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="prHistoryBody">
                    <div class="history-section" id="prHistoryList"><div class="empty-history">暂无记录</div></div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex-between">
                <span style="font-size:0.7rem;color:#3a5f7a;">💡 点击任务按钮记录一环，满100环自动结算</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-end" id="prEndBtn" style="background:#b48b5f;color:#fff;border:none;padding:5px 16px;border-radius:40px;font-weight:600;cursor:pointer;font-size:0.75rem;">⏹️ 提前结束</button>
                    <button class="btn-reset" id="prResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:5px 16px;border-radius:40px;font-weight:600;cursor:pointer;font-size:0.75rem;">🗑️ 重置本轮</button>
                </div>
            </div>

            <!-- 历史统计 -->
            <div class="module" id="prModuleStats">
                <div class="module-header">
                    <div class="title">📊 历史轮次统计 <span class="hint" id="prSettledCount">已结算: 0轮</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn-analysis" id="prAnalysisToggleBtn">📊 数据分析</button>
                        <button class="btn-import" id="prImportBtn">📥 导入数据</button>
                        <button class="btn-toggle-history" id="prToggleStatsBtn">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="prStatsBody">
                    <div class="analysis-panel" id="prAnalysisPanel" style="display:none;">
                        <div class="analysis-grid" id="prAnalysisGrid">
                            <div class="a-item"><div class="a-num" id="prAnaTotalRuns">0</div><div class="a-label">总轮数</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaTotalCost">0</div><div class="a-label">总成本(万)</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaTotalIncome">0</div><div class="a-label">总收入(万)</div></div>
                            <div class="a-item a-profit" id="prAnaTotalProfitWrap"><div class="a-num" id="prAnaTotalProfit">0</div><div class="a-label">总利润(万)</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaAvgProfit">0</div><div class="a-label">平均利润(万)</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaWinRate">0%</div><div class="a-label">胜率</div></div>
                            <div class="a-item a-high"><div class="a-num" id="prAnaMaxProfit">0</div><div class="a-label">最高利润</div></div>
                            <div class="a-item a-low"><div class="a-num" id="prAnaMinProfit">0</div><div class="a-label">最低利润</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaAvgRings">0</div><div class="a-label">平均环数</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaTotalRings">0</div><div class="a-label">总环数</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaWinCount">0</div><div class="a-label">盈利轮数</div></div>
                            <div class="a-item"><div class="a-num" id="prAnaLoseCount">0</div><div class="a-label">亏损轮数</div></div>
                        </div>
                        <div class="task-stats-row" id="prTaskStatsRow"></div>
                        <div class="filter-row">
                            <div class="filter-item"><label>📅 日期从</label><input type="date" id="prFilterDateFrom"></div>
                            <div class="filter-item"><label>到</label><input type="date" id="prFilterDateTo"></div>
                            <div class="filter-item"><label>📌 环数</label><input type="number" id="prFilterRingsMin" placeholder="≥" style="width:50px;"><span>-</span><input type="number" id="prFilterRingsMax" placeholder="≤" style="width:50px;"></div>
                            <div class="filter-item"><label>📈 利润</label><select id="prFilterProfitType"><option value="all">全部</option><option value="positive">盈利</option><option value="negative">亏损</option></select></div>
                            <div class="filter-item"><button class="btn-filter" id="prApplyFilterBtn">应用筛选</button><button class="btn-filter reset" id="prResetFilterBtn">重置</button></div>
                        </div>
                    </div>
                    <div class="table-wrap" style="max-height:320px;overflow-y:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:36px;min-width:36px;">#</th>
                                    <th style="min-width:100px;">📅 日期</th>
                                    <th style="min-width:50px;">📌 环数</th>
                                    <th style="min-width:55px;">💰 成本</th>
                                    <th style="min-width:70px;">⭐ 总积分</th>
                                    <th style="min-width:55px;">📈 利润</th>
                                    <th style="min-width:65px;">📈 修炼点</th>
                                    <th style="min-width:55px;">📘 书铁</th>
                                    <th style="min-width:52px;">📊 详情</th>
                                    <th style="min-width:52px;">⚙️</th>
                                </tr>
                            </thead>
                            <tbody id="prHistoryTableBody">
                                <tr><td colspan="10" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无已结算记录</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        // ===== UI设置 =====
        document.getElementById('prBgColor').addEventListener('input', function() {
            PetRingModule.uiSettings.bgColor = this.value;
            PetRingModule.applyUISettings();
            PetRingModule.saveData();
        });
        document.getElementById('prCardColor').addEventListener('input', function() {
            PetRingModule.uiSettings.cardBgColor = this.value;
            PetRingModule.applyUISettings();
            PetRingModule.saveData();
        });
        document.getElementById('prBtnColor').addEventListener('input', function() {
            PetRingModule.uiSettings.btnColor = this.value;
            PetRingModule.applyUISettings();
            PetRingModule.saveData();
        });
        document.getElementById('prTextColor').addEventListener('input', function() {
            PetRingModule.uiSettings.textColor = this.value;
            PetRingModule.applyUISettings();
            PetRingModule.saveData();
        });
        document.getElementById('prFontSize').addEventListener('input', function() {
            const val = parseInt(this.value);
            document.getElementById('prFontSizeDisplay').textContent = val;
            PetRingModule.uiSettings.fontSize = val;
            PetRingModule.applyUISettings();
            PetRingModule.saveData();
        });
        document.getElementById('prResetUIBtn').addEventListener('click', function() {
            if (confirm('重置所有UI设置为默认值？')) {
                PetRingModule.uiSettings = {
                    bgColor: '#eef2f7',
                    btnColor: '#4CAF50',
                    btnTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    textColor: '#1a1a2e',
                    fontSize: 14
                };
                document.getElementById('prBgColor').value = PetRingModule.uiSettings.bgColor;
                document.getElementById('prCardColor').value = PetRingModule.uiSettings.cardBgColor;
                document.getElementById('prBtnColor').value = PetRingModule.uiSettings.btnColor;
                document.getElementById('prTextColor').value = PetRingModule.uiSettings.textColor;
                document.getElementById('prFontSize').value = PetRingModule.uiSettings.fontSize;
                document.getElementById('prFontSizeDisplay').textContent = PetRingModule.uiSettings.fontSize;
                PetRingModule.applyUISettings();
                PetRingModule.saveData();
                alert('✅ UI设置已重置！');
            }
        });
        document.getElementById('prToggleUISettingsBtn').addEventListener('click', function() {
            const body = document.getElementById('prUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 汇率变化 =====
        document.getElementById('prExchangeRate').addEventListener('input', function() {
            const val = parseFloat(this.value) || 0;
            PetRingModule.exchangeRate = val;
            PetRingModule.saveData();
            PetRingModule.render();
        });

        // ===== 确认结算 =====
        document.getElementById('prConfirmSettleBtn').addEventListener('click', () => {
            if (this.pendingSettle) {
                this.confirmSettle();
            } else {
                const stats = this.calcStats();
                if (stats.ringCount === 0) {
                    alert('还没有任何记录！');
                    return;
                }
                const income = this.calcIncome(stats);
                this.quickSettle(stats, income);
            }
        });

        // ===== 隐藏按钮 =====
        document.getElementById('prToggleTaskBtn').addEventListener('click', function() {
            const body = document.getElementById('prTaskBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('prToggleAdviceBtn').addEventListener('click', function() {
            const body = document.getElementById('prAdviceBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('prTogglePriceBtn').addEventListener('click', function() {
            const body = document.getElementById('prPriceBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('prToggleIncomeBtn').addEventListener('click', function() {
            const body = document.getElementById('prIncomeBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('prToggleHistoryBtn').addEventListener('click', function() {
            const body = document.getElementById('prHistoryBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('prToggleStatsBtn').addEventListener('click', function() {
            const body = document.getElementById('prStatsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 任务按钮 =====
        document.getElementById('petRingContainer').addEventListener('click', (e) => {
            const btn = e.target.closest('.task-btn');
            if (btn) {
                const key = btn.dataset.key;
                if (this.DEDUCT_TYPES.some(d => d.key === key)) {
                    this.addDeduct(key);
                } else {
                    this.addRecord(key);
                }
            }
        });

        // ===== 撤销 =====
        document.getElementById('prUndoBtn').addEventListener('click', () => this.undoRecord());

        // ===== 提前结束 =====
        document.getElementById('prEndBtn').addEventListener('click', () => {
            const stats = this.calcStats();
            if (stats.ringCount === 0) {
                alert('还没有任何记录！');
                return;
            }
            if (!confirm(`当前只有 ${stats.ringCount} 环，确定要提前结束结算吗？`)) return;
            const income = this.calcIncome(stats);
            this.quickSettle(stats, income);
        });

        // ===== 重置 =====
        document.getElementById('prResetBtn').addEventListener('click', () => {
            if (confirm('重置本轮所有记录？（不会删除已结算的历史）')) {
                this.records = [];
                this.bookRewards = [];
                this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
                this.pendingSettle = null;
                this.saveData();
                this.render();
            }
        });

        // ===== 书铁添加 =====
        document.getElementById('prAddBookBtn').addEventListener('click', () => {
            const name = document.getElementById('prBookName').value.trim() || '未知书铁';
            const val = parseFloat(document.getElementById('prBookValue').value) || 0;
            if (val <= 0) { alert('请输入有效的书铁价值！'); return; }
            this.bookRewards.push({ name, value: val });
            document.getElementById('prBookName').value = '';
            document.getElementById('prBookValue').value = '';
            this.saveData();
            this.render();
        });

        // ===== 奖励删除（事件委托） =====
        document.getElementById('petRingContainer').addEventListener('click', (e) => {
            const delBtn = e.target.closest('.reward-del-btn');
            if (delBtn) {
                const type = delBtn.dataset.type;
                const idx = parseInt(delBtn.dataset.idx);
                if (!isNaN(idx)) {
                    this.removeRewardItem(type, idx);
                }
            }
        });

        // ===== 奖励按钮 =====
        document.getElementById('prAdd200PointsBtn').addEventListener('click', () => {
            this.extraRewards.points += 200;
            this.saveData();
            this.render();
        });
        document.getElementById('prAddFruitBtn').addEventListener('click', () => {
            this.extraRewards.fruits += 1;
            this.saveData();
            this.render();
        });
        document.getElementById('prAddFurnitureBtn').addEventListener('click', () => {
            this.extraRewards.furnitures += 1;
            this.saveData();
            this.render();
        });

        // ===== 单价变化 =====
        document.getElementById('prFruitPrice').addEventListener('change', () => this.render());
        document.getElementById('prFurniturePrice').addEventListener('change', () => this.render());

        // ===== 价格输入变化 =====
        document.getElementById('petRingContainer').addEventListener('change', (e) => {
            const input = e.target.closest('#prPriceInputs input');
            if (input) {
                const key = input.dataset.key;
                let val = parseFloat(input.value);
                if (isNaN(val) || val < 0) val = 0;
                this.prices[key] = val;
                this.saveData();
                this.render();
            }
        });

        // ===== 扣分设置变化 =====
        document.getElementById('petRingContainer').addEventListener('change', (e) => {
            const input = e.target.closest('#prDeductSettings input');
            if (input) {
                const key = input.dataset.key;
                const type = input.dataset.type;
                let val = parseFloat(input.value);
                if (isNaN(val) || val < 0) val = 0;
                if (!this.deductSettings[key]) this.deductSettings[key] = { deduct: 0, cost: 0 };
                if (type === 'deduct') this.deductSettings[key].deduct = val;
                else this.deductSettings[key].cost = val;
                this.saveData();
                this.render();
            }
        });

        // ===== 数据分析 =====
        let analysisVisible = false;
        document.getElementById('prAnalysisToggleBtn').addEventListener('click', function() {
            analysisVisible = !analysisVisible;
            document.getElementById('prAnalysisPanel').style.display = analysisVisible ? 'block' : 'none';
            this.textContent = analysisVisible ? '📊 隐藏分析' : '📊 数据分析';
            this.classList.toggle('active', analysisVisible);
            if (analysisVisible) {
                const data = PetRingModule.getFilteredData();
                PetRingModule.updateAnalysis(data);
            }
        });

        // ===== 筛选 =====
        document.getElementById('prApplyFilterBtn').addEventListener('click', () => {
            this.filterState.dateFrom = document.getElementById('prFilterDateFrom').value || '';
            this.filterState.dateTo = document.getElementById('prFilterDateTo').value || '';
            this.filterState.ringsMin = document.getElementById('prFilterRingsMin').value || '';
            this.filterState.ringsMax = document.getElementById('prFilterRingsMax').value || '';
            this.filterState.profitType = document.getElementById('prFilterProfitType').value || 'all';
            this.render();
            if (document.getElementById('prAnalysisPanel').style.display !== 'none') {
                this.updateAnalysis(this.getFilteredData());
            }
        });
        document.getElementById('prResetFilterBtn').addEventListener('click', () => {
            document.getElementById('prFilterDateFrom').value = '';
            document.getElementById('prFilterDateTo').value = '';
            document.getElementById('prFilterRingsMin').value = '';
            document.getElementById('prFilterRingsMax').value = '';
            document.getElementById('prFilterProfitType').value = 'all';
            this.filterState = { dateFrom: '', dateTo: '', ringsMin: '', ringsMax: '', profitType: 'all' };
            this.render();
            if (document.getElementById('prAnalysisPanel').style.display !== 'none') {
                this.updateAnalysis(this.getFilteredData());
            }
        });

        // ===== 导入 =====
        document.getElementById('prImportBtn').addEventListener('click', () => {
            document.getElementById('prImpDate').value = new Date().toLocaleString();
            document.getElementById('prImpBookValue').value = '';
            document.getElementById('prImpBookList').textContent = '无';
            document.getElementById('prImpRewardSummary').textContent = '📊 当前奖励合计: 书铁0万 + 修炼果0万 + 家具0万 = 0万';
            document.getElementById('prImportModal').classList.add('show');
        });
        document.getElementById('prImportCancel').addEventListener('click', () => {
            document.getElementById('prImportModal').classList.remove('show');
        });
        document.getElementById('prImportConfirm').addEventListener('click', () => this.importData());
        document.getElementById('prImportSimpleBtn').addEventListener('click', () => {
            this.importData();
        });

        // ===== 导入弹窗奖励按钮 =====
        document.getElementById('prImpAddBookBtn').addEventListener('click', () => {
            const val = parseFloat(document.getElementById('prImpBookValue').value) || 0;
            if (val <= 0) { alert('请输入有效的书铁价值！'); return; }
            const list = document.getElementById('prImpBookList');
            const current = list.textContent === '无' ? [] : list.textContent.split(', ').filter(s => s);
            current.push(`书铁${val}万`);
            list.textContent = current.join(', ');
            document.getElementById('prImpBookValue').value = '';
            this.updateImpRewardSummary();
        });
        document.getElementById('prImpAdd200Btn').addEventListener('click', () => {
            const list = document.getElementById('prImpBookList');
            const current = list.textContent === '无' ? [] : list.textContent.split(', ').filter(s => s);
            current.push('200修炼点');
            list.textContent = current.join(', ');
            this.updateImpRewardSummary();
        });
        document.getElementById('prImpAddFruitBtn').addEventListener('click', () => {
            const list = document.getElementById('prImpBookList');
            const current = list.textContent === '无' ? [] : list.textContent.split(', ').filter(s => s);
            current.push('修炼果×1');
            list.textContent = current.join(', ');
            this.updateImpRewardSummary();
        });
        document.getElementById('prImpAddFurnitureBtn').addEventListener('click', () => {
            const list = document.getElementById('prImpBookList');
            const current = list.textContent === '无' ? [] : list.textContent.split(', ').filter(s => s);
            current.push('家具×1');
            list.textContent = current.join(', ');
            this.updateImpRewardSummary();
        });

        // ===== 弹窗 =====
        document.getElementById('settleModalCancel').addEventListener('click', () => {
            document.getElementById('settleModal').classList.remove('show');
        });
        document.getElementById('settleModalConfirm').addEventListener('click', () => {
            document.getElementById('settleModal').classList.remove('show');
        });
        document.getElementById('settleModal').addEventListener('click', (e) => {
            if (e.target === this) this.classList.remove('show');
        });

        // ===== 历史表格删除 =====
        document.getElementById('petRingContainer').addEventListener('click', (e) => {
            const delBtn = e.target.closest('.del-btn');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                if (!isNaN(idx) && idx >= 0 && idx < this.history.length) {
                    if (confirm('确定要删除这条记录吗？')) {
                        this.history.splice(idx, 1);
                        this.saveData();
                        this.updateStats();
                        this.updateHistory();
                        this.updateAdvice();
                        this.updateBookList();
                        this.updateHistoryTable();
                    }
                }
                return;
            }
            const detailBtn = e.target.closest('.detail-toggle');
            if (detailBtn) {
                const idx = parseInt(detailBtn.dataset.idx);
                const detail = document.querySelector(`.detail-row[data-idx="${idx}"]`);
                if (detail) {
                    detail.classList.toggle('show');
                    detailBtn.textContent = detail.classList.contains('show') ? '📊✕' : '📊';
                }
            }
        });
    },

    // ========== 核心业务 ==========
    addRecord(key) {
        if (this.pendingSettle) {
            alert('本轮已满100环，请先确认结算再继续！');
            return;
        }
        const price = this.prices[key] || 0;
        const type = this.ITEM_TYPES.find(t => t.key === key);
        const score = type ? type.score : 0;
        const idx = this.records.length;
        this.records.push({ typeKey: key, cost: price, score, ringPoints: this.getRingPoints(idx), isDeduct: false });
        this.render();
    },

    addDeduct(key) {
        if (this.pendingSettle) {
            alert('本轮已满100环，请先确认结算再继续！');
            return;
        }
        const s = this.deductSettings[key];
        if (!s) return;
        const type = this.DEDUCT_TYPES.find(d => d.key === key);
        const idx = this.records.length;
        this.records.push({
            typeKey: key,
            cost: s.cost || 0,
            score: -(s.deduct || 0),
            ringPoints: this.getRingPoints(idx),
            isDeduct: true,
            label: type ? type.label : key
        });
        this.render();
    },

    undoRecord() {
        if (this.records.length > 0) {
            this.records.pop();
            if (this.pendingSettle) {
                this.pendingSettle = null;
            }
            this.render();
        } else {
            alert('没有可撤销的记录！');
        }
    },

    // ========== 更新书铁列表 ==========
    updateBookList() {
        const display = document.getElementById('prBookListDisplay');
        if (!display) return;

        const allItems = [];

        this.bookRewards.forEach((b, idx) => {
            allItems.push({ type: 'book', label: `${b.name}(${b.value}万)`, idx: idx, dataType: 'book' });
        });

        if (this.extraRewards.points > 0) {
            const count = Math.floor(this.extraRewards.points / 200);
            for (let i = 0; i < count; i++) {
                allItems.push({ type: 'points', label: `200修炼点`, idx: i, dataType: 'points' });
            }
        }

        if (this.extraRewards.fruits > 0) {
            for (let i = 0; i < this.extraRewards.fruits; i++) {
                allItems.push({ type: 'fruit', label: `修炼果×1`, idx: i, dataType: 'fruit' });
            }
        }

        if (this.extraRewards.furnitures > 0) {
            for (let i = 0; i < this.extraRewards.furnitures; i++) {
                allItems.push({ type: 'furniture', label: `家具图册×1`, idx: i, dataType: 'furniture' });
            }
        }

        if (allItems.length === 0) {
            display.textContent = '无';
            return;
        }

        let html = '';
        allItems.forEach((item) => {
            const colorMap = {
                book: '#d4edda',
                points: '#fff3cd',
                fruit: '#cce5ff',
                furniture: '#d6d8db'
            };
            const bgColor = colorMap[item.type] || '#eef4fa';
            html += `<span style="display:inline-block;background:${bgColor};padding:2px 8px;border-radius:16px;margin:2px 4px 2px 0;font-size:0.7rem;border:1px solid #d0dce8;">
                ${item.label}
                <button class="reward-del-btn" data-type="${item.dataType}" data-idx="${item.idx}" style="background:#f5d0d0;border:none;border-radius:50%;width:16px;height:16px;font-size:0.6rem;cursor:pointer;color:#8f3a3a;font-weight:700;line-height:16px;text-align:center;padding:0;margin-left:4px;">✕</button>
            </span>`;
        });
        display.innerHTML = html;
    },

    // ========== 更新渲染 ==========
    updateStats() {
        const stats = this.calcStats();
        const income = this.calcIncome(stats);
        const rmb = income.profit * this.exchangeRate;

        document.getElementById('prTotalCost').textContent = stats.totalCost.toFixed(1);
        document.getElementById('prTotalScore').textContent = stats.totalScore;
        document.getElementById('prRingCount').innerHTML = `${stats.ringCount} <span class="remaining">/${stats.remaining}剩</span>`;
        document.getElementById('prAvgCost').textContent = stats.avgCost.toFixed(1);
        document.getElementById('prTotalPoints').textContent = stats.totalPoints;
        document.getElementById('prProfitDisplay').textContent = income.profit.toFixed(1) + ` (≈${rmb.toFixed(2)}元)`;
        document.getElementById('prProfitDisplay2').textContent = income.profit.toFixed(1);
        document.getElementById('prTotalIncomeDisplay').textContent = income.totalIncome.toFixed(1);
        document.getElementById('prRingInfo').textContent = `共${stats.ringCount}环`;

        const ps = document.getElementById('prProfitStat');
        ps.className = 'stat-item' + (income.profit > 0 ? ' profit' : income.profit < 0 ? ' loss' : '');
        const pb = document.getElementById('prProfitBox');
        pb.className = 'income-item' + (income.profit > 0 ? ' profit-box' : income.profit < 0 ? ' loss-box' : '');

        document.querySelectorAll('#prTaskGrid .task-item-wrapper').forEach(w => {
            const key = w.dataset.key;
            const ce = w.querySelector('.task-count');
            if (ce && stats.typeCount[key] !== undefined) {
                ce.textContent = stats.typeCount[key] > 0 ? stats.typeCount[key] : '';
            }
        });

        this.buildTaskButtons();
        this.buildDeductSettings();
        this.buildPriceInputs();
    },

    buildTaskButtons() {
        const grid = document.getElementById('prTaskGrid');
        if (!grid || grid.children.length > 0) return;

        let html = '';
        const allTasks = [...this.ITEM_TYPES, ...this.DEDUCT_TYPES.map(d => ({
            key: d.key,
            label: d.label,
            score: -(this.deductSettings[d.key]?.deduct || d.defaultDeduct),
            isDeduct: true
        }))];

        allTasks.forEach(t => {
            const isDeduct = t.isDeduct || false;
            const sc = isDeduct ? t.score : (this.ITEM_TYPES.find(it => it.key === t.key)?.score || 0);
            const color = isDeduct ? '#8f3a3a' : (this.ITEM_TYPES.find(it => it.key === t.key)?.color || '#1f3b53');
            html += `<div class="task-item-wrapper" data-key="${t.key}">
                <button class="${isDeduct ? 'task-btn deduct' : 'task-btn'}" data-key="${t.key}" style="border-color:${color};background:${isDeduct ? '#c0392b' : '#4CAF50'};color:#ffffff;border-radius:30px;padding:8px 2px;font-size:0.85rem;font-weight:700;cursor:pointer;text-align:center;width:100%;display:flex;flex-direction:column;align-items:center;line-height:1.2;border:1px solid ${color};">
                    <span style="color:#ffffff;">${t.label}</span>
                    <span class="sub" style="color:${isDeduct ? '#ffcccc' : '#e0e0e0'};font-weight:600;font-size:0.6rem;">${isDeduct ? `${sc}分` : `+${sc}分`}</span>
                </button>
                <span class="task-count"></span>
            </div>`;
        });
        grid.innerHTML = html;
    },

    buildDeductSettings() {
        const container = document.getElementById('prDeductSettings');
        if (!container || container.children.length > 0) return;

        let html = '';
        this.DEDUCT_TYPES.forEach(d => {
            const s = this.deductSettings[d.key] || { deduct: d.defaultDeduct, cost: d.defaultCost };
            html += `<div class="ds-item">
                <label>${d.label}</label>
                <input type="number" step="0.5" min="0" value="${s.deduct}" data-key="${d.key}" data-type="deduct"><span class="unit">分</span>
                <input type="number" step="0.1" min="0" value="${s.cost}" data-key="${d.key}" data-type="cost"><span class="unit">万</span>
            </div>`;
        });
        container.innerHTML = html;
    },

    buildPriceInputs() {
        const container = document.getElementById('prPriceInputs');
        if (!container || container.children.length > 0) return;

        let html = '';
        this.ITEM_TYPES.forEach(t => {
            const v = this.prices[t.key] ?? t.defaultPrice;
            html += `<div class="price-item"><label style="color:${t.color};">${t.label}</label><input type="number" step="0.1" min="0" value="${v}" data-key="${t.key}"></div>`;
        });
        container.innerHTML = html;
    },

    updateHistory() {
        const list = document.getElementById('prHistoryList');
        if (this.records.length === 0) {
            list.innerHTML = '<div class="empty-history">暂无记录</div>';
            return;
        }

        let html = '';
        const records = this.records.slice(-30).reverse();
        for (let r of records) {
            const type = this.ITEM_TYPES.find(t => t.key === r.typeKey);
            const label = type ? type.label : (r.label || r.typeKey);
            const sc = r.score < 0 ? r.score : `+${r.score}`;
            html += `<div class="history-item">
                <div class="info">
                    <span style="background:${r.isDeduct?'#f5d0d0':'#dce6f0'};padding:0 10px;border-radius:40px;font-size:0.7rem;">${label}</span>
                    <span>💰${r.cost.toFixed(1)}</span>
                    <span>⭐${sc}</span>
                    <span>📈+${r.ringPoints}</span>
                </div>
            </div>`;
        }
        list.innerHTML = html;
    },

    updateHistoryTable() {
        const tbody = document.getElementById('prHistoryTableBody');
        const count = this.history.length;
        document.getElementById('prSettledCount').textContent = `已结算: ${count}轮`;

        if (count === 0) {
            tbody.innerHTML =
                '<tr><td colspan="10" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无已结算记录</td></tr>';
            return;
        }

        const data = this.getFilteredData();
        if (data.length === 0 && count > 0) {
            tbody.innerHTML =
                '<tr><td colspan="10" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">无匹配筛选条件的记录</td></tr>';
            return;
        }

        let html = '';
        const list = data.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = data.length - i;
            const pc = h.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const idx = this.history.indexOf(h);
            const rmb = h.profit * this.exchangeRate;

            const rewardParts = [];
            if (h.bookIncome && h.bookIncome > 0) rewardParts.push(`书铁${h.bookIncome.toFixed(1)}万`);
            if (h.furnitureIncome && h.furnitureIncome > 0) rewardParts.push(`家具${h.furnitureIncome.toFixed(1)}万`);
            const rewardStr = rewardParts.length > 0 ? rewardParts.join(' + ') : '-';

            let detailStr = '';
            if (h.typeCount) {
                const details = [];
                for (let key of this.ITEM_TYPES.map(t => t.key)) {
                    if (h.typeCount[key] > 0) {
                        const label = this.ITEM_TYPES.find(t => t.key === key)?.label || key;
                        details.push(`${label}:${h.typeCount[key]}`);
                    }
                }
                detailStr = details.join(' | ');
            }

            html += `<tr>
                <td style="font-weight:700;color:#1f3b53;background:#f5f8fc;">${row}</td>
                <td>${h.date || '未知'}</td>
                <td><strong>${h.ringCount}</strong></td>
                <td>${(h.totalCost || 0).toFixed(1)}</td>
                <td><strong>${h.totalScore || 0}</strong></td>
                <td class="${pc}">${(h.profit || 0).toFixed(1)} (≈${rmb.toFixed(2)}元)</td>
                <td><strong>${h.totalPoints || 0}</strong></td>
                <td>${(h.bookIncome || 0).toFixed(1)}</td>
                <td><button class="detail-toggle" data-idx="${idx}">📊</button></td>
                <td><button class="del-btn" data-idx="${idx}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button></td>
            </tr>
            <tr class="detail-row" data-idx="${idx}"><td colspan="10" style="padding:6px 12px;text-align:left;color:#4a6a8a;background:#f7faff;font-size:0.75rem;">${detailStr || '无详细任务数据'} | 奖励: ${rewardStr}</td></tr>`;
        }
        tbody.innerHTML = html;

        if (document.getElementById('prAnalysisPanel').style.display !== 'none') {
            this.updateAnalysis(data);
        }
    },

    updateAnalysis(data) {
        const count = data.length;
        if (count === 0) {
            ['prAnaTotalRuns', 'prAnaTotalCost', 'prAnaTotalIncome', 'prAnaTotalProfit', 'prAnaAvgProfit',
                'prAnaMaxProfit', 'prAnaMinProfit', 'prAnaAvgRings', 'prAnaTotalRings', 'prAnaWinCount',
                'prAnaLoseCount'
            ].forEach(id => document.getElementById(id).textContent = '0');
            document.getElementById('prAnaWinRate').textContent = '0%';
            document.getElementById('prAnaTotalProfitWrap').className = 'a-item';
            document.getElementById('prTaskStatsRow').innerHTML =
                '<div style="grid-column:1/-1;text-align:center;color:#6c87a0;font-size:0.7rem;padding:4px;">无数据</div>';
            return;
        }

        let totalCost = 0,
            totalIncome = 0,
            totalProfit = 0,
            totalRings = 0,
            totalScore = 0;
        let winCount = 0,
            loseCount = 0;
        let maxProfit = -Infinity,
            minProfit = Infinity;
        const taskTotals = {};
        this.ITEM_TYPES.forEach(t => taskTotals[t.key] = 0);

        for (let h of data) {
            totalCost += h.totalCost || 0;
            totalIncome += h.totalIncome || 0;
            totalProfit += h.profit || 0;
            totalRings += h.ringCount || 0;
            totalScore += h.totalScore || 0;
            if (h.profit > 0) winCount++;
            else if (h.profit < 0) loseCount++;
            if (h.profit > maxProfit) maxProfit = h.profit;
            if (h.profit < minProfit) minProfit = h.profit;
            if (h.typeCount) {
                for (let [key, val] of Object.entries(h.typeCount)) {
                    if (taskTotals[key] !== undefined) taskTotals[key] += val;
                }
            }
        }

        const avgProfit = totalProfit / count;
        const winRate = count > 0 ? (winCount / count * 100) : 0;
        const avgRings = totalRings / count;
        const totalRmb = totalProfit * this.exchangeRate;

        document.getElementById('prAnaTotalRuns').textContent = count;
        document.getElementById('prAnaTotalCost').textContent = totalCost.toFixed(1);
        document.getElementById('prAnaTotalIncome').textContent = totalIncome.toFixed(1);
        document.getElementById('prAnaTotalProfit').textContent = totalProfit.toFixed(1) + ` (≈${totalRmb.toFixed(2)}元)`;
        document.getElementById('prAnaTotalProfitWrap').className = 'a-item' + (totalProfit >= 0 ? ' a-profit' : ' a-loss');
        document.getElementById('prAnaAvgProfit').textContent = avgProfit.toFixed(1);
        document.getElementById('prAnaWinRate').textContent = winRate.toFixed(0) + '%';
        document.getElementById('prAnaMaxProfit').textContent = maxProfit !== -Infinity ? maxProfit.toFixed(1) : '0';
        document.getElementById('prAnaMinProfit').textContent = minProfit !== Infinity ? minProfit.toFixed(1) : '0';
        document.getElementById('prAnaAvgRings').textContent = avgRings.toFixed(1);
        document.getElementById('prAnaTotalRings').textContent = totalRings;
        document.getElementById('prAnaWinCount').textContent = winCount;
        document.getElementById('prAnaLoseCount').textContent = loseCount;

        let tsHtml = '';
        this.ITEM_TYPES.forEach(t => {
            const avg = count > 0 ? (taskTotals[t.key] / count).toFixed(1) : '0';
            tsHtml += `<div class="ts-item">
                <div class="ts-num" style="color:${t.color};">${taskTotals[t.key]||0}</div>
                <div class="ts-label">${t.label} (均${avg})</div>
            </div>`;
        });
        document.getElementById('prTaskStatsRow').innerHTML = tsHtml;
    },

    updateAdvice() {
        const stats = this.calcStats();
        const income = this.calcIncome(stats);
        const status = document.getElementById('prAdviceStatus');
        const pred = document.getElementById('prAdvicePrediction');
        const predText = document.getElementById('prAdvicePredictionText');
        const strat = document.getElementById('prAdviceStrategy');
        const stratText = document.getElementById('prAdviceStrategyText');
        const tag = document.getElementById('prAdviceTag');

        if (stats.ringCount === 0) {
            status.textContent = '点击下方任务按钮，开始记录本轮跑环数据。（初始成本10万）';
            pred.style.display = 'none';
            strat.style.display = 'none';
            tag.textContent = '等待开始';
            return;
        }

        status.textContent =
            `已完成 ${stats.ringCount} 环，剩余 ${stats.remaining} 环，总成本 ${stats.totalCost.toFixed(1)} 万，总积分 ${stats.totalScore}，平均每环 ${stats.avgCost.toFixed(1)} 万。`;

        const avgScore = stats.ringCount > 0 ? stats.totalScore / stats.ringCount : 0;
        const projected = Math.round(stats.totalScore + avgScore * (100 - stats.ringCount));
        let reward = '';
        if (projected >= 222) reward = '150级书铁或160级战魄 🏆';
        else if (projected >= 212) reward = '140级书铁 🌟';
        else if (projected >= 202) reward = '130级书铁 📈';
        else if (projected >= 192) reward = '120级书铁 📊';
        else if (projected >= 182) reward = '110级书铁 📉';
        else if (projected >= 172) reward = '100级书铁 📉';
        else reward = '80-90级书铁 ⚠️';

        pred.style.display = 'block';
        predText.innerHTML = `按当前节奏预估100环总积分约 <strong>${projected}</strong> 分，可获得 <strong>${reward}</strong>`;

        strat.style.display = 'block';
        let strategyMsg =
            `💰 ${stats.avgCost > 5 ? '⚠️ 成本偏高，建议"乞丐跑环"策略' : stats.avgCost > 2.5 ? '📊 成本中等，正常跑' : '✅ 成本较低，可冲击高分'}`;
        if (income.profit > 0) {
            strategyMsg += ` 💰 <span class="success">当前预估盈利 +${income.profit.toFixed(1)}万</span>`;
        } else if (income.profit < -50) {
            strategyMsg += ` 📉 <span class="warning">当前亏损 ${income.profit.toFixed(1)}万</span>`;
        }
        stratText.innerHTML = strategyMsg;

        if (projected >= 222) tag.textContent = '🏆 冲150级';
        else if (projected >= 202) tag.textContent = '📈 高价值目标';
        else if (projected >= 180) tag.textContent = '📊 稳健收益';
        else tag.textContent = '📉 低成本模式';
    },

    // ========== 导入 ==========
    importData() {
        const date = document.getElementById('prImpDate').value || new Date().toLocaleString();
        const ringCount = parseInt(document.getElementById('prImpRings').value) || 100;
        const totalCost = parseFloat(document.getElementById('prImpCost').value) || 0;
        const profit = parseFloat(document.getElementById('prImpProfit').value) || 0;
        const rewards = document.getElementById('prImpRewards').value || '';

        const typeCount = {};
        this.ITEM_TYPES.forEach(t => typeCount[t.key] = 0);

        const impMap = {
            find: document.getElementById('prImpFind'),
            ring60: document.getElementById('prImpRing60'),
            ring70: document.getElementById('prImpRing70'),
            ring80: document.getElementById('prImpRing80'),
            flower: document.getElementById('prImpFlower'),
            cook: document.getElementById('prImpCook'),
            furn1: document.getElementById('prImpFurn1'),
            furn2: document.getElementById('prImpFurn2'),
            var_common: document.getElementById('prImpVarCommon'),
            var_spec: document.getElementById('prImpVarSpec')
        };

        let hasTaskData = false;
        for (let [key, el] of Object.entries(impMap)) {
            const val = parseInt(el?.value) || 0;
            typeCount[key] = val;
            if (val > 0) hasTaskData = true;
        }

        if (!hasTaskData) {
            const keys = Object.keys(impMap);
            const baseCount = Math.floor(ringCount / keys.length);
            for (let key of keys) typeCount[key] = baseCount;
            let remaining = ringCount - baseCount * keys.length;
            for (let i = 0; i < remaining && i < keys.length; i++) {
                typeCount[keys[i]]++;
            }
        }

        let totalScore = 0;
        for (let [key, count] of Object.entries(typeCount)) {
            const type = this.ITEM_TYPES.find(t => t.key === key);
            if (type) totalScore += type.score * count;
        }

        const totalPoints = ringCount * 10;
        const fp = parseFloat(document.getElementById('prFruitPrice').value) || 80;
        const fruitIncome = totalPoints / 170 * fp;
        const totalIncome = fruitIncome + profit + totalCost;

        const entry = {
            date,
            ringCount,
            totalCost,
            totalScore,
            totalPoints,
            totalIncome,
            profit: profit + fruitIncome,
            bookIncome: 0,
            furnitureIncome: 0,
            fruitIncome,
            isComplete: true,
            typeCount,
            rewards: rewards || `修炼果${fruitIncome.toFixed(1)}万`
        };

        this.history.push(entry);
        this.saveData();
        this.render();
        document.getElementById('prImportModal').classList.remove('show');
        alert('✅ 数据导入成功！');
    },

    updateImpRewardSummary() {
        const listText = document.getElementById('prImpBookList').textContent;
        const items = listText === '无' ? [] : listText.split(', ').filter(s => s);

        let bookTotal = 0;
        let fruitTotal = 0;
        let furnitureTotal = 0;

        for (let item of items) {
            if (item.includes('书铁')) {
                const val = parseFloat(item.replace('书铁', '').replace('万', ''));
                if (!isNaN(val)) bookTotal += val;
            } else if (item.includes('修炼果')) {
                const fp = parseFloat(document.getElementById('prFruitPrice').value) || 80;
                fruitTotal += fp;
            } else if (item.includes('家具')) {
                const fup = parseFloat(document.getElementById('prFurniturePrice').value) || 3.5;
                furnitureTotal += fup;
            } else if (item.includes('200修炼点')) {
                const fp = parseFloat(document.getElementById('prFruitPrice').value) || 80;
                fruitTotal += 200 / 170 * fp;
            }
        }

        const total = bookTotal + fruitTotal + furnitureTotal;
        document.getElementById('prImpRewardSummary').textContent =
            `📊 当前奖励合计: 书铁${bookTotal.toFixed(1)}万 + 修炼果${fruitTotal.toFixed(1)}万 + 家具${furnitureTotal.toFixed(1)}万 = ${total.toFixed(1)}万`;
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PetRingModule.init());
} else {
    PetRingModule.init();
}
