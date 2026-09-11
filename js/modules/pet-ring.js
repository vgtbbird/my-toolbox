// ============================================================
//  🏃 跑宠环模块 - 完整版（烹饪/三药拆分 + 历史详情弹窗 + 重登标记）
//  功能：跑环记录 + 期望值计算 + 策略建议 + 100环结算弹窗 + 修炼点价值计入
//  新增：烹饪/三药拆分 | 历史详情弹窗显示每环数据 | 重登标记
// ============================================================
const PetRingModule = {
    id: 'petRing',
    sortState: { order: 'desc' },

    // ========== 数据 ==========
    storageKey: 'petRing',
    currentRunId: null, 
    records: [],
    history: [],
    prices: {},
    deductSettings: {},
    bookRewards: [],
    extraRewards: { points: 0, fruits: 0, furnitures: 0 },
    pendingSettle: null,
    exchangeRate: 0.08,
    fruitPrice: 80,
    pendingRelog: false,  // 🆕 是否有待标记的重登

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
        deductColor: '#d4a0a0'
    },

    // ========== 概率表 ==========
    taskProb: {
        find: 0.43,
        ring60: 0.10,
        ring70: 0.05,
        ring80: 0.05,
        flower: 0.04,
        cook: 0.08,       // 🆕 均分
        medicine: 0.08,   // 🆕 新增
        furn1: 0.07,
        furn2: 0.05,
        var_spec: 0.01
    },
    taskScore: {
        find: 1,
        ring60: 2,
        ring70: 3,
        ring80: 5,
        flower: 4,
        cook: 2,
        medicine: 2,
        furn1: 2,
        furn2: 5,
        var_spec: 10
    },
    taskLabel: {
        find: '找人',
        ring60: '60环',
        ring70: '70环',
        ring80: '80环',
        flower: '花卉乐器',
        cook: '烹饪',
        medicine: '三药',
        furn1: '1级家具',
        furn2: '2级家具',
        var_spec: '指定变异'
    },

    ITEM_TYPES: [
        { key: 'find', label: '找人', icon: '🔍', score: 1, defaultPrice: 0, color: '#2d6b9e' },
        { key: 'ring60', label: '60环', icon: '🔵', score: 2, defaultPrice: 1.5, color: '#3a7a4a' },
        { key: 'ring70', label: '70环', icon: '🟠', score: 3, defaultPrice: 3, color: '#b87a3a' },
        { key: 'ring80', label: '80环', icon: '🟣', score: 5, defaultPrice: 8, color: '#8f3a8f' },
        { key: 'flower', label: '花卉乐器', icon: '🌸', score: 4, defaultPrice: 2, color: '#c45a7a' },
        { key: 'cook', label: '烹饪', icon: '🍳', score: 2, defaultPrice: 0.8, color: '#3a9e7a' },
        { key: 'medicine', label: '三药', icon: '💊', score: 2, defaultPrice: 1.5, color: '#7a5a9e' },
        { key: 'furn1', label: '1级家具', icon: '🪑', score: 2, defaultPrice: 1, color: '#7a8a3a' },
        { key: 'furn2', label: '2级家具', icon: '🛋️', score: 5, defaultPrice: 3, color: '#8a6a3a' },
        { key: 'var_common', label: '非指定变异', icon: '🐉', score: 5, defaultPrice: 30, color: '#b45a3a' },
        { key: 'var_spec', label: '指定变异', icon: '⭐', score: 10, defaultPrice: 80, color: '#b43a7a' }
    ],

    DEDUCT_TYPES: [
        { key: 'skip', label: '跳过任务', icon: '⏭️', defaultDeduct: 20, defaultCost: 0 },
        { key: 'normal_pet', label: '交普通召唤兽', icon: '🐾', defaultDeduct: 15, defaultCost: 0.5 },
        { key: 'low_quality', label: '不足品质烹饪/三药', icon: '⚠️', defaultDeduct: 4, defaultCost: 0.3 }
    ],

    INITIAL_COST: 10,
   filterState: { dateFrom: '', dateTo: '', ringsMin: '', ringsMax: '', scoreMin: '', scoreMax: '', profitType: 'all' },

    // ========== 生命周期 ==========
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
        
        // 🆕 启动时间和时辰定时器
        if (this._timeTimer) clearInterval(this._timeTimer);
        this._timeTimer = setInterval(() => {
            this.updateTimeAndShichen();
        }, 1000);
        this.updateTimeAndShichen();
    },

    render() {
        const fruitInput = document.getElementById('prFruitPrice');
        if (fruitInput) {
            this.fruitPrice = parseFloat(fruitInput.value) || 80;
        }
        this.updateStats();
        this.updateHistory();
        this.updateAdvice();
        this.updateBookList();
        this.updateHistoryTable();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
        this.checkAutoSettle();
        this.updateRelogAnalysis();
        this.updateTimeAndShichen();  
    },

        // 🆕 更新时间和时辰显示
    updateTimeAndShichen() {
        const now = new Date();
        const timestamp = now.getTime();
        const shichen = this.getShichen(timestamp);
        
        // 当前时间
        const timeEl = document.getElementById('prCurrentTime');
        if (timeEl) {
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${h}:${m}:${s}`;
        }
        
         // 当前时辰（绿色）
        const shichenEl = document.getElementById('prCurrentShichen');
        if (shichenEl) {
            shichenEl.textContent = shichen.name + '时';
            shichenEl.style.color = '#2d6b2d';
        }
        
        // 下时辰（显示具体时辰名 + 倒计时，红色）
        const nextShichenEl = document.getElementById('prNextShichenCountdown');
        if (nextShichenEl) {
            const nextIndex = (shichen.index + 1) % 12;
            const nextName = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][nextIndex];
            const countdown = this.formatCountdown(shichen.secondsToNextShichen);
            nextShichenEl.textContent = `${nextName}时 ${countdown}`;
            nextShichenEl.style.color = '#c0392b';
        }
        
        // 系统刷新倒计时
        const refreshEl = document.getElementById('prNextRefreshCountdown');
        if (refreshEl) {
            refreshEl.textContent = this.formatCountdown(this.getNextRefreshCountdown());
        }
    },

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.currentRunId = data.currentRunId || null;
        if (!this.currentRunId) {
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }
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
            fontSize: 14,
            deductColor: '#d4a0a0'
        };
        this.pendingSettle = data.pendingSettle || null;
        this.exchangeRate = data.exchangeRate || 0.08;
        this.fruitPrice = data.fruitPrice || 80;
        this.pendingRelog = data.pendingRelog || false;

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
            exchangeRate: this.exchangeRate,
            fruitPrice: this.fruitPrice,
            pendingRelog: this.pendingRelog
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
            const color = s.deductColor || '#d4a0a0';
            el.style.setProperty('background', color, 'important');
            el.style.setProperty('background-color', color, 'important');
            el.style.setProperty('color', '#ffffff', 'important');
            el.style.setProperty('border', '1px solid ' + color, 'important');
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
            this.showFullSettleModal(stats);
        }
    },

    // ========== 获取任务标签（兼容旧数据） ==========
    getTaskLabel(key) {
        // 🆕 兼容旧数据：如果历史记录中有 cook 但没有 medicine，说明是旧数据
        // 在显示时统一处理
        if (key === 'cook') {
            // 检查当前是否在显示历史数据
            // 如果是旧数据（没有 medicine 字段），显示"烹饪三药"
            // 新数据显示"烹饪"
            return '烹饪三药';  // 默认兼容显示
        }
        if (key === 'medicine') {
            return '三药';
        }
        const type = this.ITEM_TYPES.find(t => t.key === key);
        return type ? type.label : key;
    },

// ========== 100环强制结算弹窗（优化版：自动判定等级） ==========
showFullSettleModal(stats) {
    const fruitPrice = this.fruitPrice || 80;
    const furnPrice = parseFloat(document.getElementById('prFurniturePrice')?.value) || 3.5;

    const pointsValue = stats.totalPoints * (fruitPrice / 170);
    const points200Value = (200 / 170) * fruitPrice;
    const fruitValue = fruitPrice;
    const furnValue = furnPrice;

    // 🆕 根据总积分自动判定书铁等级
    const score = stats.totalScore;
    let autoLevel = 90;
    let autoLevelLabel = '90级';
    if (score >= 222) { autoLevel = 150; autoLevelLabel = '150级'; }
    else if (score >= 212) { autoLevel = 140; autoLevelLabel = '140级'; }
    else if (score >= 202) { autoLevel = 130; autoLevelLabel = '130级'; }
    else if (score >= 192) { autoLevel = 120; autoLevelLabel = '120级'; }
    else if (score >= 182) { autoLevel = 110; autoLevelLabel = '110级'; }
    else if (score >= 172) { autoLevel = 100; autoLevelLabel = '100级'; }
    else { autoLevel = 90; autoLevelLabel = '90级'; }

    const bookTypeList = ['剑', '刀', '枪', '锤', '斧', '扇', '鞭', '魔棒', '双环', '双剑', '飘带', '爪刺', '伞', '灯笼', '法杖', '宝珠', '巨剑', '弓', '棍', '铠甲', '女衣', '项链', '发钗', '头盔', '腰带', '鞋子'];

    let currentBookType = '书';
    let currentLevel = autoLevel;  // 🆕 使用自动判定的等级
    let currentBookName = '';

    const modalHTML = `
        <div style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:560px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">🎯 100环结算报告</h3>
            
            <!-- 摘要 -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 12px;background:#f0f5fb;border-radius:12px;margin-bottom:14px;font-size:0.8rem;border:1px solid #dce5ef;">
                <div><span style="color:#5a7a94;">总成本</span> <strong>${stats.totalCost.toFixed(1)}万</strong></div>
                <div><span style="color:#5a7a94;">总积分</span> <strong style="color:${score>=192?'#2d6b2d':'#c0392b'};">${stats.totalScore}</strong></div>
                <div><span style="color:#5a7a94;">修炼点</span> <strong>${stats.totalPoints}</strong> <span style="color:#8ab0c8;font-size:0.7rem;">（≈${(stats.totalPoints/170).toFixed(2)}果）</span></div>
            </div>

            <!-- 修炼点价值 -->
            <div style="margin-bottom:14px;padding:8px 14px;background:#e8f0e8;border-radius:10px;border:1px solid #5f8f5f;">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;">
                    <span style="color:#1f3b53;">📈 修炼点价值</span>
                    <span style="font-weight:700;color:#2d6b2d;">${pointsValue.toFixed(1)}万</span>
                </div>
            </div>

            <!-- 📘 书铁奖励（自动判定等级） -->
            <div style="margin-bottom:14px;padding:12px 16px;background:#f0f5fb;border-radius:16px;border:1px solid #dce5ef;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;">📘 书铁奖励</div>
                    <div style="font-size:0.7rem;background:#1f344b;padding:2px 12px;border-radius:30px;color:#f0d060;font-weight:600;">
                        🎯 ${autoLevelLabel}
                    </div>
                </div>
                
                <!-- 书/铁切换 -->
                <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap;">
                    <button class="ph-book-type-btn active" data-type="书" style="padding:4px 20px;border-radius:14px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:600;">📕 书</button>
                    <button class="ph-book-type-btn" data-type="铁" style="padding:4px 20px;border-radius:14px;border:2px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.85rem;font-weight:600;">📗 铁</button>
                </div>

                <!-- 书种类（仅书时显示） -->
                <div id="settleBookNameContainer" style="margin-bottom:8px;">
                    <div style="font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">选择书种类</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;" id="settleBookNameList">
                        ${bookTypeList.map(t => `
                            <button class="ph-book-name-btn" data-name="${t}" style="padding:2px 10px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.65rem;margin:2px;">${t}</button>
                        `).join('')}
                    </div>
                </div>

                <!-- 价值输入 -->
                <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <label style="font-weight:500;font-size:0.8rem;color:#1f3b53;">💰 价值(万)</label>
                    <input type="number" id="settleBookValue" placeholder="输入价值" style="flex:1;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                </div>
                <div style="font-size:0.65rem;color:#8ab0c8;margin-top:4px;" id="settleBookDisplay">💡 当前选择：<span id="settleBookDisplayText">${autoLevelLabel} 书</span></div>
            </div>

            <!-- 🎁 三选一 -->
            <div style="margin-bottom:14px;padding:12px 16px;background:#f0f5fb;border-radius:16px;border:1px solid #dce5ef;">
                <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;margin-bottom:8px;">🎁 随机奖励（三选一）</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;cursor:pointer;padding:6px 12px;background:#eef4fa;border-radius:12px;border:2px solid #4CAF50;" class="reward-option" data-value="points200">
                        <input type="radio" name="rewardType" value="points200" checked> 200修炼点（≈${points200Value.toFixed(1)}万）
                    </label>
                    <label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;cursor:pointer;padding:6px 12px;background:#eef4fa;border-radius:12px;border:2px solid transparent;" class="reward-option" data-value="fruit">
                        <input type="radio" name="rewardType" value="fruit"> 修炼果×1（${fruitValue.toFixed(1)}万）
                    </label>
                    <label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;cursor:pointer;padding:6px 12px;background:#eef4fa;border-radius:12px;border:2px solid transparent;" class="reward-option" data-value="furniture">
                        <input type="radio" name="rewardType" value="furniture"> 家具图×1（${furnValue.toFixed(1)}万）
                    </label>
                </div>
            </div>

            <!-- 预览 -->
            <div style="padding:10px 16px;background:#f5f8fc;border-radius:12px;margin-bottom:14px;border:1px solid #dce5ef;">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:0.85rem;">
                    <span style="color:#5a7a94;">📊 收入合计</span>
                    <span style="font-weight:700;color:#1f3b53;" id="settlePreviewTotal">修炼点${pointsValue.toFixed(1)} + 书铁0 + 奖励0 = ${pointsValue.toFixed(1)}万</span>
                </div>
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:0.85rem;margin-top:2px;">
                    <span style="color:#5a7a94;">💰 预期利润</span>
                    <span style="font-weight:700;" id="settlePreviewProfit">${(pointsValue - stats.totalCost).toFixed(1)}万</span>
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;flex-wrap:wrap;">
                <button class="btn-cancel" id="settleFullCancel" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">取消</button>
                <button class="btn-confirm" id="settleFullConfirm" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#4c7a5c;color:white;">✅ 确认结算</button>
            </div>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'settleFullOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';
    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);

    // ===== 事件绑定 =====
    const bookTypeBtns = overlay.querySelectorAll('.ph-book-type-btn');
    const bookNameList = document.getElementById('settleBookNameList');
    const bookNameContainer = document.getElementById('settleBookNameContainer');

    // 书/铁切换
    bookTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            bookTypeBtns.forEach(b => {
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            this.style.background = '#4CAF50';
            this.style.borderColor = '#4CAF50';
            this.style.color = '#fff';
            currentBookType = this.dataset.type;
            // 铁时隐藏书种类选择
            bookNameContainer.style.display = currentBookType === '书' ? 'block' : 'none';
            updateDisplayText();
            updatePreview();
        });
    });

    // 书种类点击
    bookNameList.querySelectorAll('.ph-book-name-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            bookNameList.querySelectorAll('.ph-book-name-btn').forEach(b => {
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            this.style.background = '#4CAF50';
            this.style.borderColor = '#4CAF50';
            this.style.color = '#fff';
            currentBookName = this.dataset.name;
            updateDisplayText();
            updatePreview();
        });
    });

    // 价值输入变化
    document.getElementById('settleBookValue').addEventListener('input', updatePreview);

    // 随机奖励变化
    overlay.querySelectorAll('input[name="rewardType"]').forEach(el => {
        el.addEventListener('change', updatePreview);
    });

    function updateDisplayText() {
        const typeText = currentBookType === '书' ? '📕 书' : '📗 铁';
        let detailText = '';
        if (currentBookType === '书') {
            const levelLabel = autoLevel + '级';
            const nameLabel = currentBookName || '请选择';
            detailText = `${typeText} ${levelLabel} ${nameLabel}`;
        } else {
            const levelLabel = autoLevel === 160 ? '战魄' : autoLevel + '级铁';
            detailText = `${typeText} ${levelLabel}`;
        }
        document.getElementById('settleBookDisplayText').textContent = detailText;
    }

    function updatePreview() {
        const bookValue = parseFloat(document.getElementById('settleBookValue').value) || 0;
        const rewardType = overlay.querySelector('input[name="rewardType"]:checked')?.value || 'points200';

        const pointsVal = stats.totalPoints * (fruitPrice / 170);
        let rewardVal = 0, rewardLabel = '';
        if (rewardType === 'points200') { rewardVal = (200/170)*fruitPrice; rewardLabel = '200修炼点'; }
        else if (rewardType === 'fruit') { rewardVal = fruitPrice; rewardLabel = '修炼果'; }
        else if (rewardType === 'furniture') { rewardVal = furnPrice; rewardLabel = '家具图'; }

        const totalIncome = pointsVal + bookValue + rewardVal;
        const profit = totalIncome - stats.totalCost;

        const levelLabel = autoLevel + '级';
        const bookLabel = currentBookType === '书' ? `${levelLabel}${currentBookName || '书'}` : `${levelLabel}铁`;

        document.getElementById('settlePreviewTotal').textContent = 
            `修炼点${pointsVal.toFixed(1)} + ${bookLabel}(${bookValue}万) + ${rewardLabel}(${rewardVal.toFixed(1)}万) = ${totalIncome.toFixed(1)}万`;
        document.getElementById('settlePreviewProfit').textContent = `${profit >= 0 ? '✅' : '❌'} ${profit.toFixed(1)}万`;
        document.getElementById('settlePreviewProfit').style.color = profit >= 0 ? '#2d6b2d' : '#c0392b';
    }

    // 初始化
    updateDisplayText();
    updatePreview();

    // 取消
    document.getElementById('settleFullCancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // 确认结算
    document.getElementById('settleFullConfirm').addEventListener('click', () => {
        const bookType = currentBookType;
        const bookLevel = autoLevel;
        const bookNameInput = currentBookName;
        const bookValue = parseFloat(document.getElementById('settleBookValue').value) || 0;

        if (bookLevel <= 0) { alert('请选择书铁等级！'); return; }
        if (bookValue <= 0) { alert('请填写书铁价值！'); return; }
        if (bookType === '书' && !bookNameInput) { alert('请选择书种类！'); return; }

        let bookDisplayName = '';
        if (bookType === '铁') {
            bookDisplayName = bookLevel === 160 ? '战魄' : `${bookLevel}级铁`;
        } else {
            bookDisplayName = `${bookLevel}级${bookNameInput}书`;
        }

        const rewardType = overlay.querySelector('input[name="rewardType"]:checked')?.value || 'points200';
        const pointsVal = stats.totalPoints * (fruitPrice / 170);

        let rewardValue = 0, rewardLabel = '';
        if (rewardType === 'points200') { rewardValue = (200/170)*fruitPrice; rewardLabel = '200修炼点'; }
        else if (rewardType === 'fruit') { rewardValue = fruitPrice; rewardLabel = '1个修炼果'; }
        else if (rewardType === 'furniture') { rewardValue = furnPrice; rewardLabel = '家具图×1'; }

        const totalIncome = pointsVal + bookValue + rewardValue;
        const profit = totalIncome - stats.totalCost;
        const typeCount = stats.typeCount || {};
        const rewardsDesc = `${bookDisplayName}（${bookValue}万） + ${rewardLabel}（${rewardValue.toFixed(1)}万） + 修炼点${stats.totalPoints}点（${pointsVal.toFixed(1)}万）`;

        const ringsData = this.records.map(r => ({
            taskIndex: r.taskIndex,
            typeKey: r.typeKey,
            label: this.ITEM_TYPES.find(t => t.key === r.typeKey)?.label || r.typeKey,
            cost: r.cost,
            score: r.score,
            ringPoints: r.ringPoints,
            isDeduct: r.isDeduct || false,
            isRelog: r.isRelog || false,
            date: r.date,
            // 🆕 时辰参数
            timestamp: r.timestamp || null,
            shichen: r.shichen || '',
            shichenIndex: r.shichenIndex !== undefined ? r.shichenIndex : -1,
            halfHour: r.halfHour !== undefined ? r.halfHour : -1,
            secondsInHalfHour: r.secondsInHalfHour !== undefined ? r.secondsInHalfHour : -1,
            isDaytime: r.isDaytime || false,
            timeStr: r.timeStr || ''
        }));

        const entry = {
            date: new Date().toLocaleString(),
            ringCount: stats.ringCount,
            totalCost: stats.totalCost,
            totalScore: stats.totalScore,
            totalPoints: stats.totalPoints,
            totalIncome: totalIncome,
            profit: profit,
            bookIncome: bookValue,
            bookDisplayName: bookDisplayName,
            bookType: bookType,
            bookLevel: bookLevel,
            bookName: bookNameInput,
            furnitureIncome: rewardType === 'furniture' ? rewardValue : 0,
            fruitIncome: rewardType === 'points200' || rewardType === 'fruit' ? rewardValue : 0,
            pointsValue: pointsVal,
            isComplete: true,
            typeCount: typeCount,
            rewards: rewardsDesc,
            exchangeRate: this.exchangeRate,
            rewardType: rewardType,
            prediction20: this._prediction20 || null,
            rings: ringsData,
            relogCount: ringsData.filter(r => r.isRelog).length
        };

        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.pendingRelog = false;
        this.saveData();

        overlay.remove();
        this.showSettleModal(entry);
        this.updateStats();
        this.updateHistory();
        this.updateAdvice();
        this.updateBookList();
        this.updateHistoryTable();

        const container = document.getElementById('petRingContainer');
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
},

    // ========== 结算准备 ==========
    prepareSettle() {
        const stats = this.calcStats();
        const income = this.calcIncome(stats);
        if (stats.ringCount >= 100) {
            return;
        } else {
            this.quickSettle(stats, income);
        }
    },

    // ========== 快速结算（提前结束） ==========
    quickSettle(stats, income) {
        const fruitPrice = this.fruitPrice || 80;
        const pointsValue = stats.totalPoints * (fruitPrice / 170);
        const rewards = this.bookRewards.map(b => `${b.name}(${b.value}万)`).join(' + ');

        // 🆕 保存 rings 详细数据
        const ringsData = this.records.map(r => ({
            taskIndex: r.taskIndex,
            typeKey: r.typeKey,
            label: this.ITEM_TYPES.find(t => t.key === r.typeKey)?.label || r.typeKey,
            cost: r.cost,
            score: r.score,
            ringPoints: r.ringPoints,
            isDeduct: r.isDeduct || false,
            isRelog: r.isRelog || false,
            date: r.date,
            // 🆕 时辰参数
            timestamp: r.timestamp || null,
            shichen: r.shichen || '',
            shichenIndex: r.shichenIndex !== undefined ? r.shichenIndex : -1,
            halfHour: r.halfHour !== undefined ? r.halfHour : -1,
            secondsInHalfHour: r.secondsInHalfHour !== undefined ? r.secondsInHalfHour : -1,
            isDaytime: r.isDaytime || false,
            timeStr: r.timeStr || ''
        }));

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
            exchangeRate: this.exchangeRate,
            pointsValue: pointsValue,
            bookDisplayName: null,
            rewardType: null,
            prediction20: this._prediction20 || null,
            rings: ringsData,  // 🆕 保存每环详细数据
            relogCount: ringsData.filter(r => r.isRelog).length  // 🆕 重登次数
        };
        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.pendingRelog = false;
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

    // ========== 确认结算 ==========
    confirmSettle() {
        alert('请使用结算弹窗完成结算');
    },

    // ========== 显示结算结果弹窗 ==========
    showSettleModal(entry) {
        const profit = entry.profit;
        const rmb = profit * this.exchangeRate;
        const fruitCount = entry.totalPoints / 170;
        document.getElementById('settleModalTitle').textContent = entry.isComplete ? '🎯 结算报告' : '⏹️ 提前结束结算';

        let descText = `💰 总成本 ${entry.totalCost.toFixed(1)}万 | 📈 利润 ${profit.toFixed(1)}万 (≈${rmb.toFixed(2)}元) | 📌 ${entry.ringCount}环 | ⭐ 总积分 ${entry.totalScore}`;
        document.getElementById('settleModalDesc').textContent = descText;

        let bodyHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:8px 0;">
                <span>📌 总环数: <strong>${entry.ringCount}</strong></span>
                <span>⭐ 总积分: <strong>${entry.totalScore}</strong></span>
                <span>💰 总成本: <strong>${entry.totalCost.toFixed(1)}万</strong></span>
                <span>📈 修炼点: <strong>${entry.totalPoints}</strong> (≈${fruitCount.toFixed(2)}果)</span>
                <span style="grid-column:1/-1;padding:4px 8px;background:#f0f5fb;border-radius:8px;font-size:0.85rem;">
                    💎 修炼点价值: <strong>${(entry.pointsValue || 0).toFixed(1)}万</strong>
                    <span style="font-size:0.7rem;color:#5a7a94;">（${entry.totalPoints}点 × 修炼果单价/170）</span>
                </span>
        `;

        if (entry.bookDisplayName) {
            bodyHTML += `
                <span style="grid-column:1/-1;padding:2px 0;">
                    📘 书铁: <strong>${entry.bookDisplayName}</strong> 价值 <strong>${(entry.bookIncome || 0).toFixed(1)}万</strong>
                </span>
            `;
        }

        let rewardLabel = '';
        if (entry.rewardType === 'points200') {
            rewardLabel = '200修炼点';
        } else if (entry.rewardType === 'fruit') {
            rewardLabel = '1个修炼果';
        } else if (entry.rewardType === 'furniture') {
            rewardLabel = '家具图×1';
        }
        const rewardValue = (entry.fruitIncome || 0) + (entry.furnitureIncome || 0);
        if (rewardLabel) {
            bodyHTML += `
                <span style="grid-column:1/-1;padding:2px 0;">
                    🎁 随机奖励: <strong>${rewardLabel}</strong> 价值 <strong>${rewardValue.toFixed(1)}万</strong>
                </span>
            `;
        }

        // 🆕 显示重登次数
        if (entry.relogCount > 0) {
            bodyHTML += `
                <span style="grid-column:1/-1;padding:2px 0;color:#dbbd7c;">
                    🔁 下线重登: <strong>${entry.relogCount}</strong> 次
                </span>
            `;
        }

        bodyHTML += `
                <span style="grid-column:1/-1;padding-top:8px;border-top:1px solid #dce5ef;font-size:1rem;text-align:center;color:${profit>=0?'#2d6b2d':'#c0392b'};">
                    ${profit >= 0 ? '✅' : '❌'} 利润: <strong>${profit.toFixed(1)}万</strong> (≈${rmb.toFixed(2)}元)
                </span>
            </div>
        `;

        document.getElementById('settleModalBody').innerHTML = bodyHTML;
        document.getElementById('settleModal').classList.add('show');
    },

    // ========== 时辰系统 ==========
    // 🆕 获取当前时辰信息
    getShichen(timestamp) {
        const date = new Date(timestamp);
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const totalSeconds = minute * 60 + second;
        
        // 每半小时（1800秒）一轮12时辰
        const halfHourIndex = Math.floor(totalSeconds / 1800);
        const secondsInHalfHour = totalSeconds % 1800;
        
        // 每个时辰150秒（2.5分钟）
        const shichenIndex = Math.floor(secondsInHalfHour / 150);
        
        const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        return {
            name: shichenNames[shichenIndex],
            index: shichenIndex,
            halfHour: halfHourIndex,
            secondsInHalfHour: secondsInHalfHour,
            secondsToNextShichen: 150 - (secondsInHalfHour % 150),
            isDaytime: shichenIndex >= 4 && shichenIndex <= 9
        };
    },

    // 🆕 获取下次系统刷新倒计时（每10分钟一次）
    getNextRefreshCountdown() {
        const now = new Date();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        
        const nextRefreshMinute = Math.ceil((minute + 1) / 10) * 10;
        const minutesLeft = nextRefreshMinute - minute - 1;
        const secondsLeft = 60 - second;
        
        return minutesLeft * 60 + secondsLeft;
    },

    // 🆕 格式化倒计时
    formatCountdown(seconds) {
        if (seconds < 0) seconds = 0;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
        if (f.scoreMin) data = data.filter(h => (h.totalScore || 0) >= parseInt(f.scoreMin));
        if (f.scoreMax) data = data.filter(h => (h.totalScore || 0) <= parseInt(f.scoreMax));
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

    // ========== 期望值计算 ==========
    calculateExpectation() {
        const totalRings = 100;
        const runRings = this.records.length;
        const stats = this.calcStats();
        const currentScore = stats.totalScore;
        const remaining = totalRings - runRings;

        if (runRings === 0) {
            return {
                currentScore: 0,
                runRings: 0,
                remaining: 100,
                expectedScore: 200,
                details: [],
                canPredict: false
            };
        }

        const currentCounts = {};
        for (let r of this.records) {
            const key = r.typeKey;
            if (key && this.taskProb[key] !== undefined) {
                currentCounts[key] = (currentCounts[key] || 0) + 1;
            }
        }

        let expectedScore = currentScore;
        let details = [];
        const taskKeys = Object.keys(this.taskProb);

        for (let key of taskKeys) {
            const prob = this.taskProb[key];
            const score = this.taskScore[key];
            const label = this.taskLabel[key] || key;
            const already = currentCounts[key] || 0;

            const remainingExpected = remaining * prob;
            const expectedContribution = remainingExpected * score;
            expectedScore += expectedContribution;

            details.push({
                key: key,
                label: label,
                prob: prob,
                score: score,
                already: already,
                remainingExpected: remainingExpected,
                expectedContribution: expectedContribution
            });
        }

        return {
            currentScore: currentScore,
            runRings: runRings,
            remaining: remaining,
            expectedScore: expectedScore,
            details: details,
            canPredict: true
        };
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('petRingContainer');
        if (!container) return;

        container.innerHTML = `
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
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">⚠️ 扣分按钮</label>
                            <input type="color" id="prDeductColor" value="${this.uiSettings.deductColor || '#d4a0a0'}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="prResetUIBtn" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
                <div class="stat-item"><div class="num" id="prCurrentTime">--:--:--</div><div class="label">🕐 当前时间</div></div>
                <div class="stat-item"><div class="num" id="prCurrentShichen">--</div><div class="label">⏱️ 当前时辰</div></div>
                <div class="stat-item"><div class="num" id="prNextShichenCountdown" style="font-size:0.85rem;">--</div><div class="label">⏳ 下时辰</div></div>
                <div class="stat-item"><div class="num" id="prNextRefreshCountdown">--:--</div><div class="label">🔄 系统刷新</div></div>
                <div class="stat-item"><div class="num" id="prTotalCost">10.0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="prTotalScore">0</div><div class="label">⭐ 总积分</div></div>
                <div class="stat-item">
                    <div class="num" id="prRingCount">0 / 100 剩</div>
                    <div class="label">📌 当前/剩余环数</div>
                </div>
            </div>

            <!-- 🔁 重登实时分析（放在任务类型上面） -->
<div id="prRelogAnalysis" style="font-size:0.85rem;color:#1f3b53;padding:6px 12px;background:#fdf8ee;border-radius:10px;margin-bottom:8px;border:1px solid #f0e8d0;font-weight:600;">
    🔁 等待重登标记...
</div>

            <div class="module" id="prModuleTask">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span class="hint">— 点击记录一环</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
<button class="btn-relog" id="prMarkRelogBtn" style="background:#dbbd7c;color:#1f344b;border:none;padding:4px 16px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.7rem;">🔁 标记下线重登</button>
<span id="prRelogStatus" style="font-size:0.7rem;color:#5a7a94;display:flex;align-items:center;">无待标记</span>
<button class="btn-relog" id="prCancelRelogBtn" style="background:#b45f5f;color:#fff;border:none;padding:4px 12px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.65rem;display:none;">↩️ 撤销重登</button>
                        <button class="btn-undo" id="prUndoBtn">↩️ 撤销</button>
                        <button class="toggle-btn" id="prToggleTaskBtn">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="prTaskBody">
                    <div class="task-grid" id="prTaskGrid"></div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding-top:6px;border-top:1px solid #dce5ef;">
                        <span style="font-weight:600;font-size:0.75rem;color:#1f3b53;">⚙️ 扣分设置</span>
                        <button class="toggle-btn" id="prToggleDeductBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:1px 12px;font-size:0.6rem;cursor:pointer;font-weight:600;color:#1f3b53;">👁️ 隐藏</button>
                    </div>
                    <div class="deduct-settings-inline" id="prDeductSettings" style="margin-top:4px;"></div>
                </div>
            </div>
                        <div class="module" id="prModuleHistory">
                <div class="module-header">
                    <div class="title">📜 本轮记录 <span class="hint" id="prRingInfo">共0环</span></div>
                    <button class="toggle-btn" id="prToggleHistoryBtn">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="prHistoryBody">
                    <div class="history-section" id="prHistoryList" style="max-height:200px;overflow-y:auto;"><div class="empty-history">暂无记录</div></div>
                    <div style="text-align:right;margin-top:4px;">
                        <button class="btn-small" id="prViewAllRingsBtn" style="background:#6b8baa;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;">📋 查看全部</button>
                    </div>
                </div>
            </div>

            

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
                        <div class="income-item"><label>💎 修炼果单价</label><input type="number" step="0.1" min="0" id="prFruitPrice" value="${this.fruitPrice || 80}"><span class="unit">万</span></div>
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



            <div class="flex-between">
                <span style="font-size:0.7rem;color:#3a5f7a;">💡 点击任务按钮记录一环，满100环自动结算</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-end" id="prEndBtn" style="background:#b48b5f;color:#fff;border:none;padding:5px 16px;border-radius:40px;font-weight:600;cursor:pointer;font-size:0.75rem;">⏹️ 提前结束</button>
                    <button class="btn-reset" id="prResetBtn" style="background:#b45f5f;color:#fff;border:none;padding:5px 16px;border-radius:40px;font-weight:600;cursor:pointer;font-size:0.75rem;">🗑️ 重置本轮</button>
                </div>
            </div>

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
                        <div id="prAnaPredictionCompare" style="padding:4px 0;margin:8px 0;"></div>
                        <div class="task-stats-row" id="prTaskStatsRow"></div>
                        <div id="prShichenAnalysis"></div>
                        <div class="filter-row">
                            <div class="filter-item"><label>📅 日期从</label><input type="date" id="prFilterDateFrom"></div>
                            <div class="filter-item"><label>到</label><input type="date" id="prFilterDateTo"></div>
                            <div class="filter-item"><label>📌 环数</label><input type="number" id="prFilterRingsMin" placeholder="≥" style="width:50px;"><span>-</span><input type="number" id="prFilterRingsMax" placeholder="≤" style="width:50px;"></div>
                           <div class="filter-item"><label>⭐ 积分</label><input type="number" id="prFilterScoreMin" placeholder="≥" style="width:50px;"><span>-</span><input type="number" id="prFilterScoreMax" placeholder="≤" style="width:50px;"></div>
                            <div class="filter-item"><label>📈 利润</label><select id="prFilterProfitType"><option value="all">全部</option><option value="positive">盈利</option><option value="negative">亏损</option></select></div>
                            <div class="filter-item"><button class="btn-filter" id="prApplyFilterBtn">应用筛选</button><button class="btn-filter reset" id="prResetFilterBtn">重置</button></div>
                        </div>
                    </div>
                    <div class="table-wrap" style="max-height:320px;overflow-y:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:36px;min-width:36px;">#</th>
                                    <th style="min-width:100px;cursor:pointer;" id="prSortHeader">📅 日期 <span id="prSortIcon">↓</span></th>
                                    <th style="min-width:50px;">📌 环数</th>
                                    <th style="min-width:55px;">⭐ 积分</th>
                                    <th style="min-width:60px;">💰 成本</th>
                                    <th style="min-width:80px;">📈 修炼点</th>
                                    <th style="min-width:100px;">📘 书铁</th>
                                    <th style="min-width:80px;">🎁 随机奖励</th>
                                    <th style="min-width:60px;">💰 收入</th>
                                    <th style="min-width:60px;">📈 利润</th>
                                    <th style="min-width:52px;">📊 详情</th>
                                    <th style="min-width:52px;">⚙️</th>
                                </tr>
                            </thead>
                            <tbody id="prHistoryTableBody">
                                <tr><td colspan="12" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无已结算记录</td></tr>
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
        const deductColorEl = document.getElementById('prDeductColor');
        if (deductColorEl) {
            deductColorEl.addEventListener('input', function() {
                PetRingModule.uiSettings.deductColor = this.value;
                PetRingModule.applyUISettings();
                PetRingModule.render();
                PetRingModule.saveData();
            });
        }
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
                    fontSize: 14,
                    deductColor: '#d4a0a0'
                };
                document.getElementById('prBgColor').value = PetRingModule.uiSettings.bgColor;
                document.getElementById('prCardColor').value = PetRingModule.uiSettings.cardBgColor;
                document.getElementById('prBtnColor').value = PetRingModule.uiSettings.btnColor;
                document.getElementById('prTextColor').value = PetRingModule.uiSettings.textColor;
                document.getElementById('prDeductColor').value = PetRingModule.uiSettings.deductColor;
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

// ===== 🆕 标记下线重登 =====
document.getElementById('prMarkRelogBtn').addEventListener('click', function() {
    if (PetRingModule.pendingRelog) {
        alert('已有待标记的重登，请先记录当前环再标记下一环');
        return;
    }
    PetRingModule.pendingRelog = true;
    const nextIndex = PetRingModule.records.length + 1;
    document.getElementById('prRelogStatus').textContent = `⏳ 第${nextIndex}环待标记 🔁`;
    document.getElementById('prRelogStatus').style.color = '#dbbd7c';
    document.getElementById('prCancelRelogBtn').style.display = 'inline-block';  // 🆕 加这行
    PetRingModule.updateRelogAnalysis(); 
});

        // ===== 🆕 撤销重登标记 =====
document.getElementById('prCancelRelogBtn').addEventListener('click', function() {
    if (!PetRingModule.pendingRelog) {
        alert('当前没有待标记的重登');
        return;
    }
    PetRingModule.pendingRelog = false;
    document.getElementById('prRelogStatus').textContent = '无待标记';
    document.getElementById('prRelogStatus').style.color = '#5a7a94';
    document.getElementById('prCancelRelogBtn').style.display = 'none';
    PetRingModule.updateRelogAnalysis();
});

        // ===== 确认结算 =====
        document.getElementById('prConfirmSettleBtn').addEventListener('click', () => {
            const stats = this.calcStats();
            if (stats.ringCount === 0) {
                alert('还没有任何记录！');
                return;
            }
            if (stats.ringCount >= 100) {
                this.checkAutoSettle();
                return;
            }
            const income = this.calcIncome(stats);
            this.quickSettle(stats, income);
        });

        // ===== 扣分设置折叠 =====
        document.getElementById('prToggleDeductBtn')?.addEventListener('click', function() {
            const body = document.getElementById('prDeductSettings');
            if (body) {
                const isHidden = body.style.display === 'none';
                body.style.display = isHidden ? 'flex' : 'none';
                body.classList.toggle('hidden');
                this.textContent = isHidden ? '👁️ 隐藏' : '👁️ 显示';
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

                // ===== 🆕 查看本轮全部记录 =====
        const viewAllBtn = document.getElementById('prViewAllRingsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllRingsModal());
        }

        // ===== 提前结束 =====
        document.getElementById('prEndBtn').addEventListener('click', () => {
            const stats = this.calcStats();
            if (stats.ringCount === 0) {
                alert('还没有任何记录！');
                return;
            }
            if (stats.ringCount >= 100) {
                alert('已满100环，请使用结算弹窗完成结算');
                this.checkAutoSettle();
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
                this.pendingRelog = false;
                this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                document.getElementById('prRelogStatus').textContent = '无待标记';
                document.getElementById('prRelogStatus').style.color = '#5a7a94';
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

        // ===== 奖励删除 =====
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
        document.getElementById('prFruitPrice').addEventListener('change', () => {
            const val = parseFloat(document.getElementById('prFruitPrice').value) || 80;
            PetRingModule.fruitPrice = val;
            PetRingModule.saveData();
            PetRingModule.render();
        });
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
            this.filterState.scoreMin = document.getElementById('prFilterScoreMin').value || '';
            this.filterState.scoreMax = document.getElementById('prFilterScoreMax').value || '';
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
            document.getElementById('prFilterScoreMin').value = '';
            document.getElementById('prFilterScoreMax').value = '';
            document.getElementById('prFilterProfitType').value = 'all';
            this.filterState = { dateFrom: '', dateTo: '', ringsMin: '', ringsMax: '', scoreMin: '', scoreMax: '', profitType: 'all' };
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

        // ===== 🆕 历史表格详情按钮 - 弹窗显示每环数据 =====
        document.getElementById('prHistoryTableBody').addEventListener('click', (e) => {
            const btn = e.target.closest('.detail-toggle');
            if (btn) {
                const idx = parseInt(btn.dataset.idx);
                if (!isNaN(idx) && idx >= 0 && idx < this.history.length) {
                    this.showRingsDetailModal(this.history[idx]);
                }
                return;
            }
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
            }
        });

        // ===== 排序按钮 =====
        document.getElementById('prSortHeader')?.addEventListener('click', function() {
            PetRingModule.sortState.order = PetRingModule.sortState.order === 'desc' ? 'asc' : 'desc';
            PetRingModule.updateHistoryTable();
        });
    },

// 🆕 显示每环详细数据弹窗（兼容旧数据）
showRingsDetailModal(entry) {
    if (!entry) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';

    let html = `
        <div style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:650px;width:95%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">📊 ${entry.ringCount || 0}环 详细数据</h3>
            <div style="font-size:0.8rem;color:#5a7a94;margin-bottom:8px;">${entry.date || '未知日期'}</div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;padding:8px 12px;background:#f0f5fb;border-radius:12px;margin-bottom:10px;border:1px solid #dce5ef;">
                <div><span style="color:#5a7a94;">总成本</span> <strong>${(entry.totalCost || 0).toFixed(1)}万</strong></div>
                <div><span style="color:#5a7a94;">总收入</span> <strong>${(entry.totalIncome || 0).toFixed(1)}万</strong></div>
                <div><span style="color:#5a7a94;">利润</span> <strong style="color:${(entry.profit||0)>=0?'#2d6b2d':'#c0392b'};">${(entry.profit||0)>=0?'+':''}${(entry.profit||0).toFixed(1)}万</strong></div>
                ${(entry.relogCount || 0) > 0 ? `<div><span style="color:#dbbd7c;">🔁 重登</span> <strong style="color:#dbbd7c;">${entry.relogCount}次</strong></div>` : '<div></div>'}
            </div>

            <div style="margin-bottom:8px;font-size:0.7rem;color:#5a7a94;">📌 任务分布：</div>
            <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:4px;">
    `;

    const typeCount = entry.typeCount || {};
    let hasTypeCount = false;

    // 🔍 判断该轮次是否为旧数据（没有 medicine 字段）
    const hasMedicine = entry.rings ? entry.rings.some(r => r.typeKey === 'medicine') : false;

    for (let [key, count] of Object.entries(typeCount)) {
        if (count > 0) {
            hasTypeCount = true;
            let label;
            if (key === 'cook') {
                // 如果有 medicine 字段，说明是新数据，显示"烹饪"
                // 否则是旧数据，显示"烹饪三药"
                label = hasMedicine ? '烹饪' : '烹饪三药';
            } else {
                label = this.getTaskLabel(key);
            }
            html += `<span style="display:inline-block;background:#f0f5fb;padding:2px 10px;border-radius:12px;margin:2px;font-size:0.7rem;">${label}: ${count}次</span>`;
        }
    }

    if (!hasTypeCount) {
        html += `<span style="color:#6c87a0;font-size:0.7rem;">暂无次数统计</span>`;
    }

    html += `</div>`;
    

     // ===== 🆕 重登区间分析 =====
const rings = entry.rings || [];
if (rings.length > 0) {
   const relogIndices = [];
for (let i = 0; i < rings.length; i++) {
    if (rings[i].isRelog) {
        const idx = (rings[i].taskIndex || (i + 1)) - 1;
        if (!relogIndices.includes(idx)) {
            relogIndices.push(idx);
        }
    }
}
    
relogIndices.sort((a, b) => a - b);
console.log('🔍 relogIndices:', relogIndices);
        if (relogIndices.length > 0) {
            const intervals = [];
            for (let i = 0; i < relogIndices.length; i++) {
                const startIdx = relogIndices[i];
                const endIdx = (i + 1 < relogIndices.length) ? relogIndices[i + 1] : rings.length;
                if (startIdx < endIdx) {
                    const segment = rings.slice(startIdx, endIdx);
                    const stats = {};
                    for (let r of segment) {
                        const key = r.typeKey;
                        stats[key] = (stats[key] || 0) + 1;
                    }
                    const total = segment.length;
                    const parts = [];
                    for (let [key, count] of Object.entries(stats)) {
                        const type = this.ITEM_TYPES.find(t => t.key === key);
                        const label = type ? type.label : key;
                        const pct = Math.round((count / total) * 100);
                        parts.push(`${label}${count}(${pct}%)`);
                    }
                    intervals.push(`[${startIdx + 1}-${endIdx}环] ${parts.join(' ')}`);
                }
            }
            if (intervals.length > 0) {
                html += `
                   <div style="margin-top:8px;padding:6px 10px;background:#fdf8ee;border-radius:8px;border:1px solid #f0e8d0;font-size:0.7rem;color:#1f3b53;">
                        🔁 重登区间分析：${intervals.join(' | ')}
                    </div>
                `;
            }
        }
    }

    if (rings.length > 0) {
        html += `
            <div style="margin-bottom:6px;font-size:0.7rem;color:#5a7a94;">📋 每环详情：</div>
            <div style="max-height:300px;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;">
        `;
        for (let r of rings) {
            // 🆕 直接使用保存的 label，如果没有则用 getTaskLabel
            let label = r.label || this.getTaskLabel(r.typeKey);
            // 如果是旧数据的 cook，统一显示为"烹饪三药"
            if (r.typeKey === 'cook' && !hasMedicine) {
                label = '烹饪三药';
            }
            const relogIcon = r.isRelog ? ' 🔁' : '';
            const bgColor = r.isRelog ? '#fdf8ee' : 'transparent';
            
            // 🆕 时辰显示
            let shichenDisplay = '';
            if (r.shichen) {
                const dayNight = r.isDaytime ? '☀️' : '🌙';
                shichenDisplay = `<span style="color:#b8860b;font-size:0.65rem;">${dayNight}${r.shichen}时</span>`;
            }
            const timeDisplay = r.timeStr ? `<span style="color:#8ab0c8;font-size:0.6rem;">${r.timeStr}</span>` : '';
            
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 8px;border-bottom:1px solid #f0f4f8;background:${bgColor};font-size:0.75rem;gap:6px;">
                    <span style="font-weight:600;color:#1f3b53;min-width:50px;font-size:0.75rem;">第${r.taskIndex}环</span>
                    <span style="color:${r.typeKey === 'find' ? '#c0392b' : '#1f3b53'};min-width:60px;font-size:0.75rem;">${label}${relogIcon}</span>
                    <span style="color:#b8860b;font-size:0.75rem;min-width:50px;">${r.shichen ? (r.isDaytime ? '☀️' : '🌙') + r.shichen + '时' : ''}</span>
                    <span style="color:#1a1a2e;font-size:0.75rem;min-width:60px;">${r.timeStr || ''}</span>
                    <span style="color:#1a1a2e;font-size:0.75rem;">💰${(r.cost || 0).toFixed(1)} ⭐${r.score || 0}</span>
                    ${r.isRelog ? '<span style="color:#dbbd7c;font-weight:700;font-size:0.75rem;">🔁重登</span>' : '<span style="color:#1a1a2e;font-size:0.75rem;">✅</span>'}
                </div>
            `;
        }
        html += `</div>`;
    } else if (hasTypeCount) {
        html += `
            <div style="margin-top:8px;padding:8px 12px;background:#f5f8fc;border-radius:8px;border:1px solid #e8eef5;text-align:center;color:#5a7a94;font-size:0.75rem;">
                ℹ️ 该轮次为旧数据，仅显示任务次数统计（无每环详情）
            </div>
        `;
    }

    html += `
            <div class="modal-actions" style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                <button class="btn-cancel" id="ringsDetailClose" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">关闭</button>
            </div>
        </div>
    `;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    document.getElementById('ringsDetailClose').addEventListener('click', () => {
        overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
},
        

       addRecord(key) {
        if (this.pendingSettle) {
            alert('本轮已满100环，请先确认结算再继续！');
            return;
        }
        const price = this.prices[key] || 0;
        const type = this.ITEM_TYPES.find(t => t.key === key);
        const score = type ? type.score : 0;
        const idx = this.records.length;
        
        // 🆕 检查是否有待标记的重登
        const isRelog = this.pendingRelog || false;
        if (this.pendingRelog) {
            this.pendingRelog = false;
            document.getElementById('prRelogStatus').textContent = '无待标记';
            document.getElementById('prRelogStatus').style.color = '#5a7a94';
            document.getElementById('prCancelRelogBtn').style.display = 'none';
        }

        // 🆕 记录时辰参数
        const now = new Date();
        const timestamp = now.getTime();
        const shichen = this.getShichen(timestamp);

        this.records.push({ 
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4), 
            runId: this.currentRunId, 
            taskIndex: this.records.length + 1,
            typeKey: key, 
            cost: price, 
            score, 
            ringPoints: this.getRingPoints(idx), 
            isDeduct: false,
            isRelog: isRelog,
            date: now.toLocaleString(),
            
            // 🆕 时辰参数
            timestamp: timestamp,
            shichen: shichen.name,
            shichenIndex: shichen.index,
            halfHour: shichen.halfHour,
            secondsInHalfHour: shichen.secondsInHalfHour,
            isDaytime: shichen.isDaytime,
            timeStr: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
        });
        this.render();
        this.updateRelogAnalysis();
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
        
        // 🆕 检查是否有待标记的重登
        const isRelog = this.pendingRelog || false;
        if (this.pendingRelog) {
            this.pendingRelog = false;
            document.getElementById('prRelogStatus').textContent = '无待标记';
            document.getElementById('prRelogStatus').style.color = '#5a7a94';
            document.getElementById('prCancelRelogBtn').style.display = 'none';
        }

        // 🆕 记录时辰参数
        const now = new Date();
        const timestamp = now.getTime();
        const shichen = this.getShichen(timestamp);

        this.records.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4), 
            runId: this.currentRunId, 
            taskIndex: this.records.length + 1,
            typeKey: key,
            cost: s.cost || 0,
            score: -(s.deduct || 0),
            ringPoints: this.getRingPoints(idx),
            isDeduct: true,
            isRelog: isRelog,
            label: type ? type.label : key,
            date: now.toLocaleString(),
            
            // 🆕 时辰参数
            timestamp: timestamp,
            shichen: shichen.name,
            shichenIndex: shichen.index,
            halfHour: shichen.halfHour,
            secondsInHalfHour: shichen.secondsInHalfHour,
            isDaytime: shichen.isDaytime,
            timeStr: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
        });
        this.render();
        this.updateRelogAnalysis();
    },

    undoRecord() {
        if (this.records.length > 0) {
            const removed = this.records.pop();
            // 如果撤销的是重登标记的环，清除待标记状态
            if (removed.isRelog) {
                this.pendingRelog = true;
                const nextIndex = this.records.length + 1;
                document.getElementById('prRelogStatus').textContent = `⏳ 第${nextIndex}环待标记 🔁`;
                document.getElementById('prRelogStatus').style.color = '#dbbd7c';
                document.getElementById('prCancelRelogBtn').style.display = 'inline-block';  // 🆕 加这行
            }
            if (this.pendingSettle) {
                this.pendingSettle = null;
            }
            this.render();
            this.updateRelogAnalysis();
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
        const ringCount = stats.ringCount;
        const benchmark = ringCount * 2;
        const diff = stats.totalScore - benchmark;
        let diffText = '';
        if (ringCount > 0) {
            if (diff > 0) {
                diffText = ` 🟢 领先${diff}分`;
            } else if (diff < 0) {
                diffText = ` 🔴 落后${Math.abs(diff)}分`;
            } else {
                diffText = ` ⚪ 持平`;
            }
        }
        document.getElementById('prTotalScore').textContent = stats.totalScore + diffText;
        document.getElementById('prRingCount').textContent = `${stats.ringCount} / ${stats.remaining} 剩`;
        const elAvgCost = document.getElementById('prAvgCost');
        if (elAvgCost) elAvgCost.textContent = stats.avgCost.toFixed(1);
        
        const elTotalPoints = document.getElementById('prTotalPoints');
        if (elTotalPoints) elTotalPoints.textContent = stats.totalPoints;
        
        const elProfitDisplay = document.getElementById('prProfitDisplay');
        if (elProfitDisplay) elProfitDisplay.textContent = income.profit.toFixed(1) + ` (≈${rmb.toFixed(2)}元)`;
        
        const elProfitDisplay2 = document.getElementById('prProfitDisplay2');
        if (elProfitDisplay2) elProfitDisplay2.textContent = income.profit.toFixed(1);
        
        const elTotalIncomeDisplay = document.getElementById('prTotalIncomeDisplay');
        if (elTotalIncomeDisplay) elTotalIncomeDisplay.textContent = income.totalIncome.toFixed(1);
        
        const elRingInfo = document.getElementById('prRingInfo');
        if (elRingInfo) elRingInfo.textContent = `共${stats.ringCount}环`;

        const ps = document.getElementById('prProfitStat');
        if (ps) {
            ps.className = 'stat-item' + (income.profit > 0 ? ' profit' : income.profit < 0 ? ' loss' : '');
        }
        const pb = document.getElementById('prProfitBox');
        if (pb) {
            pb.className = 'income-item' + (income.profit > 0 ? ' profit-box' : income.profit < 0 ? ' loss-box' : '');
        }

        const totalRings = stats.ringCount;
        document.querySelectorAll('#prTaskGrid .task-item-wrapper').forEach(w => {
            const key = w.dataset.key;
            const ce = w.querySelector('.task-count');
            if (ce && stats.typeCount[key] !== undefined) {
                const count = stats.typeCount[key] || 0;
                if (count > 0 && totalRings > 0) {
                    const pct = Math.round((count / totalRings) * 100);
                    const color = pct >= 40 ? '#2d6b2d' : '#c0392b';
                    ce.innerHTML = `${count} <span style="color:${color};font-weight:700;">(${pct}%)</span>`;
                } else if (count > 0) {
                    ce.textContent = count;
                } else {
                    ce.textContent = '';
                }
            }
        });

        this.buildTaskButtons();
        this.buildDeductSettings();
        this.buildPriceInputs();
    },

    buildTaskButtons() {
        const deductColor = this.uiSettings.deductColor || '#d4a0a0';
        const grid = document.getElementById('prTaskGrid');
        if (!grid || grid.children.length > 0) return;

        let html = '';
        const allTasks = [...this.ITEM_TYPES, ...this.DEDUCT_TYPES.map(d => ({
            key: d.key,
            label: d.label,
            icon: d.icon || '',
            score: -(this.deductSettings[d.key]?.deduct || d.defaultDeduct),
            isDeduct: true
        }))];

        allTasks.forEach(t => {
            const isDeduct = t.isDeduct || false;
            const sc = isDeduct ? t.score : (this.ITEM_TYPES.find(it => it.key === t.key)?.score || 0);
            const color = isDeduct ? '#8f3a3a' : (this.ITEM_TYPES.find(it => it.key === t.key)?.color || '#1f3b53');
            html += `<div class="task-item-wrapper" data-key="${t.key}">
                <button class="${isDeduct ? 'task-btn deduct' : 'task-btn'}" data-key="${t.key}" style="border-color:${isDeduct ? deductColor : color};background:${isDeduct ? deductColor : '#4CAF50'};color:#ffffff;border-radius:30px;padding:8px 2px;font-size:0.85rem;font-weight:700;cursor:pointer;text-align:center;width:100%;display:flex;flex-direction:column;align-items:center;line-height:1.2;border:1px solid ${isDeduct ? deductColor : color};">
                    <span style="color:#ffffff;">${t.icon || ''} ${t.label}</span>
                    <span class="sub" style="color:${isDeduct ? '#ffcccc' : '#e0e0e0'};font-weight:600;font-size:0.6rem;">${isDeduct ? `${sc}分` : `+${sc}分`}</span>
                </button>
                <span class="task-count"></span>
            </div>`;
        });
        grid.innerHTML = html;
    },

    buildDeductSettings() {
        const container = document.getElementById('prDeductSettings');
        if (!container) return;

        let html = '';
        this.DEDUCT_TYPES.forEach(d => {
            const s = this.deductSettings[d.key] || { deduct: d.defaultDeduct, cost: d.defaultCost };
            html += `<div class="ds-item">
                <label>${d.icon || ''} ${d.label}</label>
                <input type="number" step="0.5" min="0" value="${s.deduct}" data-key="${d.key}" data-type="deduct"><span class="unit">分</span>
                <input type="number" step="0.1" min="0" value="${s.cost}" data-key="${d.key}" data-type="cost"><span class="unit">万</span>
            </div>`;
        });
        container.innerHTML = html;

        const toggleBtn = document.getElementById('prToggleDeductBtn');
        if (toggleBtn && container.classList.contains('hidden')) {
            container.style.display = 'none';
            toggleBtn.textContent = '👁️ 显示';
        } else {
            container.style.display = 'flex';
        }
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
    const records = this.records.slice().reverse();  // 显示全部
    for (let r of records) {
        const type = this.ITEM_TYPES.find(t => t.key === r.typeKey);
        const label = type ? type.label : (r.label || r.typeKey);
        const sc = r.score < 0 ? r.score : `+${r.score}`;
        const relogIcon = r.isRelog ? ' 🔁' : '';
        
        // 🆕 时辰和时间显示
        let shichenDisplay = '';
        if (r.shichen) {
            const dayNight = r.isDaytime ? '☀️' : '🌙';
            shichenDisplay = `<span style="color:#b8860b;font-size:0.7rem;">${dayNight}${r.shichen}时</span>`;
        }
         const timeDisplay = r.timeStr ? `<span style="color:#1a1a2e;font-size:0.65rem;">${r.timeStr}</span>` : '';
        
        const labelColor = r.typeKey === 'find' ? '#c0392b' : '#1a1a2e';
        html += `<div class="history-item">
            <div class="info">
                <span style="font-weight:600;color:#1f3b53;min-width:36px;">#${r.taskIndex}</span>
                <span style="background:${r.isRelog ? '#fdf8ee' : (r.isDeduct?'#f5d0d0':'#dce6f0')};padding:0 10px;border-radius:40px;font-size:0.7rem;color:${labelColor};">${label}${relogIcon}</span>
                ${shichenDisplay}
                ${timeDisplay}
                <span>💰${r.cost.toFixed(1)}</span>
                <span>⭐${sc}</span>
                <span>📈+${r.ringPoints}</span>
            </div>
        </div>`;
    }
    list.innerHTML = html;
},

    

    // 🆕 显示本轮全部记录弹窗
showAllRingsModal() {
    if (this.records.length === 0) {
        alert('暂无记录');
        return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';

    let listHtml = '';
    for (let i = 0; i < this.records.length; i++) {
        const r = this.records[i];
        const type = this.ITEM_TYPES.find(t => t.key === r.typeKey);
        const label = type ? type.label : (r.label || r.typeKey);
        const sc = r.score < 0 ? r.score : `+${r.score}`;
        const relogIcon = r.isRelog ? ' 🔁' : '';
        const dayNight = r.isDaytime ? '☀️' : '🌙';
        const shichenDisplay = r.shichen ? `${dayNight}${r.shichen}时` : '';
        const timeDisplay = r.timeStr || '';
        const bgColor = r.isRelog ? '#fdf8ee' : 'transparent';
        
        const labelColor = r.typeKey === 'find' ? '#c0392b' : '#1f3b53';
        listHtml += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #f0f4f8;background:${bgColor};font-size:0.75rem;gap:6px;">
                <span style="font-weight:600;color:#1f3b53;min-width:40px;">#${r.taskIndex}</span>
                <span style="color:${labelColor};min-width:60px;">${label}${relogIcon}</span>
                <span style="color:#b8860b;min-width:50px;">${shichenDisplay}</span>
                <span style="color:#1a1a2e;min-width:60px;">${timeDisplay}</span>
                <span style="color:#1a1a2e;">💰${r.cost.toFixed(1)} ⭐${sc}</span>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:650px;width:95%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">📋 本轮全部记录</h3>
            <div style="font-size:0.8rem;color:#5a7a94;margin-bottom:10px;">共 ${this.records.length} 环</div>
            <div style="max-height:500px;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;">
                ${listHtml}
            </div>
            <div style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                <button class="btn-cancel" id="allRingsClose" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('allRingsClose').addEventListener('click', () => {
        overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
},

updateRelogAnalysis() {
    const container = document.getElementById('prRelogAnalysis');
    if (!container) return;

    const records = this.records;
    if (records.length === 0) {
        container.innerHTML = '🔁 等待重登标记...';
        container.style.color = '#5a7a94';
        return;
    }

    // 找出所有重登的索引（用 taskIndex 定位）
    const relogIndices = [];
    for (let i = 0; i < records.length; i++) {
        if (records[i].isRelog) {
            const idx = (records[i].taskIndex || (i + 1)) - 1;
            if (!relogIndices.includes(idx)) {
                relogIndices.push(idx);
            }
        }
    }
    relogIndices.sort((a, b) => a - b);

    if (relogIndices.length === 0) {
        container.innerHTML = '🔁 暂无重登标记';
        container.style.color = '#5a7a94';
        return;
    }

    // 🆕 只取最后一个重登标记，统计它之后到现在的区间
    const lastRelogIdx = relogIndices[relogIndices.length - 1];
    const hasPending = (lastRelogIdx + 1) < records.length;

    if (!hasPending) {
        container.innerHTML = `🔁 已标记第${lastRelogIdx + 1}环重登，等待任务记录...`;
        container.style.color = '#dbbd7c';
        return;
    }

    // 统计最后一个重登之后的任务
   const pendingRecords = records.slice(lastRelogIdx);
    const stats = {};
    for (let r of pendingRecords) {
        const key = r.typeKey;
        stats[key] = (stats[key] || 0) + 1;
    }
    const total = pendingRecords.length;
    const parts = [];
    for (let [key, count] of Object.entries(stats)) {
        const type = this.ITEM_TYPES.find(t => t.key === key);
        const label = type ? type.label : key;
        const pct = Math.round((count / total) * 100);
        parts.push(`${label}${count}(${pct}%)`);
    }

    const startRing = lastRelogIdx + 1;
    container.style.fontSize = '0.85rem';
    container.innerHTML = `🔁 [${startRing}-?环] ${parts.join(' ')} (当前区间)`;
    container.style.color = '#1f3b53';

    // 同步撤销按钮显示状态
    const cancelBtn = document.getElementById('prCancelRelogBtn');
    if (cancelBtn) {
        cancelBtn.style.display = this.pendingRelog ? 'inline-block' : 'none';
    }
},

    updateHistoryTable() {
        const tbody = document.getElementById('prHistoryTableBody');
        const count = this.history.length;
        document.getElementById('prSettledCount').textContent = `已结算: ${count}轮`;

        if (count === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无已结算记录</td></tr>';
            return;
        }

        let data = this.getFilteredData();

        if (data.length === 0 && count > 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">无匹配筛选条件的记录</td></tr>';
            return;
        }

        const sortOrder = this.sortState.order === 'desc' ? -1 : 1;
        data = [...data].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return (dateA - dateB) * sortOrder;
        });

        const fruitPrice = this.fruitPrice || 80;

        let html = '';
        const total = data.length;
        for (let i = 0; i < data.length; i++) {
            const h = data[i];
            const row = this.sortState.order === 'desc' ? total - i : i + 1;
            const pc = h.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const idx = this.history.indexOf(h);
            const rmb = h.profit * this.exchangeRate;

            const points = h.totalPoints || 0;
            const pointsValue = points * (fruitPrice / 170);
            let pointsDisplay = points + '点';
            if (points > 0) {
                pointsDisplay += ` (${pointsValue.toFixed(1)}万)`;
            }

            let bookDisplay = '-';
            if (h.bookDisplayName) {
                bookDisplay = h.bookDisplayName;
            } else if (h.bookIncome && h.bookIncome > 0) {
                bookDisplay = `书铁(${h.bookIncome.toFixed(1)}万)`;
            }

            let rewardDisplay = '-';
            let rewardLabel = '';
            if (h.rewardType === 'points200') {
                rewardLabel = '200修炼点';
            } else if (h.rewardType === 'fruit') {
                rewardLabel = '1个修炼果';
            } else if (h.rewardType === 'furniture') {
                rewardLabel = '家具图×1';
            }
            const rewardVal = (h.fruitIncome || 0) + (h.furnitureIncome || 0);
            if (rewardLabel && rewardVal > 0) {
                rewardDisplay = `${rewardLabel}(${rewardVal.toFixed(1)}万)`;
            } else if (h.rewards && h.rewards !== '无' && !h.bookDisplayName) {
                rewardDisplay = h.rewards;
            }

            const totalIncome = h.totalIncome || 0;

            // 🆕 详情按钮改为打开弹窗
            const hasRings = h.rings && h.rings.length > 0;

            // 🆕 重登次数显示
            let relogDisplay = '-';
            if (h.relogCount && h.relogCount > 0) {
                relogDisplay = `🔁 ${h.relogCount}次`;
            }

            html += `<tr>
                <td style="font-weight:700;color:#1f3b53;background:#f5f8fc;">${row}</td>
                <td>${h.date || '未知'}</td>
                <td><strong>${h.ringCount}</strong></td>
                <td><strong>${h.totalScore || 0}</strong></td>
                <td>${(h.totalCost || 0).toFixed(1)}</td>
                <td style="font-size:0.75rem;">${pointsDisplay}</td>
                <td style="font-size:0.75rem;">${bookDisplay}</td>
                <td style="font-size:0.75rem;">${rewardDisplay}</td>
                <td><strong>${totalIncome.toFixed(1)}</strong></td>
                <td class="${pc}">${(h.profit || 0).toFixed(1)} (≈${rmb.toFixed(2)}元)</td>
                <td>
                    <button class="detail-toggle" data-idx="${idx}" style="background:#dce5ef;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#1f3b53;font-weight:600;">
                        ${hasRings ? '📊' : '📊'}
                    </button>
                    ${relogDisplay !== '-' ? `<span style="font-size:0.6rem;color:#dbbd7c;display:block;">${relogDisplay}</span>` : ''}
                </td>
                <td><button class="del-btn" data-idx="${idx}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button></td>
            </tr>`;
        }
        tbody.innerHTML = html;

        const icon = document.getElementById('prSortIcon');
        if (icon) icon.textContent = this.sortState.order === 'desc' ? '↓' : '↑';

        if (document.getElementById('prAnalysisPanel').style.display !== 'none') {
            this.updateAnalysis(data);
        }
    },

    // ========== 决策建议 ==========
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

        const exp = this.calculateExpectation();
        const expectedFinal = exp.expectedScore;
        const runRings = stats.ringCount;
        const remaining = 100 - runRings;

        const benchmark = runRings * 2;
        const diff = stats.totalScore - benchmark;

        let statusMsg = `已完成 ${runRings} 环，剩余 ${remaining} 环，总成本 ${stats.totalCost.toFixed(1)} 万，当前积分 ${stats.totalScore}。`;
        if (diff > 0) {
            statusMsg += ` 🟢 领先 ${diff} 分`;
        } else if (diff < 0) {
            statusMsg += ` 🔴 落后 ${Math.abs(diff)} 分`;
        } else {
            statusMsg += ` ⚪ 持平`;
        }
        status.textContent = statusMsg;

        pred.style.display = 'block';
        let reward = '';
        let rewardColor = '#f2eee4';
        if (expectedFinal >= 222) {
            reward = '🏆 150级书铁或160级战魄';
            rewardColor = '#f0d060';
        } else if (expectedFinal >= 212) {
            reward = '🌟 140级书铁';
            rewardColor = '#60d080';
        } else if (expectedFinal >= 202) {
            reward = '📈 130级书铁';
            rewardColor = '#60b0e0';
        } else if (expectedFinal >= 192) {
            reward = '📊 120级书铁';
            rewardColor = '#b0c8e0';
        } else if (expectedFinal >= 182) {
            reward = '📉 110级书铁';
            rewardColor = '#e0a060';
        } else if (expectedFinal >= 172) {
            reward = '📉 100级书铁';
            rewardColor = '#e0a060';
        } else {
            reward = '⚠️ 80-90级书铁或家具图纸';
            rewardColor = '#e06060';
        }

        predText.innerHTML = `按概率模型预测终积分约 <strong style="color:${rewardColor};">${expectedFinal.toFixed(0)}</strong> 分，预计获得 <strong style="color:${rewardColor};">${reward}</strong>`;

        if (runRings === 20) {
            this._prediction20 = Math.round(expectedFinal);
        } else if (runRings < 20) {
            this._prediction20 = null;
        }

        strat.style.display = 'block';
        let strategyMsg = '';
        let tagText = '';

        if (expectedFinal >= 222 && diff >= 0) {
            strategyMsg = '🎯 <strong style="color:#f0d060;">冲刺150级策略</strong>：当前有望冲击150级奖励！建议全部正常交，遇到指定变异提交（+10分），80环正常交，不要跳。<br>💡 预计成本较高，但收益也最高。';
            tagText = '🏆 冲150级';
        } else if (expectedFinal >= 192 && diff >= -5) {
            strategyMsg = '📊 <strong style="color:#60d080;">标准跑环策略</strong>：目标120-140级书铁。建议60/70环正常交，80环视善恶点情况，变异任务评估成本。<br>💡 投入产出均衡，适合多数玩家。';
            tagText = '📈 标准模式';
        } else if (expectedFinal >= 172) {
            strategyMsg = '📉 <strong style="color:#e0a060;">乞丐跑环策略</strong>：目标100-110级书铁或保底。建议80环用善恶点或跳过，变异任务交普通或跳过，只交低价物品。<br>💡 成本最低，保底收益。';
            tagText = '🛡️ 乞丐模式';
        } else {
            strategyMsg = '⚠️ <strong style="color:#e06060;">保底策略</strong>：当前积分偏低，建议以保底修炼果为目标。80环以上全部跳过，变异任务跳过或交普通，只交60环、烹饪、三药等低价物品。<br>💡 控制成本，等待下一轮。';
            tagText = '💤 保底模式';
        }

        if (expectedFinal >= 212) {
            strategyMsg += '<br>🐉 <strong>变异策略</strong>：遇到指定变异 <span style="color:#f0d060;">✅ 建议提交</span>（有望冲140-150级）';
        } else if (expectedFinal >= 192 && diff >= 0) {
            strategyMsg += '<br>🐉 <strong>变异策略</strong>：遇到指定变异 <span style="color:#60d080;">🤔 视成本决定</span>（低价可交，高价跳过）';
        } else {
            strategyMsg += '<br>🐉 <strong>变异策略</strong>：遇到指定变异 <span style="color:#e06060;">❌ 不建议提交</span>（收益有限，保底为主）';
        }

        stratText.innerHTML = strategyMsg;
        tag.textContent = tagText;
    },

    // ========== 数据分析 ==========
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
            document.getElementById('prAnaPredictionCompare').innerHTML = '无数据';
            return;
        }

        let totalCost = 0, totalIncome = 0, totalProfit = 0, totalRings = 0, totalScore = 0;
        let winCount = 0, loseCount = 0;
        let maxProfit = -Infinity, minProfit = Infinity;
        const taskTotals = {};
                // 🆕 时辰统计
        const shichenStats = {};
        const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        shichenNames.forEach(name => {
            shichenStats[name] = { total: 0, find: 0, items: 0 };
        });
        let totalRingsWithShichen = 0;
        this.ITEM_TYPES.forEach(t => taskTotals[t.key] = 0);

        let predictionDiffs = [];
        let predictionCount = 0;

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

                        // 🆕 统计时辰数据
            if (h.rings && h.rings.length > 0) {
                for (let r of h.rings) {
                    if (r.shichen) {
                        const sc = shichenStats[r.shichen];
                        if (sc) {
                            sc.total++;
                            totalRingsWithShichen++;
                            if (r.typeKey === 'find') sc.find++;
                            else if (['ring60', 'ring70', 'ring80', 'flower', 'cook', 'medicine', 'furn1', 'furn2', 'var_common', 'var_spec'].includes(r.typeKey)) {
                                sc.items++;
                            }
                        }
                    }
                }
            }

            if (h.prediction20 !== undefined && h.totalScore !== undefined) {
                const diff = h.prediction20 - h.totalScore;
                predictionDiffs.push({
                    predicted: h.prediction20,
                    actual: h.totalScore,
                    diff: diff,
                    date: h.date
                });
                predictionCount++;
            }
        }

        let predictionHtml = '';
        if (predictionCount > 0) {
            const totalDiff = predictionDiffs.reduce((sum, d) => sum + d.diff, 0);
            const avgDiff = totalDiff / predictionCount;
            const absDiffs = predictionDiffs.map(d => Math.abs(d.diff));
            const avgAbsDiff = absDiffs.reduce((a, b) => a + b, 0) / predictionCount;
            const maxDiff = Math.max(...absDiffs);
            const accurateCount = predictionDiffs.filter(d => Math.abs(d.diff) <= 10).length;
            const accuracy = (accurateCount / predictionCount * 100);
            const overCount = predictionDiffs.filter(d => d.diff > 0).length;
            const underCount = predictionDiffs.filter(d => d.diff < 0).length;

            predictionHtml = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin:8px 0;padding:10px;background:#f0f5fb;border-radius:12px;border:1px solid #dce5ef;">
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">数据量</div>
                        <div style="font-weight:700;color:#1f3b53;">${predictionCount}轮</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">平均偏差</div>
                        <div style="font-weight:700;color:${avgDiff > 0 ? '#c0392b' : avgDiff < 0 ? '#2d6b2d' : '#1f3b53'};">${avgDiff.toFixed(1)}分</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">平均绝对偏差</div>
                        <div style="font-weight:700;color:#1f3b53;">${avgAbsDiff.toFixed(1)}分</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">最大偏差</div>
                        <div style="font-weight:700;color:#1f3b53;">${maxDiff.toFixed(0)}分</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">准确率(±10分)</div>
                        <div style="font-weight:700;color:${accuracy >= 70 ? '#2d6b2d' : accuracy >= 50 ? '#b48b3a' : '#c0392b'};">${accuracy.toFixed(0)}%</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem;color:#5a7a94;">预测偏高/偏低</div>
                        <div style="font-weight:700;color:#1f3b53;">${overCount} / ${underCount}</div>
                    </div>
                </div>
                <div style="font-size:0.65rem;color:#5a7a94;text-align:center;padding:2px 0;">
                    💡 偏差 = 20环预测终积分 − 实际终积分（正=预测偏高，负=预测偏低）
                </div>
            `;
        } else {
            predictionHtml = '<div style="color:#5a7a94;font-size:0.75rem;padding:8px 0;text-align:center;">暂无20环预测数据</div>';
        }

        document.getElementById('prAnaPredictionCompare').innerHTML = predictionHtml;

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

            // 🆕 时辰分析
        let shichenHtml = '';
        if (totalRingsWithShichen > 0) {
            let rows = '';
            shichenNames.forEach(name => {
                const sc = shichenStats[name];
                if (sc.total > 0) {
                    const findPct = Math.round((sc.find / sc.total) * 100);
                    const itemPct = Math.round((sc.items / sc.total) * 100);
                    const isDay = ['辰', '巳', '午', '未', '申', '酉'].includes(name);
                    const dayNight = isDay ? '☀️' : '🌙';
                    rows += `<tr>
                        <td style="padding:3px 6px;text-align:center;font-weight:600;">${dayNight}${name}时</td>
                        <td style="padding:3px 6px;text-align:center;">${sc.total}</td>
                        <td style="padding:3px 6px;text-align:center;color:#2d6b9e;">${sc.find} (${findPct}%)</td>
                        <td style="padding:3px 6px;text-align:center;color:#b45a3a;">${sc.items} (${itemPct}%)</td>
                    </tr>`;
                }
            });
            
            shichenHtml = `
                <div style="margin-top:10px;padding:8px 10px;background:#f0f5fb;border-radius:12px;border:1px solid #dce5ef;">
                    <div style="font-weight:700;font-size:0.8rem;color:#1f3b53;margin-bottom:6px;">⏱️ 时辰分布分析 <span style="font-weight:400;font-size:0.65rem;color:#5a7a94;">— 共 ${totalRingsWithShichen} 环有数据</span></div>
                    <table style="width:100%;border-collapse:collapse;font-size:0.7rem;">
                        <thead>
                            <tr style="background:#1f344b;color:#f0ebdd;">
                                <th style="padding:3px 6px;text-align:center;font-weight:600;">时辰</th>
                                <th style="padding:3px 6px;text-align:center;font-weight:600;">总环数</th>
                                <th style="padding:3px 6px;text-align:center;font-weight:600;">找人</th>
                                <th style="padding:3px 6px;text-align:center;font-weight:600;">物品</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        } else {
            shichenHtml = `<div style="margin-top:10px;padding:6px 12px;background:#f5f8fc;border-radius:8px;text-align:center;color:#6c87a0;font-size:0.7rem;">⏱️ 暂有时辰数据（仅新数据记录时辰）</div>`;
        }
        
        // 插入到分析面板
        const shichenContainer = document.getElementById('prShichenAnalysis');
        if (shichenContainer) {
            shichenContainer.innerHTML = shichenHtml;
        }
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
            rewards: rewards || `修炼果${fruitIncome.toFixed(1)}万`,
            rings: [],  // 导入数据没有详细环数据
            relogCount: 0
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

window.PetRingModule = PetRingModule;
