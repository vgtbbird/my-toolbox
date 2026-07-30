// 精简测试版 - 验证UI能否显示
const TreePlantModule = {
    id: 'treePlant',
    storageKey: 'treePlant',
    history: [],
    prices: {},
    current: { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {} },
    uiSettings: { bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14 },

    LOOT_TYPES: [
        { key: 'eryao', label: '二药', defaultPrice: 1.5 },
    ],

    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
    },

    render() {
        console.log('🌳 种树模块渲染');
        this.updateStats();
        this.updateCurrent();
        this.updateHistory();
        this.updateAnalysis();
        this.saveData();
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.current = data.current || { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {} };
        this.uiSettings = data.uiSettings || { bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14 };
        this.LOOT_TYPES.forEach(t => {
            if (this.current.loot[t.key] === undefined) this.current.loot[t.key] = 0;
            if (this.prices[t.key] === undefined) this.prices[t.key] = t.defaultPrice;
        });
        console.log('📊 种树加载数据: history', this.history.length, '条');
    },

    saveData() {
        Storage.set(this.storageKey, { history: this.history, prices: this.prices, current: this.current, uiSettings: this.uiSettings });
    },

    calcStats() {
        let totalCost = 0, totalIncome = 0, totalProfit = 0, winCount = 0;
        for (let h of this.history) { totalCost += h.cost || 0; totalIncome += h.income || 0; totalProfit += h.profit || 0; if (h.profit > 0) winCount++; }
        const count = this.history.length;
        return { totalCost, totalIncome, totalProfit, count, avgProfit: count > 0 ? totalProfit / count : 0, winRate: count > 0 ? (winCount / count * 100) : 0 };
    },

    calcCurrentIncome() {
        let total = 0; const details = [];
        for (let [key, count] of Object.entries(this.current.loot)) {
            if (count > 0) { const price = this.prices[key] || 0; const val = count * price; total += val; const label = this.LOOT_TYPES.find(t => t.key === key)?.label || key; details.push(`${label}×${count}=${val.toFixed(1)}万`); }
        }
        return { total, details };
    },

    buildUI() {
        const container = document.getElementById('treePlantContainer');
        if (!container) return;
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="trTotalCost">0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalIncome">0</div><div class="label">📊 总收入(万)</div></div>
                <div class="stat-item" id="trProfitStat"><div class="num" id="trTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalCount">0</div><div class="label">🌳 种植棵数</div></div>
                <div class="stat-item"><div class="num" id="trAvgProfit">0</div><div class="label">📊 平均利润/棵</div></div>
                <div class="stat-item" id="trRateStat"><div class="num" id="trWinRate">0%</div><div class="label">🏆 盈利率</div></div>
            </div>
            <div class="module">
                <div class="module-header"><div class="title">🌳 测试模块 <span class="hint">— 如果看到这个说明UI正常</span></div></div>
                <div class="module-body"><p style="padding:10px;color:#1f3b53;">✅ 种树UI构建成功！</p></div>
            </div>
        `;
        console.log('✅ 种树UI构建完成');
    },

    bindEvents() {},
    applyUISettings() {},
    updateStats() {
        document.getElementById('trTotalCost').textContent = '0';
        document.getElementById('trTotalIncome').textContent = '0';
        document.getElementById('trTotalProfit').textContent = '0';
        document.getElementById('trTotalCount').textContent = '0';
        document.getElementById('trAvgProfit').textContent = '0';
        document.getElementById('trWinRate').textContent = '0%';
    },
    updateCurrent() {},
    updateHistory() {
        const tbody = document.getElementById('trHistoryBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="padding:30px 0;text-align:center;">测试数据</td></tr>';
    },
    updateAnalysis() {}
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TreePlantModule.init());
} else {
    TreePlantModule.init();
}
