// ============================================================
//  📦 存储核心 - 终极修复版
// ============================================================
const Storage = {
    set(moduleKey, data) {
        try {
            localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    },

    get(moduleKey, defaultValue = null) {
        try {
            const data = localStorage.getItem(`toolbox_${moduleKey}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('读取失败:', e);
            return defaultValue;
        }
    },

    remove(moduleKey) {
        localStorage.removeItem(`toolbox_${moduleKey}`);
    },

    getAll() {
        const all = {};
        // 👇 改动1：先把所有的 key 存到一个数组里，防止循环时漏读
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('toolbox_')) {
                keys.push(key);
            }
        }
        // 👇 改动2：遍历刚刚存好的 key 数组，强制从硬盘里逐条读取，绝对不漏
        for (let key of keys) {
            const moduleKey = key.replace('toolbox_', '');
            try {
                all[moduleKey] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                all[moduleKey] = localStorage.getItem(key);
            }
        }
        return all;
    },

    importAll(data) {
        for (let [key, value] of Object.entries(data)) {
            localStorage.setItem(`toolbox_${key}`, JSON.stringify(value));
        }
    },

    // 覆盖模式
    mergeAll(data) {
        console.log('🔄 开始合并云端数据...');
        for (let [moduleKey, cloudData] of Object.entries(data)) {
            console.log(`📦 处理模块: ${moduleKey}`);
            this.set(moduleKey, cloudData);
            console.log(`  └─ ✅ 已保存，history: ${cloudData.history?.length || 0} 条`);
        }
        console.log('✅ 合并完成！');
    }
};

window.Storage = Storage;
