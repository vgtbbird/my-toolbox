// ============================================================
//  🏃 跑商助手模块 - 完整版
//  功能：5地地图 + 当前位置标记 + 一刷/二刷状态 + 商人标记 + 价格记录
//  数据来源：端游玩家社群整理
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
        fontSize: 14,
        // 状态颜色
        colorFirst: '#60d080',    // 一刷赶得上
        colorSecond: '#f0d060',   // 二刷赶得上
        colorMiss: '#8ab0c8',     // 赶不上
        colorCurrent: '#dbbd7c',  // 当前位置边框
        colorLowPrice: '#4CAF50', // 低价商人
        colorHighPrice: '#e06060' // 高价商人
    },

    // ========== 数据 ==========
    currentLocation: null,           // 当前所在位置 id
    firstOffset: 0,                  // 一刷微调秒数（-10 ~ +10）
    secondMinute: 3,                 // 二刷分钟偏移（0-9）
    secondSecond: 20,                // 二刷秒数（0-59）
    travelTimes: {},                 // 跑动时间 { 'changan_aolai': 150, ... }
    shopPrices: {},                  // 商人价格标记 { 'changan_0': 'low', 'changan_1': 'high' }
    goodsPrices: {},                // 当前商品价格 { 'changan_fozhu': 7000, ... }
    priceRecords: [],                // 价格记录历史

    // ========== 地点配置 ==========
    locations: [
        { id: 'aolai', name: '傲来', icon: '🌊', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changshou', name: '长寿', icon: '🌳', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changan', name: '长安', icon: '🏯', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'difu', name: '地府', icon: '👻', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'beiju', name: '北俱', icon: '⛰️', shopLayout: 'vertical', shops: ['上商', '下商'] }
    ],

    // ========== 跑动时间表（秒） ==========
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

    // ========== 商品参考价 ==========
    goodsData: {
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

    // ========== 生命周期 ==========
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        // 启动定时器，每秒更新剩余时间
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
            this.updateTimeDisplay();
            this.updateMap();
        }, 1000);
        setTimeout(() => this.applyUISettings(), 150);
    },

    render() {
        this.updateTimeDisplay();
        this.updateMap();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
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
        this.goodsPrices = data.goodsPrices || {};
        this.priceRecords = data.priceRecords || [];
        this.uiSettings = data.uiSettings || this.uiSettings;
    },

    saveData() {
        Storage.set(this.storageKey, {
            currentLocation: this.currentLocation,
            firstOffset: this.firstOffset,
            secondMinute: this.secondMinute,
            secondSecond: this.secondSecond,
            travelTimes: this.travelTimes,
            shopPrices: this.shopPrices,
            goodsPrices: this.goodsPrices,
            priceRecords: this.priceRecords,
            uiSettings: this.uiSettings
        });
    },

    // ========== UI设置 ==========
    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');

        container.querySelectorAll('.module, .sh-location-card').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
            el.style.setProperty('background-color', s.cardBgColor, 'important');
        });

        container.querySelectorAll('.sh-location-name').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });

        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.sh-location-card, .sh-shop-btn, .sh-goods-item, .sh-price-input').forEach(el => {
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
        if (target < now) {
            target.setMinutes(nextMinute + 10, 0, 0);
            target.setSeconds(10 + this.firstOffset);
        }
        return target;
    },

    getNextSecondRefresh() {
        const now = new Date();
        const minute = now.getMinutes();
        const baseMinute = Math.floor(minute / 10) * 10;
        let targetMinute = baseMinute + this.secondMinute;
        let target = new Date(now);
        target.setMinutes(targetMinute, this.secondSecond, 0);
        if (target < now) {
            target.setMinutes(targetMinute + 10, this.secondSecond, 0);
        }
        return target;
    },

    getTimeRemaining(target) {
        const now = new Date();
        const diff = (target - now) / 1000;
        return Math.max(0, diff);
    },

    formatTimeRemaining(seconds) {
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

    // ========== 状态判断 ==========
    checkRefreshStatus(targetLocation) {
        if (!this.currentLocation) {
            return { travelTime: null, first: 'none', second: 'none', firstRemain: null, secondRemain: null };
        }

        const travelTime = this.getTravelTime(this.currentLocation, targetLocation);
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();
        const now = new Date();
        const firstRemain = (firstTarget - now) / 1000;
        const secondRemain = (secondTarget - now) / 1000;

        return {
            travelTime: travelTime,
            first: firstRemain > travelTime ? 'can' : 'miss',
            second: secondRemain > travelTime ? 'can' : 'miss',
            firstRemain: firstRemain,
            secondRemain: secondRemain
        };
    },

    // ========== 更新时间显示 ==========
    updateTimeDisplay() {
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();
        const firstRemain = this.getTimeRemaining(firstTarget);
        const secondRemain = this.getTimeRemaining(secondTarget);

        const firstStr = firstTarget.toLocaleTimeString();
        const secondStr = secondTarget.toLocaleTimeString();

        const el1 = document.getElementById('shFirstTimeDisplay');
        const el2 = document.getElementById('shSecondTimeDisplay');
        if (el1) el1.textContent = firstStr + '（剩余 ' + this.formatTimeRemaining(firstRemain) + '）';
        if (el2) el2.textContent = secondStr + '（剩余 ' + this.formatTimeRemaining(secondRemain) + '）';
    },

    // ========== 更新地图 ==========
    updateMap() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;

        const s = this.uiSettings;
        const now = new Date();
        const firstTarget = this.getNextFirstRefresh();
        const secondTarget = this.getNextSecondRefresh();

        let html = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">';

        for (let loc of this.locations) {
            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            // 状态颜色
            let firstColor = s.colorMiss;
            let firstLabel = '⚪';
            let firstText = '赶不上';
            if (status.first === 'can') {
                firstColor = s.colorFirst;
                firstLabel = '🟢';
                firstText = '赶得上';
            } else if (status.first === 'none') {
                firstColor = '#8ab0c8';
                firstLabel = '—';
                firstText = '未计算';
            }

            let secondColor = s.colorMiss;
            let secondLabel = '⚪';
            let secondText = '赶不上';
            if (status.second === 'can') {
                secondColor = s.colorSecond;
                secondLabel = '🟡';
                secondText = '赶得上';
            } else if (status.second === 'none') {
                secondColor = '#8ab0c8';
                secondLabel = '—';
                secondText = '未计算';
            }

            const travelDisplay = isCurrent ? '📍当前' : (status.travelTime !== null ? this.formatTimeRemaining(status.travelTime) : '--');

            // 商户布局
            let shopsHtml = '';
            if (loc.shopLayout === 'horizontal') {
                shopsHtml = `
                    <div style="display:flex;gap:4px;justify-content:center;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="flex:1;padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;transition:all 0.2s;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="flex:1;padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;transition:all 0.2s;">${loc.shops[1]}</button>
                    </div>
                `;
            } else {
                shopsHtml = `
                    <div style="display:flex;flex-direction:column;gap:4px;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;transition:all 0.2s;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="padding:4px 8px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;transition:all 0.2s;">${loc.shops[1]}</button>
                    </div>
                `;
            }

            // 商品信息
            const goods = this.goodsData[loc.id] || [];
            const goodsHtml = goods.map(g => {
                const currentPrice = this.goodsPrices[loc.id + '_' + g.key] || '';
                return `
                    <div class="sh-goods-item" style="display:flex;justify-content:space-between;align-items:center;padding:1px 0;font-size:0.55rem;color:#5a7a94;">
                        <span>${g.name} <span style="color:#8ab0c8;">${g.refPrice}</span></span>
                        <input class="sh-price-input" data-location="${loc.id}" data-goods="${g.key}" type="number" value="${currentPrice}" placeholder="当前价" style="width:50px;padding:1px 4px;border:1px solid #dce5ef;border-radius:6px;font-size:0.55rem;text-align:center;background:transparent;">
                    </div>
                `;
            }).join('');

            const borderColor = isCurrent ? s.colorCurrent : 'transparent';
            const borderWidth = isCurrent ? '3px' : '1px';

            html += `
                <div class="sh-location-card" data-location="${loc.id}" style="
                    background:${s.cardBgColor};
                    border-radius:12px;
                    padding:8px 8px;
                    border:${borderWidth} solid ${borderColor};
                    box-shadow:0 2px 8px rgba(0,0,0,0.06);
                    cursor:pointer;
                    transition:all 0.2s;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span class="sh-location-name" style="font-size:0.9rem;font-weight:700;color:#1f3b53;cursor:pointer;">${loc.icon} ${loc.name}</span>
                        <span style="font-size:0.65rem;color:${isCurrent ? s.colorCurrent : '#5a7a94'};font-weight:600;">${travelDisplay}</span>
                    </div>
                    <div style="display:flex;gap:4px;font-size:0.6rem;margin:2px 0;flex-wrap:wrap;">
                        <span style="background:${firstColor}33;color:${firstColor};padding:0 8px;border-radius:10px;font-weight:600;">${firstLabel}一刷 ${firstText}</span>
                        <span style="background:${secondColor}33;color:${secondColor};padding:0 8px;border-radius:10px;font-weight:600;">${secondLabel}二刷 ${secondText}</span>
                    </div>
                    ${shopsHtml}
                    <div style="border-top:1px solid #eef2f7;margin-top:4px;padding-top:4px;">
                        ${goodsHtml}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // ========== 构建UI ==========
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
                            <div style="display:flex;gap:6px;margin-top:4px;">
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
                                <span style="font-size:0.6rem;color:#8ab0c8;line-height:28px;">💡 每周维护后设置一次</span>
                            </div>
                        </div>
                    </div>
                    <div style="font-size:0.65rem;color:#5a7a94;padding:4px 0;">💡 点击地图上的地点名称标记当前位置，自动计算各地可达性</div>
                </div>
            </div>

            <!-- 地图 -->
            <div id="shMapContainer" style="margin-bottom:10px;">
                <!-- 由 updateMap 生成 -->
            </div>

            <!-- 图例 -->
            <div style="display:flex;gap:12px;flex-wrap:wrap;padding:6px 0;border-top:1px solid #eef2f7;font-size:0.65rem;color:#5a7a94;">
                <span>🟢 一刷赶得上</span>
                <span>🟡 二刷赶得上</span>
                <span>⚪ 赶不上</span>
                <span>| 点击地点名称标记当前位置</span>
                <span>| 点击商人标记低价/高价</span>
            </div>

            <!-- 设置 -->
            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <div>
                        <button class="toggle-btn" id="shToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="shUISettingsBody" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;padding:8px 0;">
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🟢 一刷</label>
                        <input type="color" id="shColorFirst" value="${this.uiSettings.colorFirst}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🟡 二刷</label>
                        <input type="color" id="shColorSecond" value="${this.uiSettings.colorSecond}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>⚪ 赶不上</label>
                        <input type="color" id="shColorMiss" value="${this.uiSettings.colorMiss}" style="width:40px;height:30px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
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
                        <label>🔤 字体</label>
                        <input type="number" id="shFontSize" value="${this.uiSettings.fontSize}" min="12" max="20" style="width:50px;padding:2px;border-radius:8px;border:1px solid #ddd;text-align:center;display:block;margin:2px auto;">
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;">
                        <button class="btn-small" id="shResetUIColors" style="background:#b48b5f;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;">↩️ 重置</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        const container = document.getElementById('shopHelperContainer');
        if (!container) return;

        // ===== 点击地点卡片 =====
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.sh-location-card');
            if (card) {
                const locId = card.dataset.location;
                this.currentLocation = locId;
                this.saveData();
                this.render();
            }
        });

        // ===== 点击商人按钮 =====
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sh-shop-btn');
            if (btn) {
                const locId = btn.dataset.location;
                const shopIdx = parseInt(btn.dataset.shop);
                const key = locId + '_' + shopIdx;
                const siblings = btn.parentElement.querySelectorAll('.sh-shop-btn');

                // 如果当前已经是低价，取消标记
                if (this.shopPrices[key] === 'low') {
                    delete this.shopPrices[key];
                    // 清除另一个商人的高价标记
                    const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                    delete this.shopPrices[otherKey];
                    this.saveData();
                    this.render();
                    return;
                }

                // 标记当前为低价
                this.shopPrices[key] = 'low';
                // 另一个商人标记为高价
                const otherKey = locId + '_' + (shopIdx === 0 ? 1 : 0);
                this.shopPrices[otherKey] = 'high';
                this.saveData();
                this.render();
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
                } else {
                    delete this.goodsPrices[key];
                }
                this.saveData();
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

        // ===== 折叠 =====
        document.getElementById('shToggleTimeBtn').addEventListener('click', function() {
            const body = document.getElementById('shTimeBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('shToggleUISettings').addEventListener('click', function() {
            const body = document.getElementById('shUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // ===== 颜色 =====
        ['First', 'Second', 'Miss', 'Current', 'Low', 'High'].forEach(type => {
            const id = 'shColor' + type;
            const key = 'color' + type;
            document.getElementById(id).addEventListener('input', function() {
                ShopHelperModule.uiSettings[key] = this.value;
                ShopHelperModule.saveData();
                ShopHelperModule.render();
            });
        });

        // ===== 字体 =====
        document.getElementById('shFontSize').addEventListener('change', function() {
            const val = parseInt(this.value) || 14;
            ShopHelperModule.uiSettings.fontSize = val;
            ShopHelperModule.saveData();
            ShopHelperModule.applyUISettings();
        });

        // ===== 重置颜色 =====
        document.getElementById('shResetUIColors').addEventListener('click', function() {
            if (!confirm('重置所有颜色为默认值？')) return;
            const defaults = {
                colorFirst: '#60d080',
                colorSecond: '#f0d060',
                colorMiss: '#8ab0c8',
                colorCurrent: '#dbbd7c',
                colorLowPrice: '#4CAF50',
                colorHighPrice: '#e06060'
            };
            Object.assign(ShopHelperModule.uiSettings, defaults);
            ShopHelperModule.saveData();
            Object.keys(defaults).forEach(key => {
                const el = document.getElementById('shColor' + key.charAt(0).toUpperCase() + key.slice(1));
                if (el) el.value = defaults[key];
            });
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
