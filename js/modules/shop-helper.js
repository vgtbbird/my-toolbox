// ============================================================
//  🏃 跑商助手模块 - 重构完整版
//  修复：事件冒泡 + 地点高亮 + 跑动时间自定义 + 商品增删 + 清晰状态
// ============================================================
const ShopHelperModule = {
    id: 'shopHelper',

    // ========== 存储 ==========
    storageKey: 'shopHelper',

    // ========== UI设置 ==========
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 16,
        // 状态颜色
        colorCanReach: '#2d6b2d',        // 赶得上 - 绿色
        colorCannotReach: '#c0392b',     // 赶不上 - 红色
        colorCurrent: '#dbbd7c',         // 当前位置边框
        colorLowPrice: '#4CAF50',        // 低价商人
        colorHighPrice: '#e06060',       // 高价商人
        locationHighlight: 'rgba(219,189,124,0.15)'
    },

    // ========== 数据 ==========
    currentLocation: null,
    firstOffset: 0,
    secondMinute: 3,
    secondSecond: 20,
    travelTimes: {},
    shopPrices: {},
    goodsList: {},
    goodsPrices: {},
    priceHistory: {},
    runRecords: [],

    // ========== 地点配置 ==========
    locations: [
        { id: 'aolai', name: '傲来', icon: '🌊', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changshou', name: '长寿', icon: '🌳', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changan', name: '长安', icon: '🏯', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'difu', name: '地府', icon: '👻', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'beiju', name: '北俱', icon: '⛰️', shopLayout: 'vertical', shops: ['上商', '下商'] }
    ],

    // ========== 默认商品 ==========
    defaultGoods: {
        'aolai': [
            { key: 'yan', name: '盐', refPrice: 6500 },
            { key: 'maozi', name: '帽子', refPrice: 3000 },
            { key: 'jiu', name: '酒', refPrice: 3500 }
        ],
        'changshou': [
            { key: 'lurong', name: '鹿茸', refPrice: 7000 },
            { key: 'mianfen', name: '面粉', refPrice: 3000 },
            { key: 'fu', name: '符', refPrice: 5000 }
        ],
        'changan': [
            { key: 'fozhu', name: '佛珠', refPrice: 7000 },
            { key: 'shanzi', name: '扇子', refPrice: 3800 },
            { key: 'wuqi', name: '武器', refPrice: 4000 }
        ],
        'difu': [
            { key: 'zhiqian', name: '纸钱', refPrice: 3000 },
            { key: 'shoushi', name: '首饰', refPrice: 4300 },
            { key: 'yemingzhu', name: '夜明珠', refPrice: 8000 }
        ],
        'beiju': [
            { key: 'xiangyou', name: '香油', refPrice: 4000 },
            { key: 'renshen', name: '人参', refPrice: 7500 },
            { key: 'lingdang', name: '铃铛', refPrice: 4000 }
        ]
    },

    // ========== 默认跑动时间 ==========
    defaultTravelTimes: {
        'changan_aolai': 150,
        'changan_changshou': 270,
        'changan_difu': 90,
        'changan_beiju': 240,
        'aolai_changshou': 120,
        'aolai_difu': 150,
        'aolai_beiju': 40,
        'changshou_difu': 150,
        'changshou_beiju': 60,
        'difu_beiju': 270
    },

    // ========== 地点名称映射 ==========
    locationNames: {
        'changan': '长安',
        'aolai': '傲来',
        'changshou': '长寿',
        'difu': '地府',
        'beiju': '北俱'
    },

    // ========== 生命周期 ==========
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
            this.updateTimeDisplay();
            this.renderMap();
        }, 1000);
    },

    render() {
        this.updateTimeDisplay();
        this.renderMap();
        this.renderTravelTimes();
        this.saveData();
        this.applyUISettings();
    },

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.currentLocation = data.currentLocation || null;
        this.firstOffset = data.firstOffset || 0;
        this.secondMinute = data.secondMinute !== undefined ? data.secondMinute : 3;
        this.secondSecond = data.secondSecond !== undefined ? data.secondSecond : 20;
        this.travelTimes = data.travelTimes || { ...this.defaultTravelTimes };
        this.shopPrices = data.shopPrices || {};
        this.goodsList = data.goodsList || JSON.parse(JSON.stringify(this.defaultGoods));
        this.goodsPrices = data.goodsPrices || {};
        this.priceHistory = data.priceHistory || {};
        this.runRecords = data.runRecords || [];
        this.uiSettings = data.uiSettings || this.uiSettings;
        // 确保所有地点都有商品列表
        for (let loc of this.locations) {
            if (!this.goodsList[loc.id]) {
                this.goodsList[loc.id] = JSON.parse(JSON.stringify(this.defaultGoods[loc.id] || []));
            }
        }
    },

    saveData() {
        Storage.set(this.storageKey, {
            currentLocation: this.currentLocation,
            firstOffset: this.firstOffset,
            secondMinute: this.secondMinute,
            secondSecond: this.secondSecond,
            travelTimes: this.travelTimes,
            shopPrices: this.shopPrices,
            goodsList: this.goodsList,
            goodsPrices: this.goodsPrices,
            priceHistory: this.priceHistory,
            runRecords: this.runRecords,
            uiSettings: this.uiSettings
        });
    },

    // ========== UI设置应用 ==========
    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');

        container.querySelectorAll('.module, .sh-location-card').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.sh-location-name, .sh-goods-name, .sh-travel-label, .sh-status-label').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.sh-location-card, .sh-shop-btn, .sh-goods-item, .sh-price-input, .sh-travel-input, .sh-status-text').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

    // ========== 刷新时间计算 ==========
    getNextFirstRefresh() {
        const now = new Date();
        const minute = now.getMinutes();
        const nextMinute = Math.ceil((minute + 1) / 10) * 10;
        const target = new Date(now);
        target.setMinutes(nextMinute, 0, 0);
        target.setSeconds(10 + this.firstOffset);
        if (target < now) target.setMinutes(nextMinute + 10, 0, 0);
        target.setSeconds(10 + this.firstOffset);
        return target;
    },

    getNextSecondRefresh() {
        const now = new Date();
        const minute = now.getMinutes();
        const baseMinute = Math.floor(minute / 10) * 10;
        let targetMinute = baseMinute + this.secondMinute;
        let target = new Date(now);
        target.setMinutes(targetMinute, this.secondSecond, 0);
        if (target < now) target.setMinutes(targetMinute + 10, this.secondSecond, 0);
        return target;
    },

    getTimeRemaining(target) {
        const now = new Date();
        return Math.max(0, (target - now) / 1000);
    },

    formatTime(seconds) {
        if (seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
    },

    // ========== 跑动时间 ==========
    getTravelTime(from, to) {
        if (from === to) return 0;
        const key1 = from + '_' + to;
        const key2 = to + '_' + from;
        return this.travelTimes[key1] || this.travelTimes[key2] || 180;
    },

    // ========== 刷新状态判断 ==========
    checkRefreshStatus(targetLocation) {
        if (!this.currentLocation || this.currentLocation === targetLocation) {
            const firstTarget = this.getNextFirstRefresh();
            const secondTarget = this.getNextSecondRefresh();
            const now = new Date();
            return {
                first: 'can',
                second: 'can',
                firstRemain: (firstTarget - now) / 1000,
                secondRemain: (secondTarget - now) / 1000,
                isCurrent: true
            };
        }

        const travelTime = this.getTravelTime(this.currentLocation, targetLocation);
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();
        const now = new Date();
        const firstRemain = (firstTarget - now) / 1000;
        const secondRemain = (secondTarget - now) / 1000;

        return {
            first: firstRemain > travelTime ? 'can' : 'cannot',
            second: secondRemain > travelTime ? 'can' : 'cannot',
            firstRemain: firstRemain,
            secondRemain: secondRemain,
            travelTime: travelTime,
            isCurrent: false
        };
    },

    // ========== 更新时间显示 ==========
    updateTimeDisplay() {
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();
        const el1 = document.getElementById('shFirstTimeDisplay');
        const el2 = document.getElementById('shSecondTimeDisplay');
        if (el1) el1.textContent = firstTarget.toLocaleTimeString() + '（剩余 ' + this.formatTime(this.getTimeRemaining(firstTarget)) + '）';
        if (el2) el2.textContent = secondTarget.toLocaleTimeString() + '（剩余 ' + this.formatTime(this.getTimeRemaining(secondTarget)) + '）';
    },

    // ============================================================
    //  🗺️ 渲染地图
    // ============================================================
    renderMap() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;

        const s = this.uiSettings;

        let html = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">';

        for (let loc of this.locations) {
            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            // 状态判断
            let firstStatus = status.first === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let firstColor = status.first === 'can' ? s.colorCanReach : s.colorCannotReach;
            let secondStatus = status.second === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let secondColor = status.second === 'can' ? s.colorCanReach : s.colorCannotReach;

            // 当前位置特殊显示
            if (status.isCurrent) {
                firstStatus = '📍 当前';
                firstColor = s.colorCurrent;
                secondStatus = '📍 当前';
                secondColor = s.colorCurrent;
            }

            const travelDisplay = isCurrent ? '📍当前' : (status.travelTime ? this.formatTime(status.travelTime) : '--');

            // 商户布局
            let shopsHtml = '';
            const shopKeys = ['left', 'right'];
            if (loc.shopLayout === 'horizontal') {
                shopsHtml = `
                    <div style="display:flex;gap:4px;justify-content:center;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="flex:1;padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.75rem;transition:all 0.2s;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="flex:1;padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.75rem;transition:all 0.2s;">${loc.shops[1]}</button>
                    </div>
                `;
            } else {
                shopsHtml = `
                    <div style="display:flex;flex-direction:column;gap:4px;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.75rem;transition:all 0.2s;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.75rem;transition:all 0.2s;">${loc.shops[1]}</button>
                    </div>
                `;
            }

            // 应用商人颜色标记
            const shop0Key = loc.id + '_0';
            const shop1Key = loc.id + '_1';
            const shop0Color = this.shopPrices[shop0Key] === 'low' ? s.colorLowPrice : (this.shopPrices[shop0Key] === 'high' ? s.colorHighPrice : null);
            const shop1Color = this.shopPrices[shop1Key] === 'low' ? s.colorLowPrice : (this.shopPrices[shop1Key] === 'high' ? s.colorHighPrice : null);

            // 商品列表
            const goods = this.goodsList[loc.id] || [];
            let goodsHtml = '';
            if (goods.length > 0) {
                goodsHtml = goods.map(g => {
                    const currentPrice = this.goodsPrices[loc.id + '_' + g.key] || '';
                    const isLow = currentPrice && currentPrice < g.refPrice * 0.9;
                    const isHigh = currentPrice && currentPrice > g.refPrice * 1.1;
                    let priceColor = '#5a7a94';
                    if (isLow) priceColor = s.colorLowPrice;
                    else if (isHigh) priceColor = s.colorHighPrice;

                    return `
                        <div class="sh-goods-item" style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:0.7rem;color:#5a7a94;gap:4px;">
                            <span class="sh-goods-name" style="min-width:32px;font-weight:500;color:#1f3b53;">${g.name}</span>
                            <span style="color:#8ab0c8;font-size:0.6rem;min-width:32px;">${g.refPrice}</span>
                            <input class="sh-price-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${currentPrice}" placeholder="价" style="width:50px;padding:1px 4px;border:1px solid #dce5ef;border-radius:6px;font-size:0.65rem;text-align:center;background:transparent;">
                            ${currentPrice ? `<span style="font-size:0.55rem;color:${priceColor};min-width:20px;">${isLow ? '📉' : isHigh ? '📈' : '—'}</span>` : ''}
                            <button class="sh-del-goods-btn" data-location="${loc.id}" data-goods="${g.key}" style="background:transparent;border:none;color:#ccc;cursor:pointer;font-size:0.7rem;padding:0 2px;">✕</button>
                        </div>
                    `;
                }).join('');
            }

            // 添加商品按钮
            const addGoodsHtml = `
                <div style="display:flex;gap:4px;margin-top:2px;">
                    <input class="sh-new-goods-name" data-location="${loc.id}" placeholder="商品名" style="flex:1;padding:1px 4px;border:1px solid #dce5ef;border-radius:6px;font-size:0.6rem;background:transparent;min-width:40px;">
                    <input class="sh-new-goods-price" data-location="${loc.id}" placeholder="参考价" style="width:40px;padding:1px 4px;border:1px solid #dce5ef;border-radius:6px;font-size:0.6rem;text-align:center;background:transparent;">
                    <button class="sh-add-goods-btn" data-location="${loc.id}" style="background:#4c7a5c;color:#fff;border:none;border-radius:6px;padding:0 8px;font-size:0.6rem;cursor:pointer;">+</button>
                </div>
            `;

            // 地点卡片样式
            let cardStyle = `
                background:${s.cardBgColor};
                border-radius:12px;
                padding:10px 10px;
                border:${isCurrent ? '3px' : '1px'} solid ${isCurrent ? s.colorCurrent : '#dce5ef'};
                box-shadow:${isCurrent ? '0 4px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)'};
                transition:all 0.2s;
                cursor:pointer;
            `;

            if (isCurrent) {
                cardStyle += `background:${s.locationHighlight};`;
            }

            html += `
                <div class="sh-location-card" data-location="${loc.id}" style="${cardStyle}">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span class="sh-location-name" style="font-size:1rem;font-weight:700;color:#1f3b53;cursor:pointer;user-select:none;">${loc.icon} ${loc.name}</span>
                        <span style="font-size:0.65rem;color:${isCurrent ? s.colorCurrent : '#5a7a94'};font-weight:600;">${travelDisplay}</span>
                    </div>
                    <div style="display:flex;gap:4px;font-size:0.65rem;margin:3px 0;flex-wrap:wrap;">
                        <span class="sh-status-text" style="background:${firstColor}33;color:${firstColor};padding:0 8px;border-radius:10px;font-weight:600;">🔄一刷 ${firstStatus}</span>
                        <span class="sh-status-text" style="background:${secondColor}33;color:${secondColor};padding:0 8px;border-radius:10px;font-weight:600;">🔄二刷 ${secondStatus}</span>
                    </div>
                    ${shopsHtml}
                    <div style="border-top:1px solid #eef2f7;margin-top:4px;padding-top:4px;">
                        ${goodsHtml}
                        ${addGoodsHtml}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // ===== 应用商人颜色 =====
        container.querySelectorAll('.sh-shop-btn').forEach(btn => {
            const locId = btn.dataset.location;
            const shopIdx = parseInt(btn.dataset.shop);
            const key = locId + '_' + shopIdx;
            const color = this.shopPrices[key] === 'low' ? this.uiSettings.colorLowPrice : 
                         (this.shopPrices[key] === 'high' ? this.uiSettings.colorHighPrice : null);
            if (color) {
                btn.style.background = color;
                btn.style.color = '#fff';
                btn.style.borderColor = color;
            } else {
                btn.style.background = '#f0f4f8';
                btn.style.color = '#1f3b53';
                btn.style.borderColor = '#bccad9';
            }
        });
    },

    // ============================================================
    //  🕐 渲染跑动时间配置
    // ============================================================
    renderTravelTimes() {
        const container = document.getElementById('shTravelTimesContainer');
        if (!container) return;

        const pairs = [
            ['changan', 'aolai', '长安→傲来'],
            ['changan', 'changshou', '长安→长寿'],
            ['changan', 'difu', '长安→地府'],
            ['changan', 'beiju', '长安→北俱'],
            ['aolai', 'changshou', '傲来→长寿'],
            ['aolai', 'difu', '傲来→地府'],
            ['aolai', 'beiju', '傲来→北俱'],
            ['changshou', 'difu', '长寿→地府'],
            ['changshou', 'beiju', '长寿→北俱'],
            ['difu', 'beiju', '地府→北俱']
        ];

        let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;">';
        for (let [from, to, label] of pairs) {
            const key = from + '_' + to;
            const val = this.travelTimes[key] || 180;
            html += `
                <div style="display:flex;align-items:center;gap:4px;font-size:0.7rem;">
                    <span style="color:#5a7a94;min-width:60px;">${label}</span>
                    <input type="number" class="sh-travel-input" data-from="${from}" data-to="${to}" value="${val}" min="0" max="600" style="width:50px;padding:2px 4px;border:1px solid #bccad9;border-radius:8px;font-size:0.7rem;text-align:center;">
                    <span style="color:#8ab0c8;font-size:0.6rem;">秒</span>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    // ============================================================
    //  🏗️ 构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- 刷新时间 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:10px;">
                <div class="module-header">
                    <div class="title">⏰ 刷新时间 <span class="hint">— 自动计算下次刷新</span></div>
                    <div>
                        <button class="toggle-btn" id="shToggleTimeBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="shTimeBody">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:4px 0;">
                        <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                            <div style="font-size:0.75rem;color:#5a7a94;">📌 一刷（大刷）</div>
                            <div style="font-weight:700;color:#1f3b53;font-size:0.95rem;" id="shFirstTimeDisplay">计算中...</div>
                            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                <button class="btn-small" id="shFirstMinus" style="padding:2px 10px;font-size:0.6rem;">-10秒</button>
                                <button class="btn-small" id="shFirstPlus" style="padding:2px 10px;font-size:0.6rem;">+10秒</button>
                                <span style="font-size:0.6rem;color:#5a7a94;line-height:24px;">当前微调: <span id="shFirstOffsetDisplay">0</span>秒</span>
                            </div>
                        </div>
                        <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                            <div style="font-size:0.75rem;color:#5a7a94;">📌 二刷（卖价刷新）</div>
                            <div style="font-weight:700;color:#1f3b53;font-size:0.95rem;" id="shSecondTimeDisplay">计算中...</div>
                            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                <input type="number" id="shSecondMinute" value="${this.secondMinute}" min="0" max="9" style="width:40px;padding:2px 4px;border:1px solid #bccad9;border-radius:8px;font-size:0.7rem;text-align:center;">
                                <span style="font-size:0.7rem;color:#5a7a94;line-height:28px;">分</span>
                                <input type="number" id="shSecondSecond" value="${this.secondSecond}" min="0" max="59" style="width:40px;padding:2px 4px;border:1px solid #bccad9;border-radius:8px;font-size:0.7rem;text-align:center;">
                                <span style="font-size:0.7rem;color:#5a7a94;line-height:28px;">秒</span>
                                <button class="btn-small" id="shSetSecondBtn" style="padding:2px 14px;font-size:0.65rem;">设置</button>
                            </div>
                        </div>
                    </div>
                    <div style="font-size:0.65rem;color:#5a7a94;padding:4px 0;">💡 点击地点卡片标记当前位置，自动计算各地可达性 | 点击商人标记低价/高价</div>
                </div>
            </div>

            <!-- 地图 -->
            <div id="shMapContainer" style="margin-bottom:10px;"></div>

            <!-- 图例 -->
            <div style="display:flex;gap:12px;flex-wrap:wrap;padding:6px 0;border-top:1px solid #eef2f7;font-size:0.65rem;color:#5a7a94;">
                <span>🟢 赶得上</span>
                <span>🔴 赶不上</span>
                <span>| 点击地点名称标记当前位置</span>
                <span>| 点击商人标记低价/高价</span>
            </div>

            <!-- 跑动时间配置 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🕐 跑动时间配置 <span class="hint">— 自定义各地间跑动耗时</span></div>
                    <button class="toggle-btn" id="shToggleTravelBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="shTravelBody">
                    <div id="shTravelTimesContainer"></div>
                    <div style="font-size:0.6rem;color:#5a7a94;margin-top:4px;">💡 修改后自动保存，用于计算刷新是否赶得上</div>
                </div>
            </div>

            <!-- 设置 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="shToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="shUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;padding:8px 0;">
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>🟢 赶得上</label>
                            <input type="color" id="shColorCanReach" value="${this.uiSettings.colorCanReach}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>🔴 赶不上</label>
                            <input type="color" id="shColorCannotReach" value="${this.uiSettings.colorCannotReach}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>📍 当前位置</label>
                            <input type="color" id="shColorCurrent" value="${this.uiSettings.colorCurrent}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>🟢 低价商</label>
                            <input type="color" id="shColorLow" value="${this.uiSettings.colorLowPrice}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>🔴 高价商</label>
                            <input type="color" id="shColorHigh" value="${this.uiSettings.colorHighPrice}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;">
                            <label>🔤 字体大小</label>
                            <input type="number" id="shFontSize" value="${this.uiSettings.fontSize}" min="12" max="24" style="width:50px;padding:2px;border-radius:8px;border:1px solid #ddd;text-align:center;display:block;margin:2px auto;">
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="shResetUIColors" style="background:#b48b5f;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        // ===== 点击地点卡片（标记当前位置）=====
        // 使用事件委托，但只对 .sh-location-card 生效，排除子按钮
        container.addEventListener('click', (e) => {
            // 如果点击的是按钮或输入框，不处理
            if (e.target.closest('.sh-shop-btn') || 
                e.target.closest('.sh-price-input') ||
                e.target.closest('.sh-new-goods-name') ||
                e.target.closest('.sh-new-goods-price') ||
                e.target.closest('.sh-add-goods-btn') ||
                e.target.closest('.sh-del-goods-btn') ||
                e.target.closest('.sh-travel-input') ||
                e.target.closest('input') ||
                e.target.closest('button')) {
                return;
            }

            const card = e.target.closest('.sh-location-card');
            if (card) {
                const locId = card.dataset.location;
                if (locId) {
                    this.currentLocation = locId;
                    this.saveData();
                    this.render();
                }
            }
        });

        // ===== 点击商人按钮（修复事件冒泡）=====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-shop-btn');
            if (btn) {
                e.stopPropagation(); // 阻止冒泡到地点卡片
                const locId = btn.dataset.location;
                const shopIdx = parseInt(btn.dataset.shop);
                const key = locId + '_' + shopIdx;

                // 如果当前已经是低价，取消标记
                if (this.shopPrices[key] === 'low') {
                    delete this.shopPrices[key];
                    // 清除另一个商人的高价标记
                    const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                    delete this.shopPrices[otherKey];
                } else {
                    // 标记当前为低价
                    this.shopPrices[key] = 'low';
                    // 另一个商人标记为高价
                    const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                    this.shopPrices[otherKey] = 'high';
                }
                this.saveData();
                this.renderMap();
            }
        });

        // ===== 商品价格输入 =====
        container.addEventListener('change', (e) => {
            const input = e.target.closest('.sh-price-input');
            if (input) {
                const locId = input.dataset.location;
                const goodsKey = input.dataset.goods;
                const val = parseFloat(input.value);
                const key = locId + '_' + goodsKey;
                if (!isNaN(val) && val > 0) {
                    this.goodsPrices[key] = val;
                    // 记录历史
                    if (!this.priceHistory[key]) this.priceHistory[key] = [];
                    this.priceHistory[key].push({ price: val, time: new Date().toLocaleString() });
                    if (this.priceHistory[key].length > 20) this.priceHistory[key].shift();
                } else {
                    delete this.goodsPrices[key];
                }
                this.saveData();
                this.renderMap();
            }
        });

        // ===== 添加商品 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-add-goods-btn');
            if (btn) {
                e.stopPropagation();
                const locId = btn.dataset.location;
                const nameInput = container.querySelector(`.sh-new-goods-name[data-location="${locId}"]`);
                const priceInput = container.querySelector(`.sh-new-goods-price[data-location="${locId}"]`);
                if (!nameInput || !priceInput) return;
                const name = nameInput.value.trim();
                const refPrice = parseFloat(priceInput.value);
                if (!name) { alert('请输入商品名'); return; }
                if (isNaN(refPrice) || refPrice <= 0) { alert('请输入有效参考价'); return; }
                if (!this.goodsList[locId]) this.goodsList[locId] = [];
                const key = name + '_' + Date.now();
                this.goodsList[locId].push({ key: key, name: name, refPrice: refPrice });
                nameInput.value = '';
                priceInput.value = '';
                this.saveData();
                this.renderMap();
            }
        });

        // ===== 删除商品 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-del-goods-btn');
            if (btn) {
                e.stopPropagation();
                const locId = btn.dataset.location;
                const goodsKey = btn.dataset.goods;
                if (!this.goodsList[locId]) return;
                this.goodsList[locId] = this.goodsList[locId].filter(g => g.key !== goodsKey);
                // 清理价格数据
                const priceKey = locId + '_' + goodsKey;
                delete this.goodsPrices[priceKey];
                delete this.priceHistory[priceKey];
                this.saveData();
                this.renderMap();
            }
        });

        // ===== 跑动时间输入 =====
        container.addEventListener('change', (e) => {
            const input = e.target.closest('.sh-travel-input');
            if (input) {
                const from = input.dataset.from;
                const to = input.dataset.to;
                const val = parseInt(input.value);
                if (!isNaN(val) && val >= 0) {
                    const key = from + '_' + to;
                    this.travelTimes[key] = val;
                    // 也保存反向
                    const reverseKey = to + '_' + from;
                    if (!this.travelTimes[reverseKey]) {
                        // 不自动设置反向，让用户分别设置
                    }
                    this.saveData();
                    this.renderMap();
                }
            }
        });

        // ===== 一刷微调 =====
        document.getElementById('shFirstMinus').addEventListener('click', () => {
            this.firstOffset = Math.max(-10, this.firstOffset - 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.render();
        });
        document.getElementById('shFirstPlus').addEventListener('click', () => {
            this.firstOffset = Math.min(10, this.firstOffset + 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.render();
        });

        // ===== 二刷设置 =====
        document.getElementById('shSetSecondBtn').addEventListener('click', () => {
            const m = parseInt(document.getElementById('shSecondMinute').value);
            const s = parseInt(document.getElementById('shSecondSecond').value);
            if (isNaN(m) || m < 0 || m > 9) { alert('分钟请输入 0-9'); return; }
            if (isNaN(s) || s < 0 || s > 59) { alert('秒数请输入 0-59'); return; }
            this.secondMinute = m;
            this.secondSecond = s;
            this.saveData();
            this.render();
            alert('✅ 二刷时间已设置！');
        });

        // ===== 折叠按钮 =====
        document.getElementById('shToggleTimeBtn').addEventListener('click', function() {
            const body = document.getElementById('shTimeBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('shToggleTravelBtn').addEventListener('click', function() {
            const body = document.getElementById('shTravelBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('shToggleUISettings').addEventListener('click', function() {
            const body = document.getElementById('shUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 颜色设置 =====
        const colorMap = {
            'shColorCanReach': 'colorCanReach',
            'shColorCannotReach': 'colorCannotReach',
            'shColorCurrent': 'colorCurrent',
            'shColorLow': 'colorLowPrice',
            'shColorHigh': 'colorHighPrice'
        };
        for (let [elId, key] of Object.entries(colorMap)) {
            document.getElementById(elId).addEventListener('input', function() {
                ShopHelperModule.uiSettings[key] = this.value;
                ShopHelperModule.saveData();
                ShopHelperModule.render();
            });
        }

        // ===== 字体大小 =====
        document.getElementById('shFontSize').addEventListener('change', function() {
            const val = parseInt(this.value) || 16;
            ShopHelperModule.uiSettings.fontSize = val;
            ShopHelperModule.saveData();
            ShopHelperModule.applyUISettings();
            ShopHelperModule.renderMap();
        });

        // ===== 重置颜色 =====
        document.getElementById('shResetUIColors').addEventListener('click', function() {
            if (!confirm('重置所有颜色为默认值？')) return;
            const defaults = {
                colorCanReach: '#2d6b2d',
                colorCannotReach: '#c0392b',
                colorCurrent: '#dbbd7c',
                colorLowPrice: '#4CAF50',
                colorHighPrice: '#e06060'
            };
            Object.assign(ShopHelperModule.uiSettings, defaults);
            ShopHelperModule.saveData();
            for (let [elId, key] of Object.entries({
                'shColorCanReach': 'colorCanReach',
                'shColorCannotReach': 'colorCannotReach',
                'shColorCurrent': 'colorCurrent',
                'shColorLow': 'colorLowPrice',
                'shColorHigh': 'colorHighPrice'
            })) {
                const el = document.getElementById(elId);
                if (el) el.value = defaults[key];
            }
            ShopHelperModule.render();
            alert('✅ 颜色已重置！');
        });
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShopHelperModule.init());
} else {
    ShopHelperModule.init();
}

window.ShopHelperModule = ShopHelperModule;
