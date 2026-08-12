// ============================================================
//  ⛏️ 挖图统计模块 - 完整版 v1.0
// ============================================================
const DigTreasureModule = {
    id: 'digTreasure',

    storageKey: 'digTreasure',

    // ========== UI设置 ==========
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

    // ========== 数据 ==========
    records: [],
    currentType: 'normal', // normal | advanced | super
    todayRecords: {
        normal: { count: 0, items: [] },
        advanced: { count: 0, items: [] },
        super: { count: 0, items: [] }
    },
    tempItems: [], // 当前录入中的临时列表

    // ========== 价格与图标预设 ==========
    priceMap: {
        '金刚石': 18,
        '定魂珠': 18,
        '夜光珠': 12,
        '龙鳞': 8,
        '避水珠': 5,
        '兽决': 80,
        '宝石': 8,
        '精铁': 12,
        '制造书': 10,
        '环装': 5
    },
    iconMap: {
        '金刚石': '💎',
        '定魂珠': '🔮',
        '夜光珠': '🪙',
        '龙鳞': '🐉',
        '避水珠': '💧',
        '兽决': '📜',
        '宝石': '💠',
        '精铁': '🔧',
        '制造书': '📚',
        '环装': '🔴'
    },

    // ========== 宝图预设 ==========
    mapTypes: [
        { key: 'normal', label: '普通藏宝图', icon: '🗺️', defaultCost: 2.5 },
        { key: 'advanced', label: '高级藏宝图', icon: '🔥', defaultCost: 45 },
        { key: 'super', label: '超级藏宝图', icon: '💎', defaultCost: 200 }
    ],

    // ============================================================
    //  生命周期
    // ============================================================
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
        this.updateTempList();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.todayRecords = data.todayRecords || {
            normal: { count: 0, items: [] },
            advanced: { count: 0, items: [] },
            super: { count: 0, items: [] }
        };
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14
        };
        this.currentType = data.currentType || 'normal';
        this.tempItems = data.tempItems || [];
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            todayRecords: this.todayRecords,
            uiSettings: this.uiSettings,
            currentType: this.currentType,
            tempItems: this.tempItems
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('digTreasureContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');

        container.querySelectorAll('.module, .stats-grid .stat-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, input, select, button').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

    // ============================================================
    //  🏗️ 构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('digTreasureContainer');
        if (!container) return;

        const mapTabs = this.mapTypes.map(t => `
            <button class="dt-map-tab ${this.currentType === t.key ? 'active' : ''}" data-key="${t.key}" style="padding:6px 16px;border-radius:30px;border:2px solid ${this.currentType === t.key ? '#4CAF50' : '#d0dce8'};background:${this.currentType === t.key ? '#4CAF50' : '#f0f4f8'};color:${this.currentType === t.key ? '#fff' : '#1f3b53'};cursor:pointer;font-weight:600;font-size:0.8rem;margin:4px;">
                ${t.icon} ${t.label}
            </button>
        `).join('');

        const currentMap = this.mapTypes.find(m => m.key === this.currentType);
        const currentCost = currentMap ? currentMap.defaultCost : 2.5;

        container.innerHTML = `
            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="dtTodayTotal">0</div><div class="label">📅 今日总挖图</div></div>
                <div class="stat-item"><div class="num" id="dtTodayCost">0</div><div class="label">💰 今日总成本</div></div>
                <div class="stat-item"><div class="num" id="dtTodayIncome">0</div><div class="label">📊 今日总产出</div></div>
                <div class="stat-item" id="dtProfitStat"><div class="num" id="dtTodayProfit">0</div><div class="label">📈 今日利润</div></div>
            </div>

            <!-- 录入门户 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">⛏️ 记录今日挖图 <span class="hint">— 点击下方按钮快速录入</span></div>
                    <div>
                        <button class="btn-small" id="dtSaveDayBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">✅ 结算今日</button>
                        <button class="btn-small" id="dtResetDayBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">🔄 清空今日</button>
                    </div>
                </div>
                <div class="module-body">
                    <!-- 宝图类型切换 -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                        ${mapTabs}
                    </div>

                    <!-- 成本设置 -->
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:6px 12px;background:#f0f5fb;border-radius:12px;border:1px solid #dce5ef;">
                        <span style="font-weight:600;font-size:0.85rem;color:#1f3b53;">💰 单张成本 (万)</span>
                        <input type="number" id="dtCostInput" step="0.1" min="0" value="${currentCost}" style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        <span style="font-size:0.7rem;color:#5a7a94;">(可根据市场价调整)</span>
                    </div>

                    <!-- 挖图次数 -->
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <span style="font-weight:600;font-size:0.85rem;color:#1f3b53;">📌 本次挖掘次数</span>
                        <input type="number" id="dtCountInput" min="1" value="1" style="width:60px;padding:4px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        <button class="btn-complete" id="dtAddRecordBtn" style="padding:4px 16px;font-size:0.75rem;">➕ 记录本次</button>
                    </div>

                    <!-- 产出快捷按钮 -->
                    <div style="margin-top:8px;">
                        <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;margin-bottom:6px;">📦 点击添加产出</div>
                        <div id="dtPresetBtns" style="display:flex;flex-wrap:wrap;gap:4px;"></div>
                        <div style="display:flex;gap:6px;margin-top:6px;">
                            <input type="text" id="dtCustomItem" placeholder="自定义物品名" style="flex:1;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;">
                            <input type="number" id="dtCustomPrice" placeholder="价格(万)" style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;text-align:center;">
                            <button class="btn-small" id="dtAddCustomBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">➕ 添加</button>
                        </div>
                    </div>

                    <!-- 当前产出清单 -->
                    <div style="margin-top:10px;padding:8px 12px;background:#f8faff;border-radius:12px;border:1px solid #eef2f7;">
                        <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;">📋 本次产出清单</div>
                        <div id="dtTempList" style="min-height:30px;font-size:0.8rem;color:#5a7a94;">暂无产出，点击上方按钮添加</div>
                    </div>
                </div>
            </div>

            <!-- 历史记录 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📜 历史每日汇总</div>
                    <button class="toggle-btn" id="dtToggleHistory">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="dtHistoryBody">
                    <div class="table-wrap" style="max-height:300px;overflow-y:auto;">
                        <table>
                            <thead><tr><th>#</th><th>📅 日期</th><th>🗺️ 普通</th><th>🔥 高级</th><th>💎 超级</th><th>💰 总成本</th><th>📊 总产出</th><th>📈 利润</th><th>⚙️</th></tr></thead>
                            <tbody id="dtHistoryBodyTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.renderPresetButtons();
    },

    // ============================================================
    //  🎨 渲染预设按钮
    // ============================================================
    renderPresetButtons() {
        const container = document.getElementById('dtPresetBtns');
        if (!container) return;

        // 根据当前宝图类型，从预设里筛选
        let items = [];
        if (this.currentType === 'normal') {
            items = ['金刚石', '定魂珠', '夜光珠', '龙鳞', '避水珠', '兽决', '宝石', '精铁', '制造书', '环装'];
        } else if (this.currentType === 'advanced') {
            items = ['高级兽决', '高级内丹', '高级书', '高级铁', '高图装备', '高图金钱'];
        } else {
            items = ['超级兽决', '超级内丹', '神兽碎片', '极品书', '巨额金钱', '稀有道具'];
        }

        let html = '';
        for (let name of items) {
            const icon = this.iconMap[name] || '📦';
            html += `<button class="dt-preset-btn" data-name="${name}" style="padding:4px 12px;border-radius:20px;border:1px solid #bccad9;background:#eef4fa;cursor:pointer;font-size:0.7rem;font-weight:600;color:#1f3b53;">${icon} ${name}</button>`;
        }
        container.innerHTML = html;
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        document.querySelectorAll('.dt-map-tab').forEach(btn => {
            btn.addEventListener('click', function() {
                DigTreasureModule.currentType = this.dataset.key;
                DigTreasureModule.render();
                DigTreasureModule.renderPresetButtons();
                DigTreasureModule.updateCostInput();
            });
        });

        document.getElementById('dtAddRecordBtn').addEventListener('click', () => {
            this.addRecord();
        });

        document.getElementById('dtAddCustomBtn').addEventListener('click', () => {
            const name = document.getElementById('dtCustomItem').value.trim();
            const price = parseFloat(document.getElementById('dtCustomPrice').value) || 0;
            if (!name) { alert('请输入物品名称'); return; }
            if (price <= 0) { alert('请输入有效的价格'); return; }
            this.priceMap[name] = price;
            this.iconMap[name] = '📦';
            this.tempItems.push({ name, price });
            document.getElementById('dtCustomItem').value = '';
            document.getElementById('dtCustomPrice').value = '';
            this.render();
            this.updateTempList();
        });

        document.getElementById('dtSaveDayBtn').addEventListener('click', () => {
            this.saveDay();
        });

        document.getElementById('dtResetDayBtn').addEventListener('click', () => {
            if (confirm('确定要清空今日所有挖图记录吗？')) {
                this.todayRecords = { normal: { count: 0, items: [] }, advanced: { count: 0, items: [] }, super: { count: 0, items: [] } };
                this.tempItems = [];
                this.saveData();
                this.render();
            }
        });

        document.getElementById('dtToggleHistory')?.addEventListener('click', function() {
            const body = document.getElementById('dtHistoryBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // 快捷按钮点击事件
        document.getElementById('dtPresetBtns').addEventListener('click', function(e) {
            const btn = e.target.closest('.dt-preset-btn');
            if (btn) {
                const name = btn.dataset.name;
                const price = DigTreasureModule.priceMap[name] || 0;
                DigTreasureModule.tempItems.push({ name, price });
                DigTreasureModule.updateTempList();
                DigTreasureModule.updateStats();
            }
        });
    },

    updateCostInput() {
        const map = this.mapTypes.find(m => m.key === this.currentType);
        if (map) {
            document.getElementById('dtCostInput').value = map.defaultCost;
        }
    },

    // ============================================================
    //  📝 添加记录
    // ============================================================
    addRecord() {
        const count = parseInt(document.getElementById('dtCountInput').value) || 1;
        if (count <= 0) { alert('请输入有效的挖掘次数'); return; }

        const type = this.currentType;
        const costPer = parseFloat(document.getElementById('dtCostInput').value) || 2.5;
        const totalCost = count * costPer;

        // 写入今日统计
        this.todayRecords[type].count += count;
        for (let item of this.tempItems) {
            this.todayRecords[type].items.push(item);
        }
        this.tempItems = [];

        // 记录这条操作的明细（用于历史）
        const record = {
            date: new Date().toISOString().slice(0, 10),
            type: type,
            count: count,
            cost: totalCost,
            items: this.tempItems.map(i => ({ ...i }))
        };
        this.records.push(record);

        this.saveData();
        this.render();
        document.getElementById('dtCountInput').value = 1;
        alert(`✅ 已记录 ${type === 'normal' ? '普通' : type === 'advanced' ? '高级' : '超级'} 藏宝图 ${count} 张`);
    },

    // ============================================================
    //  🗓️ 结算今日
    // ============================================================
    saveDay() {
        const today = new Date().toISOString().slice(0, 10);
        const summary = {
            date: today,
            normal: { count: this.todayRecords.normal.count, items: this.todayRecords.normal.items },
            advanced: { count: this.todayRecords.advanced.count, items: this.todayRecords.advanced.items },
            super: { count: this.todayRecords.super.count, items: this.todayRecords.super.items }
        };
        // 计算成本和收入
        let totalCost = 0, totalIncome = 0;
        const mapCost = {
            normal: parseFloat(document.getElementById('dtCostInput').value) || 2.5,
            advanced: 45,
            super: 200
        };
        for (let type of ['normal', 'advanced', 'super']) {
            totalCost += summary[type].count * mapCost[type];
            for (let item of summary[type].items) {
                totalIncome += item.price || 0;
            }
        }
        summary.totalCost = totalCost;
        summary.totalIncome = totalIncome;
        summary.profit = totalIncome - totalCost;

        // 存为一条历史汇总记录
        // 这里为了简化，直接 push 到 records，实际可以独立存汇总表
        this.records.push(summary);
        this.todayRecords = { normal: { count: 0, items: [] }, advanced: { count: 0, items: [] }, super: { count: 0, items: [] } };
        this.saveData();
        this.render();
        alert('✅ 今日已结算并保存！');
    },

    // ============================================================
    //  📊 统计更新
    // ============================================================
    updateStats() {
        let totalCount = 0, totalCost = 0, totalIncome = 0;
        const mapCost = {
            normal: parseFloat(document.getElementById('dtCostInput')?.value) || 2.5,
            advanced: 45,
            super: 200
        };

        for (let type of ['normal', 'advanced', 'super']) {
            totalCount += this.todayRecords[type].count;
            totalCost += this.todayRecords[type].count * mapCost[type];
            for (let item of this.todayRecords[type].items) {
                totalIncome += item.price || 0;
            }
        }

        // 加上临时的
        for (let item of this.tempItems) {
            totalIncome += item.price || 0;
        }

        document.getElementById('dtTodayTotal').textContent = totalCount;
        document.getElementById('dtTodayCost').textContent = totalCost.toFixed(1);
        document.getElementById('dtTodayIncome').textContent = totalIncome.toFixed(1);
        const profit = totalIncome - totalCost;
        document.getElementById('dtTodayProfit').textContent = profit.toFixed(1);
        const ps = document.getElementById('dtProfitStat');
        ps.className = 'stat-item' + (profit > 0 ? ' profit' : profit < 0 ? ' loss' : '');
    },

    updateTempList() {
        const el = document.getElementById('dtTempList');
        if (!el) return;
        if (this.tempItems.length === 0) {
            el.innerHTML = '<span style="color:#5a7a94;">暂无产出，点击上方按钮添加</span>';
            return;
        }
        let html = '';
        let total = 0;
        for (let i = 0; i < this.tempItems.length; i++) {
            const item = this.tempItems[i];
            total += item.price || 0;
            const icon = this.iconMap[item.name] || '📦';
            html += `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #eef2f7;font-size:0.8rem;">
                <span>${icon} ${item.name}</span>
                <span>${item.price ? item.price.toFixed(1) + '万' : ''} <button class="dt-del-temp" data-idx="${i}" style="background:#f5d0d0;border:none;border-radius:50%;width:18px;height:18px;font-size:0.6rem;cursor:pointer;color:#8f3a3a;">✕</button></span>
            </div>`;
        }
        html += `<div style="font-weight:700;color:#1f3b53;padding-top:4px;">💰 小计: ${total.toFixed(1)}万</div>`;
        el.innerHTML = html;

        el.querySelectorAll('.dt-del-temp').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.idx);
                DigTreasureModule.tempItems.splice(idx, 1);
                DigTreasureModule.updateTempList();
                DigTreasureModule.updateStats();
            });
        });
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DigTreasureModule.init());
} else {
    DigTreasureModule.init();
}

window.DigTreasureModule = DigTreasureModule;
