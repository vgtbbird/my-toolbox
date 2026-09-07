// ============================================================
//  📊 总收益统计模块 - 汇总所有模块数据
//  功能：统计跑宠环、种树、抓宠、跑玉魄等所有模块的收益
// ============================================================
const TotalStatsModule = {  // ← ✅ 修改1：把 SoulTaskModule 改成 TotalStatsModule
    id: 'totalStats',
    storageKey: 'totalStats',

    uiSettings: {
        bgColor: '#eef2f7',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

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
        this.uiSettings = data.uiSettings || { bgColor: '#eef2f7', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14 };
    },

    saveData() {
        Storage.set(this.storageKey, { uiSettings: this.uiSettings });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('totalStatsContainer');
        if (!container) return;
        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        container.querySelectorAll('.module, .stats-grid .stat-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .total-stats-item').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

    // ============================================================
    //  获取所有模块数据
    // ============================================================
    getAllModulesData() {
        const modules = {};

        // 跑宠环
        const petRingData = Storage.get('petRing', {});
        const petRingHistory = petRingData.history || [];
        modules.petRing = {
            label: '🏃 跑宠环',
            count: petRingHistory.length,
            totalCost: petRingHistory.reduce((s, h) => s + (h.totalCost || 0), 0),
            totalProfit: petRingHistory.reduce((s, h) => s + (h.profit || 0), 0),
            totalIncome: petRingHistory.reduce((s, h) => s + (h.totalIncome || 0), 0),
            history: petRingHistory
        };

        // 种树
        const treeData = Storage.get('treePlant', {});
        const treeHistory = treeData.history || [];
        modules.treePlant = {
            label: '🌳 种树',
            count: treeHistory.length,
            totalCost: treeHistory.reduce((s, h) => s + (h.cost || 0), 0),
            totalProfit: treeHistory.reduce((s, h) => s + (h.profit || 0), 0),
            totalIncome: treeHistory.reduce((s, h) => s + (h.income || 0), 0),
            history: treeHistory
        };

        // 抓宠
        const petHuntData = Storage.get('petHunt', {});
        const petHuntRecords = petHuntData.records || [];
        let petHuntProfit = 0;
        let petHuntCost = 0;
        let petHuntIncome = 0;
        for (let r of petHuntRecords) {
            if (r.sold && r.price) {
                petHuntIncome += r.price;
                petHuntCost += r.cost || 0;
                petHuntProfit += (r.price - (r.cost || 0));
            }
        }
        modules.petHunt = {
            label: '🐾 抓宠',
            count: petHuntRecords.filter(r => r.sold).length,
            totalCost: petHuntCost,
            totalProfit: petHuntProfit,
            totalIncome: petHuntIncome,
            history: petHuntRecords.filter(r => r.sold)
        };

        // 跑玉魄
        const soulData = Storage.get('soulTask', {});
        const soulHistory = soulData.history || [];
        modules.soulTask = {
            label: '✨ 跑玉魄',
            count: soulHistory.length,
            totalCost: soulHistory.reduce((s, h) => s + parseFloat(h.payload?.totalCost || 0), 0),
            totalProfit: soulHistory.reduce((s, h) => s + parseFloat(h.payload?.profit || 0), 0),
            totalIncome: soulHistory.reduce((s, h) => s + parseFloat(h.payload?.totalIncome || 0), 0),
            history: soulHistory
        };

        // 炼妖
        const alchemyData = Storage.get('alchemy', {});
        const alchemyRecords = alchemyData.records || [];
        modules.alchemy = {
            label: '🧬 炼妖',
            count: alchemyRecords.length,
            totalCost: alchemyRecords.reduce((s, r) => s + (r.cost || 0), 0),
            totalProfit: alchemyRecords.reduce((s, r) => s + (r.profit || 0), 0),
            totalIncome: alchemyRecords.reduce((s, r) => s + (r.income || 0), 0),
            history: alchemyRecords
        };

        // 挖图
        const digData = Storage.get('digTreasure', {});
        const digRecords = digData.records || [];
        modules.digTreasure = {
            label: '⛏️ 挖图',
            count: digRecords.length,
            totalCost: digRecords.reduce((s, r) => s + (r.totalCost || 0), 0),
            totalProfit: digRecords.reduce((s, r) => s + (r.profit || 0), 0),
            totalIncome: digRecords.reduce((s, r) => s + (r.totalIncome || 0), 0),
            history: digRecords
        };

        return modules;
    },

    // ============================================================
    //  构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('totalStatsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="tsToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="tsUISettingsBody">
                    <div style="display:flex;gap:10px;flex-wrap:wrap;padding:6px 0;">
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">🎨 背景色 <input type="color" id="tsBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:30px;border-radius:4px;border:1px solid #ddd;cursor:pointer;"></label>
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">📦 卡片色 <input type="color" id="tsCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:30px;border-radius:4px;border:1px solid #ddd;cursor:pointer;"></label>
                        <label style="font-size:0.75rem;font-weight:600;color:#1f3b53;">🔤 字体 <input type="number" id="tsFontSize" value="${this.uiSettings.fontSize}" min="12" max="20" style="width:50px;padding:2px 4px;border-radius:4px;border:1px solid #ddd;text-align:center;"></label>
                    </div>
                </div>
            </div>

            <div class="stats-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
                <div class="stat-item"><div class="num" id="tsTotalCost">0</div><div class="label">💰 总成本</div></div>
                <div class="stat-item"><div class="num" id="tsTotalIncome">0</div><div class="label">📊 总收入</div></div>
                <div class="stat-item" id="tsProfitBox"><div class="num" id="tsTotalProfit">0</div><div class="label">📈 总利润</div></div>
                <div class="stat-item"><div class="num" id="tsTotalCount">0</div><div class="label">📌 总记录数</div></div>
            </div>

            <div id="tsModulesGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;"></div>
        `;
    },

    // ============================================================
    //  绑定事件
    // ============================================================
    bindEvents() {
        document.getElementById('tsBgColor').addEventListener('input', function() {
            TotalStatsModule.uiSettings.bgColor = this.value;
            TotalStatsModule.applyUISettings();
            TotalStatsModule.saveData();
        });
        document.getElementById('tsCardColor').addEventListener('input', function() {
            TotalStatsModule.uiSettings.cardBgColor = this.value;
            TotalStatsModule.applyUISettings();
            TotalStatsModule.saveData();
        });
        document.getElementById('tsFontSize').addEventListener('change', function() {
            TotalStatsModule.uiSettings.fontSize = parseInt(this.value) || 14;
            TotalStatsModule.applyUISettings();
            TotalStatsModule.saveData();
        });
        document.getElementById('tsToggleUISettings').addEventListener('click', function() {
            const body = document.getElementById('tsUISettingsBody');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                this.textContent = '👁️ 隐藏';
            } else {
                body.style.display = 'none';
                this.textContent = '👁️ 显示';
            }
        });
    },

    // ============================================================
    //  渲染
    // ============================================================
    render() {
        this.updateStats();
        setTimeout(() => this.applyUISettings(), 100);
    },

    updateStats() {
        const modules = this.getAllModulesData();
        const grid = document.getElementById('tsModulesGrid');
        if (!grid) return;

        let totalCost = 0, totalIncome = 0, totalProfit = 0, totalCount = 0;
        let html = '';

        for (let [key, mod] of Object.entries(modules)) {
            totalCost += mod.totalCost;
            totalIncome += mod.totalIncome;
            totalProfit += mod.totalProfit;
            totalCount += mod.count;

            const profitColor = mod.totalProfit >= 0 ? '#2d6b2d' : '#c0392b';
            const profitText = mod.totalProfit >= 0 ? `+${mod.totalProfit.toFixed(1)}` : mod.totalProfit.toFixed(1);

            html += `
                <div style="background:#f8faff;border-radius:16px;padding:14px 16px;border:1px solid #dce5ef;">
                    <div style="font-weight:700;font-size:1rem;color:#1f3b53;">${mod.label}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;margin-top:6px;font-size:0.8rem;">
                        <span style="color:#5a7a94;">📌 记录数</span>
                        <span style="font-weight:600;color:#1f3b53;">${mod.count}</span>
                        <span style="color:#5a7a94;">💰 总成本</span>
                        <span style="font-weight:600;color:#1f3b53;">${mod.totalCost.toFixed(1)}万</span>
                        <span style="color:#5a7a94;">📊 总收入</span>
                        <span style="font-weight:600;color:#1f3b53;">${mod.totalIncome.toFixed(1)}万</span>
                        <span style="color:#5a7a94;">📈 总利润</span>
                        <span style="font-weight:700;color:${profitColor};">${profitText}万</span>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html || '<div style="grid-column:1/-1;text-align:center;color:#6c87a0;padding:30px 0;">暂无数据</div>';

        // 更新顶部统计
        document.getElementById('tsTotalCost').textContent = totalCost.toFixed(1) + '万';
        document.getElementById('tsTotalIncome').textContent = totalIncome.toFixed(1) + '万';
        document.getElementById('tsTotalProfit').textContent = totalProfit.toFixed(1) + '万';
        document.getElementById('tsTotalCount').textContent = totalCount;

        const profitBox = document.getElementById('tsProfitBox');
        if (profitBox) {
            profitBox.className = 'stat-item ' + (totalProfit >= 0 ? 'profit' : 'loss');
        }
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TotalStatsModule.init());
} else {
    TotalStatsModule.init();
}

window.TotalStatsModule = TotalStatsModule;
