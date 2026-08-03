// ============================================================
//  🏃 跑商助手模块 - 模板版
//  功能：5地地图 + 当前位置标记 + 一刷/二刷状态
//  待完善：价格记录、路线时间编辑、二刷测定
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
    currentLocation: null,      // 当前所在位置
    firstTime: null,            // 下次一刷时间 (Date对象)
    secondTime: null,           // 下次二刷时间 (Date对象)
    travelTimes: {},            // 跑动时间 { '长安_傲来': 210, ... } 单位秒

    // ========== 地点配置 ==========
    locations: [
        { id: 'aolai', name: '傲来', icon: '🌊', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changshou', name: '长寿', icon: '🌳', shopLayout: 'horizontal', shops: ['左商', '右商'] },
        { id: 'changan', name: '长安', icon: '🏯', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'difu', name: '地府', icon: '👻', shopLayout: 'vertical', shops: ['上商', '下商'] },
        { id: 'beiju', name: '北俱', icon: '⛰️', shopLayout: 'vertical', shops: ['上商', '下商'] }
    ],

    // ========== 跑动时间预设（秒） ==========
    defaultTravelTimes: {
        'changan_aolai': 210,
        'changan_changshou': 270,
        'changan_difu': 150,
        'changan_beiju': 240,
        'aolai_changshou': 180,
        'aolai_difu': 300,
        'aolai_beiju': 270,
        'changshou_difu': 330,
        'changshou_beiju': 240,
        'difu_beiju': 210
    },

    // ========== 商品参考价 ==========
    goodsData: {
        'aolai': [{ name: '盐', refPrice: 6500, tip: '<8000可入手' }],
        'changshou': [{ name: '鹿茸', refPrice: 7000, tip: '<7500可入手' }],
        'changan': [{ name: '佛珠', refPrice: 7000, tip: '<7500可入手' }],
        'difu': [{ name: '纸钱', refPrice: 3000, tip: '<3500可入手' }],
        'beiju': [{ name: '香油', refPrice: 4000, tip: '<4500可入手' }]
    },

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
        this.updateMap();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    // ========== 数据操作 ==========
    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.currentLocation = data.currentLocation || null;
        this.travelTimes = data.travelTimes || { ...this.defaultTravelTimes };
        this.uiSettings = data.uiSettings || this.uiSettings;
    },

    saveData() {
        Storage.set(this.storageKey, {
            currentLocation: this.currentLocation,
            travelTimes: this.travelTimes,
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
    },

    // ========== 计算：获取两地跑动时间 ==========
    getTravelTime(from, to) {
        if (from === to) return 0;
        const key1 = from + '_' + to;
        const key2 = to + '_' + from;
        return this.travelTimes[key1] || this.travelTimes[key2] || 180; // 默认3分钟
    },

    // ========== 计算：判断能否赶上刷新 ==========
    checkRefreshStatus(targetLocation) {
        if (!this.currentLocation || !this.firstTime || !this.secondTime) {
            return { first: null, second: null, travelTime: null };
        }

        const travelTime = this.getTravelTime(this.currentLocation, targetLocation);
        const now = new Date();
        const firstRemain = (this.firstTime - now) / 1000;
        const secondRemain = (this.secondTime - now) / 1000;

        return {
            travelTime: travelTime,
            first: firstRemain > travelTime ? 'can' : 'miss',
            second: secondRemain > travelTime ? 'can' : 'miss',
            firstRemain: firstRemain,
            secondRemain: secondRemain
        };
    },

    // ========== 更新地图 ==========
    updateMap() {
        const container = document.getElementById('shMapContainer');
        if (!container) return;

        const s = this.uiSettings;
        let html = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">';

        for (let loc of this.locations) {
            const isCurrent = this.currentLocation === loc.id;
            const status = this.checkRefreshStatus(loc.id);

            // 状态颜色
            let firstColor = s.colorMiss;
            let secondColor = s.colorMiss;
            let firstLabel = '⚪';
            let secondLabel = '⚪';
            if (status.first === 'can') {
                firstColor = s.colorFirst;
                firstLabel = '🟢';
            }
            if (status.second === 'can') {
                secondColor = s.colorSecond;
                secondLabel = '🟡';
            }

            const travelDisplay = isCurrent ? '📍当前' : (status.travelTime !== null ? formatTime(status.travelTime) : '--');

            // 商户布局
            let shopsHtml = '';
            if (loc.shopLayout === 'horizontal') {
                shopsHtml = `
                    <div style="display:flex;gap:4px;justify-content:center;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="flex:1;padding:4px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="flex:1;padding:4px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;">${loc.shops[1]}</button>
                    </div>
                `;
            } else {
                shopsHtml = `
                    <div style="display:flex;flex-direction:column;gap:4px;margin:4px 0;">
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="0" style="padding:4px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;">${loc.shops[0]}</button>
                        <button class="sh-shop-btn" data-location="${loc.id}" data-shop="1" style="padding:4px;border-radius:8px;border:1px solid #bccad9;background:${s.cardBgColor};cursor:pointer;font-size:0.7rem;">${loc.shops[1]}</button>
                    </div>
                `;
            }

            // 商品信息
            const goods = this.goodsData[loc.id] || [];
            const goodsHtml = goods.map(g =>
                `<div style="font-size:0.55rem;color:#5a7a94;display:flex;justify-content:space-between;padding:1px 0;">
                    <span>${g.name}</span>
                    <span>${g.refPrice}</span>
                </div>`
            ).join('');

            const borderColor = isCurrent ? s.colorCurrent : 'transparent';

            html += `
                <div class="sh-location-card" data-location="${loc.id}" style="
                    background:${s.cardBgColor};
                    border-radius:12px;
                    padding:8px 10px;
                    border:2px solid ${borderColor};
                    box-shadow:0 2px 8px rgba(0,0,0,0.06);
                    cursor:pointer;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.9rem;font-weight:700;color:#1f3b53;">${loc.icon} ${loc.name}</span>
                        <span style="font-size:0.65rem;color:${isCurrent ? s.colorCurrent : '#5a7a94'};font-weight:600;">${travelDisplay}</span>
                    </div>
                    <div style="display:flex;gap:6px;font-size:0.6rem;margin:2px 0;">
                        <span style="background:${firstColor}22;color:${firstColor};padding:0 6px;border-radius:10px;">${firstLabel}一刷</span>
                        <span style="background:${secondColor}22;color:${secondColor};padding:0 6px;border-radius:10px;">${secondLabel}二刷</span>
                    </div>
                    ${shopsHtml}
                    <div style="border-top:1px solid #eef2f7;margin-top:4px;padding-top:4px;font-size:0.6rem;color:#5a7a94;">
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
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:10px;">
                <div class="module-header">
                    <div class="title">⏰ 刷新时间</div>
                    <div>
                        <button class="toggle-btn" id="shToggleTimeBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="shTimeBody">
                    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem;padding:4px 0;">
                        <span>📌 下次一刷：<strong id="shFirstTimeDisplay">未设置</strong></span>
                        <span>📌 下次二刷：<strong id="shSecondTimeDisplay">未设置</strong></span>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0;">
                        <input type="time" id="shFirstInput" step="1" style="padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        <button class="btn-small" id="shSetFirstBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;">设置一刷</button>
                        <input type="time" id="shSecondInput" step="1" style="padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        <button class="btn-small" id="shSetSecondBtn" style="background:#4c7a5c;color:#fff;border:none;padding:4px 14px;border-radius:30px;cursor:pointer;">设置二刷</button>
                    </div>
                    <div style="font-size:0.65rem;color:#5a7a94;">💡 点击地图上的地点名称标记当前位置，自动计算各地可达性</div>
                </div>
            </div>

            <div id="shMapContainer" style="margin-bottom:10px;">
                <!-- 由 updateMap 生成 -->
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0;border-top:1px solid #eef2f7;">
                <span style="font-size:0.65rem;color:#5a7a94;">🟢一刷 🟡二刷 ⚪赶不上</span>
                <span style="font-size:0.65rem;color:#5a7a94;">| 点击地点名称标记当前位置</span>
            </div>

            <div class="module" style="margin-top:10px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置</div>
                    <div>
                        <button class="toggle-btn" id="shToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="shUISettingsBody" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;padding:8px 0;">
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🟢 一刷</label>
                        <input type="color" id="shColorFirst" value="${this.uiSettings.colorFirst}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🟡 二刷</label>
                        <input type="color" id="shColorSecond" value="${this.uiSettings.colorSecond}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>⚪ 赶不上</label>
                        <input type="color" id="shColorMiss" value="${this.uiSettings.colorMiss}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>📍 当前位置</label>
                        <input type="color" id="shColorCurrent" value="${this.uiSettings.colorCurrent}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🟢 低价商</label>
                        <input type="color" id="shColorLow" value="${this.uiSettings.colorLowPrice}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🔴 高价商</label>
                        <input type="color" id="shColorHigh" value="${this.uiSettings.colorHighPrice}" style="width:40px;height:32px;border-radius:6px;border:1px solid #ddd;cursor:pointer;display:block;margin:2px auto;">
                    </div>
                    <div style="text-align:center;font-size:0.7rem;">
                        <label>🔤 字体大小</label>
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
                // 暂时只做标记，后续完善价格记录
                const locId = btn.dataset.location;
                const shopIdx = btn.dataset.shop;
                // 清除同地其他商人高亮
                const siblings = btn.parentElement.querySelectorAll('.sh-shop-btn');
                siblings.forEach(b => {
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#bccad9';
                });
                btn.style.background = '#4CAF50';
                btn.style.borderColor = '#4CAF50';
                btn.style.color = '#fff';
                // 同地另一个商人变红（如果有）
                const other = siblings.find(b => b !== btn);
                if (other) {
                    other.style.background = '#e06060';
                    other.style.borderColor = '#e06060';
                    other.style.color = '#fff';
                }
            }
        });

        // ===== 设置一刷 =====
        document.getElementById('shSetFirstBtn').addEventListener('click', () => {
            const val = document.getElementById('shFirstInput').value;
            if (!val) { alert('请选择时间！'); return; }
            const parts = val.split(':');
            const now = new Date();
            const target = new Date(now);
            target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
            if (target < now) target.setDate(target.getDate() + 1);
            this.firstTime = target;
            this.saveData();
            this.updateTimeDisplay();
            this.render();
        });

        // ===== 设置二刷 =====
        document.getElementById('shSetSecondBtn').addEventListener('click', () => {
            const val = document.getElementById('shSecondInput').value;
            if (!val) { alert('请选择时间！'); return; }
            const parts = val.split(':');
            const now = new Date();
            const target = new Date(now);
            target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
            if (target < now) target.setDate(target.getDate() + 1);
            this.secondTime = target;
            this.saveData();
            this.updateTimeDisplay();
            this.render();
        });

        // ===== 折叠按钮 =====
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

        // ===== 颜色设置 =====
        ['First', 'Second', 'Miss', 'Current', 'Low', 'High'].forEach(type => {
            const id = 'shColor' + type;
            const key = 'color' + type;
            document.getElementById(id).addEventListener('input', function() {
                ShopHelperModule.uiSettings[key] = this.value;
                ShopHelperModule.saveData();
                ShopHelperModule.render();
            });
        });

        // ===== 字体大小 =====
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
            // 更新颜色选择器
            Object.keys(defaults).forEach(key => {
                const el = document.getElementById('shColor' + key.charAt(0).toUpperCase() + key.slice(1));
                if (el) el.value = defaults[key];
            });
            ShopHelperModule.render();
            alert('✅ 颜色已重置！');
        });
    },

    // ========== 更新时间显示 ==========
    updateTimeDisplay() {
        const format = (d) => d ? d.toLocaleTimeString() : '未设置';
        document.getElementById('shFirstTimeDisplay').textContent = format(this.firstTime);
        document.getElementById('shSecondTimeDisplay').textContent = format(this.secondTime);
        // 自动填入输入框
        if (this.firstTime) {
            const h = String(this.firstTime.getHours()).padStart(2, '0');
            const m = String(this.firstTime.getMinutes()).padStart(2, '0');
            document.getElementById('shFirstInput').value = h + ':' + m;
        }
        if (this.secondTime) {
            const h = String(this.secondTime.getHours()).padStart(2, '0');
            const m = String(this.secondTime.getMinutes()).padStart(2, '0');
            document.getElementById('shSecondInput').value = h + ':' + m;
        }
    }
};

// ===== 工具函数 =====
function formatTime(seconds) {
    if (seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
}

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShopHelperModule.init());
} else {
    ShopHelperModule.init();
}

window.ShopHelperModule = ShopHelperModule;
