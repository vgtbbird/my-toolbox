// ============================================================
//  📦 存储核心 - V4 自动迁移 + 安全同步架构
//  功能：
//    1. 自动把旧数据（顶层 history/records）迁移到 V3 结构
//    2. 保证每条历史有唯一 _id 和 _createdAt
//    3. 提供同步专用的 getAllForSync
// ============================================================
const Storage = {
    // ============================================================
    //  获取某个模块的数据（自动迁移旧格式）
    // ============================================================
    get(moduleKey, defaultValue = null) {
        try {
            const raw = localStorage.getItem(`toolbox_${moduleKey}`);
            if (!raw) return defaultValue;

            let data = JSON.parse(raw);
            let needSave = false;

            // ========== 迁移 1：没有 __sync_v3，创建空的 ==========
            if (!data.__sync_v3) {
                data.__sync_v3 = { history: [], records: [], _meta: {} };
                needSave = true;
                console.log(`🛡️ [${moduleKey}] 创建 V3 结构`);
            }

            const v3 = data.__sync_v3;

            // ========== 迁移 2：补全 _meta ==========
            if (!v3._meta) {
                v3._meta = {};
                needSave = true;
            }
            if (!v3._meta.version) {
                v3._meta.version = '3.0';
                needSave = true;
            }
            if (!v3._meta.lastUpdated) {
                v3._meta.lastUpdated = Date.now();
                needSave = true;
            }

            // ========== 迁移 3：顶层 history → V3 history ==========
            if (Array.isArray(data.history) && data.history.length > 0) {
                const topCount = data.history.length;
                const v3Count = (v3.history || []).length;
                
                if (v3Count < topCount) {
                    // 顶层有数据但 V3 不全，迁移过去
                    // 用日期作为 key 去重，避免重复迁移
                    const existingIds = new Set((v3.history || []).map(h => h._id));
                    const existingDates = new Set((v3.history || []).map(h => {
                        const p = h.payload || h;
                        return p.date;
                    }));
                    
                    data.history.forEach((h, idx) => {
                        // 如果这条历史已经在 V3 里（按日期判断），跳过
                        if (h.date && existingDates.has(h.date)) return;
                        // 如果已经有 _id，直接放进去
                        if (h._id && existingIds.has(h._id)) return;
                        
                       const newId = h._id || `${moduleKey}_hist_${h.date || Date.now()}_${idx}`;
                        v3.history.push({
                            _id: newId,
                            _createdAt: h._createdAt || h.date || new Date().toISOString(),
                            payload: h
                        });
                    });
                    
                    // 按时间倒序
                    v3.history.sort((a, b) => {
                        const ta = new Date(a._createdAt || 0).getTime();
                        const tb = new Date(b._createdAt || 0).getTime();
                        return tb - ta;
                    });
                    
                    needSave = true;
                    console.log(`🛡️ [${moduleKey}] 迁移 ${topCount} 条历史到 V3`);
                }
            }

            // ========== 迁移 4：顶层 records → V3 records ==========
            if (Array.isArray(data.records) && data.records.length > 0) {
                const topCount = data.records.length;
                const v3Count = (v3.records || []).length;
                
                if (v3Count < topCount) {
                    const existingIds = new Set((v3.records || []).map(r => r._id));
                    
                    data.records.forEach((r, idx) => {
                       const newId = r.id || r._id || `${moduleKey}_rec_${r.date || Date.now()}_${idx}`;
                        if (existingIds.has(newId)) return;
                        
                        v3.records.push({
                            _id: newId,
                            _index: r.taskIndex || idx + 1,
                            _createdAt: r._createdAt || r.date || new Date().toISOString(),
                            runId: r.runId || data.currentRunId || 'legacy_run',
                            payload: r
                        });
                    });
                    
                    v3.records.sort((a, b) => (a._index || 0) - (b._index || 0));
                    
                    needSave = true;
                    console.log(`🛡️ [${moduleKey}] 迁移 ${topCount} 条当前轮次到 V3`);
                }
            }

            // ========== 迁移 5：补全 recordsLastUpdated ==========
            if (v3._meta.recordsLastUpdated === undefined) {
                const recs = v3.records || [];
                if (recs.length > 0) {
                    // 用最后一环的时间戳
                    const lastRec = recs[recs.length - 1];
                    v3._meta.recordsLastUpdated = new Date(lastRec._createdAt || 0).getTime() || 0;
                } else {
                    v3._meta.recordsLastUpdated = 0;
                }
                needSave = true;
            }

            // ========== 迁移后保存 ==========
            if (needSave) {
                localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(data));
            }

            return data;
        } catch (e) {
            console.error(`❌ 读取 [${moduleKey}] 失败:`, e);
            return defaultValue;
        }
    },

    // ============================================================
    //  保存某个模块的数据
    //  会自动更新 _meta.lastUpdated
    //  ⚠️ 模块代码只需要关心业务字段，V3 结构由模块自己维护
    // ============================================================
    set(moduleKey, data) {
        try {
            // 确保 V3 结构存在
            if (!data.__sync_v3) {
                data.__sync_v3 = { history: [], records: [], _meta: {} };
            }
            if (!data.__sync_v3._meta) {
                data.__sync_v3._meta = {};
            }
            
            // 更新 lastUpdated
            data.__sync_v3._meta.lastUpdated = Date.now();
            
            // 保证 version 存在
            if (!data.__sync_v3._meta.version) {
                data.__sync_v3._meta.version = '3.0';
            }
            
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
    //  会自动触发迁移逻辑
    // ============================================================
    getAllForSync() {
        const all = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('toolbox_')) {
                const moduleKey = key.replace('toolbox_', '');
                // 调用 get，会触发迁移
                all[moduleKey] = this.get(moduleKey, {});
            }
        }
        return all;
    },

    // ============================================================
    //  工具：把一个普通对象转成 V3 历史条目
    //  （模块可以调用这个来规范化自己的历史数据）
    // ============================================================
    makeHistoryEntry(moduleKey, item, index) {
        if (item._id && item._createdAt) {
            return { _id: item._id, _createdAt: item._createdAt, payload: item };
        }
        return {
            _id: item._id || `${moduleKey}_hist_${item.date || Date.now()}_${index}_${Math.random().toString(36).substr(2,6)}`,
            _createdAt: item._createdAt || item.date || new Date().toISOString(),
            payload: item
        };
    },

    // ============================================================
    //  工具：把一个普通对象转成 V3 当前轮次条目
    // ============================================================
    makeRecordEntry(moduleKey, item, index, runId) {
        if (item._id && item._createdAt) {
            return { 
                _id: item._id, 
                _index: item._index || item.taskIndex || index + 1,
                _createdAt: item._createdAt, 
                runId: item.runId || runId,
                payload: item 
            };
        }
        return {
            _id: item.id || item._id || `${moduleKey}_rec_${Date.now()}_${index}_${Math.random().toString(36).substr(2,6)}`,
            _index: item.taskIndex || index + 1,
            _createdAt: item._createdAt || item.date || new Date().toISOString(),
            runId: item.runId || runId || 'unknown_run',
            payload: item
        };
    }
};

window.Storage = Storage;
