// ============================================================
//  🌳 种树模块 - 完整版（含汇率设置 + 种树提醒）
// ============================================================
const TreePlantModule = {
    id: 'treePlant',

    storageKey: 'treePlant',
    history: [],
    prices: {},
    current: { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {} },
    exchangeRate: 0.08,

    // ===== UI设置 =====
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
        // 🆕 种树提醒
        notificationPermission: false,   // 通知权限是否已授权
        remindEnabled: true              // 提醒总开关
    },

    // 🆕 种树提醒状态（和 uiSettings 平级）
    treeStartTime: null,        // 开始种树的时间戳
    treeStage: 'idle',          // idle | growing | withered
    treeAlerts: {               // 各阶段是否已提醒
        '5min': false,
        '15min': false,
        '20min': false
    },
    careCount: 0,               // 已照顾次数（0-3）
    shakeReady: false,          // 是否可以摇树
    hasEarlyRipen: false,       // 是否已早熟

    LOOT_TYPES: [
        { key: 'eryao', label: '二药', defaultPrice: 1.5 },
        { key: 'bishui', label: '避水珠', defaultPrice: 5 },
        { key: 'dinghun', label: '定魂珠', defaultPrice: 18 },
        { key: 'jingang', label: '金刚石', defaultPrice: 18 },
        { key: 'yeguang', label: '夜光珠', defaultPrice: 12 },
        { key: 'longlin', label: '龙鳞', defaultPrice: 8 },
        { key: 'baoshi_hl', label: '黑宝石', defaultPrice: 8 },
        { key: 'baoshi_tys', label: '太阳石', defaultPrice: 6 },
        { key: 'baoshi_yls', label: '月亮石', defaultPrice: 10 },
        { key: 'baoshi_gms', label: '光芒石', defaultPrice: 7 },
        { key: 'baoshi_sls', label: '舍利子', defaultPrice: 9 },
        { key: 'baoshi_hmm', label: '红玛瑙', defaultPrice: 10 },
        { key: 'baoshi_fcs', label: '翡翠石', defaultPrice: 5 },
        { key: 'baoshi_xys', label: '神秘石', defaultPrice: 3 },
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
        { key: 'jinliu', label: '金柳露', defaultPrice: 8 },
        { key: 'kapian', label: '卡片', defaultPrice: 5 },
        { key: 'qianghuashi', label: '强化石', defaultPrice: 5 },
    ],

    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        // 🆕 启动定时器，每秒检查种树提醒
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
            this.checkTreeReminders();
        }, 1000);
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
        this.updateTreeStatusUI();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
        console.log('✅ 种树模块渲染完成');
    },

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
            fontSize: 14,
            notificationPermission: false,
            remindEnabled: true
        };
        this.exchangeRate = data.exchangeRate || 0.08;

        // 🆕 加载种树提醒状态
        this.treeStartTime = data.treeStartTime || null;
        this.treeStage = data.treeStage || 'idle';
        this.treeAlerts = data.treeAlerts || { '5min': false, '15min': false, '20min': false };
        this.careCount = data.careCount || 0;
        this.shakeReady = data.shakeReady || false;
        this.hasEarlyRipen = data.hasEarlyRipen || false;

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
            uiSettings: this.uiSettings,
            exchangeRate: this.exchangeRate,
            // 🆕 保存种树提醒状态
            treeStartTime: this.treeStartTime,
            treeStage: this.treeStage,
            treeAlerts: this.treeAlerts,
            careCount: this.careCount,
            shakeReady: this.shakeReady,
            hasEarlyRipen: this.hasEarlyRipen
        });
    },

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

    // ============================================================
    //  🌳 种树提醒功能
    // ============================================================

    // ===== 请求通知权限 =====
    requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('浏览器不支持桌面通知');
            return false;
        }
        if (Notification.permission === 'granted') {
            this.uiSettings.notificationPermission = true;
            this.saveData();
            return true;
        }
        if (Notification.permission === 'denied') {
            alert('⚠️ 通知被拒绝，请在浏览器设置中允许通知权限！');
            return false;
        }
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                this.uiSettings.notificationPermission = true;
                this.saveData();
                alert('✅ 通知权限已开启！种树时会提醒你浇水。');
            }
        });
        return false;
    },

    // ===== 发送提醒 =====
    sendTreeAlert(title, message, isUrgent = false, showCareBtn = true) {
        // 如果提醒被关闭，只显示弹窗
        if (!this.uiSettings.remindEnabled) {
            this.showTreeAlertModal(title, message, isUrgent, showCareBtn);
            return;
        }

        // 1. 桌面通知
        if (this.uiSettings.notificationPermission && 'Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('🌳 ' + title, {
                    body: message,
                    icon: '🌳',
                    requireInteraction: true,
                    silent: false
                });
            } catch (e) {}
        }

        // 2. 页面内弹窗
        this.showTreeAlertModal(title, message, isUrgent, showCareBtn);

        // 3. 标题闪烁
        this.flashTitle('🌳 ' + title);

        // 4. 声音提醒
        this.playAlertSound(isUrgent);
    },

    // ===== 页面内弹窗 =====
    showTreeAlertModal(title, message, isUrgent = false, showCareBtn = true) {
        // 移除旧弹窗
        const oldOverlay = document.getElementById('treeAlertOverlay');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'treeAlertOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.75);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(4px);
            animation: treeAlertFadeIn 0.4s ease;
        `;

        const isShakeReady = title.includes('摇树');
        const isWithered = title.includes('枯萎');

        let btnHtml = '';
        if (showCareBtn && !isShakeReady && !isWithered) {
            btnHtml = `
                <button id="treeAlertCareBtn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 28px;
                    border-radius: 40px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-right: 10px;
                    box-shadow: 0 4px 16px rgba(76,175,80,0.3);
                ">✅ 已照顾</button>
            `;
        }
        if (isShakeReady) {
            btnHtml = `
                <button id="treeAlertShakeBtn" style="
                    background: #f0d060;
                    color: #1f344b;
                    border: none;
                    padding: 10px 28px;
                    border-radius: 40px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(240,208,96,0.3);
                ">🔄 去摇树</button>
            `;
        }

        overlay.innerHTML = `
            <div style="
                background: ${isWithered ? '#2a0a0a' : isShakeReady ? '#1a2a1a' : '#1a2a1a'};
                border-radius: 28px;
                padding: 30px 35px 35px;
                max-width: 420px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.8);
                border: 3px solid ${isWithered ? '#ff4444' : isShakeReady ? '#f0d060' : '#4CAF50'};
                animation: treeAlertBounce 0.5s ease;
            ">
                <div style="font-size: 3.5rem; margin-bottom: 8px;">${isWithered ? '💀' : isShakeReady ? '🌳' : '🌱'}</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: ${isWithered ? '#ff6666' : isShakeReady ? '#f0d060' : '#4CAF50'}; margin-bottom: 6px;">
                    ${title}
                </div>
                <div style="font-size: 1rem; color: #e0ddd4; margin-bottom: 18px; line-height: 1.6;">
                    ${message}
                </div>
                <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:8px;">
                    ${btnHtml}
                    <button id="treeAlertCloseBtn" style="
                        background: ${isWithered ? '#cc4444' : '#555'};
                        color: white;
                        border: none;
                        padding: 10px 24px;
                        border-radius: 40px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">${isWithered ? '知道了' : '稍后提醒'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 添加动画样式
        let style = document.getElementById('treeAlertStyle');
        if (!style) {
            style = document.createElement('style');
            style.id = 'treeAlertStyle';
            style.textContent = `
                @keyframes treeAlertFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes treeAlertBounce {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // 已照顾按钮
        const careBtn = document.getElementById('treeAlertCareBtn');
        if (careBtn) {
            careBtn.addEventListener('click', () => {
                this.careCount++;
                this.saveData();
                overlay.remove();
                // 检查是否3次照顾完成
                if (this.careCount >= 3) {
                    this.shakeReady = true;
                    this.saveData();
                    // 5分钟后弹窗提醒摇树
                    setTimeout(() => {
                        if (this.shakeReady && this.treeStage !== 'withered') {
                            this.sendTreeAlert(
                                '🌳 可以摇树了！',
                                '已照顾3次，树苗成熟了！点击「去摇树」开始收获 🎉',
                                false,
                                false
                            );
                        }
                    }, 5 * 60 * 1000);
                    alert('✅ 已照顾3次！5分钟后会提醒你摇树 🎉');
                } else {
                    alert(`✅ 已照顾 ${this.careCount}/3 次，继续加油！`);
                }
                this.updateTreeStatusUI();
            });
        }

        // 去摇树按钮
        const shakeBtn = document.getElementById('treeAlertShakeBtn');
        if (shakeBtn) {
            shakeBtn.addEventListener('click', () => {
                overlay.remove();
                this.shakeReady = false;
                this.saveData();
                alert('🌳 快去摇树吧！点击「结算此树」记录产出！');
                this.updateTreeStatusUI();
            });
        }

        // 关闭按钮
        document.getElementById('treeAlertCloseBtn').addEventListener('click', () => {
            overlay.remove();
            if (isWithered) {
                this.treeStage = 'withered';
                this.saveData();
                this.updateTreeStatusUI();
            }
        });

        // 点击背景关闭
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    },

    // ===== 标题闪烁 =====
    flashTitle(message) {
        const originalTitle = document.title;
        let count = 0;
        const interval = setInterval(() => {
            document.title = count % 2 === 0 ? `🔔 ${message}` : originalTitle;
            count++;
            if (count > 10) {
                clearInterval(interval);
                document.title = originalTitle;
            }
        }, 500);
    },

    // ===== 声音提醒 =====
    playAlertSound(isUrgent) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            
            if (isUrgent) {
                oscillator.frequency.value = 800;
                oscillator.type = 'square';
                gain.gain.value = 0.15;
                oscillator.start();
                setTimeout(() => { oscillator.frequency.value = 600; }, 200);
                setTimeout(() => { oscillator.stop(); }, 600);
            } else {
                oscillator.frequency.value = 523;
                oscillator.type = 'sine';
                gain.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => { oscillator.frequency.value = 659; }, 200);
                setTimeout(() => { oscillator.stop(); }, 400);
            }
        } catch (e) {}
    },

    // ===== 检查种树提醒 =====
    checkTreeReminders() {
        // 如果提醒被关闭，不检查
        if (!this.uiSettings.remindEnabled) return;
        // 如果已早熟或已枯萎或未开始，跳过
        if (this.hasEarlyRipen || this.treeStage === 'withered' || !this.treeStartTime) {
            return;
        }

        const now = Date.now();
        const elapsed = (now - this.treeStartTime) / 1000 / 60;

        // 40分钟 → 枯萎
        if (elapsed >= 40 && this.treeStage !== 'withered') {
            this.treeStage = 'withered';
            this.saveData();
            this.sendTreeAlert('💀 树苗枯萎了！', '超过40分钟未照顾，树苗已枯死...下次记得及时浇水！', true, false);
            this.updateTreeStatusUI();
            return;
        }

        // 5分钟提醒
        if (elapsed >= 5 && !this.treeAlerts['5min']) {
            this.treeAlerts['5min'] = true;
            this.saveData();
            this.sendTreeAlert('⏰ 该浇水了！', '🌱 种树5分钟了，第一次浇水施肥！点击「已照顾」继续', false, true);
            this.updateTreeStatusUI();
            return;
        }

        // 15分钟提醒
        if (elapsed >= 15 && !this.treeAlerts['15min']) {
            this.treeAlerts['15min'] = true;
            this.saveData();
            this.sendTreeAlert('⏰ 第二次浇水！', '🌱 种树15分钟了，第二次浇水施肥！点击「已照顾」继续', false, true);
            this.updateTreeStatusUI();
            return;
        }

        // 20分钟提醒
        if (elapsed >= 20 && !this.treeAlerts['20min']) {
            this.treeAlerts['20min'] = true;
            this.saveData();
            this.sendTreeAlert('⏰ 最后一次浇水！', '🌱 种树20分钟了，最后一次浇水施肥！点击「已照顾」完成', false, true);
            this.updateTreeStatusUI();
            return;
        }
    },

    // ===== 更新状态UI =====
    updateTreeStatusUI() {
        const el = document.getElementById('trTreeStatus');
        if (!el) return;

        if (this.treeStage === 'withered') {
            el.textContent = '💀 已枯萎';
            el.style.background = '#8B0000';
            el.style.color = '#fff';
            return;
        }

        if (this.hasEarlyRipen) {
            el.textContent = '🌿 已早熟';
            el.style.background = '#f0d060';
            el.style.color = '#1f344b';
            return;
        }

        if (this.shakeReady) {
            el.textContent = '🌳 可摇树！';
            el.style.background = '#f0d060';
            el.style.color = '#1f344b';
            return;
        }

        if (!this.treeStartTime) {
            el.textContent = '⏸️ 未开始';
            el.style.background = '#e8e8e8';
            el.style.color = '#666';
            return;
        }

        const elapsed = (Date.now() - this.treeStartTime) / 1000 / 60;
        const minutes = Math.floor(elapsed);
        const seconds = Math.floor((elapsed - minutes) * 60);
        const careText = this.careCount > 0 ? ` 已照顾${this.careCount}/3次` : '';
        el.textContent = `🌱 ${minutes}分${String(seconds).padStart(2,'0')}秒${careText}`;
        el.style.background = '#4CAF50';
        el.style.color = '#fff';
    },

    // ============================================================
    //  🏗️ 构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('treePlantContainer');
        if (!container) return;

        container.innerHTML = `
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

            <div class="stats-grid">
                <div class="stat-item"><div class="num" id="trTotalCost">0</div><div class="label">💰 总成本(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalIncome">0</div><div class="label">📊 总收入(万)</div></div>
                <div class="stat-item" id="trProfitStat"><div class="num" id="trTotalProfit">0</div><div class="label">📈 总利润(万)</div></div>
                <div class="stat-item"><div class="num" id="trTotalCount">0</div><div class="label">🌳 种植棵数</div></div>
                <div class="stat-item"><div class="num" id="trAvgProfit">0</div><div class="label">📊 平均利润/棵</div></div>
                <div class="stat-item" id="trRateStat"><div class="num" id="trWinRate">0%</div><div class="label">🏆 盈利率</div></div>
            </div>

            <!-- 🆕 种树提醒控制 -->
            <div style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; align-items:center; padding:8px 12px; background:#f0f5fb; border-radius:12px; border:1px solid #d0dce8;">
                <button id="trStartTreeBtn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 6px 20px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                ">🌱 开始种树</button>
                <button id="trEarlyRipenBtn" style="
                    background: #f0d060;
                    color: #1f344b;
                    border: none;
                    padding: 6px 20px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                ">🌿 早熟</button>
                <button id="trResetTreeBtn" style="
                    background: #b45f5f;
                    color: white;
                    border: none;
                    padding: 6px 20px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                ">🔄 重置状态</button>
                <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:600; color:#1f3b53; cursor:pointer; margin-left:auto;">
                    <span>🔔 提醒</span>
                    <input type="checkbox" id="trRemindToggle" ${this.uiSettings.remindEnabled ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;">
                </label>
                <span id="trTreeStatus" style="
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: #e8e8e8;
                    color: #666;
                ">⏸️ 未开始</span>
            </div>

            <div class="module">
                <div class="module-header">
                    <div class="title">🌳 记录当前种树 <span class="hint" id="trCurrentLabel">第 1 棵</span></div>
                    <div><button class="btn-undo" id="trUndoBtn">↩️ 撤销</button></div>
                </div>
                <div class="module-body">
                    <div class="tree-current-box">
                        <div class="info-item">🌱 树苗成本: <input type="number" id="trSeedCostInput" value="${this.current.seedCost || 45}" min="0" step="1" style="width:60px;padding:2px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;text-align:center;"> 万</div>
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
                        <button class="evt-btn" data-event="forget">😴 忘记照顾 <span class="sub">(仅1次)</span></button>
                    </div>

                    <div style="font-weight:600;font-size:0.8rem;color:#1f3b53;margin:10px 0 4px;">💎 元宝产出 (点击记录)</div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;" id="trLootGrid">
                        <button class="loot-btn" data-loot="eryao">💊 二药 <span class="count" id="tl-eryao">0</span></button>
                        <button class="loot-btn" data-loot="bishui">💧 避水珠 <span class="count" id="tl-bishui">0</span></button>
                        <button class="loot-btn" data-loot="dinghun">🔮 定魂珠 <span class="count" id="tl-dinghun">0</span></button>
                        <button class="loot-btn" data-loot="jingang">💎 金刚石 <span class="count" id="tl-jingang">0</span></button>
                        <button class="loot-btn" data-loot="yeguang">🌙 夜光珠 <span class="count" id="tl-yeguang">0</span></button>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="longlin">🐉 龙鳞 <span class="count" id="tl-longlin">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_hl">🖤 黑宝石 <span class="count" id="tl-baoshi_hl">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_tys">☀️ 太阳石 <span class="count" id="tl-baoshi_tys">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_yls">🌙 月亮石 <span class="count" id="tl-baoshi_yls">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_gms">💛 光芒石 <span class="count" id="tl-baoshi_gms">0</span></button>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="baoshi_sls">💠 舍利子 <span class="count" id="tl-baoshi_sls">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_hmm">❤️ 红玛瑙 <span class="count" id="tl-baoshi_hmm">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_fcs">💚 翡翠石 <span class="count" id="tl-baoshi_fcs">0</span></button>
                        <button class="loot-btn" data-loot="baoshi_xys">🟣 神秘石 <span class="count" id="tl-baoshi_xys">0</span></button>
                        <button class="loot-btn" data-loot="haima">🐴 海马 <span class="count" id="tl-haima">0</span></button>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="money">💰 金钱(万) <span class="count" id="tl-money">0</span></button>
                        <button class="loot-btn" data-loot="exp">📈 经验 <span class="count" id="tl-exp">0</span></button>
                        <button class="loot-btn" data-loot="shoujue">📜 兽决 <span class="count" id="tl-shoujue">0</span></button>
                        <button class="loot-btn" data-loot="lingpai">🎫 令牌 <span class="count" id="tl-lingpai">0</span></button>
                        <button class="loot-btn" data-loot="caiguo">🍎 彩果 <span class="count" id="tl-caiguo">0</span></button>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="c66">🧪 超级金柳露 <span class="count" id="tl-c66">0</span></button>
                        <button class="loot-btn" data-loot="zhenzhu">🐚 珍珠 <span class="count" id="tl-zhenzhu">0</span></button>
                        <button class="loot-btn" data-loot="fushi">📿 符石 <span class="count" id="tl-fushi">0</span></button>
                        <button class="loot-btn" data-loot="fushi_juanzhou">📜 符石卷轴 <span class="count" id="tl-fushi_juanzhou">0</span></button>
                        <button class="loot-btn" data-loot="jinliu">🧪 金柳露 <span class="count" id="tl-jinliu">0</span></button>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0;">
                        <button class="loot-btn" data-loot="kapian">🃏 卡片 <span class="count" id="tl-kapian">0</span></button>
                        <button class="loot-btn" data-loot="qianghuashi">💎 强化石 <span class="count" id="tl-qianghuashi">0</span></button>
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

            <div class="module">
                <div class="module-header"><div class="title">⚙️ 掉落物价值 (万) <span class="hint">— 根据物价调整</span></div></div>
                <div class="module-body">
                    <div class="tree-price-grid" id="trPriceGrid" style="grid-template-columns:repeat(5,1fr);"></div>
                    <!-- 汇率设置 -->
                    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:6px;border-top:1px solid #dce5ef;">
                        <label style="font-weight:600;font-size:0.8rem;color:#1f3b53;">💱 1万梦幻币 = </label>
                        <input type="number" step="0.001" min="0" id="trExchangeRate" value="${this.exchangeRate}" style="width:70px;padding:4px 6px;border:1px solid #bccad9;border-radius:20px;font-size:0.8rem;text-align:center;">
                        <span style="font-size:0.8rem;color:#1f3b53;">元 RMB</span>
                        <span style="font-size:0.65rem;color:#5a7a94;margin-left:8px;">💡 例：0.08 = 1万梦幻币=0.08元</span>
                    </div>
                </div>
            </div>

            <div class="flex-between">
                <span style="font-size:0.7rem;color:#3a5f7a;">🌳 记录完整产出后点击「结算此树」</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-complete" id="trCompleteBtn" style="border-radius:50px;padding:6px 20px;">🌳 结算此树</button>
                    <button class="btn-reset" id="trResetBtn" style="border-radius:50px;padding:6px 20px;">🗑️ 重置当前</button>
                </div>
            </div>

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

    bindEvents() {
        const container = document.getElementById('treePlantContainer');
        if (!container) return;

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
                    fontSize: 14,
                    notificationPermission: false,
                    remindEnabled: true
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

        // ===== 汇率变化 =====
        document.getElementById('trExchangeRate').addEventListener('input', function() {
            const val = parseFloat(this.value) || 0;
            TreePlantModule.exchangeRate = val;
            TreePlantModule.saveData();
            TreePlantModule.render();
        });

        // ===== 🆕 开始种树 =====
        document.getElementById('trStartTreeBtn').addEventListener('click', () => {
            // 请求通知权限
            if ('Notification' in window && Notification.permission === 'default') {
                TreePlantModule.requestNotificationPermission();
            }

            // 重置所有状态
            TreePlantModule.treeStartTime = Date.now();
            TreePlantModule.treeStage = 'growing';
            TreePlantModule.treeAlerts = { '5min': false, '15min': false, '20min': false };
            TreePlantModule.careCount = 0;
            TreePlantModule.shakeReady = false;
            TreePlantModule.hasEarlyRipen = false;
            TreePlantModule.saveData();
            TreePlantModule.updateTreeStatusUI();
            
            if (TreePlantModule.uiSettings.remindEnabled) {
                alert('🌱 种树已开始！\n\n⏰ 5分钟 → 第一次浇水\n⏰ 15分钟 → 第二次浇水\n⏰ 20分钟 → 第三次浇水\n⏰ 40分钟 → 枯萎\n\n💡 每次浇水点击「已照顾」，3次后5分钟提醒摇树');
            } else {
                alert('🌱 种树已开始！\n\n⚠️ 提醒功能已关闭，不会弹出提醒');
            }
        });

        // ===== 🆕 早熟 =====
        document.getElementById('trEarlyRipenBtn').addEventListener('click', () => {
            if (!TreePlantModule.treeStartTime) {
                alert('⚠️ 请先开始种树！');
                return;
            }
            if (TreePlantModule.treeStage === 'withered') {
                alert('💀 树苗已枯萎，无法早熟！');
                return;
            }
            if (TreePlantModule.hasEarlyRipen) {
                alert('✅ 已经早熟过了！');
                return;
            }
            TreePlantModule.hasEarlyRipen = true;
            TreePlantModule.saveData();
            TreePlantModule.updateTreeStatusUI();
            alert('🌿 已标记为早熟，所有提醒已停止！');
        });

        // ===== 🆕 重置种树状态 =====
        document.getElementById('trResetTreeBtn').addEventListener('click', () => {
            if (!confirm('重置种树状态？')) return;
            TreePlantModule.treeStartTime = null;
            TreePlantModule.treeStage = 'idle';
            TreePlantModule.treeAlerts = { '5min': false, '15min': false, '20min': false };
            TreePlantModule.careCount = 0;
            TreePlantModule.shakeReady = false;
            TreePlantModule.hasEarlyRipen = false;
            TreePlantModule.saveData();
            TreePlantModule.updateTreeStatusUI();
            alert('✅ 已重置');
        });

        // ===== 🆕 提醒开关 =====
        document.getElementById('trRemindToggle').addEventListener('change', function() {
            TreePlantModule.uiSettings.remindEnabled = this.checked;
            TreePlantModule.saveData();
            alert(this.checked ? '🔔 提醒已开启' : '🔕 提醒已关闭');
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('#trEventsGrid .evt-btn');
            if (btn) {
                this.addEvent(btn.dataset.event);
                return;
            }
        });

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

        document.getElementById('trCompleteBtn').addEventListener('click', () => this.settle());
        document.getElementById('trResetBtn').addEventListener('click', () => this.reset());
        document.getElementById('trUndoBtn').addEventListener('click', () => this.undo());

        let analysisVisible = false;
        document.getElementById('trAnalysisToggleBtn').addEventListener('click', function() {
            analysisVisible = !analysisVisible;
            document.getElementById('trAnalysisPanel').style.display = analysisVisible ? 'block' : 'none';
            this.textContent = analysisVisible ? '📊 隐藏分析' : '📊 数据分析';
            this.classList.toggle('active', analysisVisible);
            if (analysisVisible) TreePlantModule.updateAnalysis();
        });
    },

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
        } else if (evt === 'forget') {
            this.current.events.push(evt);
            this.current.shakes = 1;
        } else {
            this.current.events.push(evt);
            this.current.shakes = this.current.baseShakes;
            let hasZaoshu = false;
            for (let e of this.current.events) {
                if (e === 'xiaozai') this.current.shakes += 1;
                else if (e === 'chongzai') this.current.shakes += 2;
                else if (e === 'zaoshu') hasZaoshu = true;
            }
            if (hasZaoshu) {
                this.current.shakes = 6;
            }
        }
        this.saveData();
        this.render();
    },

    undo() {
        let hasLoot = false;
        const keys = this.LOOT_TYPES.map(t => t.key);
        for (let i = keys.length - 1; i >= 0; i--) {
            const key = keys[i];
            if (this.current.loot[key] > 0) {
                this.current.loot[key]--;
                hasLoot = true;
                break;
            }
        }
        if (!hasLoot) {
            if (this.current.events.length > 0) {
                const lastEvt = this.current.events.pop();
                this.current.shakes = this.current.baseShakes;
                let hasZaoshu = false;
                for (let e of this.current.events) {
                    if (e === 'xiaozai') this.current.shakes += 1;
                    else if (e === 'chongzai') this.current.shakes += 2;
                    else if (e === 'zaoshu') hasZaoshu = true;
                }
                if (hasZaoshu) {
                    this.current.shakes = 6;
                }
                alert(`已撤销事件: ${lastEvt}`);
            } else {
                alert('没有可撤销的操作');
                return;
            }
        }
        this.saveData();
        this.render();
    },

    reset() {
        if (confirm('重置当前种树记录？（不会删除已结算的历史）')) {
            this.current = { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {}, isSettled: false };
            this.LOOT_TYPES.forEach(t => {
                if (this.current.loot[t.key] === undefined) this.current.loot[t.key] = 0;
            });
            this.saveData();
            this.render();
        }
    },

    settle() {
        const income = this.calcCurrentIncome();
        const totalLoot = Object.values(this.current.loot).reduce((a, b) => a + b, 0);
        if (totalLoot === 0 && !confirm('当前没有产出记录，确认结算此树？')) return;

        const profit = income.total - this.current.seedCost;
        const lootDetails = [];
        for (let [key, count] of Object.entries(this.current.loot)) {
            if (count > 0) {
                const label = this.LOOT_TYPES.find(t => t.key === key)?.label || key;
                lootDetails.push(`${label}×${count}`);
            }
        }

        const entry = {
            date: new Date().toLocaleString(),
            cost: this.current.seedCost,
            income: income.total,
            profit: profit,
            shakes: this.current.shakes,
            events: [...this.current.events],
            loot: { ...this.current.loot },
            lootDetails: lootDetails,
            exchangeRate: this.exchangeRate
        };

        this.history.push(entry);
        this.saveData();

        this.current = { seedCost: 45, baseShakes: 6, shakes: 6, events: [], loot: {}, isSettled: false };
        this.LOOT_TYPES.forEach(t => {
            if (this.current.loot[t.key] === undefined) this.current.loot[t.key] = 0;
        });
        this.saveData();
        this.render();

        document.getElementById('settleModalTitle').textContent = '🌳 种树结算报告';
        document.getElementById('settleModalDesc').textContent =
            `🌱 成本 ${entry.cost}万 | 📊 收入 ${entry.income.toFixed(1)}万 | 📈 利润 ${entry.profit.toFixed(1)}万 | 🔄 摇树 ${entry.shakes}次`;
        document.getElementById('settleModalBody').innerHTML =
            `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:8px 0;">
                <span>🌱 树苗成本: <strong>${entry.cost}万</strong></span>
                <span>🔄 摇树次数: <strong>${entry.shakes}次</strong></span>
                <span>📦 产出物品: <strong>${lootDetails.length > 0 ? lootDetails.join('; ') : '无'}</strong></span>
                <span>📊 总收入: <strong>${entry.income.toFixed(1)}万</strong></span>
                <span style="grid-column:1/-1;text-align:center;font-size:1.1rem;padding:6px 0;border-top:1px solid #dce5ef;color:${entry.profit>=0?'#2d6b2d':'#c0392b'};">
                    ${entry.profit >= 0 ? '✅' : '❌'} 利润: <strong>${entry.profit.toFixed(1)}万</strong> (≈${(entry.profit * this.exchangeRate).toFixed(2)}元)
                </span>
            </div>`;
        document.getElementById('settleModal').classList.add('show');
    },

    updateStats() {
        const stats = this.calcStats();
        const el = (id) => document.getElementById(id);
        const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };
        const rmb = stats.totalProfit * this.exchangeRate;

        setText('trTotalCost', stats.totalCost.toFixed(1));
        setText('trTotalIncome', stats.totalIncome.toFixed(1));
        setText('trTotalProfit', stats.totalProfit.toFixed(1) + ` (≈${rmb.toFixed(2)}元)`);
        setText('trTotalCount', stats.count);
        setText('trAvgProfit', stats.avgProfit.toFixed(1));
        setText('trWinRate', stats.winRate.toFixed(0) + '%');

        const ps = document.getElementById('trProfitStat');
        if (ps) ps.className = 'stat-item' + (stats.totalProfit > 0 ? ' profit' : stats.totalProfit < 0 ? ' loss' : '');
        const rs = document.getElementById('trRateStat');
        if (rs) rs.className = 'stat-item' + (stats.winRate >= 50 ? ' profit' : stats.winRate > 0 ? '' : '');

        this.buildPriceInputs();
    },

    buildPriceInputs() {
        const grid = document.getElementById('trPriceGrid');
        if (!grid || grid.children.length > 0) return;

        let html = '';
        this.LOOT_TYPES.forEach(t => {
            const v = this.prices[t.key] ?? t.defaultPrice;
            html +=
                `<div class="tree-price-item"><label>${t.label}</label><input type="number" step="0.1" min="0" value="${v}" data-key="${t.key}" style="border-radius:20px;padding:2px 6px;width:52px;text-align:center;border:1px solid #bccad9;"></div>`;
        });
        grid.innerHTML = html;
    },

    updateCurrent() {
        const costInput = document.getElementById('trSeedCostInput');
        if (costInput) {
            const val = parseFloat(costInput.value);
            if (!isNaN(val) && val >= 0) {
                this.current.seedCost = val;
            }
        }
        const stats = this.calcStats();
        const totalTrees = stats.count;
        const el = (id) => document.getElementById(id);
        const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };

        setText('trCurrentLabel', `第 ${totalTrees + 1} 棵`);
        setText('trSeedCost', this.current.seedCost);
        setText('trBaseShakes', this.current.baseShakes);
        setText('trCurrentShakes', this.current.shakes);
        setText('trEventsDisplay', this.current.events.length > 0 ? this.current.events.join(' + ') : '无');

        this.LOOT_TYPES.forEach(t => {
            const e = document.getElementById(`tl-${t.key}`);
            if (e) e.textContent = this.current.loot[t.key] || 0;
        });

        const income = this.calcCurrentIncome();
        const summary = document.getElementById('trCurrentLootSummary');
        if (summary) summary.textContent = income.details.length > 0 ? income.details.join('; ') : '无';
    },

    updateHistory() {
        console.log('📜 更新种树历史表格, 共', this.history.length, '条');
        
        const tbody = document.getElementById('trHistoryBody');
        const countEl = document.getElementById('trHistoryCount');
        if (countEl) countEl.textContent = `共 ${this.history.length} 棵`;

        if (this.history.length === 0) {
            if (tbody) tbody.innerHTML =
                '<tr><td colspan="8" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无种树记录</td></tr>';
            return;
        }

        let html = '';
        const list = this.history.slice().reverse();
        for (let i = 0; i < list.length; i++) {
            const h = list[i];
            const row = list.length - i;
            const pc = h.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const idx = this.history.indexOf(h);
            const rmb = h.profit * this.exchangeRate;
            
            let lootStr = '-';
            if (h.lootDetails && Array.isArray(h.lootDetails) && h.lootDetails.length > 0) {
                lootStr = h.lootDetails.join('; ');
            } else if (h.loot) {
                const parts = [];
                for (let [key, count] of Object.entries(h.loot)) {
                    if (count > 0) {
                        const label = this.LOOT_TYPES.find(t => t.key === key)?.label || key;
                        parts.push(`${label}×${count}`);
                    }
                }
                lootStr = parts.join('; ') || '-';
            }
            
            let displayStr = lootStr;
            if (displayStr.length > 50) {
                displayStr = displayStr.substring(0, 50) + '...';
            }

            html += `<tr>
                <td style="font-weight:700;color:#1f3b53;background:#f5f8fc;">${row}</td>
                <td>${h.date || '未知'}</td>
                <td>${(h.cost || 0).toFixed(1)}</td>
                <td>${(h.income || 0).toFixed(1)}</td>
                <td class="${pc}">${(h.profit || 0).toFixed(1)} (≈${rmb.toFixed(2)}元)</td>
                <td>${h.shakes || 0}</td>
                <td style="font-size:0.7rem;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${lootStr.replace(/"/g, '&quot;')}">${displayStr}</td>
                <td><button class="del-btn" data-idx="${idx}" style="background:#f5d0d0;border:none;border-radius:50px;padding:2px 14px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button></td>
            </tr>`;
        }
        if (tbody) tbody.innerHTML = html;

        if (tbody) {
            tbody.querySelectorAll('.del-btn').forEach(b => {
                b.removeEventListener('click', b._delHandler);
                b._delHandler = () => {
                    const idx = parseInt(b.dataset.idx);
                    if (idx >= 0 && idx < this.history.length) {
                        this.history.splice(idx, 1);
                        this.saveData();
                        this.render();
                    }
                };
                b.addEventListener('click', b._delHandler);
            });
        }
        console.log('✅ 种树历史表格更新完成');
    },

    updateAnalysis() {
        const stats = this.calcStats();
        const el = (id) => document.getElementById(id);
        const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };
        const rmb = stats.totalProfit * this.exchangeRate;

        setText('taTotal', stats.count);
        setText('taCost', stats.totalCost.toFixed(1));
        setText('taIncome', stats.totalIncome.toFixed(1));
        setText('taProfit', stats.totalProfit.toFixed(1) + ` (≈${rmb.toFixed(2)}元)`);
        setText('taRate', stats.winRate.toFixed(0) + '%');

        const wrap = document.getElementById('taProfitWrap');
        if (wrap) wrap.className = 'a-item' + (stats.totalProfit >= 0 ? ' a-profit' : ' a-loss');

        const summary = document.getElementById('taSummary');
        if (summary) {
            summary.textContent = stats.count === 0 ?
                '总结: 尚未有种树记录，开始种树吧！' :
                `总结: 共种植 ${stats.count} 棵，总利润 ${stats.totalProfit.toFixed(1)} 万 (≈${rmb.toFixed(2)}元)，盈利率 ${stats.winRate.toFixed(0)}%，平均每棵 ${stats.avgProfit.toFixed(1)} 万。`;
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TreePlantModule.init());
} else {
    TreePlantModule.init();
}
