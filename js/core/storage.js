// ============================================================
//  📦 存储核心 - 修复合并空数据问题
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
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('toolbox_')) {
                const moduleKey = key.replace('toolbox_', '');
                try {
                    all[moduleKey] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    all[moduleKey] = localStorage.getItem(key);
                }
            }
        }
        return all;
    },

    importAll(data) {
        for (let [key, value] of Object.entries(data)) {
            localStorage.setItem(`toolbox_${key}`, JSON.stringify(value));
        }
    },

    deduplicateHistory(items) {
        if (!Array.isArray(items) || items.length === 0) return items;
        const seen = new Set();
        const unique = [];
        for (let item of items) {
            let key = item.date || JSON.stringify(item);
            if (item.ringCount !== undefined && item.profit !== undefined) {
                key = `${item.date}_${item.ringCount}_${item.profit}`;
            }
            if (item.shakes !== undefined && item.profit !== undefined) {
                key = `${item.date}_${item.profit}_${item.shakes}`;
            }
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(item);
            }
        }
        return unique;
    },

    sortHistory(items) {
        if (!Array.isArray(items) || items.length === 0) return items;
        return items.sort((a, b) => {
            if (a.date && b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return 0;
        });
    },

    // ===== 合并数据（修复版） =====
    mergeAll(data) {
        console.log('🔄 开始合并云端数据...');
        
        for (let [moduleKey, cloudData] of Object.entries(data)) {
            console.log(`📦 处理模块: ${moduleKey}`);
            
            let localData = this.get(moduleKey, {});
            console.log(`  └─ 本地 history: ${localData.history?.length || 0} 条`);
            console.log(`  └─ 云端 history: ${cloudData.history?.length || 0} 条`);
            
            // ✅ 修复：如果本地没有数据，或者本地 history 为空，直接使用云端数据
            if (!localData || Object.keys(localData).length === 0 || localData.history?.length === 0) {
                if (cloudData.history && Array.isArray(cloudData.history)) {
                    cloudData.history = this.sortHistory(cloudData.history);
                }
                if (cloudData.records && Array.isArray(cloudData.records)) {
                    cloudData.records = this.sortHistory(cloudData.records);
                }
                this.set(moduleKey, cloudData);
                console.log(`  └─ ✅ 本地无数据或为空，直接使用云端数据 (history: ${cloudData.history?.length || 0} 条)`);
                continue;
            }
            
            const merged = { ...localData };
            
            if (cloudData.history && Array.isArray(cloudData.history)) {
                const localHistory = localData.history || [];
                const combined = [...localHistory, ...cloudData.history];
                const uniqueHistory = this.deduplicateHistory(combined);
                merged.history = this.sortHistory(uniqueHistory);
                console.log(`  └─ 合并后 history: ${merged.history.length} 条`);
            }
            
            if (cloudData.records && Array.isArray(cloudData.records)) {
                const localRecords = localData.records || [];
                const combined = [...localRecords, ...cloudData.records];
                const uniqueRecords = this.deduplicateHistory(combined);
                merged.records = this.sortHistory(uniqueRecords);
            }
            
            for (let [key, value] of Object.entries(cloudData)) {
                if (key !== 'history' && key !== 'records') {
                    merged[key] = value;
                }
            }
            
            this.set(moduleKey, merged);
            console.log(`  └─ ✅ 已保存，最终 history: ${merged.history?.length || 0} 条`);
        }
        console.log('✅ 合并完成！');
    }
};

window.Storage = Storage;
