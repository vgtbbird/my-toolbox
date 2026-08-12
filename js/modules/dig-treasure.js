// ============================================================
//  ⛏️ 挖图统计模块 - 完整优化版 v1.1
//  特性：动态产出库 | 一键记录 | 分图类型统计
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
        normal: { count: 0, cost: 0, items: [] },
        advanced: { count: 0, cost: 0, items: [] },
        super: { count: 0, cost: 0, items: [] }
    },
    tempItems: [], // 单次挖掘产出，暂未使用，保留为兼容

    // ========== 价格与图标预设 ==========
    // 用于渲染动态按钮库
    presetItems: [], 

    // ========== 宝图类型预设 ==========
    mapTypes: [
        { key: 'normal', label: '普通藏宝图', icon: '🗺️', defaultCost: 2.5 },
        { key: 'advanced', label: '高级藏宝图', icon: '🔥', defaultCost: 50 },
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
        this.updateTypeStatsLabels();
        this.renderPresetButtons();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.todayRecords = data.todayRecords || {
            normal: { count: 0, cost: 0, items: [] },
            advanced: { count: 0, cost: 0, items: [] },
            super: { count: 0, cost: 0, items: [] }
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
        
        // 核心：读取动态产出库
        this.presetItems = data.presetItems || [
            { name: '金刚石', price: 18, icon: '💎' },
            { name: '定魂珠', price: 18, icon: '🔮' },
            { name: '夜光珠', price: 12, icon: '🪙' },
            { name: '龙鳞', price: 8, icon: '🐉' },
            { name: '避水珠', price: 5, icon: '💧' },
            { name: '兽决', price: 80, icon: '📜' },
            { name: '宝石', price: 8, icon: '💠' },
            { name: '精铁', price: 12, icon: '🔧' },
            { name: '制造书', price: 10, icon: '📚' },
            { name: '环装', price: 5, icon: '🔴' },
            // 高级宝图预备
            { name: '高级兽决', price: 800, icon: '🔥' },
            { name: '高级内丹', price: 200, icon: '🧪' },
            { name: '高级书', price: 150, icon: '📚' },
            { name: '高级铁', price: 80, icon: '🔧' },
            { name: '高图金钱', price: 60, icon: '💰' },
            // 超级宝图预备
            { name: '超级兽决', price: 5000, icon: '⭐' },
            { name: '超级内丹', price: 1200, icon: '💠' },
            { name: '神兽碎片', price: 800, icon: '🐉' },
            { name: '极品书', price: 300, icon: '📜' },
            { name: '巨额金钱', price: 200, icon: '💰' }
        ];
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            todayRecords: this.todayRecords,
            uiSettings: this.uiSettings,
            currentType: this.currentType,
            tempItems: this.tempItems,
            presetItems: this.presetItems
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
            <button class="dt-map-tab ${this.currentType === t.key ? 'active' : ''}" data-key="${t.key}" style="padding:6px 16px;border-radius:30px;border:2px solid ${this.currentType === t.key ? '#4CAF50' : '#d0dce8'};background:${this.currentType === t.key ? '#4CAF50' : '#f0f4f8'};color:${this.currentType === t.key ? '#fff' : '#1f3b53'};cursor:pointer;font-weight:600;font-size:0.8rem;margin:4px;transition:0.15s;">
                ${t.icon} ${t.label}
            </button>
        `).join('');

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
                    <div class="title">📝 记录今日挖图 <span class="hint">— 点击下方宝图类型，再点产出直接记录</span></div>
                    <div>
                        <button class="btn-small" id="dtSaveDayBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">✅ 结算今日</button>
                        <button class="btn-small" id="dtResetDayBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">🔄 清空今日</button>
                    </div>
                </div>
                <div class="module-body">
                    <!-- 宝图类型切换 + 统计 -->
                    <div style="background:#f0f5fb;border-radius:12px;padding:10px 14px;margin-bottom:10px;">
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                            ${mapTabs}
                        </div>
                        <div id="dtTypeStats" style="display:flex;flex-wrap:wrap;gap:15px;font-size:0.75rem;color:#5a7a94;padding:4px 0;border-top:1px solid #dce5ef;">
                            <span id="dtNormalStats">🗺️ 普通: 0次 (0.0万)</span>
                            <span id="dtAdvancedStats">🔥 高级: 0次 (0.0万)</span>
                            <span id="dtSuperStats">💎 超级: 0次 (0.0万)</span>
                        </div>
                    </div>

                    <!-- 成本设置 -->
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:6px 12px;background:#f8faff;border-radius:12px;border:1px solid #eef2f7;">
                        <span style="font-weight:600;font-size:0.85rem;color:#1f3b53;">💰 单张成本 (万)</span>
                        <input type="number" id="dtCostInput" step="0.1" min="0" value="${this.mapTypes.find(m => m.key === this.currentType).defaultCost}" style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                        <span style="font-size:0.65rem;color:#5a7a94;">(修改后仅影响当前类型)</span>
                    </div>

                    <!-- 产出库 -->
                    <div style="margin-top:8px;">
                        <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;margin-bottom:6px;">📦 点击产出即可记录 (每次=1张宝图)</div>
                        <div id="dtPresetBtns" style="display:flex;flex-wrap:wrap;gap:4px;min-height:30px;"></div>
                        
                        <div style="display:flex;gap:6px;margin-top:8px;border-top:1px dashed #d0dce8;padding-top:8px;">
                            <input type="text" id="dtCustomItem" placeholder="自定义物品(自动入库)" style="flex:1;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;">
                            <input type="number" id="dtCustomPrice" placeholder="价格(万)" style="width:80px;padding:4px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;text-align:center;">
                            <button class="btn-small" id="dtAddCustomBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">➕ 添加入库</button>
                        </div>
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
    //  🎨 渲染预设按钮（动态库）
    // ============================================================
    renderPresetButtons() {
        const container = document.getElementById('dtPresetBtns');
        if (!container) return;

        let html = '';
        // 根据当前选择的宝图类型，筛选（简单分类，默认显示所有）
        // 建议：匹配关键词 "高级" 或 "超级" 来区分
        let list = this.presetItems;
        if (this.currentType === 'normal') {
            list = this.presetItems.filter(i => !i.name.includes('高级') && !i.name.includes('超级') && !i.name.includes('神兽') && !i.name.includes('极品'));
        } else if (this.currentType === 'advanced') {
            list = this.presetItems.filter(i => i.name.includes('高级'));
        } else if (this.currentType === 'super') {
            list = this.presetItems.filter(i => i.name.includes('超级') || i.name.includes('神兽') || i.name.includes('极品') || i.name.includes('巨额'));
        }
        
        // 如果某类型没预设，显示全部
        if (list.length === 0) list = this.presetItems;

        for (let item of list) {
            const icon = item.icon || '📦';
            html += `<button class="dt-preset-btn" data-name="${item.name}" data-price="${item.price}" style="padding:4px 12px;border-radius:20px;border:1px solid #bccad9;background:#f8faff;cursor:pointer;font-size:0.7rem;font-weight:600;color:#1f3b53;margin:2px;transition:0.1s;">
                ${icon} ${item.name} <span style="color:#5a7a94;font-weight:400;">(${item.price}万)</span>
            </button>`;
        }
        container.innerHTML = html;
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        // 1. 切换宝图类型
        document.querySelectorAll('.dt-map-tab').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.dataset.key;
                DigTreasureModule.currentType = key;
                DigTreasureModule.render();
                DigTreasureModule.updateCostInput();
            });
        });

        // 2. 点击产出按钮：直接记录1次
        document.getElementById('dtPresetBtns').addEventListener('click', function(e) {
            const btn = e.target.closest('.dt-preset-btn');
            if (btn) {
                const name = btn.dataset.name;
                const price = parseFloat(btn.dataset.price) || 0;
                const type = DigTreasureModule.currentType;
                
                // 从预设库获取图标
                const itemDef = DigTreasureModule.presetItems.find(i => i.name === name);
                const icon = itemDef ? itemDef.icon : '📦';

                // 1次挖掘，产出1个
                const cost = DigTreasureModule.mapTypes.find(m => m.key === type).defaultCost;
                DigTreasureModule.todayRecords[type].count += 1;
                DigTreasureModule.todayRecords[type].cost += cost;
                DigTreasureModule.todayRecords[type].items.push({ name, price, icon });
                
                DigTreasureModule.saveData();
                DigTreasureModule.updateStats();
                DigTreasureModule.updateTypeStatsLabels();
                
                // 极速反馈（轻微闪烁）
                btn.style.transform = 'scale(0.92)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);
            }
        });

        // 3. 自定义添加入库
        document.getElementById('dtAddCustomBtn').addEventListener('click', () => {
            const name = document.getElementById('dtCustomItem').value.trim();
            const price = parseFloat(document.getElementById('dtCustomPrice').value) || 0;
            if (!name) { alert('请输入物品名称'); return; }
            if (price <= 0) { alert('请输入有效的价格'); return; }
            
            const exists = DigTreasureModule.presetItems.some(item => item.name === name);
            if (!exists) {
                DigTreasureModule.presetItems.push({ name, price, icon: '📦' });
                DigTreasureModule.renderPresetButtons();
            } else {
                // 存在则更新价格
                const item = DigTreasureModule.presetItems.find(i => i.name === name);
                if (!confirm(`"${name}" 已存在预设库中 (当前价${item.price}万)，是否更新为 ${price}万？`)) {
                    document.getElementById('dtCustomItem').value = '';
                    document.getElementById('dtCustomPrice').value = '';
                    return;
                }
                item.price = price;
                DigTreasureModule.renderPresetButtons();
            }

            document.getElementById('dtCustomItem').value = '';
            document.getElementById('dtCustomPrice').value = '';
            DigTreasureModule.saveData();
            alert(`✅ "${name}" 已入库，可直接点击使用！`);
        });

        // 4. 结算今日
        document.getElementById('dtSaveDayBtn').addEventListener('click', () => {
            this.saveDay();
        });

        // 5. 清空今日
        document.getElementById('dtResetDayBtn').addEventListener('click', () => {
            if (confirm('⚠️ 确定要清空今日所有挖图记录吗？')) {
                this.todayRecords = { normal: { count: 0, cost: 0, items: [] }, advanced: { count: 0, cost: 0, items: [] }, super: { count: 0, cost: 0, items: [] } };
                this.saveData();
                this.render();
                this.updateTypeStatsLabels();
            }
        });

        // 6. 隐藏历史
        document.getElementById('dtToggleHistory')?.addEventListener('click', function() {
            const body = document.getElementById('dtHistoryBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
    },

    // ============================================================
    //  🧮 更新类型统计
    // ============================================================
    updateTypeStatsLabels() {
        const normal = this.todayRecords.normal;
        const advanced = this.todayRecords.advanced;
        const superRec = this.todayRecords.super;
        
        document.getElementById('dtNormalStats').textContent = `🗺️ 普通: ${normal.count}次 (${normal.cost.toFixed(1)}万)`;
        document.getElementById('dtAdvancedStats').textContent = `🔥 高级: ${advanced.count}次 (${advanced.cost.toFixed(1)}万)`;
        document.getElementById('dtSuperStats').textContent = `💎 超级: ${superRec.count}次 (${superRec.cost.toFixed(1)}万)`;
    },

    updateCostInput() {
        const map = this.mapTypes.find(m => m.key === this.currentType);
        if (map) {
            document.getElementById('dtCostInput').value = map.defaultCost;
        }
    },

    // ============================================================
    //  📊 统计更新
    // ============================================================
    updateStats() {
        let totalCount = 0, totalCost = 0, totalIncome = 0;

        for (let type of ['normal', 'advanced', 'super']) {
            totalCount += this.todayRecords[type].count;
            totalCost += this.todayRecords[type].cost || 0; // 已存成本
            for (let item of this.todayRecords[type].items) {
                totalIncome += item.price || 0;
            }
        }

        document.getElementById('dtTodayTotal').textContent = totalCount;
        document.getElementById('dtTodayCost').textContent = totalCost.toFixed(1);
        document.getElementById('dtTodayIncome').textContent = totalIncome.toFixed(1);
        const profit = totalIncome - totalCost;
        document.getElementById('dtTodayProfit').textContent = profit.toFixed(1);
        const ps = document.getElementById('dtProfitStat');
        ps.className = 'stat-item' + (profit > 0 ? ' profit' : profit < 0 ? ' loss' : '');
    },

    // ============================================================
    //  🗓️ 结算今日
    // ============================================================
    saveDay() {
        const today = new Date().toISOString().slice(0, 10);
        const normal = this.todayRecords.normal;
        const advanced = this.todayRecords.advanced;
        const superRec = this.todayRecords.super;
        
        const totalCost = normal.cost + advanced.cost + superRec.cost;
        let totalIncome = 0;
        [...normal.items, ...advanced.items, ...superRec.items].forEach(i => totalIncome += i.price || 0);
        const profit = totalIncome - totalCost;

        if (totalCount === 0 && totalIncome === 0) {
            alert('今日还没有任何挖图记录哦！');
            return;
        }

        const summary = {
            date: today,
            normal: { count: normal.count, items: normal.items },
            advanced: { count: advanced.count, items: advanced.items },
            super: { count: superRec.count, items: superRec.items },
            totalCost, totalIncome, profit
        };

        this.records.push(summary);
        this.todayRecords = { normal: { count: 0, cost: 0, items: [] }, advanced: { count: 0, cost: 0, items: [] }, super: { count: 0, cost: 0, items: [] } };
        this.saveData();
        this.render();
        this.updateTypeStatsLabels();
        alert('✅ 今日已结算并保存！');
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
