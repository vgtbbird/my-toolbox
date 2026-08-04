// ============================================================
//  🏃 跑商助手模块 - 完整版 v11
//  优化：状态用圆点表示 + 4位数完整显示 + 一刷自动重置
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
        locationHighlight: 'rgba(219,189,124,0.20)'
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
    lastFirstRefreshMinute: -1,

    locations: [
        { id: 'changan', name: '长安', icon: '🏯', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'aolai', name: '傲来', icon: '🌊', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changshou', name: '长寿', icon: '🌳', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'difu', name: '地府', icon: '👻', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'beiju', name: '北俱', icon: '⛰️', shopLayout: 'vertical', shops: ['上商', '下商'] }
    ],

        defaultGoods: {
        'changan': [
            { key: 'fozhu', name: '📿 佛珠', refPrice: 7200 },
            { key: 'wuqi', name: '⚔️ 武器', refPrice: 4500 },
            { key: 'shanzi', name: '🪭 扇子', refPrice: 4050 },
            { key: 'mianbu', name: '🧵 棉布', refPrice: 3200 }
        ],
        'difu': [
            { key: 'yemingzhu', name: '💎 夜明珠', refPrice: 8000 },
            { key: 'shoushi', name: '💍 首饰', refPrice: 4500 },
            { key: 'zhenzhu', name: '🦪 珍珠', refPrice: 5500 },
            { key: 'zhiqian', name: '📄 纸钱', refPrice: 2700 }
        ],
        'aolai': [
            { key: 'yan', name: '🧂 盐', refPrice: 5700 },
            { key: 'jiu', name: '🍶 酒', refPrice: 4050 },
            { key: 'maozi', name: '🧢 帽子', refPrice: 3150 },
            { key: 'lazhu', name: '🕯️ 蜡烛', refPrice: 1800 }
        ],
        'beiju': [
            { key: 'renshen', name: '🌿 人参', refPrice: 7200 },
            { key: 'lingdang', name: '🔔 铃铛', refPrice: 4500 },
            { key: 'xiangyou', name: '🫒 香油', refPrice: 4050 },
            { key: 'yijia', name: '🛡️ 衣甲', refPrice: 2000 }
        ],
        'changshou': [
            { key: 'lurong', name: '🦌 鹿茸', refPrice: 7200 },
            { key: 'fu', name: '📜 符', refPrice: 5400 },
            { key: 'mutou', name: '🪵 木材', refPrice: 3600 },
            { key: 'mianfen', name: '🌾 面粉', refPrice: 2700 }
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
            this.updateCurrentTime(); 
            this.updateStatusOnly();
            this.checkFirstRefresh();
        }, 1000);
    },

    render() {
        this.updateTimeDisplay();
        this.renderMap();
        this.renderTravelTimes();
        this.saveData();
        this.applyUISettings();
    },

    checkFirstRefresh() {
        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();
        const firstMinute = Math.floor(currentMinute / 10) * 10;
        const firstSecond = 10 + this.firstOffset;
        if (Math.abs(currentSecond - firstSecond) <= 1) {
            if (this.lastFirstRefreshMinute !== currentMinute) {
                this.lastFirstRefreshMinute = currentMinute;
                this.resetPricesAndShops();
            }
        }
    },

    resetPricesAndShops() {
        console.log('🔄 一刷触发！重置所有价格和商人标记');
        this.goodsPrices = {};
        this.shopPrices = {};
        this.saveData();
        this.renderMap();
        const msg = document.getElementById('syncResultMsg');
        if (msg) {
            msg.textContent = '🔄 一刷已触发，价格和商人标记已重置！';
            msg.style.color = '#2d6b2d';
            setTimeout(() => { msg.textContent = ''; }, 3000);
        }
    },

    getArrivalTime(travelSeconds) {
        const now = new Date();
        const arrival = new Date(now.getTime() + travelSeconds * 1000);
        const h = String(arrival.getHours()).padStart(2, '0');
        const m = String(arrival.getMinutes()).padStart(2, '0');
        const s = String(arrival.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    },

    updateStatusOnly() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        const s = this.uiSettings;

        for (let loc of this.locations) {
            const wrap = container.querySelector(`.sh-location-wrap[data-location="${loc.id}"]`);
            if (!wrap) continue;

            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            // 用圆点表示状态
            const firstDot = status.first === 'can' ? '🟢' : '🔴';
            const secondDot = status.second === 'can' ? '🟢' : '🔴';
            const firstColor = status.first === 'can' ? s.colorCanReach : s.colorCannotReach;
            const secondColor = status.second === 'can' ? s.colorCanReach : s.colorCannotReach;

            let firstLabel = status.first === 'can' ? '赶得上' : '赶不上';
            let secondLabel = status.second === 'can' ? '赶得上' : '赶不上';
            if (status.isCurrent) {
                firstLabel = '📍当前';
                secondLabel = '📍当前';
            }

            const statusRow = wrap.querySelector('.sh-status-row');
            if (statusRow) {
                statusRow.innerHTML = `
                    <span class="sh-status-text" style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:10px;font-weight:700;font-size:0.7rem;white-space:nowrap;background:${firstColor}22;color:${firstColor};">
                        <span style="font-size:0.8rem;">${firstDot}</span> 一刷
                    </span>
                    <span class="sh-status-text" style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:10px;font-weight:700;font-size:0.7rem;white-space:nowrap;background:${secondColor}22;color:${secondColor};">
                        <span style="font-size:0.8rem;">${secondDot}</span> 二刷
                    </span>
                `;
            }

            let arrivalDisplay = '';
            if (isCurrent) {
                arrivalDisplay = '📍当前';
            } else if (status.travelTime) {
                arrivalDisplay = this.getArrivalTime(status.travelTime);
            } else {
                arrivalDisplay = '--:--:--';
            }
            const timeEl = wrap.querySelector('.sh-travel-display');
            if (timeEl) {
                timeEl.textContent = arrivalDisplay;
                timeEl.style.color = isCurrent ? s.colorCurrent : '#1a3a5a';
                timeEl.style.fontWeight = '700';
            }

            if (isCurrent) {
                wrap.style.background = s.locationHighlight;
                wrap.style.border = `2px solid ${s.colorCurrent}`;
            } else {
                wrap.style.background = s.cardBgColor;
                wrap.style.border = '1px solid #e0e8f0';
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
        this.lastFirstRefreshMinute = data.lastFirstRefreshMinute || -1;
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
            uiSettings: this.uiSettings,
            lastFirstRefreshMinute: this.lastFirstRefreshMinute
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;
        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        container.querySelectorAll('.module, .sh-location-wrap').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
        });
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.sh-location-wrap, .sh-shop-btn, .sh-goods-item, .sh-price-input, .sh-travel-input, .sh-status-text, .sh-goods-name').forEach(el => {
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
    
    updateCurrentTime() {
        const el = document.getElementById('shCurrentTimeDisplay');
        if (!el) return;
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    },

    // ============================================================
    //  🗺️ 渲染地图
    // ============================================================
    renderMap() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        
        if (container.querySelector('.sh-location-wrap')) {
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
                    gap: 3px;
                    flex-wrap: wrap;
                    margin: 2px 0;
                }
                .sh-status-text {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    padding: 1px 6px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.7rem;
                    white-space: nowrap;
                }
                .sh-location-wrap {
                    border-radius: 12px;
                    padding: 8px 6px;
                    transition: all 0.2s;
                    border: 1px solid #e0e8f0;
                }
                .sh-location-name {
                    cursor: pointer;
                    user-select: none;
                }
                .sh-location-name:hover {
                    opacity: 0.7;
                }
                .sh-shop-btn {
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 3px 5px !important;
                    font-size: 0.7rem !important;
                    border-radius: 6px;
                    border: 2px solid #b0c0d0;
                    background: #f0f4f8;
                    font-weight: 700;
                    color: #0a1a2a;
                }
                .sh-shop-btn:hover {
                    opacity: 0.8;
                    transform: scale(0.97);
                }
                .sh-price-input, .sh-goods-refprice-input {
                    background: white !important;
                    -moz-appearance: textfield;
                    appearance: textfield;
                }
                .sh-price-input::-webkit-outer-spin-button,
                .sh-price-input::-webkit-inner-spin-button,
                .sh-goods-refprice-input::-webkit-outer-spin-button,
                .sh-goods-refprice-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .sh-del-goods-btn {
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    color: #ccc;
                    font-size: 0.75rem;
                    padding: 0 2px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .sh-del-goods-btn:hover {
                    color: #e06060 !important;
                }
                .sh-price-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    flex-shrink: 0;
                }
                .sh-price-dot.low { background: #2d7a2d; }
                .sh-price-dot.high { background: #c0392b; }
                .sh-price-dot.neutral { background: #b0b8c0; }
                .sh-price-dot.empty { background: #e8e8e8; }
                .sh-goods-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2px 0;
                    gap: 2px;
                    border-bottom: 1px solid #e8eef5;
                    flex-wrap: nowrap;
                }
                .sh-goods-name {
                    min-width: 24px;
                    font-weight: 800;
                    color: #0a1a2a;
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }
                .sh-location-header {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    gap: 4px;
                    width: 100%;
                }
            </style>
            <div class="sh-map-grid">
        `;

        for (let loc of this.locations) {
            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            const firstDot = status.first === 'can' ? '🟢' : '🔴';
            const secondDot = status.second === 'can' ? '🟢' : '🔴';
            const firstColor = status.first === 'can' ? s.colorCanReach : s.colorCannotReach;
            const secondColor = status.second === 'can' ? s.colorCanReach : s.colorCannotReach;

            let firstLabel = status.first === 'can' ? '赶得上' : '赶不上';
            let secondLabel = status.second === 'can' ? '赶得上' : '赶不上';
            if (status.isCurrent) {
                firstLabel = '📍当前';
                secondLabel = '📍当前';
            }

            let arrivalDisplay = '';
            if (isCurrent) {
                arrivalDisplay = '📍当前';
            } else if (status.travelTime) {
                arrivalDisplay = this.getArrivalTime(status.travelTime);
            } else {
                arrivalDisplay = '--:--:--';
            }

            let bgStyle = `background:${s.cardBgColor};border:1px solid ${isCurrent ? s.colorCurrent : '#e0e8f0'};`;
            if (isCurrent) bgStyle += `background:${s.locationHighlight};`;

            let shopsHtml = '';
            if (loc.shopLayout === 'horizontal') {
                shopsHtml = `
                    <div style="display:flex;gap:2px;justify-content:center;margin:2px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="flex:1;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="flex:1;">${loc.shops[1]}</button>
                    </div>
                `;
            } else {
                shopsHtml = `
                    <div style="display:flex;flex-direction:column;gap:2px;margin:2px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1">${loc.shops[1]}</button>
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
                    
                    let dotClass = 'empty';
                    let dotColor = '#e8e8e8';
                    if (currentPrice && refPrice > 0) {
                        if (currentPrice < refPrice * 0.95) {
                            dotClass = 'low';
                            dotColor = s.colorLowPrice;
                        } else if (currentPrice > refPrice * 1.05) {
                            dotClass = 'high';
                            dotColor = s.colorHighPrice;
                        } else {
                            dotClass = 'neutral';
                            dotColor = '#b0b8c0';
                        }
                    }

                    return `
                        <div class="sh-goods-item">
                            <span class="sh-goods-name">${g.name}</span>
                            <input class="sh-goods-refprice-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${refPrice}" step="100" style="width:50px;padding:1px 2px;border:1px solid #b0c8d8;border-radius:4px;font-size:0.7rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;flex-shrink:0;">
                            <input class="sh-price-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${currentPrice}" placeholder="价" style="width:50px;padding:1px 2px;border:2px solid #c0d0e0;border-radius:4px;font-size:0.7rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;flex-shrink:0;">
                            <span class="sh-price-dot ${dotClass}" style="width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;background:${dotColor};"></span>
                            <button class="sh-del-goods-btn" data-location="${loc.id}" data-goods="${g.key}">✕</button>
                        </div>
                    `;
                }).join('');
            }

            const addGoodsHtml = `
                <div style="display:flex;gap:2px;margin-top:2px;flex-wrap:wrap;">
                    <input class="sh-new-goods-name" data-location="${loc.id}" placeholder="商品" style="flex:1;min-width:32px;padding:1px 3px;border:1px solid #d0dce8;border-radius:4px;font-size:0.6rem;background:white;color:#0a1a2a;font-weight:600;">
                    <input class="sh-new-goods-price" data-location="${loc.id}" placeholder="参考价" style="width:34px;padding:1px 3px;border:1px solid #d0dce8;border-radius:4px;font-size:0.6rem;text-align:center;background:white;color:#0a1a2a;font-weight:600;">
                    <button class="sh-add-goods-btn" data-location="${loc.id}" style="background:#4c7a5c;color:#fff;border:none;border-radius:4px;padding:0 8px;font-size:0.6rem;font-weight:700;cursor:pointer;">+</button>
                </div>
            `;

            html += `
                <div class="sh-location-wrap" data-location="${loc.id}" style="${bgStyle}">
                    <div class="sh-location-header">
                        <span class="sh-location-name" data-location="${loc.id}" style="font-size:0.9rem;font-weight:800;color:#0a1a2a;white-space:nowrap;flex:1;text-align:left;cursor:pointer;min-width:0;">${loc.icon} ${loc.name}</span>
                        <span class="sh-travel-display" style="flex-shrink:0;text-align:right;font-weight:700;font-size:0.7rem;color:${isCurrent ? s.colorCurrent : '#1a3a5a'};white-space:nowrap;">${arrivalDisplay}</span>
                    </div>
                    <div class="sh-status-row">
                        <span class="sh-status-text" style="background:${firstColor}22;color:${firstColor};">
                            <span style="font-size:0.75rem;">${firstDot}</span> 一刷
                        </span>
                        <span class="sh-status-text" style="background:${secondColor}22;color:${secondColor};">
                            <span style="font-size:0.75rem;">${secondDot}</span> 二刷
                        </span>
                    </div>
                    ${shopsHtml}
                    <div style="border-top:1px solid #e0e8f0;margin-top:2px;padding-top:2px;">
                        ${goodsHtml}
                        ${addGoodsHtml}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        this.updateShopColors();
    },

    updateShopColors() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        const s = this.uiSettings;

        container.querySelectorAll('.sh-shop-btn').forEach(btn => {
            const locId = btn.dataset.location;
            const shopIdx = parseInt(btn.dataset.shop);
            const key = locId + '_' + shopIdx;
            const color = this.shopPrices[key] === 'low' ? s.colorLowPrice : 
                         (this.shopPrices[key] === 'high' ? s.colorHighPrice : null);
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

renderTravelTimes() {
    const container = document.getElementById('shTravelTimesContainer');
    if (!container) return;

        // 获取当前选中的出发地
        const selectedFrom = this.currentLocation || null;
    
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

    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:3px 4px;">';
    for (let [from, to, label] of pairs) {
        const key = from + '_' + to;
        const val = this.travelTimes[key] || 180;

        // ✅ 判断是否高亮：出发地匹配当前选中地点
        const isHighlight = (selectedFrom === from);
        const highlightStyle = isHighlight 
            ? 'background:#dbbd7c44;border:2px solid #dbbd7c;' 
            : 'background:#f5f8fc;border:1px solid #e8eef5;';

        html += `
            <div style="display:flex;align-items:center;gap:2px;font-size:0.7rem;padding:2px 4px;border-radius:4px;${highlightStyle}">
                <span style="color:#0a1a2a;min-width:44px;font-size:0.65rem;font-weight:700;${isHighlight ? 'color:#8a6a2e;' : ''}">${label}</span>
                <input type="number" class="sh-travel-input" data-from="${from}" data-to="${to}" value="${val}" min="0" max="600" style="width:40px;padding:1px 2px;border:1px solid #bccad9;border-radius:4px;font-size:0.7rem;text-align:center;background:white;color:#0a1a2a;font-weight:700;">
                <span style="color:#4a6a8a;font-size:0.5rem;font-weight:600;">秒</span>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
},

    buildUI() {
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:12px;margin-bottom:8px;padding:6px 10px;">
                <div class="module-header">
                    <div class="title" style="font-size:0.9rem;">⏰ 刷新时间 <span class="hint" style="font-size:0.65rem;">— 一刷自动重置价格</span></div>
                    <div>
                        <button class="toggle-btn" id="shToggleTimeBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:1px 12px;font-size:0.55rem;cursor:pointer;">👁️</button>
                    </div>
                </div>
                    <div class="module-body" id="shTimeBody">
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:2px 0;">
                            <!-- 一刷 -->
                            <div style="background:#f8faff;border-radius:10px;padding:6px 10px;border:1px solid #dce5ef;">
                                <div style="font-size:0.7rem;font-weight:700;color:#0a1a2a;">📌 一刷</div>
                                <div style="font-weight:700;color:#0a1a2a;font-size:0.85rem;" id="shFirstTimeDisplay">计算中...</div>
                                <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                                    <button class="btn-small" id="shFirstMinus" style="padding:1px 8px;font-size:0.55rem;font-weight:700;">-10s</button>
                                    <button class="btn-small" id="shFirstPlus" style="padding:1px 8px;font-size:0.55rem;font-weight:700;">+10s</button>
                                    <span style="font-size:0.55rem;color:#4a6a8a;line-height:22px;font-weight:600;">微调: <span id="shFirstOffsetDisplay">0</span>s</span>
                                </div>
                                <div style="font-size:0.5rem;color:#c0392b;margin-top:2px;font-weight:600;">⚠️ 一刷自动重置价格</div>
                            </div>
                    
                            <!-- 🆕 当前时间 -->
                            <div style="background:#f0f5fb;border-radius:10px;padding:6px 10px;border:2px solid #dbbd7c;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;">
                                <div style="font-size:0.6rem;font-weight:600;color:#5a7a94;">🕐 当前时间</div>
                                <div style="font-weight:700;color:#0a1a2a;font-size:0.85rem;" id="shCurrentTimeDisplay">--:--:--</div>
                            </div>
                                                
                            <!-- 二刷 -->
                            <div style="background:#f8faff;border-radius:10px;padding:6px 10px;border:1px solid #dce5ef;">
                                <div style="font-size:0.7rem;font-weight:700;color:#0a1a2a;">📌 二刷</div>
                                <div style="font-weight:700;color:#0a1a2a;font-size:0.85rem;" id="shSecondTimeDisplay">计算中...</div>
                                <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                                    <input type="number" id="shSecondMinute" value="${this.secondMinute}" min="0" max="9" style="width:30px;padding:1px 2px;border:1px solid #bccad9;border-radius:4px;font-size:0.65rem;text-align:center;font-weight:700;color:#0a1a2a;">
                                    <span style="font-size:0.65rem;color:#4a6a8a;line-height:24px;font-weight:600;">分</span>
                                    <input type="number" id="shSecondSecond" value="${this.secondSecond}" min="0" max="59" style="width:30px;padding:1px 2px;border:1px solid #bccad9;border-radius:4px;font-size:0.65rem;text-align:center;font-weight:700;color:#0a1a2a;">
                                    <span style="font-size:0.65rem;color:#4a6a8a;line-height:24px;font-weight:600;">秒</span>
                                    <button class="btn-small" id="shSetSecondBtn" style="padding:1px 10px;font-size:0.55rem;font-weight:700;">设置</button>
                                </div>
                            </div>
                        </div>
                        <div style="font-size:0.6rem;color:#4a6a8a;padding:2px 0;font-weight:600;">💡 点击 <strong>地点名称</strong> 标记当前位置 | 点击 <strong>商人</strong> 标记低价/高价</div>
                    </div>
            </div>

            <div id="shMapContainer" style="margin-bottom:6px;"></div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;padding:4px 0;border-top:1px solid #e8eef5;font-size:0.6rem;font-weight:600;color:#4a6a8a;">
                <span>🟢 赶得上</span><span>🔴 赶不上</span>
                <span>| 点击地点名标记</span>
                <span>| 点击商人标记低价/高价</span>
                <span>| ● 价格小圆点：绿=低，红=高，灰=持平</span>
            </div>

            <div class="module" style="margin-top:6px;padding:6px 8px;">
                <div class="module-header">
                    <div class="title" style="font-size:0.85rem;">🕐 跑动时间 <span class="hint" style="font-size:0.6rem;">— 双向独立</span></div>
                    <button class="toggle-btn" id="shToggleTravelBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:1px 12px;font-size:0.55rem;cursor:pointer;">👁️</button>
                </div>
                <div class="module-body" id="shTravelBody">
                    <div id="shTravelTimesContainer"></div>
                    <div style="font-size:0.55rem;color:#4a6a8a;margin-top:2px;font-weight:600;">💡 修改后自动保存，用于计算到达时刻</div>
                </div>
            </div>

            <div class="module" style="margin-top:6px;padding:6px 8px;">
                <div class="module-header">
                    <div class="title" style="font-size:0.85rem;">🎨 界面设置</div>
                    <button class="toggle-btn" id="shToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:1px 12px;font-size:0.55rem;cursor:pointer;">👁️</button>
                </div>
                <div class="module-body" id="shUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:4px;padding:4px 0;">
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>🟢 赶得上</label>
                            <input type="color" id="shColorCanReach" value="${this.uiSettings.colorCanReach}" style="width:32px;height:24px;border-radius:4px;border:1px solid #ddd;cursor:pointer;display:block;margin:1px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>🔴 赶不上</label>
                            <input type="color" id="shColorCannotReach" value="${this.uiSettings.colorCannotReach}" style="width:32px;height:24px;border-radius:4px;border:1px solid #ddd;cursor:pointer;display:block;margin:1px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>📍 高亮</label>
                            <input type="color" id="shColorCurrent" value="${this.uiSettings.colorCurrent}" style="width:32px;height:24px;border-radius:4px;border:1px solid #ddd;cursor:pointer;display:block;margin:1px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>🟢 低价商</label>
                            <input type="color" id="shColorLow" value="${this.uiSettings.colorLowPrice}" style="width:32px;height:24px;border-radius:4px;border:1px solid #ddd;cursor:pointer;display:block;margin:1px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>🔴 高价商</label>
                            <input type="color" id="shColorHigh" value="${this.uiSettings.colorHighPrice}" style="width:32px;height:24px;border-radius:4px;border:1px solid #ddd;cursor:pointer;display:block;margin:1px auto;">
                        </div>
                        <div style="text-align:center;font-size:0.6rem;font-weight:700;color:#0a1a2a;">
                            <label>🔤 字体</label>
                            <input type="number" id="shFontSize" value="${this.uiSettings.fontSize}" min="12" max="24" style="width:40px;padding:1px;border-radius:4px;border:1px solid #ddd;text-align:center;display:block;margin:1px auto;font-weight:700;color:#0a1a2a;">
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="shResetUIColors" style="background:#b48b5f;color:#fff;border:none;padding:2px 10px;border-radius:30px;cursor:pointer;font-weight:700;font-size:0.55rem;">↩️</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const nameEl = e.target.closest('.sh-location-name');
            if (nameEl) {
                e.stopPropagation();
                const locId = nameEl.dataset.location;
                if (locId) {
                    this.currentLocation = locId;
                    this.saveData();
                    this.updateStatusOnly();
                    this.renderTravelTimes();
                }
            }
        });

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
                this.updateShopColors();
            }
        });

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
                this.updatePriceDot(input);
            }
        });

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
                const priceInput = input.parentElement.querySelector('.sh-price-input');
                if (priceInput) this.updatePriceDot(priceInput);
            }
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-add-goods-btn');
            if (btn) {
                e.stopPropagation();
                const locId = btn.dataset.location;
                const wrap = container.querySelector(`.sh-location-wrap[data-location="${locId}"]`);
                if (!wrap) return;
                const nameInput = wrap.querySelector('.sh-new-goods-name');
                const priceInput = wrap.querySelector('.sh-new-goods-price');
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

        document.getElementById('shFirstMinus').addEventListener('click', () => {
            this.firstOffset = Math.max(-10, this.firstOffset - 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.updateStatusOnly();
        });
        document.getElementById('shFirstPlus').addEventListener('click', () => {
            this.firstOffset = Math.min(60, this.firstOffset + 10);
            document.getElementById('shFirstOffsetDisplay').textContent = this.firstOffset;
            this.saveData();
            this.updateStatusOnly();
        });

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

        document.getElementById('shToggleTimeBtn').addEventListener('click', function() {
            document.getElementById('shTimeBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shTimeBody').classList.contains('hidden') ? '👁️' : '👁️';
        });
        document.getElementById('shToggleTravelBtn').addEventListener('click', function() {
            document.getElementById('shTravelBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shTravelBody').classList.contains('hidden') ? '👁️' : '👁️';
        });
        document.getElementById('shToggleUISettings').addEventListener('click', function() {
            document.getElementById('shUISettingsBody').classList.toggle('hidden');
            this.textContent = document.getElementById('shUISettingsBody').classList.contains('hidden') ? '👁️' : '👁️';
        });

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
                ShopHelperModule.updateStatusOnly();
                ShopHelperModule.updateShopColors();
                ShopHelperModule.updateAllDots();
            });
        }

        document.getElementById('shFontSize').addEventListener('change', function() {
            const val = parseInt(this.value) || 15;
            ShopHelperModule.uiSettings.fontSize = val;
            ShopHelperModule.saveData();
            ShopHelperModule.applyUISettings();
        });

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
            ShopHelperModule.updateStatusOnly();
            ShopHelperModule.updateShopColors();
            ShopHelperModule.updateAllDots();
            alert('✅ 颜色已重置！');
        });
    },

    updatePriceDot(input) {
        const goodsItem = input.closest('.sh-goods-item');
        if (!goodsItem) return;
        const dot = goodsItem.querySelector('.sh-price-dot');
        if (!dot) return;

        const locId = input.dataset.location;
        const goodsKey = input.dataset.goods;
        const val = parseFloat(input.value);
        const refPriceKey = locId + '_' + goodsKey;
        const refPrice = this.goodsRefPrices[refPriceKey] || 
                         this.goodsList[locId]?.find(g => g.key === goodsKey)?.refPrice || 0;

        const s = this.uiSettings;
        if (val && refPrice > 0) {
            if (val < refPrice * 0.95) {
                dot.className = 'sh-price-dot low';
                dot.style.background = s.colorLowPrice;
            } else if (val > refPrice * 1.05) {
                dot.className = 'sh-price-dot high';
                dot.style.background = s.colorHighPrice;
            } else {
                dot.className = 'sh-price-dot neutral';
                dot.style.background = '#b0b8c0';
            }
        } else {
            dot.className = 'sh-price-dot empty';
            dot.style.background = '#e8e8e8';
        }
    },

    updateAllDots() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;
        container.querySelectorAll('.sh-price-input').forEach(input => {
            this.updatePriceDot(input);
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShopHelperModule.init());
} else {
    ShopHelperModule.init();
}

window.ShopHelperModule = ShopHelperModule;
