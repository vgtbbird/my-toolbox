// ============================================================
//  ⛏️ 挖图统计模块 - 最终交互版（对标种树 UI）
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
    currentMapType: 'normal', // normal(普通) | advanced(高级) | super(超级)
    
    // 今日记录分类型存储
    todayRecords: {
        normal: { count: 0, cost: 0, items: [] },
        advanced: { count: 0, cost: 0, items: [] },
        super: { count: 0, cost: 0, items: [] }
    },

    // ========== 宝图类型预设 ==========
    mapTypes: [
        { key: 'normal', label: '普通藏宝图', icon: '🗺️', defaultCost: 2.5 },
        { key: 'advanced', label: '高级藏宝图', icon: '🔥', defaultCost: 50 },
        { key: 'super', label: '超级藏宝图', icon: '💎', defaultCost: 200 }
    ],

    // 产出物品预设库（动态可增删改）
    presetItems: [],

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
        this.renderPresetButtons();
        this.updateTypeStatsLabels(); // 强制刷新分类统计
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
            bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff',
            cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14
        };
        this.currentMapType = data.currentMapType || 'normal';
        
        // 产出预设库（初始化可改）
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
            { name: '高图金钱', price: 60, icon: '💰' },
            // 事件（挖图特有）
            { name: '妖王', price: 0, icon: '🌪️', isEvent: true },
            { name: '幼儿园', price: 0, icon: '🏫', isEvent: true },
            { name: '放妖', price: 0, icon: '👻', isEvent: true }
        ];
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            todayRecords: this.todayRecords,
            uiSettings: this.uiSettings,
            currentMapType: this.currentMapType,
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
    //  🏗️ 构建UI（完全对标种树）
    // ============================================================
    buildUI() {
        const container = document.getElementById('digTreasureContainer');
        if (!container) return;

        // 生成宝图类型Tab按钮（带绿色切换效果）
        const mapTabsHtml = this.mapTypes.map(t => {
            const isActive = this.currentMapType === t.key;
            return `<button class="dt-map-tab ${isActive ? 'active' : ''}" data-key="${t.key}" style="padding:4px 14px;border-radius:30px;border:2px solid ${isActive ? '#4CAF50' : '#bccad9'};background:${isActive ? '#4CAF50' : '#f0f4f8'};color:${isActive ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;font-weight:600;margin:2px;transition:0.15s;">${t.icon} ${t.label}</button>`;
        }).join('');

        // 宝图类型统计文字（普通/高级/超级 分别显示）
        const normal = this.todayRecords.normal;
        const advanced = this.todayRecords.advanced;
        const superRec = this.todayRecords.super;

        container.innerHTML = `
            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="dtTodayTotal">0</div><div class="label">📅 今日总挖图</div></div>
                <div class="stat-item"><div class="num" id="dtTodayCost">0</div><div class="label">💰 今日总成本</div></div>
                <div class="stat-item"><div class="num" id="dtTodayIncome">0</div><div class="label">📊 今日总产出</div></div>
                <div class="stat-item" id="dtProfitStat"><div class="num" id="dtTodayProfit">0</div><div class="label">📈 今日利润</div></div>
            </div>

            <!-- 核心录入区 -->
            <div class="module" style="background:#f8faff;border-radius:16px;border:1px solid #dce5ef;">
                <div class="module-header">
                    <div class="title">⛏️ 今日挖图</div>
                    <div>
                        <button class="btn-small" id="dtSaveDayBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">✅ 结算今日</button>
                        <button class="btn-small" id="dtResetDayBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 14px;border-radius:30px;font-weight:600;">🔄 重置</button>
                    </div>
                </div>
                <div class="module-body">
                    
                    <!-- 第一行：宝图类型 + 分类统计 -->
                    <div style="background:#f0f5fb;border-radius:12px;padding:6px 12px;border:1px solid #d0dce8;margin-bottom:8px;">
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">${mapTabsHtml}</div>
                        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px;font-size:0.65rem;color:#5a7a94;border-top:1px solid #dce5ef;padding-top:4px;">
                            <span id="dtNormalStats">🗺️ 普通: ${normal.count}次 (${normal.cost.toFixed(1)}万)</span>
                            <span id="dtAdvancedStats">🔥 高级: ${advanced.count}次 (${advanced.cost.toFixed(1)}万)</span>
                            <span id="dtSuperStats">💎 超级: ${superRec.count}次 (${superRec.cost.toFixed(1)}万)</span>
                        </div>
                    </div>

                    <!-- 第二行：单张成本设置 -->
                    <div style="display:flex;align-items:center;gap:8px;padding:4px 10px;background:#f8faff;border-radius:12px;border:1px solid #dce5ef;margin-bottom:8px;">
                        <span style="font-size:0.7rem;font-weight:600;color:#1f3b53;">💰 单张成本</span>
                        <input type="number" id="dtCostInput" step="0.1" min="0" value="${this.mapTypes.find(m => m.key === this.currentMapType).defaultCost}" style="width:60px;padding:2px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.7rem;text-align:center;">
                        <span style="font-size:0.55rem;color:#5a7a94;">(万)</span>
                        <span style="font-size:0.55rem;color:#5a7a94;margin-left:4px;">点击按钮直接挖图 次数+1</span>
                    </div>

                    <!-- 第三行：产出及事件按钮区 -->
                    <div style="margin-top:2px;">
                        <div id="dtPresetBtns" style="display:flex;flex-wrap:wrap;gap:4px;min-height:30px;"></div>
                        
                        <!-- 第四行：自定义添加入库（仿种树输入） -->
                        <div style="display:flex;gap:6px;margin-top:6px;padding-top:6px;border-top:1px dashed #d0dce8;">
                            <input type="text" id="dtCustomItem" placeholder="自定义物品" style="flex:1;padding:2px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.7rem;">
                            <input type="number" id="dtCustomPrice" placeholder="价格" style="width:60px;padding:2px 4px;border:1px solid #bccad9;border-radius:12px;font-size:0.7rem;text-align:center;">
                            <button class="btn-small" id="dtAddCustomBtn" style="background:#6b8baa;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-weight:600;font-size:0.65rem;">➕ 添加</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderPresetButtons();
    },

    // ============================================================
    //  🎨 渲染预设按钮（包含事件标记）
    // ============================================================
    renderPresetButtons() {
        const container = document.getElementById('dtPresetBtns');
        if (!container) return;

        let html = '';
        let list = this.presetItems;

        // 根据当前宝图类型过滤展示
        if (this.currentMapType === 'normal') {
            list = this.presetItems.filter(i => !i.name.includes('高级') && !i.name.includes('超级'));
        } else if (this.currentMapType === 'advanced') {
            list = this.presetItems.filter(i => i.name.includes('高级') || i.name === '高图金钱');
        } else if (this.currentMapType === 'super') {
            list = this.presetItems.filter(i => i.name.includes('超级') || i.name === '神兽' || i.name === '巨额');
        }
        // 保证事件按钮永远可见
        const events = this.presetItems.filter(i => i.isEvent === true);
        list = [...events, ...list.filter(i => !i.isEvent)];

        for (let item of list) {
            const icon = item.icon || '📦';
            const isEvent = item.isEvent === true;
            // 事件按钮用特殊边框
            const border = isEvent ? '2px solid #dbbd7c' : '1px solid #bccad9';
            const bg = isEvent ? '#fdf8ee' : '#f8faff';
            const label = isEvent ? `${icon} ${item.name}` : `${icon} ${item.name} (${item.price}万)`;
            
            html += `<button class="dt-preset-btn" data-name="${item.name}" data-price="${item.price}" data-event="${isEvent}" style="padding:2px 12px;border-radius:20px;border:${border};background:${bg};cursor:pointer;font-size:0.7rem;font-weight:600;color:#1f3b53;margin:2px;transition:0.1s;">${label}</button>`;
        }
        container.innerHTML = html;
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        // 切换宝图类型
        document.querySelectorAll('.dt-map-tab').forEach(btn => {
            btn.addEventListener('click', function() {
                DigTreasureModule.currentMapType = this.dataset.key;
                DigTreasureModule.render(); // render 会自动刷新 UI 和分类统计
                DigTreasureModule.updateCostInput();
            });
        });

        // 点击按钮挖图（含事件处理）
        document.getElementById('dtPresetBtns').addEventListener('click', function(e) {
            const btn = e.target.closest('.dt-preset-btn');
            if (!btn) return;
            
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price) || 0;
            const isEvent = btn.dataset.event === 'true';
            const type = DigTreasureModule.currentMapType;
            const cost = DigTreasureModule.mapTypes.find(m => m.key === type).defaultCost;
            
            // 记录次数和成本
            DigTreasureModule.todayRecords[type].count += 1;
            DigTreasureModule.todayRecords[type].cost += cost;

            // 如果是事件，不需要写入产出物；如果是物品，写入产出物
            if (!isEvent) {
                const icon = btn.textContent.trim().charAt(0) === '📦' ? '📦' : btn.textContent.trim().charAt(0);
                DigTreasureModule.todayRecords[type].items.push({ name, price, icon });
            }

            DigTreasureModule.saveData();
            DigTreasureModule.render(); // 立刻刷新所有统计和分类
            btn.style.transform = 'scale(0.92)';
            setTimeout(() => btn.style.transform = 'scale(1)', 150);
        });

        // 自定义物品入库
        document.getElementById('dtAddCustomBtn').addEventListener('click', () => {
            const name = document.getElementById('dtCustomItem').value.trim();
            const price = parseFloat(document.getElementById('dtCustomPrice').value) || 0;
            if (!name) { alert('请输入物品名称'); return; }
            
            const exists = DigTreasureModule.presetItems.some(item => item.name === name);
            if (!exists) {
                DigTreasureModule.presetItems.push({ name, price, icon: '📦' });
                DigTreasureModule.renderPresetButtons();
            } else {
                const item = DigTreasureModule.presetItems.find(i => i.name === name);
                if (confirm(`"${name}" 已存在 (现价${item.price}万)，更新为 ${price}万？`)) {
                    item.price = price;
                    DigTreasureModule.renderPresetButtons();
                } else {
                    document.getElementById('dtCustomItem').value = '';
                    document.getElementById('dtCustomPrice').value = '';
                    return;
                }
            }
            document.getElementById('dtCustomItem').value = '';
            document.getElementById('dtCustomPrice').value = '';
            DigTreasureModule.saveData();
        });

        // 结算今日
        document.getElementById('dtSaveDayBtn').addEventListener('click', () => this.saveDay());
        // 重置
        document.getElementById('dtResetDayBtn').addEventListener('click', () => {
            if (confirm('确定清空今日所有记录？')) {
                this.todayRecords = { normal: { count: 0, cost: 0, items: [] }, advanced: { count: 0, cost: 0, items: [] }, super: { count: 0, cost: 0, items: [] } };
                this.saveData();
                this.render();
            }
        });
    },

    // ============================================================
    //  🧮 辅助更新函数
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
        const map = this.mapTypes.find(m => m.key === this.currentMapType);
        if (map) document.getElementById('dtCostInput').value = map.defaultCost;
    },

    updateStats() {
        let totalCount = 0, totalCost = 0, totalIncome = 0;
        for (let type of ['normal', 'advanced', 'super']) {
            totalCount += this.todayRecords[type].count;
            totalCost += this.todayRecords[type].cost;
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
        const normal = this.todayRecords.normal, advanced = this.todayRecords.advanced, superRec = this.todayRecords.super;
        const totalCost = normal.cost + advanced.cost + superRec.cost;
        let totalIncome = 0;
        [...normal.items, ...advanced.items, ...superRec.items].forEach(i => totalIncome += i.price || 0);
        const profit = totalIncome - totalCost;

        if (totalCost === 0 && totalIncome === 0) { alert('今日还没有记录！'); return; }

        const summary = { date: today, normal: { count: normal.count, items: normal.items }, advanced: { count: advanced.count, items: advanced.items }, super: { count: superRec.count, items: superRec.items }, totalCost, totalIncome, profit };
        this.records.push(summary);
        this.todayRecords = { normal: { count: 0, cost: 0, items: [] }, advanced: { count: 0, cost: 0, items: [] }, super: { count: 0, cost: 0, items: [] } };
        this.saveData();
        this.render();
        alert('✅ 今日已结算！');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DigTreasureModule.init());
} else {
    DigTreasureModule.init();
}
window.DigTreasureModule = DigTreasureModule;
