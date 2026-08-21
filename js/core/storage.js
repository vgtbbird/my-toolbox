// ============================================================
//  📦 存储核心 - V3 防丢失/防重复架构
// ============================================================
const Storage = {
    // 获取某个模块的数据 (自动兼容旧格式并升级)
    get(moduleKey, defaultValue = null) {
        try {
            const raw = localStorage.getItem(`toolbox_${moduleKey}`);
            if (!raw) return defaultValue;

            let data = JSON.parse(raw);

            // 🛡️ 自动升级：如果是 V2 旧格式，转化成 V3 双层结构
            if (!data.__sync_v3) {
                console.log(`🛡️ 自动升级模块 [${moduleKey}] 至 V3 防丢架构...`);
                data = this._upgradeToV3(moduleKey, data);
                this.set(moduleKey, data);
            }
            return data;
        } catch (e) {
            console.error('读取失败:', e);
            return defaultValue;
        }
    },

    // 保存某个模块的数据 (会自动维护版本锚点)
    set(moduleKey, data) {
        try {
            // 确保 V3 结构的核心锚点存在
            if (!data.__sync_v3) {
                data.__sync_v3 = { history: [], records: [], _meta: {} };
            }
            // 更新最后操作时间
            data.__sync_v3._meta.lastUpdated = Date.now();
            
            localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    },

    // 🛡️ 过渡期：将旧的 V2 数据无损升级到 V3 新结构
    _upgradeToV3(moduleKey, oldData) {
        const newData = {
            // 原始业务数据依然保留在顶层，保证业务代码（如 render 渲染）不受影响
            ...oldData,
            __sync_v3: {
                // 1. 历史数据：把 oldData.history 打上 V3 的绝对 ID 标签
                history: (oldData.history || []).map((item, idx) => ({
                    _id: `${moduleKey}_hist_${Date.now()}_${idx}_${Math.random().toString(36).substr(2,4)}`,
                    _createdAt: item.date || new Date().toISOString(),
                    payload: item
                })),
                // 2. 当前数据：把 oldData.records 打上 V3 的绝对 ID 标签
                records: (oldData.records || []).map((item, idx) => {
                    // 如果旧数据跑环时已有 ID，尽量保留
                    const existingId = item.id || item._id;
                    return {
                        _id: existingId || `${moduleKey}_rec_${Date.now()}_${idx}_${Math.random().toString(36).substr(2,4)}`,
                        _createdAt: item.date || new Date().toISOString(),
                        // 如果旧数据已经有 runId，则继承
                        _runTag: item.runId || item._runTag || 'legacy_run',
                        _index: item.taskIndex || (idx + 1),
                        payload: item // 原始数据保存在这里
                    };
                }),
                _meta: {
                    version: '3.0',
                    lastUpdated: Date.now(),
                    lastDeviceId: 'migration_tool'
                }
            }
        };
        return newData;
    },

    remove(moduleKey) { localStorage.removeItem(`toolbox_${moduleKey}`); },

    // 批量获取所有模块 (专门供给 sync.js 使用)
    getAllForSync() {
        const all = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('toolbox_')) {
                const moduleKey = key.replace('toolbox_', '');
                // 强制读取 V3 结构，没有则自动升级
                all[moduleKey] = this.get(moduleKey, {});
            }
        }
        return all;
    }
};

window.Storage = Storage;
