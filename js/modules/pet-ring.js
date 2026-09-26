// ============================================================
//  🏃 跑宠环模块 - 完整版（烹饪/三药拆分 + 历史详情弹窗 + 重登标记）
//  功能：跑环记录 + 期望值计算 + 策略建议 + 100环结算弹窗 + 修炼点价值计入
//  新增：烹饪/三药拆分 | 历史详情弹窗显示每环数据 | 重登标记
//  本次改动：详情弹窗 & 全部记录弹窗 → 上半部分固定，只滚环列表
// ============================================================
const PetRingModule = {
    id: 'petRing',
    sortState: { order: 'desc' },
    showHidden: false,   // 🆕 是否显示已隐藏的历史
    lrResetTs: 0,   // 🆕 左右列的重置时间点（0 表示不重置，全算）

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
    pendingRelog: false,
    startTimestamp: null,

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
        cook: 0.08,
        medicine: 0.08,
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
        this.renderShichenWeights();
        this.renderRealtimeWindow();
        this.updateTimeAndShichen();  
        // 🆕 同步「显示隐藏」按钮和状态提示
        const showHiddenBtn = document.getElementById('prShowHiddenBtn');
        const showHiddenStatus = document.getElementById('prShowHiddenStatus');
        if (showHiddenBtn) {
            showHiddenBtn.textContent = this.showHidden ? '👁️ 不显示隐藏' : '🙈 显示隐藏';
            showHiddenBtn.style.background = this.showHidden ? '#4c7a5c' : '#6b8baa';
        }
        if (showHiddenStatus) {
            showHiddenStatus.textContent = this.showHidden ? '（含隐藏数据）' : '（隐藏已过滤）';
            showHiddenStatus.style.color = this.showHidden ? '#c0392b' : '#5a7a94';
        }
    },

    updateTimeAndShichen() {
        const now = new Date();
        const timestamp = now.getTime();
        const shichen = this.getShichen(timestamp);
        
        const timeEl = document.getElementById('prCurrentTime');
        if (timeEl) {
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${h}:${m}:${s}`;
            this.renderShichenWeights();
            this.renderRealtimeWindow();
        }
        
        const shichenEl = document.getElementById('prCurrentShichen');
        if (shichenEl) {
            const elapsed = shichen.secondsInHalfHour % 150;
            const m = Math.floor(elapsed / 60);
            const s = Math.floor(elapsed % 60);
            shichenEl.textContent = `${shichen.name}时 ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            shichenEl.style.color = '#B8860B';
        }
        
        const nextShichenEl = document.getElementById('prNextShichenCountdown');
        if (nextShichenEl) {
            const nextIndex = (shichen.index + 1) % 12;
            const nextName = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][nextIndex];
            const countdown = this.formatCountdown(shichen.secondsToNextShichen);
            nextShichenEl.textContent = `${nextName}时 ${countdown}`;
            nextShichenEl.style.color = '#c0392b';
        }
        
        const refreshEl = document.getElementById('prNextRefreshCountdown');
        if (refreshEl) {
            const refreshCountdown = this.getNextShopRefreshCountdown();
            refreshEl.textContent = this.formatCountdown(refreshCountdown);
            
            const config = this.getShopRefreshConfig();
            const now2 = new Date();
            const minute = now2.getMinutes();
            const second = now2.getSeconds();
            const nowSec = minute * 60 + second;
            
            const baseMinute = Math.floor(minute / 10) * 10;
            let targetMinute = baseMinute + config.secondMinute;
            let targetSec = targetMinute * 60 + config.secondSecond;
            
            if (targetSec < nowSec) {
                targetMinute += 10;
                targetSec = targetMinute * 60 + config.secondSecond;
            }
            
            const targetDate = new Date(now2);
            targetDate.setMinutes(targetMinute, config.secondSecond, 0);
            
            const refreshShichen = this.getShichen(targetDate.getTime());
            const shichenEl2 = document.getElementById('prRefreshShichen');
            if (shichenEl2) {
                const dayNight = refreshShichen.isDaytime ? '☀️' : '🌙';
                shichenEl2.innerHTML = `🔄 下次刷新 <span style="color:#c0392b;font-size:inherit;font-weight:600;">${dayNight}${refreshShichen.name}时</span>`;
            }
        }
        
        const currentRingShichenEl = document.getElementById('prCurrentRingShichen');
        if (currentRingShichenEl) {
            const visibleRecords = this.records.filter(r => !r.deleted);
            const currentRingIndex = visibleRecords.length + 1;
            let ringShichen;
            let ringTimestamp;
            if (visibleRecords.length === 0) {
                ringShichen = shichen;
                ringTimestamp = this.startTimestamp || Date.now();
            } else {
                const lastRecord = visibleRecords[visibleRecords.length - 1];
                const nextShichenTimestamp = lastRecord.clickTimestamp || Date.now();
                ringShichen = this.getShichen(nextShichenTimestamp);
                ringTimestamp = nextShichenTimestamp;
            }
            const dayNight = ringShichen.isDaytime ? '☀️' : '🌙';
            const d = new Date(ringTimestamp);
            const ringTimeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
            currentRingShichenEl.textContent = `第${currentRingIndex}环: ${dayNight}${ringShichen.name}时 ${ringTimeStr}`;
        }
    },

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.currentRunId = data.currentRunId || null;
        
        const validRecords = (data.records || []).filter(r => !r.deleted);
        if (validRecords.length > 0) {
            const existingRunId = validRecords[0].runId || validRecords[0].payload?.runId;
            if (existingRunId) this.currentRunId = existingRunId;
        }
    
        if (this.currentRunId && (data.history || []).some(h => h.runId === this.currentRunId)) {
            this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }
        
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
        this.showHidden = false;   // 🆕 强制默认不显示隐藏
        this.lrResetTs = data.lrResetTs || 0;

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
        const historyV3 = this.history.map((h, idx) => {
            return {
                _id: h.runId ? `petRing_run_${h.runId}` : `petRing_hist_${Date.now()}_${idx}`,
                _createdAt: h._createdAt || h.date || new Date().toISOString(),
                payload: h
            };
        });
        const settledRunIds = [...new Set(this.history.map(h => h.runId || h.payload?.runId).filter(Boolean))];
        
        const recordsV3 = this.records.map((r, idx) => ({
            _id: r.id || r._id || `${this.currentRunId}_rec_${idx}`,
            _index: r.taskIndex || idx + 1,
            _createdAt: r._createdAt || r.date || new Date().toISOString(),
            runId: r.runId || this.currentRunId || 'unknown_run',
            payload: r
        }));
        
        const recordsLastUpdated = this.records.length > 0
            ? (this.records[this.records.length - 1].clickTimestamp 
               || new Date(this.records[this.records.length - 1].date).getTime() 
               || Date.now())
            : 0;
        
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
            pendingRelog: this.pendingRelog,
            startTimestamp: this.startTimestamp,
            currentRunId: this.currentRunId, 
            lrResetTs: this.lrResetTs || 0,
            __sync_v3: {
                history: historyV3,
                records: recordsV3,
                settledRunIds: settledRunIds,
                _meta: {
                    version: '3.0',
                    lastUpdated: Date.now(),
                    recordsLastUpdated: recordsLastUpdated
                }
            }
        });
    },

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

    checkAutoSettle() {
        const stats = this.calcStats();
        if (stats.ringCount >= 100 && !this.pendingSettle) {
            this.showFullSettleModal(stats);
        }
    },

    getTaskLabel(key) {
        if (key === 'cook') {
            return '烹饪三药';
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
    let currentLevel = autoLevel;
    let currentBookName = '';
    let currentIsZhanpo = false;

    const modalHTML = `
        <div style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:560px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">🎯 100环结算报告</h3>
            
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 12px;background:#f0f5fb;border-radius:12px;margin-bottom:14px;font-size:0.8rem;border:1px solid #dce5ef;">
                <div><span style="color:#5a7a94;">总成本</span> <strong>${stats.totalCost.toFixed(1)}万</strong></div>
                <div><span style="color:#5a7a94;">总积分</span> <strong style="color:${score>=192?'#2d6b2d':'#c0392b'};">${stats.totalScore}</strong></div>
                <div><span style="color:#5a7a94;">修炼点</span> <strong>${stats.totalPoints}</strong> <span style="color:#8ab0c8;font-size:0.7rem;">（≈${(stats.totalPoints/170).toFixed(2)}果）</span></div>
            </div>

            <div style="margin-bottom:14px;padding:8px 14px;background:#e8f0e8;border-radius:10px;border:1px solid #5f8f5f;">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;">
                    <span style="color:#1f3b53;">📈 修炼点价值</span>
                    <span style="font-weight:700;color:#2d6b2d;">${pointsValue.toFixed(1)}万</span>
                </div>
            </div>

            <div style="margin-bottom:14px;padding:12px 16px;background:#f0f5fb;border-radius:16px;border:1px solid #dce5ef;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-weight:700;font-size:0.9rem;color:#1f3b53;">📘 书铁奖励</div>
                    <div style="font-size:0.7rem;background:#1f344b;padding:2px 12px;border-radius:30px;color:#f0d060;font-weight:600;">
                        🎯 ${autoLevelLabel}
                    </div>
                </div>
                
                <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap;">
                    <button class="ph-book-type-btn active" data-type="书" style="padding:4px 20px;border-radius:14px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:600;">📕 书</button>
                    <button class="ph-book-type-btn" data-type="铁" style="padding:4px 20px;border-radius:14px;border:2px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.85rem;font-weight:600;">📗 铁</button>
                </div>
                ${autoLevel === 150 ? `
                <div id="settleZhanpoRow" style="display:none;margin-bottom:10px;">
                    <button class="ph-zhanpo-btn" style="padding:4px 20px;border-radius:14px;border:2px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.85rem;font-weight:600;">🗡️ 战魄（160级材料）</button>
                </div>
                ` : ''}

                <div id="settleBookNameContainer" style="margin-bottom:8px;">
                    <div style="font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">选择书种类</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;" id="settleBookNameList">
                        ${bookTypeList.map(t => `
                            <button class="ph-book-name-btn" data-name="${t}" style="padding:2px 10px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.65rem;margin:2px;">${t}</button>
                        `).join('')}
                    </div>
                </div>

                <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <label style="font-weight:500;font-size:0.8rem;color:#1f3b53;">💰 价值(万)</label>
                    <input type="number" id="settleBookValue" placeholder="输入价值" style="flex:1;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;">
                </div>
                <div style="font-size:0.65rem;color:#8ab0c8;margin-top:4px;" id="settleBookDisplay">💡 当前选择：<span id="settleBookDisplayText">${autoLevelLabel} 书</span></div>
            </div>

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

    const bookTypeBtns = overlay.querySelectorAll('.ph-book-type-btn');
    const bookNameList = document.getElementById('settleBookNameList');
    const bookNameContainer = document.getElementById('settleBookNameContainer');

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
            currentIsZhanpo = false;
            bookNameContainer.style.display = currentBookType === '书' ? 'block' : 'none';
            const zhanpoRow = document.getElementById('settleZhanpoRow');
            if (zhanpoRow) {
                zhanpoRow.style.display = (currentBookType === '铁' && autoLevel === 150) ? 'block' : 'none';
                const zb = zhanpoRow.querySelector('.ph-zhanpo-btn');
                zb.style.background = '#f0f4f8';
                zb.style.borderColor = '#bccad9';
                zb.style.color = '#1f3b53';
            }
            updateDisplayText();
            updatePreview();
        });
    });

    const zhanpoBtn = overlay.querySelector('.ph-zhanpo-btn');
    if (zhanpoBtn) {
        zhanpoBtn.addEventListener('click', function() {
            currentIsZhanpo = !currentIsZhanpo;
            if (currentIsZhanpo) {
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
            } else {
                this.style.background = '#f0f4f8';
                this.style.borderColor = '#bccad9';
                this.style.color = '#1f3b53';
            }
            updateDisplayText();
            updatePreview();
        });
    }

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

    document.getElementById('settleBookValue').addEventListener('input', updatePreview);

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
            if (currentIsZhanpo) {
                detailText = `${typeText} 战魄`;
            } else {
                detailText = `${typeText} ${autoLevel}级铁`;
            }
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

        let bookLabel = '';
        if (currentBookType === '书') {
            bookLabel = `${autoLevel}级${currentBookName || '书'}`;
        } else {
            bookLabel = currentIsZhanpo ? '战魄' : `${autoLevel}级铁`;
        }

        document.getElementById('settlePreviewTotal').textContent = 
            `修炼点${pointsVal.toFixed(1)} + ${bookLabel}(${bookValue}万) + ${rewardLabel}(${rewardVal.toFixed(1)}万) = ${totalIncome.toFixed(1)}万`;
        document.getElementById('settlePreviewProfit').textContent = `${profit >= 0 ? '✅' : '❌'} ${profit.toFixed(1)}万`;
        document.getElementById('settlePreviewProfit').style.color = profit >= 0 ? '#2d6b2d' : '#c0392b';
    }

    updateDisplayText();
    updatePreview();

    document.getElementById('settleFullCancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

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
            if (currentIsZhanpo) {
                bookDisplayName = '战魄';
            } else {
                bookDisplayName = `${bookLevel}级铁`;
            }
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

        const visibleRecords = this.records.filter(r => !r.deleted);
        const ringsData = visibleRecords.map(r => ({
            taskIndex: r.taskIndex,
            typeKey: r.typeKey,
            label: this.ITEM_TYPES.find(t => t.key === r.typeKey)?.label || r.typeKey,
            cost: r.cost,
            score: r.score,
            ringPoints: r.ringPoints,
            isDeduct: r.isDeduct || false,
            isRelog: r.isRelog || false,
            date: r.date,
            timestamp: r.timestamp || null,
            shichen: r.shichen || '',
            shichenIndex: r.shichenIndex !== undefined ? r.shichenIndex : -1,
            halfHour: r.halfHour !== undefined ? r.halfHour : -1,
            secondsInHalfHour: r.secondsInHalfHour !== undefined ? r.secondsInHalfHour : -1,
            isDaytime: r.isDaytime || false,
            timeStr: r.timeStr || ''
        }));

        const shopConfig = this.getShopRefreshConfig();
        const nowForShichen = new Date();
        const shopTargetMinute = Math.floor(nowForShichen.getMinutes() / 10) * 10 + shopConfig.secondMinute;
        const shopTargetSec = shopTargetMinute * 60 + shopConfig.secondSecond;
        const shopTargetDate = new Date(nowForShichen);
        shopTargetDate.setMinutes(shopTargetMinute, shopConfig.secondSecond, 0);
        const shopShichen = this.getShichen(shopTargetDate.getTime());
        shopConfig.shichen = shopShichen.name;
        shopConfig.isDaytime = shopShichen.isDaytime;
        const endTs = this.records.length > 0 ? this.records[this.records.length - 1].clickTimestamp : Date.now();
        const entry = {
            date: new Date().toLocaleString(),
            runId: this.currentRunId,
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
            relogCount: ringsData.filter(r => r.isRelog).length,
            shopRefreshConfig: shopConfig,
            startTimestamp: this.startTimestamp || null,
            startShichen: this.startTimestamp ? this.getShichen(this.startTimestamp).name : '',
            startIsDaytime: this.startTimestamp ? this.getShichen(this.startTimestamp).isDaytime : false,
            endTimestamp: endTs,
            endShichen: this.getShichen(endTs).name,
            endIsDaytime: this.getShichen(endTs).isDaytime
        };

        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.pendingRelog = false;
        this.startTimestamp = null;
        this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
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

    prepareSettle() {
        const stats = this.calcStats();
        const income = this.calcIncome(stats);
        if (stats.ringCount >= 100) {
            return;
        } else {
            this.quickSettle(stats, income);
        }
    },

    quickSettle(stats, income) {
        const fruitPrice = this.fruitPrice || 80;
        const pointsValue = stats.totalPoints * (fruitPrice / 170);
        const rewards = this.bookRewards.map(b => `${b.name}(${b.value}万)`).join(' + ');

        const visibleRecords = this.records.filter(r => !r.deleted);
        const ringsData = visibleRecords.map(r => ({
            taskIndex: r.taskIndex,
            typeKey: r.typeKey,
            label: this.ITEM_TYPES.find(t => t.key === r.typeKey)?.label || r.typeKey,
            cost: r.cost,
            score: r.score,
            ringPoints: r.ringPoints,
            isDeduct: r.isDeduct || false,
            isRelog: r.isRelog || false,
            date: r.date,
            timestamp: r.timestamp || null,
            shichen: r.shichen || '',
            shichenIndex: r.shichenIndex !== undefined ? r.shichenIndex : -1,
            halfHour: r.halfHour !== undefined ? r.halfHour : -1,
            secondsInHalfHour: r.secondsInHalfHour !== undefined ? r.secondsInHalfHour : -1,
            isDaytime: r.isDaytime || false,
            timeStr: r.timeStr || ''
        }));

        const shopConfig = this.getShopRefreshConfig();
        const nowForShichen = new Date();
        const shopTargetMinute = Math.floor(nowForShichen.getMinutes() / 10) * 10 + shopConfig.secondMinute;
        const shopTargetDate = new Date(nowForShichen);
        shopTargetDate.setMinutes(shopTargetMinute, shopConfig.secondSecond, 0);
        const shopShichen = this.getShichen(shopTargetDate.getTime());
        shopConfig.shichen = shopShichen.name;
        shopConfig.isDaytime = shopShichen.isDaytime;
        const endTs = this.records.length > 0 ? this.records[this.records.length - 1].clickTimestamp : Date.now();

        const entry = {
            date: new Date().toLocaleString(),
            runId: this.currentRunId,
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
            rings: ringsData,
            relogCount: ringsData.filter(r => r.isRelog).length,
            shopRefreshConfig: shopConfig,
            startTimestamp: this.startTimestamp || null,
            startShichen: this.startTimestamp ? this.getShichen(this.startTimestamp).name : '',
            startIsDaytime: this.startTimestamp ? this.getShichen(this.startTimestamp).isDaytime : false,
            endTimestamp: endTs,
            endShichen: this.getShichen(endTs).name,
            endIsDaytime: this.getShichen(endTs).isDaytime
        };
        this.history.push(entry);
        this.records = [];
        this.bookRewards = [];
        this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
        this.pendingSettle = null;
        this.pendingRelog = false;
        this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6); 
        this.saveData();
        this.startTimestamp = null;

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

    confirmSettle() {
        alert('请使用结算弹窗完成结算');
    },

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

    getShopRefreshConfig() {
        try {
            const shopData = Storage.get('shopHelper', {});
            return {
                secondMinute: shopData.secondMinute !== undefined ? shopData.secondMinute : 3,
                secondSecond: shopData.secondSecond !== undefined ? shopData.secondSecond : 20
            };
        } catch (e) {
            return { secondMinute: 3, secondSecond: 20 };
        }
    },

    getNextShopRefreshCountdown() {
        const config = this.getShopRefreshConfig();
        const now = new Date();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        
        const baseMinute = Math.floor(minute / 10) * 10;
        let targetMinute = baseMinute + config.secondMinute;
        let targetSecond = config.secondSecond;
        
        const nowSec = minute * 60 + second;
        const targetSec = targetMinute * 60 + targetSecond;
        
        let diff = targetSec - nowSec;
        if (diff < 0) {
            diff += 600;
        }
        
        return diff;
    },

    SHICHEN_COLORS: {
        '子': '#4A90D9',
        '丑': '#8E44AD',
        '寅': '#16A085',
        '卯': '#27AE60',
        '辰': '#D4A017',
        '巳': '#E67E22',
        '午': '#C0392B',
        '未': '#E91E63',
        '申': '#8D6E63',
        '酉': '#F39C12',
        '戌': '#7F8C8D',
        '亥': '#2C3E50'
    },

    getShichenColor(name) {
        return this.SHICHEN_COLORS[name] || '#B8860B';
    },

    getShichen(timestamp) {
        const date = new Date(timestamp);
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const totalSeconds = minute * 60 + second;
        
        const halfHourIndex = Math.floor(totalSeconds / 1800);
        const secondsInHalfHour = totalSeconds % 1800;
        
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

    getNextRefreshCountdown() {
        const now = new Date();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        
        const nextRefreshMinute = Math.ceil((minute + 1) / 10) * 10;
        const minutesLeft = nextRefreshMinute - minute - 1;
        const secondsLeft = 60 - second;
        
        return minutesLeft * 60 + secondsLeft;
    },

    formatCountdown(seconds) {
        if (seconds < 0) seconds = 0;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    
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

        const visibleRecords = this.records.filter(r => !r.deleted);

        for (let r of visibleRecords) {
            totalCost += r.cost;
            totalScore += r.score;
            totalPoints += r.ringPoints;
            if (typeCount[r.typeKey] !== undefined) typeCount[r.typeKey]++;
            else typeCount[r.typeKey] = 1;
        }

        const count = visibleRecords.length;
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
        
        // 🆕 默认排除已隐藏的
        if (!this.showHidden) {
            data = data.filter(h => !h.hidden);
        }
        
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
                <div class="stat-item">
                    <div class="num" id="prCurrentShichen">--</div>
                    <div class="label">⏱️ 当前时辰</div>
                </div>
                <div class="stat-item"><div class="num" id="prNextShichenCountdown" style="font-size:0.85rem;">--</div><div class="label">⏳ 下时辰</div></div>
                <div class="stat-item">
                    <div class="num" id="prNextRefreshCountdown">--:--</div>
                    <div class="label" id="prRefreshShichen">🔄 下次刷新</div>
                </div>
                <div class="stat-item"><div class="num" id="prTotalCost">10.0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="prTotalScore">0</div><div class="label">⭐ 总积分</div></div>
                <div class="stat-item">
                    <div class="num" id="prRingCount">0 / 100 剩</div>
                    <div class="label">📌 当前/剩余环数</div>
                </div>
            </div>

<div id="prRelogAnalysis" style="font-size:0.85rem;color:#1f3b53;padding:6px 12px;background:#fdf8ee;border-radius:10px;margin-bottom:8px;border:1px solid #f0e8d0;font-weight:600;">
    🔁 等待重登标记...
</div>

            <div class="module" id="prModuleTask">
                <div class="module-header">
                    <div class="title">📋 任务类型 <span class="hint">— 点击记录一环</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="btn-start" id="prStartRunBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 16px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.7rem;">▶️ 开始跑环</button>
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
                        <span style="font-weight:600;font-size:0.75rem;color:#1f3b53;white-space:nowrap;">⚙️ 扣分设置</span>
                        <span id="prRealtimeWindow" style="margin-left:10px;font-size:0.75rem;font-weight:700;color:#1f3b53;white-space:nowrap;"></span>
                        <button class="toggle-btn" id="prToggleDeductBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:1px 12px;font-size:0.6rem;cursor:pointer;font-weight:600;color:#1f3b53;">👁️ 隐藏</button>
                    </div>
                    <div class="deduct-settings-inline" id="prDeductSettings" style="margin-top:4px;"></div>
                </div>
            </div>
                        <div class="module" id="prModuleHistory">
                <div class="module-header">
                  <div class="title">📜 本轮记录 <span class="hint" id="prRingInfo">共0环</span> <span id="prCurrentRingShichen" style="color:#c0392b;font-size:inherit;font-weight:700;margin-left:4px;"></span> <button class="btn-small" id="prViewAllRingsBtn" style="background:#6b8baa;color:#fff;border:none;padding:2px 14px;border-radius:30px;font-size:0.65rem;cursor:pointer;margin-left:6px;">📋 查看全部</button></div>
                     <span id="prTopShichenHint" style="margin-left:8px;font-size:inherit;font-weight:700;color:#1f3b53;"></span>
                      <span id="prRealtimeShichenRate" style="margin-left:10px;font-size:0.75rem;font-weight:700;padding:2px 10px;border-radius:12px;background:#f0f5fb;border:1px solid #dce5ef;white-space:nowrap;color:#1f3b53;"></span>
                    <button class="toggle-btn" id="prToggleHistoryBtn">👁️ 隐藏</button>
                </div>
    <div class="module-body" id="prHistoryBody">
        <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="flex:1;min-width:0;">
                <div class="history-section" id="prHistoryList" style="max-height:200px;overflow-y:auto;"><div class="empty-history">暂无记录</div></div>
            </div>
               <div style="flex:1;min-width:0;">
               <div style="background:#f8faff;border-radius:12px;padding:4px 8px;font-size:0.75rem;border:1px solid #dce5ef;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:4px;">
                        <div style="font-weight:700;color:#1f3b53;">⏱️ 时辰权重表</div>
                        <div style="display:flex;gap:4px;align-items:center;">
                            <button id="prResetShichenLRBtn" style="background:#b48b5f;color:#fff;border:none;border-radius:30px;padding:2px 10px;font-size:0.6rem;font-weight:600;cursor:pointer;white-space:nowrap;">🔄 重置</button>
                            <select id="prWeightRange" style="font-size:0.65rem;padding:2px 4px;border-radius:8px;border:1px solid #bccad9;background:white;">
                                <option value="all">全部</option>
                                <option value="1">1天</option>
                                <option value="2">2天</option>
                                <option value="3">3天</option>
                                <option value="4">4天</option>
                                <option value="5">5天</option>
                                <option value="6">6天</option>
                            </select>
                        </div>
                    </div>
                   <div id="prWeightList" style="display:grid;grid-template-columns:1fr 1fr;gap:0 10px;"></div>
                </div>
            </div>
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
                        <label style="font-weight:600;font-size:0.8rem;color:#1f3b53;">💱 1元RMB = </label>
                        <input type="number" step="0.1" min="0" id="prExchangeRate" value="${this.exchangeRate ? (1 / this.exchangeRate).toFixed(1) : 12.5}"style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:20px;font-size:0.8rem;text-align:center;">
                        <span style="font-size:0.8rem;color:#1f3b53;">万梦幻币</span>
                        <span style="font-size:0.65rem;color:#5a7a94;margin-left:8px;">💡 例：12.5 = 1元=12.5万梦幻币</span>
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
                            <button class="btn-toggle-history" id="prShowHiddenBtn" style="background:#6b8baa;">🙈 显示隐藏</button>
                             <span id="prShowHiddenStatus" style="font-size:0.6rem;color:#5a7a94;margin-left:4px;align-self:center;">（隐藏已过滤）</span>
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

    bindEvents() {
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

        document.getElementById('prExchangeRate').addEventListener('input', function() {
            const val = parseFloat(this.value) || 0;
            PetRingModule.exchangeRate = val > 0 ? (1 / val) : 0;
            PetRingModule.saveData();
            PetRingModule.render();
        });
        
document.getElementById('prStartRunBtn').addEventListener('click', function() {
    if (PetRingModule.records.length > 0) {
        if (!confirm('已经跑了一些环，确定要重新计时？\n（不会删除记录，只重置首环时辰）')) return;
    }
    
    PetRingModule.startTimestamp = Date.now();
    PetRingModule.saveData();
    
    const shichen = PetRingModule.getShichen(PetRingModule.startTimestamp);
    const dayNight = shichen.isDaytime ? '☀️' : '🌙';
    const timeStr = new Date(PetRingModule.startTimestamp).toLocaleTimeString();
    
    const btn = document.getElementById('prStartRunBtn');
    btn.textContent = `✅ 已开始 ${timeStr}`;
    btn.style.background = '#8a9a8a';
    
    alert(`✅ 已开始跑环\n时间：${timeStr}\n时辰：${dayNight}${shichen.name}时\n\n现在可以点击任务按钮记录第1环`);
    
    PetRingModule.updateTimeAndShichen();
});

document.getElementById('prMarkRelogBtn').addEventListener('click', function() {
    if (PetRingModule.pendingRelog) {
        alert('已有待标记的重登，请先记录当前环再标记下一环');
        return;
    }
    PetRingModule.pendingRelog = true;
    const nextIndex = PetRingModule.records.length + 1;
    document.getElementById('prRelogStatus').textContent = `⏳ 第${nextIndex}环待标记 🔁`;
    document.getElementById('prRelogStatus').style.color = '#dbbd7c';
    document.getElementById('prCancelRelogBtn').style.display = 'inline-block';
    PetRingModule.updateRelogAnalysis(); 
});

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

        document.getElementById('prToggleDeductBtn')?.addEventListener('click', function() {
            const body = document.getElementById('prDeductSettings');
            if (body) {
                const isHidden = body.style.display === 'none';
                body.style.display = isHidden ? 'flex' : 'none';
                body.classList.toggle('hidden');
                this.textContent = isHidden ? '👁️ 隐藏' : '👁️ 显示';
            }
        });

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

        document.getElementById('prShowHiddenBtn').addEventListener('click', function() {
            PetRingModule.showHidden = !PetRingModule.showHidden;
            this.textContent = PetRingModule.showHidden ? '👁️ 不显示隐藏' : '🙈 显示隐藏';
            this.style.background = PetRingModule.showHidden ? '#4c7a5c' : '#6b8baa';
            const status = document.getElementById('prShowHiddenStatus');
            if (status) {
                status.textContent = PetRingModule.showHidden ? '（含隐藏数据）' : '（隐藏已过滤）';
                status.style.color = PetRingModule.showHidden ? '#c0392b' : '#5a7a94';
            }
            PetRingModule.updateHistoryTable();
            PetRingModule.updateAnalysis(PetRingModule.getFilteredData());
            PetRingModule.renderShichenWeights();   // 🆕 同步刷新权重表
        });

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

        document.getElementById('prUndoBtn').addEventListener('click', () => this.undoRecord());

        const viewAllBtn = document.getElementById('prViewAllRingsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllRingsModal());
        }

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

        document.getElementById('prResetBtn').addEventListener('click', () => {
            if (confirm('重置本轮所有记录？（不会删除已结算的历史）')) {
                this.records = [];
                this.bookRewards = [];
                this.extraRewards = { points: 0, fruits: 0, furnitures: 0 };
                this.pendingSettle = null;
                this.pendingRelog = false;
                this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6); 
                this.startTimestamp = null;
                this.currentRunId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                document.getElementById('prRelogStatus').textContent = '无待标记';
                document.getElementById('prRelogStatus').style.color = '#5a7a94';
                
                const startBtn = document.getElementById('prStartRunBtn');
                if (startBtn) {
                    startBtn.textContent = '▶️ 开始跑环';
                    startBtn.style.background = '#4c7a5c';
                }
                
                this.saveData();
                this.render();
            }
        });

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

        document.getElementById('prFruitPrice').addEventListener('change', () => {
            const val = parseFloat(document.getElementById('prFruitPrice').value) || 80;
            PetRingModule.fruitPrice = val;
            PetRingModule.saveData();
            PetRingModule.render();
        });
        document.getElementById('prFurniturePrice').addEventListener('change', () => this.render());

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

        document.getElementById('settleModalCancel').addEventListener('click', () => {
            document.getElementById('settleModal').classList.remove('show');
        });
        document.getElementById('settleModalConfirm').addEventListener('click', () => {
            document.getElementById('settleModal').classList.remove('show');
        });
        document.getElementById('settleModal').addEventListener('click', (e) => {
            if (e.target === this) this.classList.remove('show');
        });

document.getElementById('prHistoryTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.detail-toggle');
    if (btn) {
        const idx = parseInt(btn.dataset.idx);
        if (!isNaN(idx) && idx >= 0 && idx < this.history.length) {
            this.showRingsDetailModal(this.history[idx]);
        }
        return;
    }
    
    // 🆕 隐藏/恢复按钮
    const hideBtn = e.target.closest('.hide-btn');
    if (hideBtn) {
        const idx = parseInt(hideBtn.dataset.idx);
        if (!isNaN(idx) && idx >= 0 && idx < this.history.length) {
            const entry = this.history[idx];
            entry.hidden = !entry.hidden;
            this.saveData();
            this.updateStats();
            this.updateHistory();
            this.updateAdvice();
            this.updateBookList();
            this.updateHistoryTable();
        }
        return;
    }
    
    
    const delBtn = e.target.closest('.del-btn');
    if (delBtn) {
        const idx = parseInt(delBtn.dataset.idx);
        if (!isNaN(idx) && idx >= 0 && idx < this.history.length) {
            if (confirm('⚠️ 删除历史会影响其他设备的同步过滤，确定要删除吗？\n\n建议用「🙈 隐藏」代替删除。')) {
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
        
const weightRangeEl = document.getElementById('prWeightRange');
if (weightRangeEl) {
    weightRangeEl.addEventListener('change', function() {
        PetRingModule.renderShichenWeights();
    });
}

const resetShichenLRBtn = document.getElementById('prResetShichenLRBtn');
if (resetShichenLRBtn) {
    resetShichenLRBtn.addEventListener('click', function() {
        PetRingModule.lrResetTs = Date.now();
        PetRingModule.saveData();
        PetRingModule.renderShichenWeights();
        this.textContent = '🔄 已重置';
        this.style.background = '#8a9a8a';
        setTimeout(() => {
            this.textContent = '🔄 重置';
            this.style.background = '#b48b5f';
        }, 1500);
    });
}
        
        document.getElementById('prSortHeader')?.addEventListener('click', function() {
            PetRingModule.sortState.order = PetRingModule.sortState.order === 'desc' ? 'asc' : 'desc';
            PetRingModule.updateHistoryTable();
        });
    },

// 🆕 显示每环详细数据弹窗（兼容旧数据）
// 改动：每个区块独立折叠按钮
showRingsDetailModal(entry) {
    if (!entry) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';

    // 🆕 区块标题 + 折叠按钮的统一样式
    const secHeader = (icon, title, bodyId) => `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div style="font-weight:700;font-size:0.75rem;color:#1f3b53;">${icon} ${title}</div>
            <button class="rings-sec-toggle" data-target="${bodyId}" style="padding:1px 10px;border-radius:20px;border:1px solid #bccad9;background:#dce5ef;color:#1f3b53;cursor:pointer;font-size:0.6rem;font-weight:600;">👁️</button>
        </div>
    `;

    let html = `
            <div id="ringsDetailBox" style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:1200px;width:95%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
              <!-- ========== 固定区（不滚动） ========== -->
              <div style="flex-shrink:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
               <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <h3 style="color:#1f3b53;margin:0;font-size:1.2rem;">📊 ${entry.ringCount || 0}环 详细数据</h3>
                    <button id="ringsDetailTopClose" style="padding:6px 20px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.8rem;background:#dce5ef;color:#1f3b53;">关闭</button>
                </div>
                <div style="display:flex;gap:4px;">
                    <button id="ringsDetailSmaller" style="background:#dce5ef;border:none;border-radius:20px;padding:2px 10px;font-size:0.7rem;cursor:pointer;color:#1f3b53;">缩小</button>
                    <button id="ringsDetailLarger" style="background:#6b8baa;color:#fff;border:none;border-radius:20px;padding:2px 10px;font-size:0.7rem;cursor:pointer;">放大</button>
                </div>
            </div>
            <div style="font-size:0.8rem;color:#5a7a94;margin-bottom:8px;">${entry.date || '未知日期'}</div>
            
            <!-- ========== 区块1：总览 ========== -->
            <div id="ringsSecOverview" style="margin-bottom:10px;">
                ${secHeader('📊', '总览', 'ringsSecOverviewBody')}
                <div id="ringsSecOverviewBody" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;padding:8px 12px;background:#f0f5fb;border-radius:12px;border:1px solid #dce5ef;">
                    <div><span style="color:#5a7a94;">总积分</span> <strong>${entry.totalScore || 0}</strong></div>
                    <div><span style="color:#5a7a94;">总成本</span> <strong>${(entry.totalCost || 0).toFixed(1)}万</strong></div>
                    <div><span style="color:#5a7a94;">总收入</span> <strong>${(entry.totalIncome || 0).toFixed(1)}万</strong></div>
                    <div><span style="color:#5a7a94;">利润</span> <strong style="color:${(entry.profit||0)>=0?'#2d6b2d':'#c0392b'};">${(entry.profit||0)>=0?'+':''}${(entry.profit||0).toFixed(1)}万</strong></div>
                    ${(entry.relogCount || 0) > 0 ? `<div><span style="color:#dbbd7c;">🔁 重登</span> <strong style="color:#dbbd7c;">${entry.relogCount}次</strong></div>` : ''}
                    ${entry.shopRefreshConfig ? `<div><span style="color:#5a7a94;">🔄 二刷</span> <strong style="color:#c0392b;">${entry.shopRefreshConfig.secondMinute}分${entry.shopRefreshConfig.secondSecond}秒</strong></div>` : ''}
                    ${(() => {
                        const st = entry.startTimestamp || (entry.rings?.[0]?.timestamp) || null;
                        if (!st) return '';
                        return `<div><span style="color:#5a7a94;">▶️ 开始</span> <strong>${new Date(st).toLocaleTimeString()}</strong></div>`;
                    })()}
                    ${entry.endTimestamp ? `<div><span style="color:#5a7a94;">⏹️ 结束</span> <strong>${new Date(entry.endTimestamp).toLocaleTimeString()}</strong></div>` : ''}
                </div>
            </div>

            <!-- ========== 区块2：时辰筛选 ========== -->
            <div id="ringsSecShichen" style="margin-bottom:10px;">
                ${secHeader('⏱️', '时辰筛选', 'ringsSecShichenBody')}
                <div id="ringsSecShichenBody" style="padding:8px 10px;background:#f0f5fb;border-radius:10px;border:1px solid #dce5ef;">
                    <div id="ringsShichenBtns" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;"></div>
                    <div id="ringsShichenStats" style="font-size:0.75rem;color:#1f3b53;padding:6px 8px;background:white;border-radius:8px;border:1px solid #e8eef5;">
                        点击上方时辰查看该时辰的任务分布
                    </div>
                </div>
            </div>
            
            ${(() => {
                const t = this.calcWindowTimeline(entry.rings || []);
                const buildBody = (list, stepMin) => {
                    if (!list || list.length === 0) return '<span style="color:#8ab0c8;font-size:0.65rem;">无数据</span>';
                    return list.map(w => {
                        const color = w.rate === null ? '#8ab0c8' : w.rate < 33 ? '#2d6b2d' : w.rate < 45 ? '#b48b3a' : '#c0392b';
                        return `<span style="background:white;padding:1px 6px;border-radius:8px;font-size:0.62rem;border:1px solid #dce5ef;white-space:nowrap;margin:2px;">
                            ${w.start}~${w.end} <span style="color:${color};font-weight:700;">${w.rate === null ? '—' : w.rate + '%'}</span> (${w.total}环)
                        </span>`;
                    }).join('');
                };
                return `
                    <!-- ========== 区块3：10分钟段 ========== -->
                    <div id="ringsSecW10" style="margin-bottom:10px;">
                        ${secHeader('📊', '10分钟段找人率变化', 'ringsSecW10Body')}
                        <div id="ringsSecW10Body" style="padding:6px 10px;background:#f0f5fb;border-radius:10px;border:1px solid #dce5ef;display:flex;flex-wrap:wrap;gap:2px;">
                            ${buildBody(t.w10, 10)}
                        </div>
                    </div>
                    <!-- ========== 区块4：30分钟段 ========== -->
                    <div id="ringsSecW30" style="margin-bottom:10px;">
                        ${secHeader('📊', '30分钟段找人率变化', 'ringsSecW30Body')}
                        <div id="ringsSecW30Body" style="padding:6px 10px;background:#f0f5fb;border-radius:10px;border:1px solid #dce5ef;display:flex;flex-wrap:wrap;gap:2px;">
                            ${buildBody(t.w30, 30)}
                        </div>
                    </div>
                `;
            })()}

            <!-- ========== 区块5：任务分布 ========== -->
            <div id="ringsSecTasks" style="margin-bottom:10px;">
                ${secHeader('📌', '任务分布', 'ringsSecTasksBody')}
                <div id="ringsSecTasksBody" style="display:flex;flex-wrap:wrap;gap:4px;">
    `;

    const typeCount = entry.typeCount || {};
    let hasTypeCount = false;
    const hasMedicine = entry.rings ? entry.rings.some(r => r.typeKey === 'medicine') : false;

    for (let [key, count] of Object.entries(typeCount)) {
        if (count > 0) {
            hasTypeCount = true;
            let label;
            if (key === 'cook') {
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

    html += `</div></div>`;

    // ===== 区块6：重登区间 =====
    const rings = entry.rings || [];
    let relogHtml = '';
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
                relogHtml = intervals.join(' | ');
            }
        }
    }

    if (relogHtml) {
        html += `
            <div id="ringsSecRelog" style="margin-bottom:10px;">
                ${secHeader('🔁', '重登区间分析', 'ringsSecRelogBody')}
                <div id="ringsSecRelogBody" style="padding:6px 10px;background:#fdf8ee;border-radius:8px;border:1px solid #f0e8d0;font-size:0.7rem;color:#1f3b53;">
                    ${relogHtml}
                </div>
            </div>
        `;
    }

    // ===== 固定区结束 =====
    html += `</div>`;

    // ===== 滚动区开始：每环详情 =====
    html += `
            <div style="flex-shrink:0;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-size:0.7rem;color:#5a7a94;">📋 每环详情：</div>
                <div style="font-size:0.65rem;color:#8ab0c8;">（下方列表可滚动，上方固定）</div>
            </div>
            <div id="ringsDetailListWrap" style="flex:1;min-height:0;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;background:white;">
        `;
    if (rings.length > 0) {
        let cumulativePoints = 0;
        const pointsMap = {};
        for (let r of rings) {
            cumulativePoints += r.score || 0;
            pointsMap[r.taskIndex] = cumulativePoints;
        }
        for (let r of rings) {
            let label = r.label || this.getTaskLabel(r.typeKey);
            if (r.typeKey === 'cook' && !hasMedicine) {
                label = '烹饪三药';
            }
            const relogIcon = r.isRelog ? ' 🔁' : '';
            const bgColor = r.isRelog ? '#fdf8ee' : 'transparent';
            
            html += `
                    <div class="ring-detail-row" data-shichen="${r.shichen || ''}" style="display:flex;justify-content:space-between;align-items:center;padding:3px 8px;border-bottom:1px solid #f0f4f8;background:${bgColor};font-size:0.75rem;gap:6px;">
                    <span style="font-weight:600;color:#1f3b53;min-width:50px;font-size:0.75rem;">第${r.taskIndex}环</span>
                    <span style="color:${r.typeKey === 'find' ? '#c0392b' : '#1f3b53'};min-width:60px;font-size:0.75rem;">${label}${relogIcon}</span>
                    <span style="color:${r.shichen ? this.getShichenColor(r.shichen) : '#B8860B'};font-size:inherit;font-weight:600;min-width:50px;">${r.shichen ? (r.isDaytime ? '☀️' : '🌙') + r.shichen + '时' : ''}</span>
                    <span style="color:#1a1a2e;font-size:0.75rem;min-width:60px;">${(() => { if (!r.date) return r.timeStr || ''; const p = r.date.split(' ')[0].split('/'); return p.length >= 3 ? p[1] + '/' + p[2] + ' ' + (r.timeStr || '') : r.timeStr || ''; })()}</span>
                    <span style="color:#1a1a2e;font-size:0.75rem;">💰${(r.cost || 0).toFixed(1)} ⭐${r.score || 0} 累计${pointsMap[r.taskIndex] || 0}</span>
                    ${r.isRelog ? '<span style="color:#dbbd7c;font-weight:700;font-size:0.75rem;">🔁重登</span>' : '<span style="color:#1a1a2e;font-size:0.75rem;">✅</span>'}
                </div>
            `;
        }
    } else if (hasTypeCount) {
        html += `
            <div style="margin-top:8px;padding:8px 12px;background:#f5f8fc;border-radius:8px;border:1px solid #e8eef5;text-align:center;color:#5a7a94;font-size:0.75rem;">
                ℹ️ 该轮次为旧数据，仅显示任务次数统计（无每环详情）
            </div>
        `;
    }
    html += `</div>`;

    // ===== 底部固定 =====
    html += `
            <div class="modal-actions" style="flex-shrink:0;display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                <button class="btn-cancel" id="ringsDetailClose" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">关闭</button>
            </div>
        </div>
    `;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    const detailBox = document.getElementById('ringsDetailBox');
    if (detailBox) {
        document.getElementById('ringsDetailLarger').addEventListener('click', () => {
            const currentMaxWidth = parseInt(detailBox.style.maxWidth) || 1200;
            detailBox.style.maxWidth = Math.min(currentMaxWidth + 200, 1800) + 'px';
            detailBox.style.width = Math.min(currentMaxWidth + 200, 1800) + 'px';
        });
        document.getElementById('ringsDetailSmaller').addEventListener('click', () => {
            const currentMaxWidth = parseInt(detailBox.style.maxWidth) || 1200;
            detailBox.style.maxWidth = Math.max(currentMaxWidth - 200, 500) + 'px';
            detailBox.style.width = Math.max(currentMaxWidth - 200, 500) + 'px';
        });
    }

    // 🆕 每个区块独立的折叠按钮
    overlay.querySelectorAll('.rings-sec-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const body = document.getElementById(targetId);
            if (!body) return;
            const hidden = body.style.display === 'none';
            body.style.display = hidden ? '' : 'none';
            // 按钮文字切换
            if (hidden) {
                this.textContent = '👁️';
                this.style.background = '#dce5ef';
                this.style.color = '#1f3b53';
            } else {
                this.textContent = '👁️‍🗨️';
                this.style.background = '#f0e8d0';
                this.style.color = '#8a6a3a';
            }
        });
    });

    const shichenBtnContainer = document.getElementById('ringsShichenBtns');
    const shichenStatsContainer = document.getElementById('ringsShichenStats');
    const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const SHICHEN_COLORS = this.SHICHEN_COLORS || {};

    const calcShichenStats = (filterShichen) => {
        const stats = { total: 0, typeCount: {} };
        for (let r of rings) {
            if (!r.shichen) continue;
            if (filterShichen && r.shichen !== filterShichen) continue;
            stats.total++;
            stats.typeCount[r.typeKey] = (stats.typeCount[r.typeKey] || 0) + 1;
        }
        return stats;
    };

    const renderShichenStats = (filterShichen) => {
        const stats = calcShichenStats(filterShichen);
        if (stats.total === 0) {
            shichenStatsContainer.innerHTML = '该时辰暂无数据';
            return;
        };
        
        const findCount = stats.typeCount['find'] || 0;
        const findPct = Math.round((findCount / stats.total) * 100);
        const itemCount = stats.total - findCount;
        const itemPct = Math.round((itemCount / stats.total) * 100);
        
        let html = `<div style="margin-bottom:6px;font-weight:700;">共 ${stats.total} 环 | 🔍找人 ${findCount}次 (${findPct}%) | 📦物品 ${itemCount}次 (${itemPct}%)</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:3px;">`;
        
        const sortedTypes = Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1]);
        for (let [key, count] of sortedTypes) {
            const type = this.ITEM_TYPES.find(t => t.key === key);
            const label = type ? type.label : key;
            const pct = Math.round((count / stats.total) * 100);
            html += `<span style="display:inline-block;background:#f0f5fb;padding:2px 8px;border-radius:10px;font-size:0.7rem;">${label}: ${count}次 (${pct}%)</span>`;
        }
        html += `</div>`;
        
        shichenStatsContainer.innerHTML = html;
    }

    let btnsHtml = `<button class="shichen-filter-btn" data-shichen="" style="padding:2px 10px;border-radius:12px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;cursor:pointer;font-size:0.7rem;font-weight:600;">全部</button>`;
    for (let name of shichenNames) {
        const hasData = rings.some(r => r.shichen === name);
        const color = SHICHEN_COLORS[name] || '#B8860B';
        if (!hasData) {
            btnsHtml += `<button disabled style="padding:2px 10px;border-radius:12px;border:1px solid #e0e0e0;background:#f5f5f5;color:#ccc;font-size:0.7rem;">${name}</button>`;
        } else {
            btnsHtml += `<button class="shichen-filter-btn" data-shichen="${name}" style="padding:2px 10px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;color:${color};cursor:pointer;font-size:0.7rem;font-weight:600;">${name}时</button>`;
        }
    }
    shichenBtnContainer.innerHTML = btnsHtml;

    shichenBtnContainer.querySelectorAll('.shichen-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            shichenBtnContainer.querySelectorAll('.shichen-filter-btn').forEach(b => {
                const name = b.dataset.shichen;
                const color = name ? (SHICHEN_COLORS[name] || '#B8860B') : '#4CAF50';
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = color;
            });
            this.style.background = '#4CAF50';
            this.style.borderColor = '#4CAF50';
            this.style.color = '#fff';
            
            const filterShichen = this.dataset.shichen || '';
            renderShichenStats(filterShichen);
            
            const ringRows = overlay.querySelectorAll('.ring-detail-row');
            ringRows.forEach(row => {
                const rowShichen = row.dataset.shichen || '';
                if (filterShichen && rowShichen !== filterShichen) {
                    row.style.display = 'none';
                } else {
                    row.style.display = 'flex';
                }
            });
        });
    });

    renderShichenStats('');
    
    document.getElementById('ringsDetailClose').addEventListener('click', () => {
        overlay.remove();
    });
    
    document.getElementById('ringsDetailTopClose').addEventListener('click', () => {
    overlay.remove();
});
},

    addRecord(key) {
        if (this.records.filter(r => !r.deleted).length >= 100) {
            alert('本轮已满100环，请先结算！');
            return;
        }
        if (!this.startTimestamp && this.records.length === 0) {
            alert('请先点击「▶️ 开始跑环」按钮！');
            return;
        }
        const price = this.prices[key] || 0;
        const type = this.ITEM_TYPES.find(t => t.key === key);
        const score = type ? type.score : 0;
        const visibleRecords = this.records.filter(r => !r.deleted);
        const idx = visibleRecords.length;
        
        const isRelog = this.pendingRelog || false;
        if (this.pendingRelog) {
            this.pendingRelog = false;
            document.getElementById('prRelogStatus').textContent = '无待标记';
            document.getElementById('prRelogStatus').style.color = '#5a7a94';
            document.getElementById('prCancelRelogBtn').style.display = 'none';
        }

        const now = new Date();
        const nowTimestamp = now.getTime();
        
        let recordTimestamp;
        if (visibleRecords.length === 0) {
            recordTimestamp = this.startTimestamp || nowTimestamp;
        } else {
            recordTimestamp = visibleRecords[visibleRecords.length - 1].clickTimestamp || nowTimestamp;
        }
        const recordDate = new Date(recordTimestamp);
        const shichen = this.getShichen(recordTimestamp);
        const winState = this.calcRealtimeWindow();

        this.records.push({ 
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4), 
            runId: this.currentRunId, 
            taskIndex: visibleRecords.length + 1,
            typeKey: key, 
            cost: price, 
            score, 
            ringPoints: this.getRingPoints(idx), 
            isDeduct: false,
            isRelog: isRelog,
            date: recordDate.toLocaleString(),
            
            timestamp: recordTimestamp,
            clickTimestamp: nowTimestamp,
            shichen: shichen.name,
            shichenIndex: shichen.index,
            halfHour: shichen.halfHour,
            secondsInHalfHour: shichen.secondsInHalfHour,
            isDaytime: shichen.isDaytime,
            timeStr: `${String(recordDate.getHours()).padStart(2,'0')}:${String(recordDate.getMinutes()).padStart(2,'0')}:${String(recordDate.getSeconds()).padStart(2,'0')}`,
            winState: winState
        });
        this.render();
        this.updateRelogAnalysis();
    },
    

    addDeduct(key) {
        if (this.records.filter(r => !r.deleted).length >= 100) {
            alert('本轮已满100环，请先结算！');
            return;
        }
        if (!this.startTimestamp && this.records.length === 0) {
            alert('请先点击「▶️ 开始跑环」按钮！');
            return;
        }
        const s = this.deductSettings[key];
        if (!s) return;
        const type = this.DEDUCT_TYPES.find(d => d.key === key);
        const visibleRecords = this.records.filter(r => !r.deleted);
        const idx = visibleRecords.length;
        
        const isRelog = this.pendingRelog || false;
        if (this.pendingRelog) {
            this.pendingRelog = false;
            document.getElementById('prRelogStatus').textContent = '无待标记';
            document.getElementById('prRelogStatus').style.color = '#5a7a94';
            document.getElementById('prCancelRelogBtn').style.display = 'none';
        }

        const now = new Date();
        const nowTimestamp = now.getTime();
        
        let recordTimestamp;
        if (visibleRecords.length === 0) {
            recordTimestamp = this.startTimestamp || nowTimestamp;
        } else {
            recordTimestamp = visibleRecords[visibleRecords.length - 1].clickTimestamp || nowTimestamp;
        }
        const recordDate = new Date(recordTimestamp);
        const shichen = this.getShichen(recordTimestamp);
        const winState = this.calcRealtimeWindow();

        this.records.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4), 
            runId: this.currentRunId, 
            taskIndex: visibleRecords.length + 1,
            typeKey: key,
            cost: s.cost || 0,
            score: -(s.deduct || 0),
            ringPoints: this.getRingPoints(idx),
            isDeduct: true,
            isRelog: isRelog,
            label: type ? type.label : key,
            date: recordDate.toLocaleString(),
            
            timestamp: recordTimestamp,
            clickTimestamp: nowTimestamp,
            shichen: shichen.name,
            shichenIndex: shichen.index,
            halfHour: shichen.halfHour,
            secondsInHalfHour: shichen.secondsInHalfHour,
            isDaytime: shichen.isDaytime,
            timeStr: `${String(recordDate.getHours()).padStart(2,'0')}:${String(recordDate.getMinutes()).padStart(2,'0')}:${String(recordDate.getSeconds()).padStart(2,'0')}`,
            winState: winState
        });
        this.render();
        this.updateRelogAnalysis();
    },

undoRecord() {
    const visibleRecords = this.records.filter(r => !r.deleted);
    if (visibleRecords.length === 0) {
        alert('没有可撤销的记录！');
        return;
    }

    const lastVisible = visibleRecords[visibleRecords.length - 1];
    const idx = this.records.findIndex(r => r.id === lastVisible.id);
    if (idx >= 0) {
        this.records[idx].deleted = true;
        this.records[idx].deletedAt = Date.now();
    }

    if (lastVisible.isRelog) {
        this.pendingRelog = true;
        const nextIndex = visibleRecords.length;
        document.getElementById('prRelogStatus').textContent = `⏳ 第${nextIndex}环待标记 🔁`;
        document.getElementById('prRelogStatus').style.color = '#dbbd7c';
        document.getElementById('prCancelRelogBtn').style.display = 'inline-block';
    }

    if (this.pendingSettle) {
        this.pendingSettle = null;
    }

    this.saveData();
    this.render();
    this.updateRelogAnalysis();
},

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

        const startBtn = document.getElementById('prStartRunBtn');
        if (startBtn) {
            if (this.startTimestamp) {
                const timeStr = new Date(this.startTimestamp).toLocaleTimeString();
                startBtn.textContent = `✅ 已开始 ${timeStr}`;
                startBtn.style.background = '#8a9a8a';
            } else {
                startBtn.textContent = '▶️ 开始跑环';
                startBtn.style.background = '#4c7a5c';
            }
        }
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
    const visibleRecords = this.records.filter(r => !r.deleted);
    if (visibleRecords.length === 0) {
        list.innerHTML = '<div class="empty-history">暂无记录</div>';
        return;
    }

    let html = '';
    const records = visibleRecords.slice().reverse();
    let cumulativePoints = 0;
    const pointsMap = {};
    for (let r of visibleRecords) {
        cumulativePoints += r.score || 0;
        pointsMap[r.taskIndex] = cumulativePoints;
    }
    for (let r of records) {
        const type = this.ITEM_TYPES.find(t => t.key === r.typeKey);
        const label = type ? type.label : (r.label || r.typeKey);
        const sc = r.score < 0 ? r.score : `+${r.score}`;
        const relogIcon = r.isRelog ? ' 🔁' : '';
        
        let shichenDisplay = '';
        if (r.shichen) {
            const dayNight = r.isDaytime ? '☀️' : '🌙';
            shichenDisplay = `<span style="color:#b8860b;font-size:0.7rem;">${dayNight}${r.shichen}时</span>`;
        }
        let timeDisplay = '';
        if (r.timeStr) {
            let shortDate = '';
            if (r.date) {
                const parts = r.date.split(' ')[0].split('/');
                if (parts.length >= 3) {
                    shortDate = `${parts[1]}/${parts[2]}`;
                }
            }
           timeDisplay = `<span style="color:#1a1a2e;font-size:0.85rem;">${shortDate} ${r.timeStr}</span>`;
        }
        
        const labelColor = r.typeKey === 'find' ? '#c0392b' : '#1a1a2e';
        html += `<div class="history-item">
            <div class="info">
                <span style="font-weight:600;color:#1f3b53;min-width:36px;">#${r.taskIndex}</span>
                <span style="background:${r.isRelog ? '#fdf8ee' : (r.isDeduct?'#f5d0d0':'#dce6f0')};padding:0 10px;border-radius:40px;font-size:0.7rem;color:${labelColor};">${label}${relogIcon}</span>
                ${shichenDisplay}
                ${timeDisplay}
                <span>💰${r.cost.toFixed(1)}</span>
                <span>⭐${sc}</span>
                <span>累计${pointsMap[r.taskIndex] || 0}</span>
            </div>
        </div>`;
    }
    list.innerHTML = html;
},

    // 🆕 显示本轮全部记录弹窗
    // ===== 改动点：外层 Flex 布局 + 上半固定 + 下半滚动 =====
showAllRingsModal() {
    const visibleRecords = this.records.filter(r => !r.deleted);
    if (visibleRecords.length === 0) {
        alert('暂无记录');
        return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);';

    let listHtml = '';
    for (let i = 0; i < visibleRecords.length; i++) {
        const r = visibleRecords[i];
        const type = this.ITEM_TYPES.find(t => t.key === r.typeKey);
        const label = type ? type.label : (r.label || r.typeKey);
        const sc = r.score < 0 ? r.score : `+${r.score}`;
        const relogIcon = r.isRelog ? ' 🔁' : '';
        const dayNight = r.isDaytime ? '☀️' : '🌙';
        const shichenColor = r.shichen ? this.getShichenColor(r.shichen) : '#B8860B';
        const shichenDisplay = r.shichen ? `<span style="color:${shichenColor};font-weight:600;">${dayNight}${r.shichen}时</span>` : '';
        let timeDisplay = r.timeStr || '';
        if (r.date) {
            const parts = r.date.split(' ')[0].split('/');
            if (parts.length >= 3) {
                timeDisplay = `${parts[1]}/${parts[2]} ${timeDisplay}`;
            }
        }
        const bgColor = r.isRelog ? '#fdf8ee' : 'transparent';
        
        const labelColor = r.typeKey === 'find' ? '#c0392b' : '#1f3b53';
        listHtml += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #f0f4f8;background:${bgColor};font-size:0.75rem;gap:6px;">
                <span style="font-weight:600;color:#1f3b53;min-width:40px;">#${r.taskIndex}</span>
                <span style="color:${labelColor};min-width:60px;">${label}${relogIcon}</span>
                <span style="min-width:50px;">${shichenDisplay}</span>
                <span style="color:#1a1a2e;min-width:60px;">${timeDisplay}</span>
                <span style="color:#1a1a2e;">💰${r.cost.toFixed(1)} ⭐${sc}</span>
            </div>
        `;
    }

    const timeline = this.calcWindowTimeline(visibleRecords);
    const buildTimelineRow = (list, label) => {
        if (!list || list.length === 0) return '';
        return `<div style="margin-bottom:8px;padding:6px 10px;background:#f0f5fb;border-radius:10px;border:1px solid #dce5ef;">
            <div style="font-weight:700;font-size:0.75rem;color:#1f3b53;margin-bottom:4px;">${label}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${list.map(w => {
                    const color = w.rate === null ? '#8ab0c8' : w.rate < 33 ? '#2d6b2d' : w.rate < 45 ? '#b48b3a' : '#c0392b';
                    return `<span style="background:white;padding:1px 6px;border-radius:8px;font-size:0.62rem;border:1px solid #dce5ef;white-space:nowrap;">
                        ${w.start}~${w.end} <span style="color:${color};font-weight:700;">${w.rate === null ? '—' : w.rate + '%'}</span> (${w.total}环)
                    </span>`;
                }).join('')}
            </div>
        </div>`;
    };
    const timelineHtml = buildTimelineRow(timeline.w10, '📊 10分钟段找人率变化')
                       + buildTimelineRow(timeline.w30, '📊 30分钟段找人率变化');

    overlay.innerHTML = `
       <div style="background:#f8faff;border-radius:28px;padding:24px 28px 28px;max-width:900px;width:95%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <!-- ========== 固定区 ========== -->
            <div style="flex-shrink:0;">
                <h3 style="color:#1f3b53;margin-bottom:4px;font-size:1.2rem;">📋 本轮全部记录</h3>
                <div style="font-size:0.8rem;color:#5a7a94;margin-bottom:10px;">共 ${this.records.length} 环</div>
                ${timelineHtml}
                <div style="font-size:0.7rem;color:#5a7a94;margin:4px 0 6px;">📋 每环详情（下方可滚动）：</div>
            </div>
            <!-- ========== 滚动区 ========== -->
            <div style="flex:1;min-height:0;overflow-y:auto;border:1px solid #eef2f7;border-radius:12px;background:white;">
                ${listHtml}
            </div>
            <!-- ========== 底部固定 ========== -->
            <div style="flex-shrink:0;display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
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

    calcRealtimeWindow() {
    const nowD = new Date();
    const nowM = nowD.getMinutes();
    const nowH2 = nowD.getHours();
    const cur10Start = Math.floor(nowM / 10) * 10;
    const cur30Start = Math.floor(nowM / 30) * 30;
    const prev10Start = cur10Start - 10;
    const prev30Start = cur30Start - 30;

    const calcWin = (startMin, endMin) => {
        const s = nowH2 * 3600 + startMin * 60;
        const e = nowH2 * 3600 + endMin * 60;
        let total = 0, find = 0;
        for (let r of this.records) {
            if (r.deleted) continue;
            const ts = r.timestamp;
            if (!ts) continue;
            const d = new Date(ts);
            const sec = d.getHours() * 3600 + d.getMinutes() * 60;
            if (sec >= s && sec < e) {
                total++;
                if (r.typeKey === 'find') find++;
            }
        }
        return { total, find, rate: total > 0 ? Math.round(find / total * 100) : null };
    };

    return {
        prev10: calcWin(prev10Start, prev10Start + 10),
        cur10:  calcWin(cur10Start,  cur10Start + 10),
        prev30: calcWin(prev30Start, prev30Start + 30),
        cur30:  calcWin(cur30Start,  cur30Start + 30)
    };
},
    
renderRealtimeWindow() {
    const el = document.getElementById('prRealtimeWindow');
    if (!el) return;

    const nowD = new Date();
    const nowM = nowD.getMinutes();
    const nowH = nowD.getHours();
    const cur10Start = Math.floor(nowM / 10) * 10;
    const cur30Start = Math.floor(nowM / 30) * 30;
    const prev10Start = cur10Start - 10;
    const prev30Start = cur30Start - 30;

    const win = this.calcRealtimeWindow();

    const colorOf = (rate) => {
        if (rate === null) return '#8ab0c8';
        if (rate < 33) return '#2d6b2d';
        if (rate < 45) return '#b48b3a';
        return '#c0392b';
    };

    const pad = (n) => String(n).padStart(2, '0');
    const fmtHM = (h, m) => {
        if (m < 0) { h = (h - 1 + 24) % 24; m += 60; }
        if (m >= 60) { h = (h + 1) % 24; m -= 60; }
        return `${pad(h)}:${pad(m)}`;
    };

    const fmtRate = (r) => {
        if (r.rate === null) return '—';
        return `${r.rate}% (${r.total}环)`;
    };

    el.innerHTML = `
        <span>上10分(${fmtHM(nowH, prev10Start)}~${fmtHM(nowH, prev10Start + 10)}): <span style="color:${colorOf(win.prev10.rate)};">${fmtRate(win.prev10)}</span></span>
        <span style="margin-left:4px;">本10分(${fmtHM(nowH, cur10Start)}~${fmtHM(nowH, cur10Start + 10)}): <span style="color:${colorOf(win.cur10.rate)};">${fmtRate(win.cur10)}</span></span>
        <span style="margin-left:4px;">上30分(${fmtHM(nowH, prev30Start)}~${fmtHM(nowH, prev30Start + 30)}): <span style="color:${colorOf(win.prev30.rate)};">${fmtRate(win.prev30)}</span></span>
        <span style="margin-left:4px;">本30分(${fmtHM(nowH, cur30Start)}~${fmtHM(nowH, cur30Start + 30)}): <span style="color:${colorOf(win.cur30.rate)};">${fmtRate(win.cur30)}</span></span>
    `;
},

    calcWindowTimeline(rings) {
    if (!rings || rings.length === 0) return { w10: [], w30: [] };
    
    const build = (stepMin) => {
        const map = {};
        for (let r of rings) {
            if (r.deleted) continue;
            const ts = r.timestamp;
            if (!ts) continue;
            const d = new Date(ts);
            const h = d.getHours();
            const m = d.getMinutes();
            const startMin = Math.floor(m / stepMin) * stepMin;
            const key = `${String(h).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
            if (!map[key]) map[key] = { start: key, total: 0, find: 0 };
            map[key].total++;
            if (r.typeKey === 'find') map[key].find++;
        }
        const result = [];
        const sortedKeys = Object.keys(map).sort((a, b) => {
            const [ah, am] = a.split(':').map(Number);
            const [bh, bm] = b.split(':').map(Number);
            const aMin = ah * 60 + am;
            const bMin = bh * 60 + bm;
            const aIsNextDay = ah < 6;
            const bIsNextDay = bh < 6;
            if (aIsNextDay !== bIsNextDay) {
                return aIsNextDay ? 1 : -1;
            }
            return aMin - bMin;
        });
        for (let k of sortedKeys) {
            const w = map[k];
            const [hh, mm] = w.start.split(':').map(Number);
            const endMin = mm + stepMin;
            const endH = Math.floor(endMin / 60) + hh;
            const endM = endMin % 60;
            result.push({
                start: w.start,
                end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
                total: w.total,
                find: w.find,
                rate: w.total > 0 ? Math.round(w.find / w.total * 100) : null
            });
        }
        return result;
    };
    
    return { w10: build(10), w30: build(30) };
},

// 🆕 找"上 N 个已结束的完整同游戏时辰"的时段
// n: 1 表示上一个，2 表示上两个
// shichenIndex: 0-11（子=0, 丑=1, ..., 亥=11）
// 返回: {rate, total} 或 null（无数据/超过3天）
calcShichenRateForLastN(n, shichenIndex) {
    const now = Date.now();
    const nowSec = Math.floor(now / 1000);
    const halfHourStart = nowSec - (nowSec % 1800);
    const curSStart = halfHourStart + shichenIndex * 150;
    const curSEnd = curSStart + 150;

    // 找"最近的已结束时段"的起始秒
    let lastEndedStart;
    if (nowSec >= curSEnd) {
        lastEndedStart = curSStart;
    } else {
        lastEndedStart = curSStart - 1800;
    }

    // 往前推 n-1 轮
    const targetStartSec = lastEndedStart - (n - 1) * 1800;
    const targetEndSec = targetStartSec + 150;
    const startTs = targetStartSec * 1000;
    const endTs = targetEndSec * 1000;

    // 超过 3 天不查
    const THREE_DAYS_MS = 3 * 24 * 3600 * 1000;
    if (now - startTs > THREE_DAYS_MS) {
        return null;
    }

    let total = 0, find = 0;
    const checkRecord = (r) => {
        if (!r.timestamp) return;
        // 🆕 跳过重置前的数据
        if (this.lrResetTs && r.timestamp < this.lrResetTs) return;
        if (r.timestamp >= startTs && r.timestamp < endTs) {
            total++;
            if (r.typeKey === 'find') find++;
        }
    };
    for (let h of this.history) {
        for (let r of h.rings || []) checkRecord(r);
    }
    for (let r of this.records) {
        if (r.deleted) continue;
        checkRecord(r);
    }

    if (total === 0) return null;
    return { rate: Math.round(find / total * 100), total };
},
    
renderShichenWeights() {
    const rangeEl = document.getElementById('prWeightRange');
    if (!rangeEl) return;
    const range = rangeEl.value || 'all';
    const now = Date.now();
    let cutoff = 0;
    if (range !== 'all') {
        const days = parseInt(range);
        if (!isNaN(days) && days > 0) {
            cutoff = now - days * 24 * 3600 * 1000;
        }
    }

    const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const stats = {};
    shichenNames.forEach(n => stats[n] = { total: 0, find: 0 });

    // 从 history 累加（主统计）
    for (let h of this.history) {
        const histTime = new Date(h.date).getTime();
        if (cutoff && histTime < cutoff) continue;
        for (let r of h.rings || []) {
            if (!r.shichen) continue;
            if (!stats[r.shichen]) continue;
            stats[r.shichen].total++;
            if (r.typeKey === 'find') stats[r.shichen].find++;
        }
    }

    // 从 records 累加（主统计）
    for (let r of this.records) {
        if (r.deleted) continue;
        if (!r.shichen) continue;
        if (!stats[r.shichen]) continue;
        stats[r.shichen].total++;
        if (r.typeKey === 'find') stats[r.shichen].find++;
    }

    // 🆕 获取当前时辰索引
    const nowShichen = this.getShichen(Date.now());
    const nowShichenName = nowShichen.name;

    // 🆕 生成 HTML（5 列：标记+时辰名、左%、中%、右%、环数）
    let html = '';
    for (let n of shichenNames) {
        const s = stats[n];
        const shichenIndex = shichenNames.indexOf(n);
        const isCurrent = (n === nowShichenName);

        // 🆕 计算左/右的百分比
        const leftData = this.calcShichenRateForLastN(2, shichenIndex);
        const rightData = this.calcShichenRateForLastN(1, shichenIndex);

        // 🆕 颜色规则（统一函数）
        const getColor = (rate) => {
            if (rate === null || rate === undefined) return '#c0ccd8';
            if (rate < 33) return '#2d6b2d';
            if (rate < 45) return '#b48b3a';
            return '#c0392b';
        };

        const leftDisplay = leftData ? `${leftData.rate}%(${leftData.total})` : '—';
        const leftColor = getColor(leftData ? leftData.rate : null);
        const rightDisplay = rightData ? `${rightData.rate}%(${rightData.total})` : '—';
        const rightColor = getColor(rightData ? rightData.rate : null);
        
        let mainDisplay = '—';
        let mainColor = getColor(null);
        if (s.total > 0) {
            const rate = s.find / s.total * 100;
            mainDisplay = `${rate.toFixed(0)}%(${s.total})`;
            mainColor = getColor(rate);
        }

        // 当前时辰加 👉 标记
        const mark = isCurrent ? '👉' : '';
        const nameStyle = isCurrent 
            ? 'color:#c0392b;font-weight:800;' 
            : 'color:#1f3b53;';
        const rowBg = isCurrent ? 'background:#fff5f5;' : '';   // 🆕

        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid #eef2f7;font-size:0.7rem;gap:2px;${rowBg}">
            <span style="${nameStyle}flex:1.2;white-space:nowrap;font-size:0.7rem;text-align:left;">${mark}${n}时</span>
            <span style="color:${leftColor};font-weight:700;flex:1;text-align:right;font-size:0.7rem;">${leftDisplay}</span>
            <span style="color:${mainColor};font-weight:700;flex:1;text-align:right;font-size:0.7rem;">${mainDisplay}</span>
            <span style="color:${rightColor};font-weight:700;flex:1;text-align:right;font-size:0.7rem;">${rightDisplay}</span>
        </div>`;
    }
    document.getElementById('prWeightList').innerHTML = html;

    // 后面 top4 提示不变
    const shichenArr = [];
    for (let n of shichenNames) {
        const s = stats[n];
        if (s.total === 0) continue;
        shichenArr.push({ name: n, rate: s.find / s.total });
    }
    shichenArr.sort((a, b) => a.rate - b.rate);
    const top4 = shichenArr.slice(0, 4);
    
    const hintEl = document.getElementById('prTopShichenHint');
    if (hintEl) {
        if (top4.length === 0) {
            hintEl.textContent = '';
        } else {
            const nowShichen2 = this.getShichen(Date.now()).name;
            let parts = [];
            for (let i = 0; i < top4.length; i++) {
                const t = top4[i];
                const isCurrent = (t.name === nowShichen2);
                const color = isCurrent ? '#c0392b' : '#1f3b53';
                const weight = isCurrent ? '900' : '700';
                parts.push(`<span style="color:${color};font-weight:${weight};">${i + 1}.${t.name}</span>`);
            }
            hintEl.innerHTML = '⭐ ' + parts.join('  ');
            // 🆕 当前时辰的实时找人率
            const rtEl = document.getElementById('prRealtimeShichenRate');
            if (rtEl) {
                const nowShichen3 = this.getShichen(Date.now());
                const shichenIndex3 = nowShichen3.index;
                const nowSec = Math.floor(Date.now() / 1000);
                const halfHourStartSec = nowSec - (nowSec % 1800);
                const startSec = halfHourStartSec + shichenIndex3 * 150;
                const startTs = startSec * 1000;
                const endTs = Date.now();
            
                let total = 0, find = 0;
                const checkRecord = (r) => {
                    if (!r.timestamp) return;
                    if (r.timestamp >= startTs && r.timestamp <= endTs) {
                        total++;
                        if (r.typeKey === 'find') find++;
                    }
                };
                for (let h of this.history) {
                    for (let r of h.rings || []) checkRecord(r);
                }
                for (let r of this.records) {
                    if (r.deleted) continue;
                    checkRecord(r);
                }
            
                if (total === 0) {
                    rtEl.innerHTML = `当前：<span style="color:#c0392b;">${nowShichen3.name}时</span> 找人率 <span style="color:#8ab0c8;">—</span>`;
                    rtEl.style.background = '#f5f5f5';
                } else {
                    const rate = Math.round(find / total * 100);
                    let color;
                    if (rate < 33) color = '#2d6b2d';
                    else if (rate < 45) color = '#b48b3a';
                    else color = '#c0392b';
                    rtEl.innerHTML = `当前：<span style="color:#c0392b;">${nowShichen3.name}时</span> 找人率 <span style="color:${color};">${rate}%</span>`;
                    rtEl.style.background = '#f0f5fb';
                }
            }
        }
    }
},

updateRelogAnalysis() {
    const container = document.getElementById('prRelogAnalysis');
    if (!container) return;

    const records = this.records.filter(r => !r.deleted);
    if (records.length === 0) {
        container.innerHTML = '🔁 等待重登标记...';
        container.style.color = '#5a7a94';
        return;
    }

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

    const lastRelogIdx = relogIndices[relogIndices.length - 1];
    const hasPending = (lastRelogIdx + 1) < records.length;

    if (!hasPending) {
        container.innerHTML = `🔁 已标记第${lastRelogIdx + 1}环重登，等待任务记录...`;
        container.style.color = '#dbbd7c';
        return;
    }

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

    const cancelBtn = document.getElementById('prCancelRelogBtn');
    if (cancelBtn) {
        cancelBtn.style.display = this.pendingRelog ? 'inline-block' : 'none';
    }
},

updateHistoryTable() {
    const tbody = document.getElementById('prHistoryTableBody');
    
    // 🆕 统计时排除隐藏
    const visibleHistory = this.showHidden 
        ? this.history 
        : this.history.filter(h => !h.hidden);
    
    const count = visibleHistory.length;
    document.getElementById('prSettledCount').textContent = 
        `已结算: ${count}轮${this.history.filter(h => h.hidden).length > 0 ? ` (隐藏${this.history.filter(h => h.hidden).length}轮)` : ''}`;

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
        const hasRings = h.rings && h.rings.length > 0;

        // 🆕 隐藏行样式
        const rowStyle = h.hidden ? 'opacity:0.45;background:#f5f5f5;' : '';
        const hiddenTag = h.hidden ? '<span style="color:#999;font-size:0.6rem;margin-left:4px;">🙈已隐藏</span>' : '';

        html += `<tr style="${rowStyle}">
            <td style="font-weight:700;color:#1f3b53;background:#f5f8fc;">${row}</td>
            <td>${h.date || '未知'}${hiddenTag}</td>
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
                    📊
                </button>
                <span style="font-size:0.7rem;color:#c0392b;font-weight:700;margin-left:4px;">${h.typeCount?.find || 0}</span>
            </td>
            <td>
                <button class="hide-btn" data-idx="${idx}" style="background:${h.hidden ? '#d4edda' : '#e8e8e8'};border:none;border-radius:30px;padding:2px 10px;font-size:0.65rem;cursor:pointer;color:${h.hidden ? '#2d6b2d' : '#666'};font-weight:700;margin-right:2px;" title="${h.hidden ? '恢复显示' : '隐藏此轮'}">${h.hidden ? '👁️' : '🙈'}</button>
                <button class="del-btn" data-idx="${idx}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 10px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
            </td>
        </tr>`;
    }
    tbody.innerHTML = html;

    const icon = document.getElementById('prSortIcon');
    if (icon) icon.textContent = this.sortState.order === 'desc' ? '↓' : '↑';

    if (document.getElementById('prAnalysisPanel').style.display !== 'none') {
        this.updateAnalysis(data);
    }
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
        
        const shichenContainer = document.getElementById('prShichenAnalysis');
        if (shichenContainer) {
            shichenContainer.innerHTML = shichenHtml;
        }
    },

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
            runId: this.currentRunId || `import_${Date.now()}`,
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
            rings: [],
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
