// ============================================================
//  🐾 抓宠收益模块 - 完整版（紧凑布局）
// ============================================================
const PetHuntModule = {
    id: 'petHunt',

    // ========== 存储 ==========
    storageKey: 'petHunt',

    // ========== UI设置 ==========
    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14
    },

    // ========== 数据 ==========
    records: [],
    petLibrary: [],
    customScenes: [],
    filterState: { dateFrom: '', dateTo: '', petType: 'all', sold: 'all' },
    sortState: { field: 'date', order: 'desc' },

    sceneGroups: {
        group1: ['长寿郊外', '朱紫国', '建邺城'],
        group2: ['江南野外', '大唐国境', '北俱芦洲'],
        group3: ['大唐境外', '麒麟山', '傲来国']
    },
    allScenes: ['长寿郊外', '朱紫国', '建邺城', '江南野外', '大唐国境', '北俱芦洲', '大唐境外', '麒麟山', '傲来国'],
    sceneGroupMap: {
        '长寿郊外': 'group1', '朱紫国': 'group1', '建邺城': 'group1',
        '江南野外': 'group2', '大唐国境': 'group2', '北俱芦洲': 'group2',
        '大唐境外': 'group3', '麒麟山': 'group3', '傲来国': 'group3'
    },

    quickPets: ['吸血鬼', '幽灵', '鼠先锋', '犀牛将军', '蝴蝶仙子', '雷鸟人'],

    defaultPetLibrary: [
        { name: '大力金刚', level: '飞升', mustSkills: ['高级强力', '高级防御'], refPrice: 100, isRare: true },
        { name: '龙龟', level: '飞升', mustSkills: ['水攻', '法术防御'], refPrice: 60, isRare: true },
        { name: '夜罗刹', level: '飞升', mustSkills: ['夜舞倾城', '高级敏捷'], refPrice: 50, isRare: true },
        { name: '修罗傀儡鬼', level: '化圣', mustSkills: ['高级连击', '高级必杀'], refPrice: 30, isRare: true },
        { name: '曼珠沙华', level: '化圣', mustSkills: ['法术暴击', '高级魔之心'], refPrice: 30, isRare: true },
        { name: '毗舍童子', level: '化圣', mustSkills: ['连击', '高级神佑复生'], refPrice: 25, isRare: true },
        { name: '持国巡守', level: '化圣', mustSkills: ['须弥真言', '高级魔之心'], refPrice: 25, isRare: true },
        { name: '鬼将', level: 105, mustSkills: ['鬼魂术'], refPrice: 15, isRare: false },
        { name: '律法女娲', level: 95, mustSkills: ['高级反震'], refPrice: 10, isRare: false },
        { name: '吸血鬼', level: 95, mustSkills: ['鬼魂术', '夜战', '弱点雷'], refPrice: 8, isRare: false },
        { name: '幽灵', level: 95, mustSkills: ['鬼魂术', '夜战'], refPrice: 5, isRare: false },
        { name: '画魂', level: 105, mustSkills: ['地狱烈火', '高级魔之心'], refPrice: 5, isRare: false },
        { name: '雷鸟人', level: 45, mustSkills: ['飞行', '弱点雷', '高级雷属性吸收'], refPrice: 2, isRare: false },
        { name: '蝴蝶仙子', level: 45, mustSkills: ['飞行', '弱点雷'], refPrice: 2, isRare: false },
        { name: '古代瑞兽', level: 45, mustSkills: ['高级神迹'], refPrice: 2, isRare: false },
        { name: '鼠先锋', level: 85, mustSkills: ['高级敏捷', '夜战'], refPrice: 2, isRare: false },
        { name: '泪妖', level: 85, mustSkills: ['法术暴击'], refPrice: 2, isRare: false },
        { name: '犀牛将军', level: 75, mustSkills: ['高级必杀'], refPrice: 3, isRare: false },
        { name: '牛头', level: 35, mustSkills: ['鬼魂术', '夜战'], refPrice: 1, isRare: false },
        { name: '马面', level: 35, mustSkills: ['鬼魂术', '夜战', '高级必杀'], refPrice: 1, isRare: false },
        { name: '黑熊精', level: 35, mustSkills: ['高级必杀'], refPrice: 1, isRare: false },
        { name: '僵尸', level: 35, mustSkills: ['鬼魂术', '夜战'], refPrice: 1, isRare: false },
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
        this.updateStats();
        this.updateRecordsTable();
        this.updateScenePrediction();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadData() {
        const data = Storage.get(this.storageKey, {});
        this.records = data.records || [];
        this.petLibrary = data.petLibrary || [...this.defaultPetLibrary];
        this.customScenes = data.customScenes || [];
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14
        };
        this.filterState = data.filterState || { dateFrom: '', dateTo: '', petType: 'all', sold: 'all' };
        this.sortState = data.sortState || { field: 'date', order: 'desc' };
        this.allScenes = ['长寿郊外', '朱紫国', '建邺城', '江南野外', '大唐国境', '北俱芦洲', '大唐境外', '麒麟山', '傲来国', ...this.customScenes];
    },

    saveData() {
        Storage.set(this.storageKey, {
            records: this.records,
            petLibrary: this.petLibrary,
            customScenes: this.customScenes,
            uiSettings: this.uiSettings,
            filterState: this.filterState,
            sortState: this.sortState
        });
    },

    loadUISettings() {
        const data = Storage.get(this.storageKey, {});
        this.uiSettings = data.uiSettings || {
            bgColor: '#eef2f7',
            btnColor: '#4CAF50',
            btnTextColor: '#ffffff',
            cardBgColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 14
        };
    },

    saveUISettings() {
        Storage.set(this.storageKey, { uiSettings: this.uiSettings });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('petHuntContainer');
        if (!container) return;
        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        const card = container.closest('.card');
        if (card) card.style.setProperty('background', s.bgColor, 'important');
        container.querySelectorAll('.module, .ph-stats-grid .stat-item, .ph-history-section, .ph-table-wrap').forEach(el => {
            el.style.setProperty('background', s.cardBgColor, 'important');
            el.style.setProperty('background-color', s.cardBgColor, 'important');
        });
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .module .title .hint, .ph-record-item, .ph-table-wrap td, .ph-table-wrap th, .filter-item label').forEach(el => {
            el.style.setProperty('color', s.textColor, 'important');
        });
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.stat-item .num, .stat-item .label, .module .title, .ph-record-item, .ph-table-wrap td, .ph-table-wrap th, .filter-item label, input, select, button').forEach(el => {
            el.style.setProperty('font-size', fontSize, 'important');
        });
        container.querySelectorAll('.stat-item .num').forEach(el => {
            el.style.setProperty('font-size', (s.fontSize + 6) + 'px', 'important');
        });
    },

    calcStats() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        let todayCount = 0, weekCount = 0, totalCount = 0;
        let variantCount = 0, totalValue = 0, soldValue = 0;
        for (let r of this.records) {
            const dateStr = r.date.split(' ')[0];
            totalCount++;
            if (r.isVariant) variantCount++;
            if (r.price) totalValue += r.price;
            if (r.sold) soldValue += r.price;
            if (dateStr === today) todayCount++;
            if (dateStr >= weekStartStr) weekCount++;
        }
        return { todayCount, weekCount, totalCount, variantCount, totalValue, soldValue, unsoldValue: totalValue - soldValue };
    },

    getPetInfo(name) {
        return this.petLibrary.find(p => p.name === name);
    },

    searchPets(keyword) {
        if (!keyword || keyword.length < 1) return [];
        const lower = keyword.toLowerCase();
        return this.petLibrary.filter(p => p.name.includes(keyword) || p.name.toLowerCase().includes(lower));
    },

    addPetToLibrary(name, level, mustSkills, refPrice, isRare) {
        if (this.petLibrary.some(p => p.name === name)) return false;
        this.petLibrary.push({ name, level: level || '未知', mustSkills: mustSkills || [], refPrice: refPrice || 0, isRare: isRare || false });
        this.saveData();
        return true;
    },

    addScene(sceneName) {
        if (this.customScenes.includes(sceneName) || this.allScenes.includes(sceneName)) return false;
        this.customScenes.push(sceneName);
        this.allScenes.push(sceneName);
        this.saveData();
        return true;
    },

    addRecord(petName, isVariant, skillCount, price, sold, scene, notes) {
        const record = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            petName: petName,
            isVariant: isVariant || false,
            skillCount: skillCount || 0,
            price: parseFloat(price) || 0,
            sold: sold || false,
            scene: scene || '未知',
            notes: notes || ''
        };
        this.records.push(record);
        this.saveData();
        this.render();
        return record;
    },

    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        this.saveData();
        this.render();
    },

    toggleSold(id) {
        const record = this.records.find(r => r.id === id);
        if (record) {
            record.sold = !record.sold;
            this.saveData();
            this.render();
        }
    },

    updateScenePrediction() {
        const selectedScene = document.getElementById('phScene')?.value;
        const el = document.getElementById('phScenePrediction');
        if (!el) return;
        if (!selectedScene || selectedScene === '') {
            el.innerHTML = '选择场景后显示下一组预测';
            return;
        }
        if (this.customScenes.includes(selectedScene)) {
            el.innerHTML = `📍 自定义场景：${selectedScene}`;
            return;
        }
        const groupKey = this.sceneGroupMap[selectedScene];
        if (!groupKey) {
            el.innerHTML = '未知场景';
            return;
        }
        const groupIndex = parseInt(groupKey.replace('group', ''));
        const nextGroupIndex = groupIndex === 3 ? 1 : groupIndex + 1;
        const nextGroupKey = 'group' + nextGroupIndex;
        const nextScenes = this.sceneGroups[nextGroupKey];
        const currentScenes = this.sceneGroups[groupKey];
        el.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:0.8rem;padding:4px 0;">
                <span>📍 当前组：<strong style="color:#4CAF50;">${currentScenes.join('、')}</strong></span>
                <span>➡️ 下一组：<strong style="color:#f0d060;">${nextScenes.join('、')}</strong></span>
                <span style="color:#8ab0c8;font-size:0.7rem;">💡 提前飞过去蹲点！</span>
            </div>
        `;
    },

    // ========== 构建UI ==========
    buildUI() {
        const container = document.getElementById('petHuntContainer');
        if (!container) return;

        const sceneOptions = this.allScenes.map(s => `<option value="${s}">${s}</option>`).join('');
        const sceneQuickBtns = this.allScenes.map(s => 
            `<button class="ph-scene-btn" data-scene="${s}" style="padding:2px 8px;border-radius:12px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.6rem;margin:1px;">${s}</button>`
        ).join('');
        const quickPetBtns = this.quickPets.map(p => 
            `<button class="ph-quick-pet" data-pet="${p}" style="padding:2px 10px;border-radius:14px;border:1px solid #bccad9;background:#eef4fa;cursor:pointer;font-size:0.65rem;margin:1px;">${p}</button>`
        ).join('');
        const skillBtns = [0,1,2,3,4,5].map(n => 
            `<button class="ph-skill-btn" data-skill="${n}" style="padding:2px 10px;border-radius:14px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.65rem;margin:1px;min-width:28px;text-align:center;">${n}</button>`
        ).join('');
        const priceBtns = [30, 50, 100].map(p => 
            `<button class="ph-price-btn" data-price="${p}" style="padding:2px 10px;border-radius:14px;border:1px solid #bccad9;background:#f0f4f8;cursor:pointer;font-size:0.65rem;margin:1px;">${p}万</button>`
        ).join('');

        container.innerHTML = `
            <!-- 界面设置 -->
            <div class="module" style="background:#f0f4f8;border:1px solid #d0dce8;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title">🎨 界面设置 <span class="hint">— 自定义颜色和字体</span></div>
                    <div>
                        <button class="toggle-btn" id="phToggleUISettings" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="phUISettingsBody">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:8px 0;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🎨 背景色</label>
                            <input type="color" id="phBgColor" value="${this.uiSettings.bgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📦 卡片色</label>
                            <input type="color" id="phCardColor" value="${this.uiSettings.cardBgColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔘 按钮色</label>
                            <input type="color" id="phBtnColor" value="${this.uiSettings.btnColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">📝 文字色</label>
                            <input type="color" id="phTextColor" value="${this.uiSettings.textColor}" style="width:50px;height:36px;border:2px solid #ddd;border-radius:8px;cursor:pointer;">
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:0.75rem;color:#1f3b53;">
                            <label style="font-weight:600;">🔤 字体大小</label>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" id="phFontSize" min="12" max="20" value="${this.uiSettings.fontSize}" style="width:80px;">
                                <span id="phFontSizeDisplay" style="font-weight:700;min-width:24px;text-align:center;">${this.uiSettings.fontSize}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <button class="btn-small" id="phResetUI" style="background:#b48b5f;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">↩️ 重置</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="ph-stats-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
                <div class="stat-item"><div class="num" id="phTodayCount">0</div><div class="label">📅 今日抓宠</div></div>
                <div class="stat-item"><div class="num" id="phWeekCount">0</div><div class="label">📆 本周抓宠</div></div>
                <div class="stat-item" id="phVariantStat"><div class="num" id="phVariantCount">0</div><div class="label">✨ 变异数量</div></div>
                <div class="stat-item" id="phValueStat"><div class="num" id="phTotalValue">0</div><div class="label">💰 总价值(万)</div></div>
            </div>

            <!-- 场景刷新规则 -->
            <div class="module" style="background:#f0f5fb;border:1px solid #c9d8ea;border-radius:16px;margin-bottom:14px;">
                <div class="module-header">
                    <div class="title" style="color:#1f3b53;">📌 怪物幼儿园场景刷新规则</div>
                    <div>
                        <button class="toggle-btn" id="phToggleSceneRules" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="phSceneRulesBody" style="font-size:0.85rem;color:#1f3b53;line-height:1.8;padding:8px 12px;">
                    <div style="background:#1a2a3a;border-radius:12px;padding:12px 16px;color:#f2eee4;border-left:4px solid #f0d060;">
                        <div style="font-weight:700;color:#f0d060;font-size:0.95rem;">⚠️ 场景分三组，按顺序循环刷新</div>
                        <div style="margin-top:6px;">
                            <div>🔹 <strong>第一组</strong>：长寿郊外 → 朱紫国 → 建邺城</div>
                            <div>🔹 <strong>第二组</strong>：江南野外 → 大唐国境 → 北俱芦洲</div>
                            <div>🔹 <strong>第三组</strong>：大唐境外 → 麒麟山 → 傲来国</div>
                        </div>
                        <div style="margin-top:6px;color:#8ab0c8;font-size:0.8rem;">
                            🔄 刷新顺序：第一组 → 第二组 → 第三组 → 第一组 → ...
                            <br>💡 知道当前在哪一组，就能预判下一次刷新地点，提前飞过去！
                        </div>
                    </div>
                </div>
            </div>

            <!-- 添加抓宠记录 - 紧凑布局 -->
            <div class="module">
                <div class="module-header">
                    <div class="title">📝 添加抓宠记录 <span class="hint">— 点击按钮快速录入</span></div>
                    <div>
                        <button class="btn-small" id="phAddPetBtn" style="background:#6b8baa;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;font-weight:600;">➕ 添加宠物</button>
                        <button class="btn-small" id="phAddSceneBtn" style="background:#6b8baa;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;font-weight:600;">📍 添加场景</button>
                        <button class="toggle-btn" id="phToggleAddBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="phAddBody">
                    <!-- 第1行：变异 + 宠物名 + 技能 -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-bottom:6px;">
                        <div style="display:flex;align-items:center;gap:4px;">
                            <span style="font-weight:600;font-size:0.7rem;color:#5a7a94;white-space:nowrap;">✨ 变异</span>
                            <button class="ph-variant-btn active" data-variant="no" style="padding:3px 12px;border-radius:14px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;cursor:pointer;font-size:0.7rem;font-weight:600;">普通</button>
                            <button class="ph-variant-btn" data-variant="yes" style="padding:3px 12px;border-radius:14px;border:2px solid #bccad9;background:#f0f4f8;color:#1f3b53;cursor:pointer;font-size:0.7rem;font-weight:600;">变异</button>
                        </div>
                       <div style="flex:0 0 60px;">
                            <input type="text" id="phPetNameInput" placeholder="宠物名" style="width:100%;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;background:white;">
                            <div id="phPetMatchList" style="display:none;background:white;border:1px solid #bccad9;border-radius:8px;max-height:100px;overflow-y:auto;position:absolute;z-index:100;min-width:150px;"></div>
                            <div id="phPetInfoDisplay" style="display:none;background:#f0f5fb;border-radius:10px;padding:4px 10px;margin-top:3px;font-size:0.7rem;border:1px solid #d0dce8;"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:4px;">
                            <span style="font-weight:600;font-size:0.7rem;color:#5a7a94;white-space:nowrap;">📊 技能</span>
                            ${skillBtns}
                            <input type="number" id="phSkillCountInput" placeholder="手" min="0" max="20" style="width:36px;padding:3px 4px;border:1px solid #bccad9;border-radius:12px;font-size:0.65rem;text-align:center;">
                        </div>
                    </div>

                    <!-- 第2行：常用宠物 -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-bottom:6px;">
                        <span style="font-weight:600;font-size:0.7rem;color:#5a7a94;white-space:nowrap;">🐾 常用</span>
                        ${quickPetBtns}
                    </div>

                    <!-- 第3行：售价 -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-bottom:6px;">
                        <span style="font-weight:600;font-size:0.7rem;color:#5a7a94;white-space:nowrap;">💰 售价</span>
                        ${priceBtns}
                        <input type="number" id="phPrice" placeholder="手动" min="0" step="0.1" style="width:70px;padding:3px 6px;border:1px solid #bccad9;border-radius:12px;font-size:0.7rem;text-align:center;">
                        <span style="font-size:0.7rem;color:#5a7a94;">万</span>
                        <label style="display:flex;align-items:center;gap:4px;font-size:0.7rem;color:#1f3b53;cursor:pointer;margin-left:4px;">
                            <input type="checkbox" id="phSold"> 已卖出
                        </label>
                    </div>

                    <!-- 第4行：场景 -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin-bottom:4px;">
                        <span style="font-weight:600;font-size:0.7rem;color:#5a7a94;white-space:nowrap;">📍 场景</span>
                        ${sceneQuickBtns}
                    </div>

                    <!-- 第5行：场景下拉 + 预测 -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;">
                        <select id="phScene" style="flex:1;min-width:120px;padding:4px 8px;border:1px solid #bccad9;border-radius:12px;font-size:0.75rem;background:white;">
                            <option value="">选择场景</option>
                            ${sceneOptions}
                        </select>
                        <div id="phScenePrediction" style="flex:2;min-width:150px;background:#1a2a3a;border-radius:8px;padding:3px 10px;color:#f2eee4;font-size:0.7rem;border-left:3px solid #f0d060;">
                            选择场景后显示预测
                        </div>
                        <button class="btn-complete" id="phSaveBtn" style="background:#4c7a5c;color:#fff;border:none;padding:3px 16px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.7rem;">📥 保存</button>
                        <button class="btn-small" id="phClearBtn" style="background:#b48b5f;color:#fff;border:none;padding:3px 12px;border-radius:30px;cursor:pointer;font-size:0.65rem;">🗑️ 清空</button>
                    </div>
                </div>
            </div>

            <!-- 抓宠记录表格 -->
            <div class="module" style="margin-top:14px;">
                <div class="module-header">
                    <div class="title">📋 抓宠记录 <span class="hint" id="phRecordCount">共 0 条</span></div>
                    <div>
                        <button class="btn-analysis" id="phAnalysisToggleBtn" style="border-radius:50px;">📊 数据分析</button>
                        <button class="toggle-btn" id="phToggleRecordsBtn" style="background:#dce5ef;border:1px solid #bccad9;border-radius:30px;padding:2px 14px;font-size:0.6rem;font-weight:600;color:#1f3b53;cursor:pointer;">👁️ 隐藏</button>
                    </div>
                </div>
                <div class="module-body" id="phRecordsBody">
                    <div class="analysis-panel" id="phAnalysisPanel" style="display:none;margin-bottom:10px;">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;" id="phAnalysisGrid">
                            <div class="a-item"><div class="a-num" id="phAnaTotal">0</div><div class="a-label">总记录</div></div>
                            <div class="a-item"><div class="a-num" id="phAnaVariant">0</div><div class="a-label">变异数</div></div>
                            <div class="a-item"><div class="a-num" id="phAnaValue">0</div><div class="a-label">总价值(万)</div></div>
                            <div class="a-item"><div class="a-num" id="phAnaSold">0</div><div class="a-label">已售价值</div></div>
                            <div class="a-item"><div class="a-num" id="phAnaUnsold">0</div><div class="a-label">未售价值</div></div>
                            <div class="a-item"><div class="a-num" id="phAnaAvgPrice">0</div><div class="a-label">平均售价</div></div>
                        </div>
                        <div class="filter-row" style="display:flex;flex-wrap:wrap;gap:8px 16px;padding-top:8px;border-top:1px solid #dce5ef;">
                            <div class="filter-item"><label>📅 日期从</label><input type="date" id="phFilterDateFrom"></div>
                            <div class="filter-item"><label>到</label><input type="date" id="phFilterDateTo"></div>
                            <div class="filter-item"><label>📌 类型</label><select id="phFilterType"><option value="all">全部</option><option value="variant">变异</option><option value="normal">普通</option></select></div>
                            <div class="filter-item"><label>💰 状态</label><select id="phFilterSold"><option value="all">全部</option><option value="sold">已卖出</option><option value="unsold">未卖出</option></select></div>
                            <div class="filter-item"><button class="btn-filter" id="phApplyFilterBtn">应用筛选</button><button class="btn-filter reset" id="phResetFilterBtn">重置</button></div>
                        </div>
                    </div>
                    <div class="ph-table-wrap" style="width:100%;overflow-x:auto;max-height:320px;overflow-y:auto;border-radius:16px;border:1px solid #d0dce8;background:white;">
                        <table style="width:100%;min-width:750px;border-collapse:collapse;font-size:0.85rem;">
                            <thead>
                                <tr>
                                    <th style="width:36px;min-width:36px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">#</th>
                                    <th style="min-width:100px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;cursor:pointer;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;" id="phSortHeader">📅 日期 <span id="phSortIcon">↓</span></th>
                                    <th style="min-width:60px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">🐾 宠物</th>
                                    <th style="min-width:50px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">✨ 变异</th>
                                    <th style="min-width:50px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">📊 技能</th>
                                    <th style="min-width:70px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">💰 价值</th>
                                    <th style="min-width:70px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">📌 状态</th>
                                    <th style="min-width:60px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">📍 场景</th>
                                    <th style="min-width:70px;padding:8px 6px;background:#1f344b;color:#f0ebdd;text-align:center;position:sticky;top:0;z-index:10;font-weight:700;font-size:0.7rem;">⚙️ 操作</th>
                                </tr>
                            </thead>
                            <tbody id="phRecordsTableBody">
                                <tr><td colspan="9" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无抓宠记录</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 添加宠物弹窗 -->
            <div class="modal-overlay" id="phAddPetModal">
                <div class="modal-box" style="max-width:480px;">
                    <h3>➕ 添加宠物</h3>
                    <div class="modal-desc">添加新宠物到宠物库，后续录入时自动匹配。</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">🐾 宠物名 *</label>
                            <input type="text" id="phNewPetName" placeholder="如：芙蓉仙子" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📌 参战等级</label>
                            <input type="text" id="phNewPetLevel" placeholder="如：75" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">💰 参考价(万)</label>
                            <input type="number" id="phNewPetPrice" placeholder="0" min="0" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;grid-column:1/-1;">
                            <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">⭐ 必带技能（用逗号分隔）</label>
                            <input type="text" id="phNewPetSkills" placeholder="如：鬼魂术,夜战,弱点雷" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;grid-column:1/-1;padding:4px 0;">
                            <input type="checkbox" id="phNewPetRare">
                            <label style="font-size:0.8rem;color:#1f3b53;">⭐ 标记为稀有宠物</label>
                        </div>
                    </div>
                    <div class="modal-actions" style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                        <button class="btn-cancel" id="phAddPetCancel" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">取消</button>
                        <button class="btn-confirm" id="phAddPetConfirm" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#4c7a5c;color:white;">✅ 添加</button>
                    </div>
                </div>
            </div>

            <!-- 添加场景弹窗 -->
            <div class="modal-overlay" id="phAddSceneModal">
                <div class="modal-box" style="max-width:400px;">
                    <h3>📍 添加场景</h3>
                    <div class="modal-desc">添加自定义场景（非幼儿园场景）。</div>
                    <div style="display:flex;flex-direction:column;gap:8px;padding:8px 0;">
                        <label style="font-weight:600;font-size:0.75rem;color:#1f3b53;">📍 场景名称 *</label>
                        <input type="text" id="phNewSceneName" placeholder="如：D5" style="padding:6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.8rem;">
                    </div>
                    <div class="modal-actions" style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">
                        <button class="btn-cancel" id="phAddSceneCancel" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#dce5ef;color:#1f3b53;">取消</button>
                        <button class="btn-confirm" id="phAddSceneConfirm" style="padding:8px 24px;border-radius:40px;border:none;font-weight:600;cursor:pointer;font-size:0.85rem;background:#4c7a5c;color:white;">✅ 添加</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 绑定事件 ==========
    bindEvents() {
        const container = document.getElementById('petHuntContainer');
        if (!container) return;

        // UI设置
        document.getElementById('phBgColor').addEventListener('input', function() {
            PetHuntModule.uiSettings.bgColor = this.value;
            PetHuntModule.applyUISettings();
            PetHuntModule.saveUISettings();
        });
        document.getElementById('phCardColor').addEventListener('input', function() {
            PetHuntModule.uiSettings.cardBgColor = this.value;
            PetHuntModule.applyUISettings();
            PetHuntModule.saveUISettings();
        });
        document.getElementById('phBtnColor').addEventListener('input', function() {
            PetHuntModule.uiSettings.btnColor = this.value;
            PetHuntModule.applyUISettings();
            PetHuntModule.saveUISettings();
        });
        document.getElementById('phTextColor').addEventListener('input', function() {
            PetHuntModule.uiSettings.textColor = this.value;
            PetHuntModule.applyUISettings();
            PetHuntModule.saveUISettings();
        });
        document.getElementById('phFontSize').addEventListener('input', function() {
            const val = parseInt(this.value);
            document.getElementById('phFontSizeDisplay').textContent = val;
            PetHuntModule.uiSettings.fontSize = val;
            PetHuntModule.applyUISettings();
            PetHuntModule.saveUISettings();
        });
        document.getElementById('phResetUI').addEventListener('click', function() {
            if (confirm('重置所有UI设置为默认值？')) {
                PetHuntModule.uiSettings = {
                    bgColor: '#eef2f7',
                    btnColor: '#4CAF50',
                    btnTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    textColor: '#1a1a2e',
                    fontSize: 14
                };
                document.getElementById('phBgColor').value = PetHuntModule.uiSettings.bgColor;
                document.getElementById('phCardColor').value = PetHuntModule.uiSettings.cardBgColor;
                document.getElementById('phBtnColor').value = PetHuntModule.uiSettings.btnColor;
                document.getElementById('phTextColor').value = PetHuntModule.uiSettings.textColor;
                document.getElementById('phFontSize').value = PetHuntModule.uiSettings.fontSize;
                document.getElementById('phFontSizeDisplay').textContent = PetHuntModule.uiSettings.fontSize;
                PetHuntModule.applyUISettings();
                PetHuntModule.saveUISettings();
                alert('✅ UI设置已重置！');
            }
        });
        document.getElementById('phToggleUISettings').addEventListener('click', function() {
            const body = document.getElementById('phUISettingsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('phToggleSceneRules').addEventListener('click', function() {
            const body = document.getElementById('phSceneRulesBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('phToggleAddBtn').addEventListener('click', function() {
            const body = document.getElementById('phAddBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });
        document.getElementById('phToggleRecordsBtn').addEventListener('click', function() {
            const body = document.getElementById('phRecordsBody');
            body.classList.toggle('hidden');
            this.textContent = body.classList.contains('hidden') ? '👁️ 显示' : '👁️ 隐藏';
        });

        // 变异卡片切换
        document.querySelectorAll('.ph-variant-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.ph-variant-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#bccad9';
                    b.style.color = '#1f3b53';
                });
                this.classList.add('active');
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
            });
        });

        // 常用宠物
        document.querySelectorAll('.ph-quick-pet').forEach(btn => {
            btn.addEventListener('click', function() {
                const pet = this.dataset.pet;
                document.getElementById('phPetNameInput').value = pet;
                PetHuntModule.displayPetInfo(pet);
                document.querySelectorAll('.ph-quick-pet').forEach(b => {
                    b.style.background = '#eef4fa';
                    b.style.borderColor = '#bccad9';
                });
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
            });
        });

        // 技能卡片
        document.querySelectorAll('.ph-skill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skill = this.dataset.skill;
                document.getElementById('phSkillCountInput').value = skill;
                document.querySelectorAll('.ph-skill-btn').forEach(b => {
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#bccad9';
                    b.style.color = '#1f3b53';
                });
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
            });
        });

        // 售价快捷
        document.querySelectorAll('.ph-price-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const price = this.dataset.price;
                document.getElementById('phPrice').value = price;
                document.querySelectorAll('.ph-price-btn').forEach(b => {
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#bccad9';
                    b.style.color = '#1f3b53';
                });
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
            });
        });

        // 场景快速按钮
        document.querySelectorAll('.ph-scene-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const scene = this.dataset.scene;
                document.getElementById('phScene').value = scene;
                document.querySelectorAll('.ph-scene-btn').forEach(b => {
                    b.style.background = '#f0f4f8';
                    b.style.borderColor = '#bccad9';
                    b.style.color = '#1f3b53';
                });
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.color = '#fff';
                PetHuntModule.updateScenePrediction();
            });
        });

        // 场景下拉
        document.getElementById('phScene').addEventListener('change', function() {
            PetHuntModule.updateScenePrediction();
            const val = this.value;
            document.querySelectorAll('.ph-scene-btn').forEach(b => {
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
                if (b.dataset.scene === val) {
                    b.style.background = '#4CAF50';
                    b.style.borderColor = '#4CAF50';
                    b.style.color = '#fff';
                }
            });
        });

        // 宠物名自动匹配
        const petInput = document.getElementById('phPetNameInput');
        const matchList = document.getElementById('phPetMatchList');
        petInput.addEventListener('input', function() {
            const keyword = this.value.trim();
            if (keyword.length < 1) {
                matchList.style.display = 'none';
                document.getElementById('phPetInfoDisplay').style.display = 'none';
                return;
            }
            const matches = PetHuntModule.searchPets(keyword);
            if (matches.length === 0) {
                matchList.style.display = 'none';
                document.getElementById('phPetInfoDisplay').style.display = 'none';
                return;
            }
            let html = '';
            matches.forEach(p => {
                const isRare = p.isRare ? '⭐' : '';
                html += `<div class="ph-match-item" data-name="${p.name}" style="padding:4px 10px;cursor:pointer;border-bottom:1px solid #f0f4f8;font-size:0.8rem;${p.isRare ? 'color:#dbbd7c;' : ''}">${isRare} ${p.name} (${p.level || '未知'})</div>`;
            });
            matchList.innerHTML = html;
            matchList.style.display = 'block';
            matchList.querySelectorAll('.ph-match-item').forEach(item => {
                item.addEventListener('click', function() {
                    const name = this.dataset.name;
                    petInput.value = name;
                    matchList.style.display = 'none';
                    PetHuntModule.displayPetInfo(name);
                });
            });
        });
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#phPetNameInput') && !e.target.closest('#phPetMatchList')) {
                matchList.style.display = 'none';
            }
        });

        // 保存记录
        document.getElementById('phSaveBtn').addEventListener('click', function() {
            const petName = document.getElementById('phPetNameInput').value.trim();
            if (!petName) { alert('请输入宠物名！'); return; }
            const isVariant = document.querySelector('.ph-variant-btn.active')?.dataset.variant === 'yes';
            const skillCount = parseInt(document.getElementById('phSkillCountInput').value) || 0;
            const price = parseFloat(document.getElementById('phPrice').value) || 0;
            const scene = document.getElementById('phScene').value;
            const sold = document.getElementById('phSold').checked;
            if (!scene) { alert('请选择场景！'); return; }
            PetHuntModule.addRecord(petName, isVariant, skillCount, price, sold, scene, '');
            // 清空
            document.getElementById('phPetNameInput').value = '';
            document.getElementById('phPrice').value = '';
            document.getElementById('phSkillCountInput').value = '';
            document.getElementById('phSold').checked = false;
            document.getElementById('phPetInfoDisplay').style.display = 'none';
            document.getElementById('phScene').value = '';
            document.querySelectorAll('.ph-variant-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            document.querySelector('.ph-variant-btn[data-variant="no"]').classList.add('active');
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.background = '#4CAF50';
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.borderColor = '#4CAF50';
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.color = '#fff';
            document.querySelectorAll('.ph-quick-pet, .ph-skill-btn, .ph-price-btn, .ph-scene-btn').forEach(b => {
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            document.getElementById('phScenePrediction').innerHTML = '选择场景后显示下一组预测';
            alert('✅ 记录已保存！');
        });

        // 清空
        document.getElementById('phClearBtn').addEventListener('click', function() {
            document.getElementById('phPetNameInput').value = '';
            document.getElementById('phPrice').value = '';
            document.getElementById('phSkillCountInput').value = '';
            document.getElementById('phSold').checked = false;
            document.getElementById('phPetInfoDisplay').style.display = 'none';
            document.getElementById('phScene').value = '';
            document.querySelectorAll('.ph-variant-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            document.querySelector('.ph-variant-btn[data-variant="no"]').classList.add('active');
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.background = '#4CAF50';
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.borderColor = '#4CAF50';
            document.querySelector('.ph-variant-btn[data-variant="no"]').style.color = '#fff';
            document.querySelectorAll('.ph-quick-pet, .ph-skill-btn, .ph-price-btn, .ph-scene-btn').forEach(b => {
                b.style.background = '#f0f4f8';
                b.style.borderColor = '#bccad9';
                b.style.color = '#1f3b53';
            });
            document.getElementById('phScenePrediction').innerHTML = '选择场景后显示下一组预测';
        });

        // 添加宠物
        document.getElementById('phAddPetBtn').addEventListener('click', function() {
            document.getElementById('phAddPetModal').classList.add('show');
        });
        document.getElementById('phAddPetCancel').addEventListener('click', function() {
            document.getElementById('phAddPetModal').classList.remove('show');
        });
        document.getElementById('phAddPetModal').addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('show');
        });
        document.getElementById('phAddPetConfirm').addEventListener('click', function() {
            const name = document.getElementById('phNewPetName').value.trim();
            if (!name) { alert('请输入宠物名！'); return; }
            const level = document.getElementById('phNewPetLevel').value.trim() || '未知';
            const refPrice = parseFloat(document.getElementById('phNewPetPrice').value) || 0;
            const skillsStr = document.getElementById('phNewPetSkills').value.trim();
            const mustSkills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s) : [];
            const isRare = document.getElementById('phNewPetRare').checked;
            const success = PetHuntModule.addPetToLibrary(name, level, mustSkills, refPrice, isRare);
            if (!success) { alert('⚠️ 该宠物已存在！'); return; }
            document.getElementById('phAddPetModal').classList.remove('show');
            document.getElementById('phNewPetName').value = '';
            document.getElementById('phNewPetLevel').value = '';
            document.getElementById('phNewPetPrice').value = '';
            document.getElementById('phNewPetSkills').value = '';
            document.getElementById('phNewPetRare').checked = false;
            alert('✅ 宠物已添加到库！');
            PetHuntModule.buildUI();
            PetHuntModule.bindEvents();
            PetHuntModule.render();
        });

        // 添加场景
        document.getElementById('phAddSceneBtn').addEventListener('click', function() {
            document.getElementById('phAddSceneModal').classList.add('show');
        });
        document.getElementById('phAddSceneCancel').addEventListener('click', function() {
            document.getElementById('phAddSceneModal').classList.remove('show');
        });
        document.getElementById('phAddSceneModal').addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('show');
        });
        document.getElementById('phAddSceneConfirm').addEventListener('click', function() {
            const scene = document.getElementById('phNewSceneName').value.trim();
            if (!scene) { alert('请输入场景名称！'); return; }
            const success = PetHuntModule.addScene(scene);
            if (!success) { alert('⚠️ 该场景已存在！'); return; }
            document.getElementById('phAddSceneModal').classList.remove('show');
            document.getElementById('phNewSceneName').value = '';
            alert('✅ 场景已添加到库！');
            PetHuntModule.buildUI();
            PetHuntModule.bindEvents();
            PetHuntModule.render();
        });

        // 数据分析
        let analysisVisible = false;
        document.getElementById('phAnalysisToggleBtn').addEventListener('click', function() {
            analysisVisible = !analysisVisible;
            document.getElementById('phAnalysisPanel').style.display = analysisVisible ? 'block' : 'none';
            this.textContent = analysisVisible ? '📊 隐藏分析' : '📊 数据分析';
            this.classList.toggle('active', analysisVisible);
            if (analysisVisible) PetHuntModule.updateAnalysis();
        });

        // 筛选
        document.getElementById('phApplyFilterBtn').addEventListener('click', function() {
            PetHuntModule.filterState.dateFrom = document.getElementById('phFilterDateFrom').value || '';
            PetHuntModule.filterState.dateTo = document.getElementById('phFilterDateTo').value || '';
            PetHuntModule.filterState.petType = document.getElementById('phFilterType').value || 'all';
            PetHuntModule.filterState.sold = document.getElementById('phFilterSold').value || 'all';
            PetHuntModule.render();
            if (analysisVisible) PetHuntModule.updateAnalysis();
        });
        document.getElementById('phResetFilterBtn').addEventListener('click', function() {
            document.getElementById('phFilterDateFrom').value = '';
            document.getElementById('phFilterDateTo').value = '';
            document.getElementById('phFilterType').value = 'all';
            document.getElementById('phFilterSold').value = 'all';
            PetHuntModule.filterState = { dateFrom: '', dateTo: '', petType: 'all', sold: 'all' };
            PetHuntModule.render();
            if (analysisVisible) PetHuntModule.updateAnalysis();
        });

        // 排序
        document.getElementById('phSortHeader').addEventListener('click', function() {
            PetHuntModule.sortState.order = PetHuntModule.sortState.order === 'desc' ? 'asc' : 'desc';
            PetHuntModule.render();
        });

        // 删除/卖出切换
        container.addEventListener('click', function(e) {
            const delBtn = e.target.closest('.ph-del-btn');
            if (delBtn) {
                const id = parseInt(delBtn.dataset.id);
                if (!isNaN(id) && confirm('确定要删除这条记录吗？')) {
                    PetHuntModule.deleteRecord(id);
                }
                return;
            }
            const soldBtn = e.target.closest('.ph-sold-btn');
            if (soldBtn) {
                const id = parseInt(soldBtn.dataset.id);
                if (!isNaN(id)) {
                    PetHuntModule.toggleSold(id);
                }
                return;
            }
        });
    },

    displayPetInfo(name) {
        const info = this.getPetInfo(name);
        const display = document.getElementById('phPetInfoDisplay');
        if (!info) { display.style.display = 'none'; return; }
        const skillsText = info.mustSkills && info.mustSkills.length > 0 ? info.mustSkills.join('、') : '无';
        const rareText = info.isRare ? '⭐ 稀有' : '普通';
        display.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:4px 16px;">
                <span><strong>${info.name}</strong> (${info.level || '未知'})</span>
                <span>${rareText}</span>
                <span>📌 必带技能：${skillsText}</span>
                <span>💰 参考价：${info.refPrice || 0}万</span>
            </div>
        `;
        display.style.display = 'block';
    },

    updateStats() {
        const stats = this.calcStats();
        document.getElementById('phTodayCount').textContent = stats.todayCount;
        document.getElementById('phWeekCount').textContent = stats.weekCount;
        document.getElementById('phVariantCount').textContent = stats.variantCount;
        document.getElementById('phTotalValue').textContent = stats.totalValue.toFixed(1);
        const vs = document.getElementById('phVariantStat');
        vs.className = 'stat-item' + (stats.variantCount > 0 ? ' profit' : '');
        const valS = document.getElementById('phValueStat');
        valS.className = 'stat-item' + (stats.totalValue > 0 ? ' profit' : '');
    },

    updateRecordsTable() {
        const tbody = document.getElementById('phRecordsTableBody');
        const countEl = document.getElementById('phRecordCount');
        const count = this.records.length;
        countEl.textContent = `共 ${count} 条`;
        if (count === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="padding:30px 0;color:#6c87a0;text-align:center;font-style:italic;">暂无抓宠记录</td></tr>';
            return;
        }
        let data = [...this.records];
        const f = this.filterState;
        if (f.dateFrom) { const from = new Date(f.dateFrom); data = data.filter(r => new Date(r.date) >= from); }
        if (f.dateTo) { const to = new Date(f.dateTo); to.setHours(23, 59, 59); data = data.filter(r => new Date(r.date) <= to); }
        if (f.petType === 'variant') { data = data.filter(r => r.isVariant); }
        else if (f.petType === 'normal') { data = data.filter(r => !r.isVariant); }
        if (f.sold === 'sold') { data = data.filter(r => r.sold); }
        else if (f.sold === 'unsold') { data = data.filter(r => !r.sold); }
        const sortOrder = this.sortState.order === 'desc' ? -1 : 1;
        data.sort((a, b) => { const dateA = new Date(a.date); const dateB = new Date(b.date); return (dateA - dateB) * sortOrder; });
        let html = '';
        const total = data.length;
        for (let i = 0; i < data.length; i++) {
            const r = data[i];
            const row = this.sortState.order === 'desc' ? total - i : i + 1;
            const variantText = r.isVariant ? '✨ 是' : '否';
            const soldText = r.sold ? '✅ 已卖' : '⏳ 未卖';
            const priceText = r.price ? r.price.toFixed(1) + '万' : '-';
            html += `<tr>
                <td style="font-weight:700;color:#1f3b53;background:#f5f8fc;text-align:center;padding:6px 4px;">${row}</td>
                <td style="padding:6px 4px;text-align:center;">${r.date || '未知'}</td>
                <td style="padding:6px 4px;text-align:center;font-weight:600;color:#1f3b53;">${r.petName}</td>
                <td style="padding:6px 4px;text-align:center;${r.isVariant ? 'color:#dbbd7c;font-weight:700;' : ''}">${variantText}</td>
                <td style="padding:6px 4px;text-align:center;">${r.skillCount || 0}</td>
                <td style="padding:6px 4px;text-align:center;font-weight:600;color:${r.price > 0 ? '#2d6b2d' : '#5a7a94'};">${priceText}</td>
                <td style="padding:6px 4px;text-align:center;${r.sold ? 'color:#2d6b2d;' : 'color:#b48b3a;'}">
                    ${soldText}
                    <button class="ph-sold-btn" data-id="${r.id}" style="background:${r.sold ? '#f5d0d0' : '#d4edda'};border:none;border-radius:30px;padding:2px 10px;font-size:0.55rem;cursor:pointer;margin-left:4px;color:${r.sold ? '#8f3a3a' : '#2d6b2d'};font-weight:600;">${r.sold ? '↩️ 改未卖' : '💰 卖出'}</button>
                </td>
                <td style="padding:6px 4px;text-align:center;font-size:0.75rem;color:#5a7a94;">${r.scene || '-'}</td>
                <td style="padding:6px 4px;text-align:center;">
                    <button class="ph-del-btn" data-id="${r.id}" style="background:#f5d0d0;border:none;border-radius:30px;padding:2px 12px;font-size:0.65rem;cursor:pointer;color:#8f3a3a;font-weight:700;">✕</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html;
        const icon = document.getElementById('phSortIcon');
        if (icon) icon.textContent = this.sortState.order === 'desc' ? '↓' : '↑';
    },

    updateAnalysis() {
        const data = this.records;
        const count = data.length;
        if (count === 0) {
            ['phAnaTotal', 'phAnaVariant', 'phAnaValue', 'phAnaSold', 'phAnaUnsold', 'phAnaAvgPrice'].forEach(id => document.getElementById(id).textContent = '0');
            return;
        }
        let variantCount = 0, totalValue = 0, soldValue = 0;
        for (let r of data) {
            if (r.isVariant) variantCount++;
            if (r.price) totalValue += r.price;
            if (r.sold) soldValue += r.price;
        }
        const unsoldValue = totalValue - soldValue;
        const avgPrice = count > 0 ? totalValue / count : 0;
        document.getElementById('phAnaTotal').textContent = count;
        document.getElementById('phAnaVariant').textContent = variantCount;
        document.getElementById('phAnaValue').textContent = totalValue.toFixed(1);
        document.getElementById('phAnaSold').textContent = soldValue.toFixed(1);
        document.getElementById('phAnaUnsold').textContent = unsoldValue.toFixed(1);
        document.getElementById('phAnaAvgPrice').textContent = avgPrice.toFixed(1);
    }
};

// ===== 自动初始化 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PetHuntModule.init());
} else {
    PetHuntModule.init();
}

window.PetHuntModule = PetHuntModule;
