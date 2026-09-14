// ============================================================
//  📦 存储核心 - 精简版（只做读写，不做迁移）
// ============================================================
const Storage = {
    // ============================================================
    //  获取某个模块的数据
    // ============================================================
    get(moduleKey, defaultValue = null) {
        try {
            const raw = localStorage.getItem(`toolbox_${moduleKey}`);
            if (!raw) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            console.error(`❌ 读取 [${moduleKey}] 失败:`, e);
            return defaultValue;
        }
    },

    // ============================================================
    //  保存某个模块的数据
    // ============================================================
    set(moduleKey, data) {
        try {
            localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`❌ 保存 [${moduleKey}] 失败:`, e);
            return false;
        }
    },

    // ============================================================
    //  删除某个模块
    // ============================================================
    remove(moduleKey) {
        localStorage.removeItem(`toolbox_${moduleKey}`);
    },

    // ============================================================
    //  批量获取所有模块（供 sync.js 使用）
    // ============================================================
    getAllForSync() {
        const all = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('toolbox_')) {
                const moduleKey = key.replace('toolbox_', '');
                all[moduleKey] = this.get(moduleKey, {});
            }
        }
        return all;
    }
};

window.Storage = Storage;
