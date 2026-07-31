// ============================================================
//  📊 总收益汇总模块 - 完整版
// ============================================================
const TotalStatsModule = {
    id: 'totalStats',

    // ========== 数据 ==========
    currentDate: new Date(),

    // ========== 生命周期 ==========
    init() {
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
    },

    render() {
        this.updateStats();
    },

    // ========== 获取所有模块数据 ==========
    getAllRecords() {
        const records = [];
        
        // 1. 获取跑宠环数据
        const petRing = Storage.get('petRing');
        if (petRing && petRing.history) {
            for (let h of petRing.history) {
                const rmb = h.profit * (h.exchangeRate || 0.08);
                records.push({
                    date: h.date,
                    module: '跑宠环',
                    icon: '🏃',
                    type: '跑环',
                    detail: `${h.ringCount}环 | 积分${h.totalScore || 0} | 修炼点${h.totalPoints || 0}`,
                    income: h.totalIncome || 0,
                    cost: h.totalCost || 0,
                    profit: h.profit || 0,
                    rmb: rmb,
                    exchangeRate: h.exchangeRate || 0.08,
                    raw: h
                });
            }
        }

        // 2. 获取种树数据
        const treePlant = Storage.get('treePlant');
        if (treePlant && treePlant.history) {
            for (let h of treePlant.history) {
                const rmb = h.profit * (h.exchangeRate || 0.08);
                const lootStr = h.lootDetails ? h.lootDetails.join('; ') : '无产出';
                records.push({
                    date: h.date,
                    module: '种树',
                    icon: '🌳',
                    type: '种树',
                    detail: `收入${(h.income || 0).toFixed(1)}万 | 摇树${h.shakes || 0}次 | ${lootStr.substring(0, 20)}${lootStr.length > 20 ? '...' : ''}`,
                    income: h.income || 0,
                    cost: h.cost || 0,
                    profit: h.profit || 0,
                    rmb: rmb,
                    exchangeRate: h.exchangeRate || 0.08,
                    raw: h
                });
            }
        }

        // 按日期排序（最新的在前）
        records.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        return records;
    },

    // ========== 按日期分组 ==========
    groupByDate(records) {
        const groups = {};
        for (let r of records) {
            const dateKey = r.date.split(' ')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(r);
        }
        return groups;
    },

    // ========== 计算汇总 ==========
    calcTotalStats(records) {
        let totalIncome = 0,
            totalCost = 0,
            totalProfit = 0,
            totalRmb = 0;
        const moduleStats = {};

        for (let r of records) {
            totalIncome += r.income || 0;
            totalCost += r.cost || 0;
            totalProfit += r.profit || 0;
            totalRmb += r.rmb || 0;

            if (!moduleStats[r.module]) {
                moduleStats[r.module] = { 
                    count: 0, 
                    income: 0, 
                    cost: 0, 
                    profit: 0,
                    rmb: 0
                };
            }
            moduleStats[r.module].count++;
            moduleStats[r.module].income += r.income || 0;
            moduleStats[r.module].cost += r.cost || 0;
            moduleStats[r.module].profit += r.profit || 0;
            moduleStats[r.module].rmb += r.rmb || 0;
        }

        const winCount = records.filter(r => r.profit > 0).length;
        const winRate = records.length > 0 ? (winCount / records.length * 100) : 0;

        return { 
            totalIncome, 
            totalCost, 
            totalProfit, 
            totalRmb,
            moduleStats, 
            count: records.length,
            winCount,
            winRate
        };
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('totalStatsContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- 顶部统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="tsTotalCount">0</div><div class="label">📊 总记录</div></div>
                <div class="stat-item"><div class="num" id="tsTotalIncome">0</div><div class="label">💰 总收入(万)</div></div>
                <div class="stat-item" id="tsTotalProfitStat"><div class="num" id="tsTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="tsTotalRmb">0</div><div class="label">💴 总收益(元)</div></div>
                <div class="stat-item"><div class="num" id="tsWinRate">0%</div><div class="label">🏆 盈利率</div></div>
                <div class="stat-item"><div class="num" id="tsModuleCount">0</div><div class="label">📦 模块数</div></div>
            </div>

            <!-- 模块统计 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📦 各模块统计</div>
                </div>
                <div class="module-body">
                    <div id="tsModuleStats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;">
                        <div style="color:#6c87a0;text-align:center;padding:12px;">暂无数据</div>
                    </div>
                </div>
            </div>

            <!-- 筛选栏 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📅 时间线 <span class="hint">— 按日期查看所有记录</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <input type="date" id="tsFilterDate" style="padding:4px 8px;border:1px solid #bccad9;border-radius:16px;font-size:0.7rem;">
                        <button class="btn-small" id="tsFilterBtn" style="background:#4c7a5c;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;">🔍 筛选</button>
                        <button class="btn-small" id="tsFilterResetBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;">↩️ 重置</button>
                    </div>
                </div>
                <div class="module-body">
                    <div id="tsCalendar" style="margin-bottom:12px;"></div>
                    <div id="tsTimeline">
                        <div style="color:#6c87a0;text-align:center;padding:20px;">暂无记录</div>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        document.getElementById('tsFilterBtn').addEventListener('click', () => {
            this.render();
        });

        document.getElementById('tsFilterResetBtn').addEventListener('click', () => {
            document.getElementById('tsFilterDate').value = '';
            this.render();
        });

        document.getElementById('totalStatsContainer').addEventListener('click', (e) => {
            const dateBtn = e.target.closest('.ts-date-btn');
            if (dateBtn) {
                const date = dateBtn.dataset.date;
                document.getElementById('tsFilterDate').value = date;
                this.render();
            }
        });
    },

    // ========== 渲染日历 ==========
    renderCalendar(year, month, records) {
        const container = document.getElementById('tsCalendar');
        if (!container) return;

        const dateKeys = new Set();
        for (let r of records) {
            const d = r.date.split(' ')[0];
            dateKeys.add(d);
        }

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-weight:600;color:#1f3b53;">
                <span>${year}年${month + 1}月</span>
                <span style="font-size:0.7rem;color:#5a7a94;">有数据的日期高亮</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:0.7rem;text-align:center;">
                <div style="color:#c0392b;font-weight:600;">日</div>
                <div style="font-weight:600;">一</div>
                <div style="font-weight:600;">二</div>
                <div style="font-weight:600;">三</div>
                <div style="font-weight:600;">四</div>
                <div style="font-weight:600;">五</div>
                <div style="color:#c0392b;font-weight:600;">六</div>
        `;

        for (let i = 0; i < firstDay; i++) {
            html += `<div style="padding:4px;"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const hasData = dateKeys.has(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === document.getElementById('tsFilterDate').value;

            let style = 'padding:6px 2px;border-radius:50%;cursor:pointer;';
            if (hasData) {
                style += 'background:#4c7a5c;color:#fff;font-weight:700;';
            }
            if (isToday && !hasData) {
                style += 'border:2px solid #4c7a5c;';
            }
            if (isSelected) {
                style += 'border:3px solid #dbbd7c;';
            }

            const clickAttr = hasData ? `class="ts-date-btn" data-date="${dateStr}"` : '';

            html += `<div style="${style}" ${clickAttr}>${d}</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    // ========== 渲染时间线 ==========
    renderTimeline(records, filterDate) {
        const container = document.getElementById('tsTimeline');
        if (!container) return;

        let filtered = records;
        if (filterDate) {
            filtered = records.filter(r => r.date.startsWith(filterDate));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="color:#6c87a0;text-align:center;padding:20px;font-style:italic;">
                    ${filterDate ? `📅 ${filterDate} 暂无记录` : '暂无记录'}
                </div>
            `;
            return;
        }

        const groups = this.groupByDate(filtered);
        const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        let html = '';
        let totalProfit = 0;
        let totalIncome = 0;
        let totalCost = 0;
        let totalRmb = 0;

        for (let date of sortedDates) {
            const items = groups[date];
            let dayIncome = 0,
                dayCost = 0,
                dayProfit = 0,
                dayRmb = 0;
            for (let item of items) {
                dayIncome += item.income || 0;
                dayCost += item.cost || 0;
                dayProfit += item.profit || 0;
                dayRmb += item.rmb || 0;
            }
            totalIncome += dayIncome;
            totalCost += dayCost;
            totalProfit += dayProfit;
            totalRmb += dayRmb;

            const profitClass = dayProfit >= 0 ? 'profit-positive' : 'profit-negative';

            html += `
                <div style="background:#f8faff;border-radius:12px;padding:10px 14px;margin-bottom:10px;border:1px solid #e8eef5;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
                        <span style="font-weight:700;color:#1f3b53;">📅 ${date}</span>
                        <span style="font-size:0.8rem;color:#5a7a94;">${items.length} 条</span>
                        <span style="font-size:0.85rem;font-weight:700;">
                            💰 ${dayIncome.toFixed(1)}万 | 
                            📈 <span class="${profitClass}">${dayProfit >= 0 ? '+' : ''}${dayProfit.toFixed(1)}万</span>
                            | 💴 ${dayRmb.toFixed(2)}元
                        </span>
                    </div>
                    <div style="border-top:1px solid #eef2f7;padding-top:6px;">
            `;

            for (let item of items) {
                const pc = item.profit >= 0 ? 'profit-positive' : 'profit-negative';
                html += `
                    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.8rem;border-bottom:1px solid #f5f8fc;">
                        <span style="font-size:1.1rem;">${item.icon}</span>
                        <span style="font-weight:600;color:#1f3b53;min-width:60px;">${item.module}</span>
                        <span style="color:#5a7a94;flex:1;font-size:0.75rem;">${item.detail}</span>
                        <span style="font-weight:600;white-space:nowrap;font-size:0.75rem;">
                            💰 ${(item.income || 0).toFixed(1)}万
                            | <span class="${pc}">${item.profit >= 0 ? '+' : ''}${(item.profit || 0).toFixed(1)}万</span>
                            | 💴 ${(item.rmb || 0).toFixed(2)}元
                        </span>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        const totalProfitClass = totalProfit >= 0 ? 'profit-positive' : 'profit-negative';
        html += `
            <div style="background:#f0f5fb;border-radius:12px;padding:12px 16px;border:2px solid #4c7a5c;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;font-size:0.9rem;">
                    <span style="font-weight:700;color:#1f3b53;">📊 汇总</span>
                    <span>💰 总收入: <strong>${totalIncome.toFixed(1)}万</strong></span>
                    <span>📈 总利润: <strong class="${totalProfitClass}">${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(1)}万</strong></span>
                    <span>💴 总收益: <strong>${totalRmb.toFixed(2)}元</strong></span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // ========== 更新数据 ==========
    updateStats() {
        const records = this.getAllRecords();
        const filterDate = document.getElementById('tsFilterDate').value;

        const stats = this.calcTotalStats(records);
        
        // 统计卡片
        document.getElementById('tsTotalCount').textContent = stats.count;
        document.getElementById('tsTotalIncome').textContent = stats.totalIncome.toFixed(1);
        document.getElementById('tsTotalProfit').textContent = stats.totalProfit.toFixed(1);
        document.getElementById('tsTotalRmb').textContent = stats.totalRmb.toFixed(2);
        document.getElementById('tsWinRate').textContent = stats.winRate.toFixed(0) + '%';
        document.getElementById('tsModuleCount').textContent = Object.keys(stats.moduleStats).length;

        // 利润颜色
        const ps = document.getElementById('tsTotalProfitStat');
        ps.className = 'stat-item' + (stats.totalProfit > 0 ? ' profit' : stats.totalProfit < 0 ? ' loss' : '');

        // 模块统计
        this.renderModuleStats(stats.moduleStats);

        // 日历
        const now = this.currentDate;
        this.renderCalendar(now.getFullYear(), now.getMonth(), records);

        // 时间线
        this.renderTimeline(records, filterDate);
    },

    // ========== 渲染模块统计 ==========
    renderModuleStats(moduleStats) {
        const container = document.getElementById('tsModuleStats');
        if (!container) return;

        const keys = Object.keys(moduleStats);
        if (keys.length === 0) {
            container.innerHTML = '<div style="color:#6c87a0;text-align:center;padding:12px;">暂无数据</div>';
            return;
        }

        const icons = {
            '跑宠环': '🏃',
            '种树': '🌳',
            '师门': '📋',
            '活动': '🎯'
        };

        let html = '';
        for (let [name, stats] of Object.entries(moduleStats)) {
            const icon = icons[name] || '📦';
            const pc = stats.profit >= 0 ? 'profit-positive' : 'profit-negative';
            html += `
                <div style="background:white;border-radius:12px;padding:10px 12px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.04);">
                    <div style="font-size:1.2rem;">${icon}</div>
                    <div style="font-weight:600;font-size:0.85rem;color:#1f3b53;">${name}</div>
                    <div style="font-size:0.65rem;color:#5a7a94;">${stats.count}笔</div>
                    <div style="font-size:0.8rem;font-weight:700;" class="${pc}">${stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(1)}万</div>
                    <div style="font-size:0.7rem;color:#5a7a94;">💴 ${stats.rmb.toFixed(2)}元</div>
                </div>
            `;
        }
        container.innerHTML = html;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TotalStatsModule.init());
} else {
    TotalStatsModule.init();
}
