// ============================================================
//  🚀 应用核心 - 修复Tab切换
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
        }

        const btn = document.querySelector(`.tab-nav .tab-btn[data-tab="${tabId}"]`);
        if (btn) {
            btn.classList.add('active');
        }

        this.currentTab = tabId;

        // 渲染对应模块
        if (this.modules[tabId] && typeof this.modules[tabId].render === 'function') {
            console.log(`🔄 渲染模块: ${tabId}`);
            this.modules[tabId].render();
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
                module.render();
            }
        }
    },

    getModule(id) {
        return this.modules[id] || null;
    },

    init() {
        console.log('🚀 App 启动中...');

        // ✅ 绑定Tab按钮点击事件
        document.querySelectorAll('.tab-nav .tab-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const tabId = this.dataset.tab;
                console.log(`🖱️ 点击Tab: ${tabId}`);
                App.switchTab(tabId);
            });
        });

        // 绑定返回首页按钮
        document.querySelectorAll('.btn-back-home').forEach(btn => {
            btn.addEventListener('click', function() {
                App.goHome();
            });
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
