// ============================================================
//  🏃 跑商助手模块 - 重构完整版 v6
//  修复：输入框无法输入的问题（分离渲染 + 事件优化）
// ============================================================
const ShopHelperModule = {
    id: 'shopHelper',

    storageKey: 'shopHelper',

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 15,
        colorCanReach: '#2d6b2d',
        colorCannotReach: '#c0392b',
        colorCurrent: '#dbbd7c',
        colorLowPrice: '#2d7a2d',
        colorHighPrice: '#c0392b',
        locationHighlight: 'rgba(219,189,124,0.15)'
    },

    currentLocation: null,
    firstOffset: 0,
    secondMinute: 3,
    secondSecond: 20,
    travelTimes: {},
    shopPrices: {},
    goodsList: {},
    goodsPrices: {},
    goodsRefPrices: {},
    priceHistory: {},
    runRecords: [],

    locations: [
        { id: 'aolai', name: '傲来', icon: '🌊', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changshou', name: '长寿', icon: '🌳', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changan', name: '长安', icon: '🏯', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'difu', name: '地府', icon: '👻', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'beiju', name: '北俱', icon: '⛰️', shopLayout: 'vertical', shops: ['上商', '下商'] }
    ],

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

    defaultTravelTimes: {
        'changan_aolai': 150, 'aolai_changan': 30,
        'changan_changshou': 270, 'changshou_changan': 120,
        'changan_difu': 90, 'difu_changan': 60,
        'changan_beiju': 240, 'beiju_changan': 30,
        'aolai_changshou': 120, 'changshou_aolai': 120,
        'aolai_difu': 150, 'difu_aolai': 150,
        'aolai_beiju': 40, 'beiju_aolai': 40,
        'changshou_difu': 150, 'difu_changshou': 150,
        'changshou_beiju': 60, 'beiju_changshou': 40,
        'difu_beiju': 270, 'beiju_difu': 120
    },

    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
            this.updateTimeDisplay();
            this.updateStatusOnly(); // 只更新状态，不重绘整个地图
        }, 1000);
    },

    render() {
        this.updateTimeDisplay();
        this.renderMap();
        this.renderTravelTimes();
        this.saveData();
        this.applyUISettings();
    },

    // 只更新状态标签（不重绘整个地图，保持输入框焦点）
    updateStatusOnly() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        const s = this.uiSettings;

        // 只更新每个地点的状态标签和耗时
        for (let loc of this.locations) {
            const card = container.querySelector(`.sh-location-card[data-location="${loc.id}"]`);
            if (!card) continue;

            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            let firstStatus = status.first === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let firstColor = status.first === 'can' ? s.colorCanReach : s.colorCannotReach;
            let secondStatus = status.second === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let secondColor = status.second === 'can' ? s.colorCanReach : s.colorCannotReach;

            if (status.isCurrent) {
                firstStatus = '📍当前';
                firstColor = s.colorCurrent;
                secondStatus = '📍当前';
                secondColor = s.colorCurrent;
            }

            // 更新状态标签
            const statusRow = card.querySelector('.sh-status-row');
            if (statusRow) {
                statusRow.innerHTML = `
                    <span class="sh-status-text" style="background:${firstColor}33;color:${firstColor};padding:0 8px;border-radius:10px;font-weight:800;font-size:0.7rem;white-space:nowrap;">🔄一刷 ${firstStatus}</span>
                    <span class="sh-status-text" style="background:${secondColor}33;color:${secondColor};padding:0 8px;border-radius:10px;font-weight:800;font-size:0.7rem;white-space:nowrap;">🔄二刷 ${secondStatus}</span>
                `;
            }

            // 更新耗时显示
            const travelDisplay = isCurrent ? '📍当前' : (status.travelTime ? this.formatTime(status.travelTime) : '--');
            const timeEl = card.querySelector('.sh-travel-display');
            if (timeEl) {
                timeEl.textContent = travelDisplay;
                timeEl.style.color = isCurrent ? s.colorCurrent : '#4a6a8a';
            }

            // 更新边框
            if (isCurrent) {
                card.style.border = `3px solid ${s.colorCurrent}`;
                card.style.background = s.locationHighlight;
                card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            } else {
                card.style.border = '1px solid #dce5ef';
                card.style.background = s.cardBgColor;
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }
        }
    },

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
        this.goodsRefPrices = data.goodsRefPrices || {};
        this.priceHistory = data.priceHistory || {};
        this.runRecords = data.runRecords || [];
        this.uiSettings = data.uiSettings || this.uiSettings;
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
            goodsRefPrices: this.goodsRefPrices,
            priceHistory: this.priceHistory,
            runRecords: this.runRecords,
            uiSettings: this.uiSettings
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;
        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        container.querySelectorAll('.module, .sh-location-card').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.sh-location-card, .sh-shop-btn, .sh-goods-item, .sh-price-input, .sh-travel-input, .sh-status-text, .sh-goods-name, .sh-goods-refprice').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
    },

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

    getTravelTime(from, to) {
        if (from === to) return 0;
        const key = from + '_' + to;
        return this.travelTimes[key] || 180;
    },

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

    updateTimeDisplay() {
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();
        const el1 = document.getElementById('shFirstTimeDisplay');
        const el2 = document.getElementById('shSecondTimeDisplay');
        if (el1) el1.textContent = firstTarget.toLocaleTimeString() + '（剩余 ' + this.formatTime(this.getTimeRemaining(firstTarget)) + '）';
        if (el2) el2.textContent = secondTarget.toLocaleTimeString() + '（剩余 ' + this.formatTime(this.getTimeRemaining(secondTarget)) + '）';
    },

    // ============================================================
    //  🗺️ 渲染地图（只渲染一次，后续只更新状态）
    // ============================================================
    renderMap() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        
        // 如果已经有内容，只更新状态，不重新渲染
        if (container.querySelector('.sh-location-card')) {
            this.updateStatusOnly();
            return;
        }

        const s = this.uiSettings;

        let html = `
            <style>
                .sh-map-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                }
                @media (max-width: 1024px) {
                    .sh-map-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .sh-map-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                .sh-status-row {
                    display: flex;
                    flex-direction: row;
                    gap: 4px;
                    flex-wrap: wrap;
                    margin: 3px 0;
                }
                .sh-status-text {
                    display: inline-block;
                    padding: 0 8px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.7rem;
                    white-space: nowrap;
                }
                .sh-price-input, .sh-goods-refprice-input {
                    background: white !important;
                    pointer-events: auto !important;
                }
            </style>
            <div class="sh-map-grid">
        `;

        for (let loc of this.locations) {
            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            let firstStatus = status.first === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let firstColor = status.first === 'can' ? s.colorCanReach : s.colorCannotReach;
            let secondStatus = status.second === 'can' ? '赶得上 ✅' : '赶不上 ❌';
            let secondColor = status.second === 'can' ? s.colorCanReach : s.colorCannotReach;

            if (status.isCurrent) {
                firstStatus = '📍当前';
                firstColor = s.colorCurrent;
                secondStatus = '📍当前';
                secondColor = s.colorCurrent;
            }

            const travelDisplay = isCurrent ? '📍当前' : (status.travelTime ? this.formatTime(status.travelTime) : '--');

            let shopsHtml = '';
            if (loc.shopLayout === 'horizontal') {
                shopsHtml = `
                    <div style="display:flex;gap:4px;justify-content:center;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="flex:1;padding:4px 6px;border-radius:8px;border:2px solid #b0c0d0;background:#f0f4f8;cursor:pointer;font-size:0.8rem;font-weight:700;color:#0a1a2a;transition:all 0.2s;min-width:0;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="flex:1;padding:4px 6px;border-radius:8px;border:2px solid #b0c0d0;background:#f0f4f8;cursor:pointer;font-size:0.8rem;font-weight:700;color:#0a1a2a;transition:all 0.2s;min-width:0;">${loc.shops[1]}</button>
                    </div>
                `;
            } else {
                shopsHtml = `
                    <div style="display:flex;flex-direction:column;gap:3px;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="padding:4px 6px;border-radius:8px;border:2px solid #b0c0d0;background:#f0f4f8;cursor:pointer;font-size:0.8rem;font-weight:700;color:#0a1a2a;transition:all 0.2s;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="padding:4px 6px;border-radius:8px;border:2px solid #b0c0d0;background:#f0f4f8;cursor:pointer;font-size:0.8rem;font-weight:700;color:#0a1a2a;transition:all 0.2s;">${loc.shops[1]}</button>
                    </div>
                `;
            }

            const goods = this.goodsList[loc.id] || [];
            let goodsHtml = '';
            if (goods.length > 0) {
                goodsHtml = goods.map(g => {
                    const currentPrice = this.goodsPrices[loc.id + '_' + g.key] || '';
                    const refPriceKey = loc.id + '_' + g.key;
                    const refPrice = this.goodsRefPrices[refPriceKey] || g.refPrice || 0;
                    
                    let priceStatus = '';
                    let priceColor = '#5a7a94';
                    if (currentPrice && refPrice > 0) {
                        if (currentPrice < refPrice * 0.95) {
                            priceStatus = '📉';
                            priceColor = s.colorLowPrice;
                        } else if (currentPrice > refPrice * 1.05) {
                            priceStatus = '📈';
                            priceColor = s.colorHighPrice;
                        } else {
                            priceStatus = '—';
                            priceColor = '#4a6a8a';
                        }
                    }

                    return `
                        <div class="sh-goods-item" style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;gap:2px;border-bottom:1px solid #e8eef5;flex-wrap:nowrap;">
                            <span class="sh-goods-name" style="min-width:28px;font-weight:800;color:#0a1a2a;font-size:0.8rem;flex-shrink:0;">${g.name}</span>
                            <input class="sh-goods-refprice-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${refPrice}" step="100" style="width:44px;padding:2px 3px;border:1px solid #b0c8d8;border-radius:6px;font-size:0.7rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;flex-shrink:0;">
                            <input class="sh-price-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${currentPrice}" placeholder="价" style="width:44px;padding:2px 3px;border:2px solid #c0d0e0;border-radius:6px;font-size:0.7rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;flex-shrink:0;">
                            ${currentPrice ? `<span style="font-size:0.65rem;color:${priceColor};font-weight:800;min-width:20px;flex-shrink:0;">${priceStatus}</span>` : '<span style="min-width:20px;font-size:0.5rem;color:#ccc;flex-shrink:0;">—</span>'}
                            <button class="sh-del-goods-btn" data-location="${loc.id}" data-goods="${g.key}" style="background:transparent;border:none;color:#ccc;cursor:pointer;font-size:0.8rem;padding:0 2px;font-weight:700;flex-shrink:0;">✕</button>
                        </div>
                    `;
                }).join('');
            }

            const addGoodsHtml = `
                <div style="display:flex;gap:3px;margin-top:3px;flex-wrap:wrap;">
                    <input class="sh-new-goods-name" data-location="${loc.id}" placeholder="商品" style="flex:1;min-width:40px;padding:2px 4px;border:1px solid #d0dce8;border-radius:6px;font-size:0.65rem;background:white;color:#0a1a2a;font-weight:600;">
                    <input class="sh-new-goods-price" data-location="${loc.id}" placeholder="参考价" style="width:40px;padding:2px 4px;border:1px solid #d0dce8;border-radius:6px;font-size:0.65rem;text-align:center;background:white;color:#0a1a2a;font-weight:600;">
                    <button class="sh-add-goods-btn" data-location="${loc.id}" style="background:#4c7a5c;color:#fff;border:none;border-radius:6px;padding:0 10px;font-size:0.7rem;font-weight:700;cursor:pointer;">+</button>
                </div>
            `;

            let cardStyle = `
                background:${s.cardBgColor};
                border-radius:12px;
                padding:8px 8px;
                border:${isCurrent ? '3px' : '1px'} solid ${isCurrent ? s.colorCurrent : '#dce5ef'};
                box-shadow:${isCurrent ? '0 4px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)'};
                transition:all 0.2s;
                cursor:default;
                min-width:0;
                overflow:hidden;
            `;
            if (isCurrent) cardStyle += `background:${s.locationHighlight};`;

            html += `
                <div class="sh-location-card" data-location="${loc.id}" style="${cardStyle}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
                        <span class="sh-location-name" style="font-size:1rem;font-weight:800;color:#0a1a2a;cursor:pointer;user-select:none;white-space:nowrap;">${loc.icon} ${loc.name}</span>
                        <span class="sh-travel-display" style="font-size:0.7rem;color:${isCurrent ? s.colorCurrent : '#4a6a8a'};font-weight:700;white-space:nowrap;">${travelDisplay}</span>
                    </div>
                    <div class="sh-status-row">
                        <span class="sh-status-text" style="background:${firstColor}33;color:${firstColor};">🔄一刷 ${firstStatus}</span>
                        <span class="sh-status-text" style="background:${secondColor}33;color:${secondColor};">🔄二刷 ${secondStatus}</span>
                    </div>
                    ${shopsHtml}
                    <div style="border-top:1px solid #e0e8f0;margin-top:4px;padding-top:4px;">
                        ${goodsHtml}
                        ${addGoodsHtml}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // 应用商人颜色
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
                btn.style.color = '#0a1a2a';
                btn.style.borderColor = '#b0c0d0';
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
            ['aolai', 'changan', '傲来→长安'],
            ['changan', 'changshou', '长安→长寿'],
            ['changshou', 'changan', '长寿→长安'],
            ['changan', 'difu', '长安→地府'],
            ['difu', 'changan', '地府→长安'],
            ['changan', 'beiju', '长安→北俱'],
            ['beiju', 'changan', '北俱→长安'],
            ['aolai', 'changshou', '傲来→长寿'],
            ['changshou', 'aolai', '长寿→傲来'],
            ['aolai', 'difu', '傲来→地府'],
            ['difu', 'aolai', '地府→傲来'],
            ['aolai', 'beiju', '傲来→北俱'],
            ['beiju', 'aolai', '北俱→傲来'],
            ['changshou', 'difu', '长寿→地府'],
            ['difu', 'changshou', '地府→长寿'],
            ['changshou', 'beiju', '长寿→北俱'],
            ['beiju', 'changshou', '北俱→长寿'],
            ['difu', 'beiju', '地府→北俱'],
            ['beiju', 'difu', '北俱→地府']
        ];

        let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:4px 6px;">';
        for (let [from, to, label] of pairs) {
            const key = from + '_' + to;
            const val = this.travelTimes[key] || 180;
            html += `
                <div style="display:flex;align-items:center;gap:3px;font-size:0.75rem;padding:2px 5px;background:#f5f8fc;border-radius:6px;border:1px solid #e8eef5;">
                    <span style="color:#0a1a2a;min-width:50px;font-size:0.7rem;font-weight:700;">${label}</span>
                    <input type="number" class="sh-travel-input" data-from="${from}" data-to="${to}" value="${val}" min="0" max="600" style="width:44px;padding:2px 3px;border:1px solid #bccad9;border-radius:6px;font-size:0.75rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;">
                    <span style="color:#4a6a8a;font-size:0.55rem;font-weight:600;">秒</span>
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
                            <div style="font-size:0.8rem;font-weight:700;color:#0a1a2a;">📌 一刷（大刷）</div>
                            <div style="font-weight:700;color:#0a1a2a;font-size:0.95rem;" id="shFirstTimeDisplay">计算中...</div>
                            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                <button class="btn-small" id="shFirstMinus" style="padding:2px 10px;font-size:0.6rem;font-weight:700;">-10秒</button>
                                <button class="btn-small" id="shFirstPlus" style="padding:2px 10px;font-size:0.6rem;font-weight:700;">+10秒</button>
                                <span style="font-size:0.65rem;color:#4a6a8a;line-height:24px;font-weight:600;">当前微调: <span id="shFirstOffsetDisplay">0</span>秒</span>
                            </div>
                        </div>
                        <div style="background:#f8faff;border-radius:12px;padding:8px 12px;border:1px solid #dce5ef;">
                            <div style="font-size:0.8rem;font-weight:700;color:#0a1a2a;">📌 二刷（卖价刷新）</div>
                            <div style="font-weight:700;color:#0a1a2a;font-size:0.95rem;" id="shSecondTimeDisplay">计算中...</div>
                            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                <input type="number" id="shSecondMinute" value="${this.secondMinute}" min="0" max="9" style="width:40px;padding:2px 4px;border:1px solid #bccad9;border-radius:8px;font-size:0.75rem;text-align:center;font-weight:700;color:#0a1a2a;">
                                <span style="font-size:0.75rem;color:#4a6a8a;line-height:28px;font-weight:600;">分</span>
                                <input type="number" id="shSecondSecond" value="${this.secondSecond}" min="0" max="59" style="width:40px;padding:2px 4px;border:1px solid #bccad9;border-radius:8px;font-size:0.75rem;text-align:center;font-weight:700;color:#0a1a2a;">
                                <span style="font-size:0.75rem;color:#4a6a8a;line-height:28px;font-weight:600;">秒</span>
                                <button class="btn-small" id="shSetSecondBtn" style="padding:2px 14px;font-size:0.65rem;font-weight:700;">设置</button>
                            </div>
                        </div>
                    </div>
                    <div style="font-size:0.7rem;color:#4a6a8a;padding:4px 0;font-weight:600;">💡 点击地点卡片标记当前位置，自动计算各地可达性 | 点击商人标记低价/高价</div>
                </div>
            </div>

            <div id="shMapContainer" style="margin-bottom:10px;"></div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;padding:6px 0;border-top:1px solid #e8eef5;font-size:0.7rem;font-weight:600;color:#4a6a8a;">
                <span>🟢 赶得上</span><span>🔴 赶不上</span>
                <span>| 点击地点名称标记当前位置</span>
                <span>| 点击商人标记低价/高价</span>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🕐 跑动时间配置 <span class="hint">— 双向独立设置</span></div>
                    <button class="toggle-btn" id="shToggleTravelBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="shTravelBody">
                    <div id="shTravelTimesContainer"></div>
                    <div style="font-size:0.65rem;color:#4a6a8a;margin-top:4px;font-weight:600;">💡 修改后自动保存，用于计算刷新是否赶得上（方向独立）</div>
                </div>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <button class="toggle-btn" id="shToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                </div>
                <div class="module-body" id="shUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;padding:8px 0;">
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>🟢 赶得上</label>
                            <input type="color" id="shColorCanReach" value="${this.uiSettings.colorCanReach}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>🔴 赶不上</label>
                            <input type="color" id="shColorCannotReach" value="${this.uiSettings.colorCannotReach}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>📍 当前位置</label>
                            <input type="color" id="shColorCurrent" value="${this.uiSettings.colorCurrent}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>🟢 低价商</label>
                            <input type="color" id="shColorLow" value="${this.uiSettings.colorLowPrice}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>🔴 高价商</label>
                            <input type="color" id="shColorHigh" value="${this.uiSettings.colorHighPrice}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.7rem;font-weight:700;color:#0a1a2a;">
                            <label>🔤 字体</label>
                            <input type="number" id="shFontSize" value="${this.uiSettings.fontSize}" min="12" max="24" style="width:50px;padding:2px;border-radius:8px;border:1px solid #ddd;text-align:center;display:block;margin:2px auto;font-weight:700;color:#0a1a2a;">
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="shResetUIColors" style="background:#b48b5f;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;font-weight:700;">↩️ 重置</button>
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

        // ===== 点击地点卡片（排除输入框和按钮） =====
        container.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || 
                target.tagName === 'SELECT' || 
                target.tagName === 'TEXTAREA' ||
                target.closest('input') ||
                target.closest('button')) {
                return; // 不阻止冒泡，但也不触发地点切换
            }

            const card = e.target.closest('.sh-location-card');
            if (card) {
                const locId = card.dataset.location;
                if (locId && locId !== this.currentLocation) {
                    this.currentLocation = locId;
                    this.saveData();
                    this.renderMap();
                    this.renderTravelTimes();
                }
            }
        });

        // ===== 点击商人按钮 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-shop-btn');
            if (btn) {
                e.stopPropagation();
                const locId = btn.dataset.location;
                const shopIdx = parseInt(btn.dataset.shop);
                const key = locId + '_' + shopIdx;

                if (this.shopPrices[key] === 'low') {
                    delete this.shopPrices[key];
                    const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                    delete this.shopPrices[otherKey];
                } else {
                    this.shopPrices[key] = 'low';
                    const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                    this.shopPrices[otherKey] = 'high';
                }
                this.saveData();
                this.renderMap();
            }
        });

        // ===== 当前价格输入（用 input 事件实时保存） =====
        container.addEventListener('input', (e) => {
            const input = e.target.closest('.sh-price-input');
            if (input) {
                const locId = input.dataset.location;
                const goodsKey = input.dataset.goods;
                const val = parseFloat(input.value);
                const key = locId + '_' + goodsKey;
                if (!isNaN(val) && val > 0) {
                    this.goodsPrices[key] = val;
                } else {
                    delete this.goodsPrices[key];
                }
                this.saveData();
                // 更新价格状态图标（只更新当前商品的状态）
                this.updatePriceStatus(input);
            }
        });

        // ===== 参考价输入 =====
        container.addEventListener('input', (e) => {
            const input = e.target.closest('.sh-goods-refprice-input');
            if (input) {
                const locId = input.dataset.location;
                const goodsKey = input.dataset.goods;
                const val = parseFloat(input.value);
                const key = locId + '_' + goodsKey;
                if (!isNaN(val) && val > 0) {
                    this.goodsRefPrices[key] = val;
                } else {
                    delete this.goodsRefPrices[key];
                }
                this.saveData();
                // 更新价格状态
                const priceInput = input.parentElement.querySelector('.sh-price-input');
                if (priceInput) this.updatePriceStatus(priceInput);
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
                const priceKey = locId + '_' + goodsKey;
                delete this.goodsPrices[priceKey];
                delete this.goodsRefPrices[priceKey];
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
                    this.saveData();
                    this.updateStatusOnly();
                }
            }
        });

        // ===== 一刷微调 =====
        document.getElementById('shFirstMinus').addEventListener('click', () => {
            this.firstOffset = Math.max(-10, this.firstOffset - 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.updateStatusOnly();
        });
        document.getElementById('shFirstPlus').addEventListener('click', () => {
            this.firstOffset = Math.min(10, this.firstOffset + 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.updateStatusOnly();
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
            this.updateStatusOnly();
            alert('✅ 二刷时间已设置！');
        });

        // ===== 折叠按钮 =====
        document.getElementById('shToggleTimeBtn').addEventListener('click', function() {
            document.getElementById('shTimeBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shTimeBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('shToggleTravelBtn').addEventListener('click', function() {
            document.getElementById('shTravelBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shTravelBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('shToggleUISettings').addEventListener('click', function() {
            document.getElementById('shUISettingsBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shUISettingsBody').classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
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
                ShopHelperModule.renderMap();
                ShopHelperModule.updateStatusOnly();
            });
        }

        // ===== 字体大小 =====
        document.getElementById('shFontSize').addEventListener('change', function() {
            const val = parseInt(this.value) || 15;
            ShopHelperModule.uiSettings.fontSize = val;
            ShopHelperModule.saveData();
            ShopHelperModule.applyUISettings();
        });

        // ===== 重置颜色 =====
        document.getElementById('shResetUIColors').addEventListener('click', function() {
            if (!confirm('重置所有颜色为默认值？')) return;
            const defaults = {
                colorCanReach: '#2d6b2d',
                colorCannotReach: '#c0392b',
                colorCurrent: '#dbbd7c',
                colorLowPrice: '#2d7a2d',
                colorHighPrice: '#c0392b'
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
            ShopHelperModule.renderMap();
            ShopHelperModule.updateStatusOnly();
            alert('✅ 颜色已重置！');
        });
    },

    // ============================================================
    //  🔄 更新单个商品的价格状态
    // ============================================================
    updatePriceStatus(input) {
        const goodsItem = input.closest('.sh-goods-item');
        if (!goodsItem) return;

        const locId = input.dataset.location;
        const goodsKey = input.dataset.goods;
        const currentPrice = parseFloat(input.value);
        const refPriceKey = locId + '_' + goodsKey;
        const refPrice = this.goodsRefPrices[refPriceKey] || 
                         this.goodsList[locId]?.find(g => g.key === goodsKey)?.refPrice || 0;

        const statusSpan = goodsItem.querySelector('.sh-price-status');
        if (!statusSpan) return;

        if (currentPrice && refPrice > 0) {
            const s = this.uiSettings;
            if (currentPrice < refPrice * 0.95) {
                statusSpan.textContent = '📉';
                statusSpan.style.color = s.colorLowPrice;
            } else if (currentPrice > refPrice * 1.05) {
                statusSpan.textContent = '📈';
                statusSpan.style.color = s.colorHighPrice;
            } else {
                statusSpan.textContent = '—';
                statusSpan.style.color = '#4a6a8a';
            }
        } else {
            statusSpan.textContent = '—';
            statusSpan.style.color = '#ccc';
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShopHelperModule.init());
} else {
    ShopHelperModule.init();
}

window.ShopHelperModule = ShopHelperModule;
