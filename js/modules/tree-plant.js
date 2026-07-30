// ============================================================
//  🌳 种树模块 - 完整版（添加金柳露 + 卡片）
// ============================================================
const TreePlantModule = {
    id: 'treePlant',

    // ========== 数据 ==========
    storageKey: 'treePlant',
    history: [],
    prices: {},
    current: { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {} },
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

    LOOT_TYPES: [
        // 二药
        { key: 'eryao', label: '二药', defaultPrice: 1.5 },
        // 五宝
        { key: 'bishui', label: '避水珠', defaultPrice: 5 },
        { key: 'dinghun', label: '定魂珠', defaultPrice: 18 },
        { key: 'jingang', label: '金刚石', defaultPrice: 18 },
        { key: 'yeguang', label: '夜光珠', defaultPrice: 12 },
        { key: 'longlin', label: '龙鳞', defaultPrice: 8 },
        // 宝石（8种）
        { key: 'baoshi_hl', label: '黑宝石', defaultPrice: 8 },
        { key: 'baoshi_tys', label: '太阳石', defaultPrice: 6 },
        { key: 'baoshi_yls', label: '月亮石', defaultPrice: 10 },
        { key: 'baoshi_gms', label: '光芒石', defaultPrice: 7 },
        { key: 'baoshi_sls', label: '舍利子', defaultPrice: 9 },
        { key: 'baoshi_hmm', label: '红玛瑙', defaultPrice: 10 },
        { key: 'baoshi_fcs', label: '翡翠石', defaultPrice: 5 },
        { key: 'baoshi_xys', label: '神秘石', defaultPrice: 3 },
        // 其他奖励
        { key: 'money', label: '金钱(万)', defaultPrice: 2.75 },
        { key: 'exp', label: '经验', defaultPrice: 0 },
        { key: 'shoujue', label: '兽决', defaultPrice: 80 },
        { key: 'lingpai', label: '令牌', defaultPrice: 450 },
        { key: 'caiguo', label: '彩果', defaultPrice: 80 },
        { key: 'haima', label: '海马', defaultPrice: 15 },
        { key: 'c66', label: '超级金柳露', defaultPrice: 25 },
        { key: 'zhenzhu', label: '珍珠', defaultPrice: 20 },
        { key: 'fushi', label: '符石', defaultPrice: 10 },
        { key: 'fushi_juanzhou', label: '符石卷轴', defaultPrice: 5 },
        // ✅ 新增
        { key: 'jinliu', label: '金柳露', defaultPrice: 8 },
        { key: 'kapian', label: '卡片', defaultPrice: 5 },
    ],

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
        console.log('🌳 种树模块渲染开始...');
        const container = document.getElementById('treePlantContainer');
        if (!container) {
            console.error('❌ 找不到 treePlantContainer');
            return;
        }
        if (!container.innerHTML || container.innerHTML.trim() === '' || !container.querySelector('.stats-grid')) {
            console.log('📦 容器为空，重新构建UI');
            this.buildUI();
        }
        this.updateStats();
        this.updateCurrent();
        this.updateHistory();
        this.updateAnalysis();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
        console.log('✅ 种树模块渲染完成');
    },

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.history = data.history || [];
        this.prices = data.prices || {};
        this.current = data.current || { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {} };
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14
        };

        this.LOOT_TYPES.forEach(t => {
            if (this.current.loot[t.key] === undefined) this.current.loot[t.key] = 0;
            if (this.prices[t.key] === undefined) this.prices[t.key] = t.defaultPrice;
        });
        
        console.log(`📊 种树加载数据: history ${this.history.length} 条`);
    },

    saveData() {
        Storage.set(this.storageKey, {
            history: this.history,
            prices: this.prices,
            current: this.current,
            uiSettings: this.uiSettings
        });
    },

    // ========== 应用UI设置 ==========
    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('treePlantContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) {
            tabContent.style.setProperty('background', s.bgColor, 'important');
            tabContent.style.setProperty('background-color', s.bgColor, 'important');
        }
        const card = container.closest('.card');
        if (card) {
            card.style.setProperty('background', s.bgColor, 'important');
        }

        container.querySelectorAll('.module, .stats-grid .stat-item, .history-section, .table-wrap, .tree-current-box, .analysis-panel, .tree-price-item').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
            el.style.setProperty('background-color', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .info-item, .info-item .val, .flex-between span, .footer-note, .history-item, .tree-price-item label, .tree-price-item input, .loot-btn, .evt-btn, .btn-complete, .btn-reset, .btn-undo, .btn-analysis, .table-wrap td, .table-wrap th, .a-item .a-num, .a-item .a-label, .advice-text, #taSummary').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        container.querySelectorAll('.loot-btn, .evt-btn, .btn-complete, .btn-reset, .btn-undo, .btn-analysis, .btn-small').forEach(el => {
            if (!el.classList.contains('loot-btn') && !el.classList.contains('evt-btn')) {
                el.style.setProperty('background', s.btnColor, 'important');
                el.style.setProperty('background-color', s.btnColor, 'important');
                el.style.setProperty('color', s.btnTextColor, 'important');
            }
        });

        container.querySelectorAll('.loot-btn, .evt-btn').forEach(el => {
            el.style.setProperty('background', s.btnColor + '22', 'important');
            el.style.setProperty('background-color', s.btnColor + '22', 'important');
            el.style.setProperty('color', s.textColor, 'important');
            el.style.setProperty('border', '1px solid ' + s.btnColor, 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .info-item, .loot-btn, .evt-btn, .btn-complete, .btn-reset, .btn-undo, .btn-analysis, .table-wrap td, .table-wrap th, .a-item .a-num, .a-item .a-label, .tree-price-item label, .tree-price-item input').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });

        container.querySelectorAll('.module .title, .section-label, .advice-title').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 2) + 'px', 'important');
        });
        container.querySelectorAll('.stat-item .num').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 6) + 'px', 'important');
        });
        container.querySelectorAll('.loot-btn .count, .evt-btn .count').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 4) + 'px', 'important');
        });
    },

    // ========== 计算 ==========
    calcStats() {
        let totalCost = 0, totalIncome = 0, totalProfit = 0, winCount = 0;
        for (let h of this.history) {
            totalCost += h.cost || 0;
            totalIncome += h.income || 0;
            totalProfit += h.profit || 0;
            if (h.profit > 0) winCount++;
        }
        const count = this.history.length;
        return {
            totalCost,
            totalIncome,
            totalProfit,
            count,
            avgProfit: count > 0 ? totalProfit / count : 0,
            winRate: count > 0 ? (winCount / count * 100) : 0
        };
    },

    calcCurrentIncome() {
        let total = 0;
        const details = [];
        for (let [key, count] of Object.entries(this.current.loot)) {
            if (count > 0) {
                const price = this.prices[key] || 0;
                const val = count * price;
                total += val;
                const label = this.LOOT_TYPES.find(t => t.key === key)?.label || key;
                details.push(`${label}×${count}=${val.toFixed(1)}万`);
            }
        }
        return { total, details };
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('treePlantContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- 🎨 界面设置 -->
            <div class="module" id="trModuleUISettings" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置 <span class="hint">— 自定义颜色和字体</span></div>
                    <div>
                        <button class="toggle-btn" id="trToggleUISettingsBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="trUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🎨 背景色</label>
                            <input type="color" id="trBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📦 卡片色</label>
                            <input type="color" id="trCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔘 按钮色</label>
                            <input type="color" id="trBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📝 文字色</label>
                            <input type="color" id="trTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔤 字体大小</label>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" id="trFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;">
                                <span id="trFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="trResetUIBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="trTotalCost">0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalIncome">0</div><div class="label">📊 总收入(万)</div></div>
                <div class="stat-item" id="trProfitStat"><div class="num" id="trTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalCount">0</div><div class="label">🌳 种植棵数</div></div>
                <div class="stat-item"><div class="num" id="trAvgProfit">0</div><div class="label">📊 平均利润/棵</div></div>
                <div class="stat-item" id="trRateStat"><div class="num" id="trWinRate">0%</div><div class="label">🏆 盈利率</div></div>
            </div>

            <!-- 当前种树 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">🌳 记录当前种树 <span class="hint" id="trCurrentLabel">第 1 棵</span></div>
                    <div><button class="btn-undo" id="trUndoBtn">↩️ 撤销</button></div>
                </div>
                <div class="module-body">
                    <div class="tree-current-box">
                        <div class="info-item">🌱 树苗成本: <span class="val" id="trSeedCost">45</span> 万</div>
                        <div class="info-item">🔄 基础摇树: <span class="val" id="trBaseShakes">6</span> 次</div>
                        <div class="info-item">📌 当前次数: <span class="val highlight" id="trCurrentShakes">6</span> 次</div>
                        <div class="info-item">🎯 已触发事件: <span class="val" id="trEventsDisplay">无</span></div>
                    </div>

                    <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;margin:8px 0 4px;">⚡ 特殊事件 (点击累加, 不限次数)</div>
                    <div class="tree-events-grid" id="trEventsGrid">
                        <button class="evt-btn" data-event="xiaozai">🍂 小灾 <span class="sub">(+1次)</span></button>
                        <button class="evt-btn" data-event="chongzai">🐛 虫灾 <span class="sub">(+2次)</span></button>
                        <button class="evt-btn" data-event="zaoshu">🌿 早熟 <span class="sub">(强制6次)</span></button>
                        <button class="evt-btn" data-event="none">⏭️ 无事件 <span class="sub">(重置)</span></button>
                    </div>

                    <!-- 元宝产出 -->
                    <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;margin:10px 0 4px;">💎 元宝产出 (点击记录)</div>

                    <!-- 第1行: 二药 + 五宝 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;" id="trLootGrid">
                        <button class="loot-btn" data-loot="eryao">💊 二药 <span class="count" id="tl-eryao">0</span></button>
                        <button class="loot-btn" data-loot="bishui">💧 避水珠 <span class="count" id="tl-bishui">0</span></button>
                        <button class="loot-btn" data-loot="dinghun">🔮 定魂珠 <span class="count" id="tl-dinghun">0</span></button>
                        <button class="loot-btn" data-loot="jingang">💎 金刚石 <span class="count" id="tl-jingang">0</span></button>
                        <button class="loot-btn" data-loot="yeguang">🌙 夜光珠 <span class="count" id="tl-yeguang">0</span></button>
                    </div>

                    <!-- 第2行: 龙鳞 + 宝石前4种 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="longlin">🐉 龙鳞 <span class="count" id="tl-longlin">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_hl">🖤 黑宝石 <span class="count" id="tl-baoshi_hl">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_tys">☀️ 太阳石 <span class="count" id="tl-baoshi_tys">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_yls">🌙 月亮石 <span class="count" id="tl-baoshi_yls">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_gms">💛 光芒石 <span class="count" id="tl-baoshi_gms">0</span></button>
                    </div>

                    <!-- 第3行: 宝石后4种 + 海马 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="baoshi_sls">💠 舍利子 <span class="count" id="tl-baoshi_sls">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_hmm">❤️ 红玛瑙 <span class="count" id="tl-baoshi_hmm">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_fcs">💚 翡翠石 <span class="count" id="tl-baoshi_fcs">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_xys">🟣 神秘石 <span class="count" id="tl-baoshi_xys">0</span></button>
                        <button class="loot-btn" data-loot="haima">🐴 海马 <span class="count" id="tl-haima">0</span></button>
                    </div>

                    <!-- 第4行: 金钱 + 经验 + 兽决 + 令牌 + 彩果 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="money">💰 金钱(万) <span class="count" id="tl-money">0</span></button>
                        <button class="loot-btn" data-loot="exp">📈 经验 <span class="count" id="tl-exp">0</span></button>
                        <button class="loot-btn" data-loot="shoujue">📜 兽决 <span class="count" id="tl-shoujue">0</span></button>
                        <button class="loot-btn" data-loot="lingpai">🎫 令牌 <span class="count" id="tl-lingpai">0</span></button>
                        <button class="loot-btn" data-loot="caiguo">🍎 彩果 <span class="count" id="tl-caiguo">0</span></button>
                    </div>

                    <!-- 第5行: 超级金柳露 + 珍珠 + 符石 + 符石卷轴 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="c66">🧪 超级金柳露 <span class="count" id="tl-c66">0</span></button>
                        <button class="loot-btn" data-loot="zhenzhu">🐚 珍珠 <span class="count" id="tl-zhenzhu">0</span></button>
                        <button class="loot-btn" data-loot="fushi">📿 符石 <span class="count" id="tl-fushi">0</span></button>
                        <button class="loot-btn" data-loot="fushi_juanzhou">📜 符石卷轴 <span class="count" id="tl-fushi_juanzhou">0</span></button>
                        <button class="loot-btn" data-loot="jinliu">🧪 金柳露 <span class="count" id="tl-jinliu">0</span></button>
                    </div>

                    <!-- 第6行: 卡片 + 4个空白占位 -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="kapian">🃏 卡片 <span class="count" id="tl-kapian">0</span></button>
                        <button class="loot-btn" data-loot="none" style="visibility:hidden;"></button>
                        <button class="loot-btn" data-loot="none" style="visibility:hidden;"></button>
                        <button class="loot-btn" data-loot="none" style="visibility:hidden;"></button>
                        <button class="loot-btn" data-loot="none" style="visibility:hidden;"></button>
                    </div>

                    <div style="background:#eef4fa;border-radius:12px;padding:6px 12px;margin-top:8px;font-size:0.8rem;color:#1f3b53;">
                        📦 当前产出: <span id="trCurrentLootSummary">无</span>
                    </div>
                </div>
            </div>

            <!-- 掉落物价值 -->
            <div class="module">
                <div class="module-header"><div class="title">⚙️ 掉落物价值 (万) <span class="hint">— 根据物价调整</span></div></div>
                <div class="module-body">
                    <div class="tree-price-grid" id="trPriceGrid" style="grid-template-columns:repeat(5,1fr);"></div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex-between">
                <span style="font-size:0.7rem;color:#3a5f7a;">🌳 记录完整产出后点击「结算此树」</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-complete" id="trCompleteBtn" style="border-radius:50px;padding:6px 20px;">🌳 结算此树</button>
                    <button class="btn-reset" id="trResetBtn" style="border-radius:50px;padding:6px 20px;">🗑️ 重置当前</button>
                </div>
            </div>

            <!-- 种树记录 -->
            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📜 种树记录 <span class="hint" id="trHistoryCount">共 0 棵</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn-analysis" id="trAnalysisToggleBtn" style="border-radius:50px;">📊 数据分析</button>
                    </div>
                </div>
                <div class="module-body">
                    <div class="analysis-panel" id="trAnalysisPanel" style="display:none;">
                        <div class="tree-analysis-grid" id="trAnalysisGrid">
                            <div class="a-item"><div class="a-num" id="taTotal">0</div><div class="a-label">总棵数</div></div>
                            <div class="a-item"><div class="a-num" id="taCost">0</div><div class="a-label">总成本(万)</div></div>
                            <div class="a-item"><div class="a-num" id="taIncome">0</div><div class="a-label">总收入(万)</div></div>
                            <div class="a-item a-profit" id="taProfitWrap"><div class="a-num" id="taProfit">0</div><div class="a-label">总利润(万)</div></div>
                            <div class="a-item"><div class="a-num" id="taRate">0%</div><div class="a-label">盈利率</div></div>
                        </div>
                        <div style="font-size:0.85rem;color:#5a7a94;text-align:center;padding:4px 0;" id="taSummary">总结: 尚未有种树记录，开始种树吧！</div>
                    </div>
                    <div class="table-wrap" style="max-height:300px;">
                        <table>
                            <thead><tr><th>#</th><th>📅 日期</th><th>🌱 成本</th><th>💰 收入</th><th>📈 利润</th><th>🔄 摇树</th><th>📦 产出</th><th>⚙️</th></tr></thead>
                            <tbody id="trHistoryBody"><tr><td colspan="8" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无种树记录</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        console.log('✅ 种树UI构建完成');
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        const container = document.getElementById('treePlantContainer');
        if (!container) return;

        // ===== UI设置 =====
        document.getElementById('trBgColor').addEventListener('input', function() {
            TreePlantModule.uiSettings.bgColor = this.value;
            TreePlantModule.applyUISettings();
            TreePlantModule.saveData();
        });
        document.getElementById('trCardColor').addEventListener('input', function() {
            TreePlantModule.uiSettings.cardBgColor = this.value;
            TreePlantModule.applyUISettings();
            TreePlantModule.saveData();
        });
        document.getElementById('trBtnColor').addEventListener('input', function() {
            TreePlantModule.uiSettings.btnColor = this.value;
            TreePlantModule.applyUISettings();
            TreePlantModule.saveData();
        });
        document.getElementById('trTextColor').addEventListener('input', function() {
            TreePlantModule.uiSettings.textColor = this.value;
            TreePlantModule.applyUISettings();
            TreePlantModule.saveData();
        });
        document.getElementById('trFontSize').addEventListener('input', function() {
            const val = parseInt(this.value);
            document.getElementById('trFontSizeDisplay').textContent = val;
            TreePlantModule.uiSettings.fontSize = val;
            TreePlantModule.applyUISettings();
            TreePlantModule.saveData();
        });
        document.getElementById('trResetUIBtn').addEventListener('click', function() {
            if (confirm('重置所有UI设置为默认值？')) {
                TreePlantModule.uiSettings = {
                    bgColor: '#eef2f7',
                    btnColor: '#4CAF50',
                    btnTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    textColor: '#1a1a2e',
                    fontSize: 14
                };
                document.getElementById('trBgColor').value = TreePlantModule.uiSettings.bgColor;
                document.getElementById('trCardColor').value = TreePlantModule.uiSettings.cardBgColor;
                document.getElementById('trBtnColor').value = TreePlantModule.uiSettings.btnColor;
                document.getElementById('trTextColor').value = TreePlantModule.uiSettings.textColor;
                document.getElementById('trFontSize').value = TreePlantModule.uiSettings.fontSize;
                document.getElementById('trFontSizeDisplay').textContent = TreePlantModule.uiSettings.fontSize;
                TreePlantModule.applyUISettings();
                TreePlantModule.saveData();
                alert('✅ UI设置已重置！');
            }
        });
        document.getElementById('trToggleUISettingsBtn').addEventListener('click', function() {
            const body = document.getElementById('trUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 事件按钮 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('#trEventsGrid .evt-btn');
            if (btn) {
                this.addEvent(btn.dataset.event);
                return;
            }
        });

        // ===== Loot按钮 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.loot-btn');
            if (btn) {
                const loot = btn.dataset.loot;
                if (loot && loot !== 'none') {
                    this.addLoot(loot);
                }
                return;
            }
        });

        // ===== 价格变化 =====
        container.addEventListener('change', (e) => {
            const input = e.target.closest('#trPriceGrid input');
            if (input) {
                const key = input.dataset.key;
                let val = parseFloat(input.value);
                if (isNaN(val) || val < 0) val = 0;
                this.prices[key] = val;
                this.saveData();
                this.render();
            }
        });

        // ===== 按钮 =====
        document.getElementById('trCompleteBtn').addEventListener('click', () => this.settle());
        document.getElementById('trResetBtn').addEventListener('click', () => this.reset());
        document.getElementById('trUndoBtn').addEventListener('click', () => this.undo());

        // ===== 数据分析 =====
        let analysisVisible = false;
        document.getElementById('trAnalysisToggleBtn').addEventListener('click', function() {
            analysisVisible = !analysisVisible;
            document.getElementById('trAnalysisPanel').style.display = analysisVisible ? 'block' : 'none';
            this.textContent = analysisVisible ? '📊 隐藏分析' : '📊 数据分析';
            this.classList.toggle('active', analysisVisible);
            if (analysisVisible) TreePlantModule.updateAnalysis();
        });
    },

    // ========== 核心业务 ==========
    addLoot(key) {
        if (this.current.isSettled) {
            alert('这棵树已结算，请开始新的记录！');
            return;
        }
        if (this.current.loot[key] === undefined) this.current.loot[key] = 0;
        this.current.loot[key]++;
        this.saveData();
        this.render();
    },

    addEvent(evt) {
        if (this.current.isSettled) {
            alert('这棵树已结算，请开始新的记录！');
            return;
        }

        if (evt === 'none') {
            this.current.events = [];
            this.current.shakes = this.current.baseShakes;
        } else {
            this.current.events.push(evt);
            this.current.shakes = this.current.baseShakes;
            let hasZaoshu = false;
            for (let e of this.current.events) {
                if (e === 'xiaozai') this.current.shakes += 1;
                else if (e === 'chongzai') this.current.shakes += 2;
                else if (e === 'zaoshu') {
                    hasZaoshu = true;
                }
            }
            if (hasZaoshu) {
                this.current.shakes = 6;
           
