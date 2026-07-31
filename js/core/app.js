// ============================================================
//  🚀 应用核心 - 修复版（支持首页）
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
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
        });

        document.querySelectorAll('.tab-nav .tab-btn').forEach(el => {
            el.classList.remove('active');
        });

        const target = document.getElementById('tab-' + tabId);
        if (target) {
            target.classList.add('active');
        }

        const btn = document.querySelector(`.tab-nav .tab-btn[data-tab="${tabId}"]`);
        if (btn) {
            btn.classList.add('active');
        }

        this.currentTab = tabId;

        if (this.modules[tabId] && typeof this.modules[tabId].render === 'function') {
            console.log(`🔄 渲染模块: ${tabId}`);
            this.modules[tabId].render();
        }
    },

    refreshAll() {
        console.log('🔄 刷新所有模块...');
        for (let [id, module] of Object.entries(this.modules)) {
            if (typeof module.render === 'function') {
                console.log(`  └─ 刷新模块: ${id}`);
                module.render();
            }
        }
    },

    getModule(id) {
        return this.modules[id] || null;
    },

    init() {
        console.log('🚀 App 启动中...');

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
