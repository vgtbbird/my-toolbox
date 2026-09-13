// ============================================================
//  ☁️ 同步核心 - V4 安全合并架构（防丢失）
//  核心逻辑：
//    1. 历史轮次：按 _id 合并去重，永不丢失
//    2. 当前轮次：按 recordsLastUpdated 整体取最新
//    3. 配置类模块：按 lastUpdated 取最新
//    4. 拉取时：本地 + 云端合并，不覆盖
//    5. 兼容旧数据：通过 Storage.get 自动迁移
// ============================================================
const GitHubSync = {
    token: '',
    repoOwner: localStorage.getItem('gitee_username') || 'FFzelda',
    repoName: 'my-data',
    filePath: 'db.json',

    // 🆕 配置类模块（只有配置，没有历史，直接取最新）
    CONFIG_MODULES: ['shopHelper', 'equipmentQuery', 'petEquipmentQuery'],

    config(options) {
        Object.assign(this, options);
        if (options.token) localStorage.setItem('gitee_token', options.token);
        if (options.repoOwner) {
            localStorage.setItem('gitee_username', options.repoOwner);
            this.repoOwner = options.repoOwner;
        }
    },

    getToken() {
        if (this.token) return this.token;
        const stored = localStorage.getItem('gitee_token');
        if (stored) { this.token = stored; return stored; }
        return '';
    },
    setToken(token) { this.token = token; localStorage.setItem('gitee_token', token); },
    getUser() {
        const stored = localStorage.getItem('gitee_username');
        if (stored) { this.repoOwner = stored; return stored; }
        return '';
    },
    setUser(username) { this.repoOwner = username; localStorage.setItem('gitee_username', username); },
    hasToken() { return !!this.getToken(); },
    getApiUrl() {
        return `https://gitee.com/api/v5/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
    },

    encodeBase64(str) { return btoa(unescape(encodeURIComponent(str))); },
    decodeBase64(base64Str) {
        try { return decodeURIComponent(escape(atob(base64Str))); } 
        catch (e) {
            try {
                const binaryStr = atob(base64Str);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                return new TextDecoder('utf-8').decode(bytes);
            } catch (e2) { return atob(base64Str); }
        }
    },

    // ============================================================
    //  判断是否为配置类模块
    // ============================================================
    isConfigModule(moduleKey) {
        return this.CONFIG_MODULES.includes(moduleKey);
    },

    // ============================================================
    //  归一化：确保数据有完整的 V3 结构
    //  把顶层 history/records 同步到 __sync_v3
    // ============================================================
    normalizeToV3(moduleKey, data) {
        if (!data) return data;
        
        if (!data.__sync_v3) {
            data.__sync_v3 = { history: [], records: [], _meta: {} };
        }
        const v3 = data.__sync_v3;
        
        if (!v3._meta) v3._meta = {};
        if (!v3._meta.version) v3._meta.version = '3.0';
        if (!v3._meta.lastUpdated) v3._meta.lastUpdated = Date.now();
        
        // 顶层 history → V3 history
        if (Array.isArray(data.history) && data.history.length > 0) {
            const existingDates = new Set((v3.history || []).map(h => (h.payload || h).date));
            data.history.forEach((h, idx) => {
                if (h.date && existingDates.has(h.date)) return;
                v3.history.push({
                    _id: h._id || `${moduleKey}_hist_${h.date || Date.now()}_${idx}_${Math.random().toString(36).substr(2,6)}`,
                    _createdAt: h._createdAt || h.date || new Date().toISOString(),
                    payload: h
                });
            });
        }
        
        // 顶层 records → V3 records
        if (Array.isArray(data.records) && data.records.length > 0) {
            const existingIds = new Set((v3.records || []).map(r => r._id));
            data.records.forEach((r, idx) => {
                const newId = r.id || r._id || `${moduleKey}_rec_${Date.now()}_${idx}`;
                if (existingIds.has(newId)) return;
                v3.records.push({
                    _id: newId,
                    _index: r.taskIndex || idx + 1,
                    _createdAt: r._createdAt || r.date || new Date().toISOString(),
                    runId: r.runId || data.currentRunId || 'unknown_run',
                    payload: r
                });
            });
        }
        
        // 补全 recordsLastUpdated
        if (v3._meta.recordsLastUpdated === undefined) {
            const recs = v3.records || [];
            if (recs.length > 0) {
                const lastRec = recs[recs.length - 1];
                v3._meta.recordsLastUpdated = new Date(lastRec._createdAt || 0).getTime() || 0;
            } else {
                v3._meta.recordsLastUpdated = 0;
            }
        }
        
        return data;
    },

    // ============================================================
    //  核心合并函数：数据类模块（有历史轮次）
    // ============================================================
    mergeDataModule(moduleKey, localData, cloudData) {
        localData = this.normalizeToV3(moduleKey, localData || {});
        cloudData = this.normalizeToV3(moduleKey, cloudData || {});
        
        const localV3 = localData.__sync_v3 || { history: [], records: [], _meta: {} };
        const cloudV3 = cloudData.__sync_v3 || { history: [], records: [], _meta: {} };
        
        // ===== 1. 合并历史（按 _id + 日期去重，永不丢失） =====
        const historyMap = new Map();
        const historyDates = new Set();  // 🆕 用日期做辅助去重
        
        // 先放云端的
        (cloudV3.history || []).forEach(h => {
            if (h._id) {
                historyMap.set(h._id, h);
                const d = (h.payload || h).date;
                if (d) historyDates.add(d);
            }
        });
        
        // 再放本地的（如果有相同的 _id 或相同的日期，跳过）
        (localV3.history || []).forEach(h => {
            if (!h._id) return;
            const d = (h.payload || h).date;
            
            // 🆕 如果日期已经存在，跳过（防止重复）
            if (d && historyDates.has(d)) return;
            
            const existing = historyMap.get(h._id);
            if (!existing || (h._createdAt > existing._createdAt)) {
                historyMap.set(h._id, h);
                if (d) historyDates.add(d);
            }
        });
        
        const mergedHistory = Array.from(historyMap.values());
        // 按时间倒序（最新在前）
        mergedHistory.sort((a, b) => {
            const ta = new Date(a._createdAt || 0).getTime();
            const tb = new Date(b._createdAt || 0).getTime();
            return tb - ta;
        });
        
        // ===== 2. 合并当前轮次（按 recordsLastUpdated 取最新） =====
        const localRecTime = localV3._meta?.recordsLastUpdated || 0;
        const cloudRecTime = cloudV3._meta?.recordsLastUpdated || 0;
        
        let mergedRecords;
        if (cloudRecTime > localRecTime) {
            // 云端的更新
            mergedRecords = cloudV3.records || [];
        } else if (localRecTime > cloudRecTime) {
            // 本地的更新
            mergedRecords = localV3.records || [];
        } else {
            // 一样新，取更长的那份
            mergedRecords = (cloudV3.records || []).length > (localV3.records || []).length
                ? cloudV3.records
                : localV3.records;
        }
        
        // ===== 3. 生成顶层 history（供模块直接用） =====
        const mergedTopHistory = mergedHistory.map(h => h.payload || h).filter(Boolean);
        
        // ===== 4. 生成顶层 records（供模块直接用） =====
        const mergedTopRecords = mergedRecords.map(r => r.payload || r).filter(Boolean);
        
        // ===== 5. 合成最终数据 =====
        return {
            // 保留本地所有字段（防止某些模块特有字段丢失）
            ...localData,
            // 云端字段覆盖（配置类同步）
            ...cloudData,
            // 🆕 合并后的顶层数据
            history: mergedTopHistory,
            records: mergedTopRecords,
            // 🆕 合并后的 V3 数据
            __sync_v3: {
                history: mergedHistory,
                records: mergedRecords,
                _meta: {
                    version: '3.0',
                    lastUpdated: Date.now(),
                    recordsLastUpdated: Math.max(localRecTime, cloudRecTime)
                }
            }
        };
    },

    // ============================================================
    //  核心合并函数：配置类模块（只有配置，无历史）
    // ============================================================
    mergeConfigModule(localData, cloudData) {
        const localTime = localData?.__sync_v3?._meta?.lastUpdated || 0;
        const cloudTime = cloudData?.__sync_v3?._meta?.lastUpdated || 0;
        
        // 取最新的
        return (cloudTime > localTime) ? cloudData : localData;
    },

    // ============================================================
    //  统一入口：合并本地和云端数据
    // ============================================================
    mergeModule(moduleKey, localData, cloudData) {
        if (this.isConfigModule(moduleKey)) {
            return this.mergeConfigModule(localData, cloudData);
        }
        return this.mergeDataModule(moduleKey, localData, cloudData);
    },

    // ============================================================
    //  查询云端数据
    // ============================================================
    async checkCloudData() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token', total: 0 };
        }

        try {
            const res = await fetch(this.getApiUrl(), {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!res.ok) {
                const err = await res.json();
                return { success: false, message: '❌ 查询失败：' + (err.message || '文件不存在'), total: 0 };
            }

            const data = await res.json();
            if (!data.content) {
                return { success: false, message: '❌ 数据格式错误', total: 0 };
            }

            const content = JSON.parse(this.decodeBase64(data.content));
            const stats = this.countData(content.modules || {});
            
            return { 
                success: true, 
                message: `✅ 云端共有 ${stats.total} 条数据`,
                total: stats.total,
                details: stats.details,
                timestamp: content.timestamp
            };
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message, total: 0 };
        }
    },

    countData(data) {
        const counts = {};
        let total = 0;
        for (let [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object') {
                const historyCount = value.__sync_v3?.history?.length || value.history?.length || 0;
                const recordsCount = value.__sync_v3?.records?.length || value.records?.length || 0;
                counts[key] = { history: historyCount, records: recordsCount };
                total += historyCount + recordsCount;
            }
        }
        return { total, details: counts };
    },

    // ============================================================
    //  同步上传（安全合并后上传）
    // ============================================================
    async syncToCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        // 1. 获取本地所有数据（Storage.get 会自动迁移）
        const localModules = Storage.getAllForSync();
        
        // 2. 获取云端数据
        let cloudModules = {};
        try {
            const res = await fetch(this.getApiUrl(), {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.content) {
                    cloudModules = JSON.parse(this.decodeBase64(data.content)).modules || {};
                }
            }
        } catch (e) { console.log('🔍 云端无数据'); }

        // 3. 合并每个模块
        const finalModules = {};
        for (let [moduleKey, localData] of Object.entries(localModules)) {
            const cloudData = cloudModules[moduleKey] || {};
            finalModules[moduleKey] = this.mergeModule(moduleKey, localData, cloudData);
        }
        
        // 4. 上传
        const payload = {
            version: '3.0',
            timestamp: new Date().toISOString(),
            modules: finalModules
        };
        
        try {
            const url = this.getApiUrl();
            let sha = null;
            const getRes = await fetch(url, {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            });
            if (getRes.ok) {
                const info = await getRes.json();
                sha = info.sha;
            }

            const putRes = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Authorization': `token ${token}`, 
                    'Accept': 'application/vnd.github.v3+json', 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    message: `同步 - ${new Date().toLocaleString()} (V4安全合并)`,
                    content: this.encodeBase64(JSON.stringify(payload, null, 2)),
                    sha: sha
                })
            });

            if (putRes.ok) {
                // 上传成功后，把合并后的数据写回本地
                for (let [moduleKey, mergedData] of Object.entries(finalModules)) {
                    localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(mergedData));
                }
                return { success: true, message: `✅ 同步成功！数据已合并` };
            } else {
                const err = await putRes.json();
                return { success: false, message: '❌ 同步失败：' + (err.message || '未知错误') };
            }
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    },

    // ============================================================
    //  从云端拉取（安全合并，不覆盖本地）
    // ============================================================
    async syncFromCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        try {
            const res = await fetch(this.getApiUrl(), {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            });

            if (!res.ok) {
                const err = await res.json();
                return { success: false, message: '❌ 拉取失败：' + (err.message || '文件不存在') };
            }

            const data = await res.json();
            if (!data.content) return { success: false, message: '❌ 云端数据为空' };

            const content = JSON.parse(this.decodeBase64(data.content));
            if (!content.modules) return { success: false, message: '❌ 云端格式错误' };

            console.log('☁️ 开始安全拉取（合并模式）...');
            let mergedCount = 0;
            let addedHistoryCount = 0;

            for (let [moduleKey, cloudData] of Object.entries(content.modules)) {
                // 读取本地数据（Storage.get 会自动迁移）
                const localData = Storage.get(moduleKey, {});
                
                // 如果本地为空，直接用云端
                if (!localData || Object.keys(localData).length === 0) {
                    localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                    continue;
                }
                
                // 合并
                const mergedData = this.mergeModule(moduleKey, localData, cloudData);
                
                // 统计新增历史
                const localHistCount = (localData.__sync_v3?.history || localData.history || []).length;
                const mergedHistCount = (mergedData.__sync_v3?.history || []).length;
                addedHistoryCount += Math.max(0, mergedHistCount - localHistCount);
                
                // 写回本地
                localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(mergedData));
                mergedCount++;
            }

            // 刷新页面
            setTimeout(() => {
                console.log('🔄 页面刷新...');
                location.reload();
            }, 800);

            return { 
                success: true, 
                message: `✅ 拉取成功！已合并 ${mergedCount} 个模块，新增 ${addedHistoryCount} 条历史` 
            };
        } catch (error) {
            console.error('❌ 拉取失败:', error);
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
