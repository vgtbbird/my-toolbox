// ============================================================
//  📊 总收益汇总模块 - 最终修复版
// ============================================================
const TotalStatsModule = {
    id: 'totalStats',

    currentDate: new Date(),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),

    init() {
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
    },

    render() {
        const records = this.getAllRecords();
        let filterDate = document.getElementById('tsFilterDate').value;
        
        if (!filterDate && records.length > 0) {
            const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
            filterDate = sorted[0].date.split(' ')[0];
            document.getElementById('tsFilterDate').value = filterDate;
        }
        
        this.updateStats(records, filterDate);
    },

    getAllRecords() {
        const records = [];
        
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
                    detail: `收入${(h.income || 0).toFixed(1)}万 | 摇树${h.shakes || 0}次`,
                    income: h.income || 0,
                    cost: h.cost || 0,
                    profit: h.profit || 0,
                    rmb: rmb,
                    exchangeRate: h.exchangeRate || 0.08,
                    raw: h,
                    lootStr: lootStr
                });
            }
        }

        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        return records;
    },

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

    calcTotalStats(records) {
        let totalIncome = 0, totalCost = 0, totalProfit = 0, totalRmb = 0;
        const moduleStats = {};

        for (let r of records) {
            totalIncome += r.income || 0;
            totalCost += r.cost || 0;
            totalProfit += r.profit || 0;
            totalRmb += r.rmb || 0;

            if (!moduleStats[r.module]) {
                moduleStats[r.module] = { count: 0, income: 0, cost: 0, profit: 0, rmb: 0 };
            }
            moduleStats[r.module].count++;
            moduleStats[r.module].income += r.income || 0;
            moduleStats[r.module].cost += r.cost || 0;
            moduleStats[r.module].profit += r.profit || 0;
            moduleStats[r.module].rmb += r.rmb || 0;
        }

        const winCount = records.filter(r => r.profit > 0).length;
        const winRate = records.length > 0 ? (winCount / records.length * 100) : 0;

        return { totalIncome, totalCost, totalProfit, totalRmb, moduleStats, count: records.length, winCount, winRate };
    },

    getMonthRecords(records) {
        return records.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === this.viewYear && d.getMonth() === this.viewMonth;
        });
    },

    buildUI() {
        const container = document.getElementById('totalStatsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="tsTotalCount">0</div><div class="label">📊 总记录</div></div>
                <div class="stat-item"><div class="num" id="tsTotalIncome">0</div><div class="label">💰 总收入(万)</div></div>
                <div class="stat-item" id="tsTotalProfitStat"><div class="num" id="tsTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="tsTotalRmb">0</div><div class="label">💴 总收益(元)</div></div>
                <div class="stat-item"><div class="num" id="tsWinRate">0%</div><div class="label">🏆 盈利率</div></div>
                <div class="stat-item"><div class="num" id="tsModuleCount">0</div><div class="label">📦 模块数</div></div>
            </div>

            <div class="module">
                <div class="module-header"><div class="title">📦 各模块统计</div></div>
                <div class="module-body"><div id="tsModuleStats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;"></div></div>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">📅 时间线 <span class="hint">— 点击有数据的日期查看详情</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <input type="date" id="tsFilterDate" style="padding:4px 8px;border:1px solid #bccad9;border-radius:16px;font-size:0.7rem;">
                        <button class="btn-small" id="tsFilterBtn" style="background:#4c7a5c;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;">🔍 筛选</button>
                        <button class="btn-small" id="tsFilterResetBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;">↩️ 重置</button>
                    </div>
                </div>
                <div class="module-body">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <button class="btn-small" id="tsPrevMonth" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.7rem;cursor:pointer;">◀ 上月</button>
                        <span id="tsMonthLabel" style="font-weight:700;font-size:1rem;color:#1f3b53;"></span>
                        <button class="btn-small" id="tsNextMonth" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.7rem;cursor:pointer;">下月 ▶</button>
                    </div>
                    <div id="tsMonthSummary" style="background:#f0f5fb;border-radius:12px;padding:8px 14px;margin-bottom:10px;font-size:0.85rem;color:#1f3b53;text-align:center;border:1px solid #dce5ef;"></div>
                    <div id="tsCalendar" style="margin-bottom:10px;"></div>
                    <div id="tsDateDetail" style="margin-bottom:10px;"></div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // 筛选按钮
        document.getElementById('tsFilterBtn').addEventListener('click', () => {
            this.render();
        });

        document.getElementById('tsFilterResetBtn').addEventListener('click', () => {
            document.getElementById('tsFilterDate').value = '';
            this.render();
        });

        // 月份切换
        document.getElementById('tsPrevMonth').addEventListener('click', () => {
            this.viewMonth--;
            if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
            document.getElementById('tsFilterDate').value = '';
            this.render();
        });

        document.getElementById('tsNextMonth').addEventListener('click', () => {
            this.viewMonth++;
            if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
            document.getElementById('tsFilterDate').value = '';
            this.render();
        });

        // 日期点击 - 使用事件委托
        document.getElementById('totalStatsContainer').addEventListener('click', function(e) {
            const dateBtn = e.target.closest('.ts-date-btn');
            if (dateBtn) {
                const date = dateBtn.dataset.date;
                console.log('点击日期:', date);
                document.getElementById('tsFilterDate').value = date;
                TotalStatsModule.render();
            }
        });
    },

    renderCalendar(year, month, records, selectedDate) {
        const container = document.getElementById('tsCalendar');
        if (!container) return;

        // 收集有数据的日期（使用原始格式，不转换）
        const dateKeys = new Set();
        for (let r of records) {
            const d = r.date.split(' ')[0];
            dateKeys.add(d);
        }

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
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
            // 使用 / 格式，与数据一致
            const dateStr = `${year}/${month + 1}/${d}`;
            const hasData = dateKeys.has(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0].replace(/-/g, '/');
            const isSelected = dateStr === selectedDate;

            let style = 'padding:6px 2px;border-radius:50%;cursor:pointer;font-size:0.75rem;';
            if (hasData) {
                style += 'background:#4c7a5c;color:#fff;font-weight:700;';
            }
            if (isToday && !hasData) {
                style += 'border:2px solid #4c7a5c;';
            }
            if (isSelected) {
                style += 'border:3px solid #dbbd7c;';
                if (hasData) {
                    style += 'background:#4c7a5c;color:#fff;';
                }
            }

            const clickAttr = hasData ? `class="ts-date-btn" data-date="${dateStr}"` : '';

            html += `<div style="${style}" ${clickAttr}>${d}</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    renderDateDetail(records, filterDate) {
        const container = document.getElementById('tsDateDetail');
        if (!container) return;

        let activeDate = filterDate;
        if (!activeDate && records.length > 0) {
            const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
            activeDate = sorted[0].date.split(' ')[0];
        }

        if (!activeDate) {
            container.innerHTML = '';
            return;
        }

        const dayRecords = records.filter(r => {
            const d = r.date.split(' ')[0];
            return d === activeDate;
        });

        if (dayRecords.length === 0) {
            container.innerHTML = '';
            return;
        }

        let totalProfit = 0, totalRmb = 0, totalIncome = 0;
        for (let r of dayRecords) {
            totalProfit += r.profit || 0;
            totalRmb += r.rmb || 0;
            totalIncome += r.income || 0;
        }

        const pc = totalProfit >= 0 ? 'profit-positive' : 'profit-negative';

        let listHtml = '';
        for (let item of dayRecords) {
            const pc2 = item.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const lootDisplay = item.lootStr && item.lootStr !== '无产出' ? item.lootStr : '';
            listHtml += `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:0.8rem;border-bottom:1px solid #f5f8fc;flex-wrap:wrap;">
                    <span style="font-size:1.1rem;">${item.icon}</span>
                    <span style="font-weight:600;color:#1f3b53;min-width:60px;">${item.module}</span>
                    <span style="color:#5a7a94;flex:1;font-size:0.75rem;">${item.detail}</span>
                    ${lootDisplay ? `<span style="color:#5a7a94;font-size:0.7rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lootDisplay}</span>` : ''}
                    <span style="font-weight:600;white-space:nowrap;font-size:0.75rem;">
                        💰 ${(item.income || 0).toFixed(1)}万
                        | <span class="${pc2}">${item.profit >= 0 ? '+' : ''}${(item.profit || 0).toFixed(1)}万</span>
                        | 💴 ${(item.rmb || 0).toFixed(2)}元
                    </span>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="background:#f8faff;border-radius:12px;padding:12px 14px;border:1px solid #e8eef5;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                    <span style="font-weight:700;color:#1f3b53;">📅 ${activeDate}</span>
                    <span style="font-size:0.8rem;color:#5a7a94;">${dayRecords.length} 条记录</span>
                    <span style="font-size:0.85rem;font-weight:700;">
                        💰 ${totalIncome.toFixed(1)}万 | 
                        📈 <span class="${pc}">${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(1)}万</span>
                        | 💴 ${totalRmb.toFixed(2)}元
                    </span>
                </div>
                <div style="border-top:1px solid #eef2f7;padding-top:6px;">
                    ${listHtml}
                </div>
            </div>
        `;
    },

    updateStats(records, filterDate) {
        if (!records) records = this.getAllRecords();
        if (!filterDate) {
            filterDate = document.getElementById('tsFilterDate').value;
            if (!filterDate && records.length > 0) {
                const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
                filterDate = sorted[0].date.split(' ')[0];
                document.getElementById('tsFilterDate').value = filterDate;
            }
        }
        
        const monthRecords = this.getMonthRecords(records);

        const stats = this.calcTotalStats(records);
        document.getElementById('tsTotalCount').textContent = stats.count;
        document.getElementById('tsTotalIncome').textContent = stats.totalIncome.toFixed(1);
        document.getElementById('tsTotalProfit').textContent = stats.totalProfit.toFixed(1);
        document.getElementById('tsTotalRmb').textContent = stats.totalRmb.toFixed(2);
        document.getElementById('tsWinRate').textContent = stats.winRate.toFixed(0) + '%';
        document.getElementById('tsModuleCount').textContent = Object.keys(stats.moduleStats).length;

        const ps = document.getElementById('tsTotalProfitStat');
        ps.className = 'stat-item' + (stats.totalProfit > 0 ? ' profit' : stats.totalProfit < 0 ? ' loss' : '');

        this.renderModuleStats(stats.moduleStats);

        document.getElementById('tsMonthLabel').textContent = `${this.viewYear}年${this.viewMonth + 1}月`;

        const monthStats = this.calcTotalStats(monthRecords);
        const mc = monthStats.totalProfit >= 0 ? 'profit-positive' : 'profit-negative';
        document.getElementById('tsMonthSummary').innerHTML = `
            📊 当月汇总：💰 收入 ${monthStats.totalIncome.toFixed(1)}万 | 
            📈 利润 <span class="${mc}">${monthStats.totalProfit >= 0 ? '+' : ''}${monthStats.totalProfit.toFixed(1)}万</span> | 
            💴 收益 ${monthStats.totalRmb.toFixed(2)}元 | 
            📌 ${monthStats.count} 条记录
        `;

        this.renderCalendar(this.viewYear, this.viewMonth, records, filterDate);
        this.renderDateDetail(records, filterDate);
    },

    renderModuleStats(moduleStats) {
        const container = document.getElementById('tsModuleStats');
        if (!container) return;

        const keys = Object.keys(moduleStats);
        if (keys.length === 0) {
            container.innerHTML = '<div style="color:#6c87a0;text-align:center;padding:12px;">暂无数据</div>';
            return;
        }

        const icons = { '跑宠环': '🏃', '种树': '🌳', '师门': '📋', '活动': '🎯' };

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
