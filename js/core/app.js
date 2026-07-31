// ============================================================
//  🚀 应用核心 - 修复版
// ============================================================
const App = {
    modules: {},
    currentTab: 'petRing',

    register(module) {
        if (!module.id) {
            console.error('模块缺少 id');
            return;
        }
        this.modules[module.id] = module;
        console.log(`✅ 模块已注册: ${module.id}`);
    },

    switchTab(tabId) {
        console.log(`🔄 切换到 Tab: ${tabId}`);

        // 显示Tab导航
        const tabNav = document.getElementById('tabNav');
        if (tabNav) tabNav.style.display = 'flex';
        
        // 隐藏首页
        const homePage = document.getElementById('homePage');
        if (homePage) homePage.classList.add('hidden');

        // 隐藏所有Tab内容
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // 取消所有Tab按钮高亮
        document.querySelectorAll('.tab-nav .tab-btn').forEach(el => {
            el.classList.remove('active');
        });

        // 显示目标Tab
        const target = document.getElementById('tab-' + tabId);
        if (target) {
            target.classList.add('active');
            console.log(`✅ Tab 内容已显示: tab-${tabId}`);
        } else {
            console.warn(`⚠️ 找不到 Tab 内容: tab-${tabId}`);
        }

        const btn = document.querySelector(`.tab-nav .tab-btn[data-tab="${tabId}"]`);
        if (btn) {
            btn.classList.add('active');
        }

        this.currentTab = tabId;

        // ✅ 关键修复：渲染对应模块
        if (this.modules[tabId] && typeof this.modules[tabId].render === 'function') {
            console.log(`🔄 渲染模块: ${tabId}`);
            try {
                this.modules[tabId].render();
            } catch (e) {
                console.error(`❌ 模块 ${tabId} 渲染失败:`, e);
            }
        } else {
            console.warn(`⚠️ 模块 ${tabId} 没有 render 方法`);
        }
    },

    goToTab(tabId) {
        this.switchTab(tabId);
    },

    goHome() {
        console.log('🏠 返回首页');
        const homePage = document.getElementById('homePage');
        if (homePage) homePage.classList.remove('hidden');
        
        const tabNav = document.getElementById('tabNav');
        if (tabNav) tabNav.style.display = 'none';
        
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelectorAll('.tab-nav .tab-btn').forEach(el => {
            el.classList.remove('active');
        });
        
        if (typeof buildHomeCards === 'function') {
            buildHomeCards();
        }
    },

    refreshAll() {
        console.log('🔄 刷新所有模块...');
        for (let [id, module] of Object.entries(this.modules)) {
            if (typeof module.render === 'function') {
                console.log(`  └─ 刷新模块: ${id}`);
                try {
                    module.render();
                } catch (e) {
                    console.error(`❌ 模块 ${id} 刷新失败:`, e);
                }
            }
        }
    },

    getModule(id) {
        return this.modules[id] || null;
    },

    init() {
        console.log('🚀 App 启动中...');

        // 绑定Tab按钮事件
        document.querySelectorAll('.tab-nav .tab-btn').forEach(btn => {
            btn.removeEventListener('click', btn._clickHandler);
            const handler = function() {
                const tabId = this.dataset.tab;
                console.log(`🖱️ 点击Tab: ${tabId}`);
                App.switchTab(tabId);
            };
            btn._clickHandler = handler;
            btn.addEventListener('click', handler);
        });

        // 绑定返回首页按钮
        document.querySelectorAll('.btn-back-home').forEach(btn => {
            btn.removeEventListener('click', btn._homeHandler);
            btn._homeHandler = function() {
                App.goHome();
            };
            btn.addEventListener('click', btn._homeHandler);
        });

        // 初始化所有模块
        for (let [id, module] of Object.entries(this.modules)) {
            if (typeof module.init === 'function') {
                console.log(`📦 初始化模块: ${id}`);
                try {
                    module.init();
                } catch (e) {
                    console.error(`❌ 模块 ${id} 初始化失败:`, e);
                }
            }
        }

        console.log('✅ App 启动完成！');
    }
};

window.App = App;
