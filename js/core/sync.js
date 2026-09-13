// ============================================================
//  ☁️ 同步核心 - V4 安全合并架构（防丢失）
// ============================================================
const GitHubSync = {
    token: '',
    repoOwner: localStorage.getItem('gitee_username') || 'FFzelda',
    repoName: 'my-data',
    filePath: 'db.json',

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

    // ===== 🆕 把顶层 history 转成 V3 结构（供同步用） =====
    normalizeToV3(moduleKey, data) {
        if (!data) return data;
        
        const v3 = data.__sync_v3 || { history: [], records: [], _meta: {} };
        
        // 如果顶层 history 有数据，且 V3 里没有（或更少），把顶层转过去
        if (data.history && data.history.length > 0) {
            if (!v3.history || v3.history.length < data.history.length) {
                v3.history = data.history.map((h, idx) => {
                    // 如果历史记录本身已经带了 _id，就用
                    if (h._id && h._createdAt) {
                        return { _id: h._id, _createdAt: h._createdAt, payload: h };
                    }
                    return {
                        _id: `${moduleKey}_hist_${h.date || Date.now()}_${idx}_${Math.random().toString(36).substr(2,4)}`,
                        _createdAt: h._createdAt || h.date || new Date().toISOString(),
                        payload: h
                    };
                });
            }
        }
        
        // 如果顶层 records 有数据，且 V3 里没有，也转过去
        if (data.records && data.records.length > 0) {
            if (!v3.records || v3.records.length < data.records.length) {
                v3.records = data.records.map((r, idx) => {
                    if (r._id && r._createdAt) {
                        return { _id: r._id, _createdAt: r._createdAt, _index: r.taskIndex || idx + 1, payload: r };
                    }
                    return {
                        _id: `${moduleKey}_rec_${Date.now()}_${idx}_${Math.random().toString(36).substr(2,4)}`,
                        _createdAt: r.date || new Date().toISOString(),
                        _index: r.taskIndex || idx + 1,
                        payload: r
                    };
                });
            }
        }
        
        data.__sync_v3 = v3;
        return data;
    },

    // ===== 查询云端数据 =====
    async checkCloudData() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token', total: 0 };
        }

        const url = this.getApiUrl();

        try {
            const res = await fetch(url, {
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

            const jsonStr = this.decodeBase64(data.content);
            const content = JSON.parse(jsonStr);

            const stats = this.countData(content.modules || {});
            return { 
                success: true, 
                message: `✅ 云端共有 ${stats.total} 条数据`,
                total: stats.total,
                details: stats.details,
                timestamp: content.timestamp
            };
        } catch (error) {
            console.error('❌ 查询云端数据失败:', error);
            return { success: false, message: '❌ 网络错误：' + error.message, total: 0 };
        }
    },

    countData(data) {
        const counts = {};
        let total = 0;
        for (let [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object') {
                const historyCount = (value.__sync_v3?.history?.length) || (value.history?.length) || 0;
                const recordsCount = (value.__sync_v3?.records?.length) || (value.records?.length) || 0;
                counts[key] = { history: historyCount, records: recordsCount };
                total += historyCount + recordsCount;
            }
        }
        return { total, details: counts };
    },

    // ============================================================
    //  核心同步引擎 - 上传（合并）
    // ============================================================
    async syncToCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        // 1. 获取本地所有数据
        let localModules = Storage.getAllForSync();
        
        // 2. 🆕 关键：把每个模块的顶层 history/records 转成 V3 结构
        for (let [moduleKey, localData] of Object.entries(localModules)) {
            localModules[moduleKey] = this.normalizeToV3(moduleKey, localData);
        }
        
        // 3. 尝试拉取云端数据
        let cloudModules = null;
        try {
            const res = await fetch(this.getApiUrl(), {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.content) {
                    const jsonStr = this.decodeBase64(data.content);
                    cloudModules = JSON.parse(jsonStr).modules || {};
                }
            }
        } catch (e) { console.log('🔍 云端无数据或读取失败'); }

        // 4. 执行合并逻辑
        const finalModules = {};
        for (let [moduleKey, localData] of Object.entries(localModules)) {
            const cloudData = cloudModules ? cloudModules[moduleKey] : null;
            const localV3 = localData.__sync_v3 || { history: [], records: [], _meta: { lastUpdated: 0 } };
            const cloudV3 = cloudData ? cloudData.__sync_v3 : null;

            // ========== 跑商助手：配置类，最新时间戳直接替换 ==========
            if (moduleKey === 'shopHelper') {
                const localTime = localV3._meta?.lastUpdated || 0;
                const cloudTime = cloudV3?._meta?.lastUpdated || 0;
                finalModules['shopHelper'] = (cloudTime > localTime) ? cloudData : localData;
                continue; 
            }

            // ========== 其他模块：安全合并 ==========
            // 历史：绝对ID去重
            let historyMap = new Map();
            if (cloudV3 && cloudV3.history) {
                cloudV3.history.forEach(h => {
                    if (h._id) historyMap.set(h._id, h);
                });
            }
            localV3.history.forEach(h => {
                if (!h._id) return;
                const existing = historyMap.get(h._id);
                if (!existing || (h._createdAt > existing._createdAt)) {
                    historyMap.set(h._id, h);
                }
            });
            const finalHistory = Array.from(historyMap.values());
            
            // 历史按时间倒序排序（最新在前）
            finalHistory.sort((a, b) => {
                const ta = new Date(a._createdAt || 0).getTime();
                const tb = new Date(b._createdAt || 0).getTime();
                return tb - ta;
            });

            // 当前轮次：按 _id 去重
            let recordsMap = new Map();
            if (cloudV3 && cloudV3.records) {
                cloudV3.records.forEach(r => {
                    if (r._id) recordsMap.set(r._id, r);
                });
            }
            localV3.records.forEach(r => {
                if (!r._id) return;
                const existing = recordsMap.get(r._id);
                if (!existing || (r._createdAt > existing._createdAt)) {
                    recordsMap.set(r._id, r);
                }
            });
            let finalRecords = Array.from(recordsMap.values());
            finalRecords.sort((a, b) => (a._index || 0) - (b._index || 0));

            // 🆕 合并后的顶层 history（供页面显示）
            const mergedTopHistory = finalHistory
                .map(h => h.payload || h)
                .filter(Boolean);

            finalModules[moduleKey] = {
                ...localData,
                history: mergedTopHistory,  // 🆕 顶层也更新
                __sync_v3: {
                    history: finalHistory,
                    records: finalRecords,
                    _meta: { 
                        version: '3.0', 
                        lastUpdated: Date.now(),
                        lastDeviceId: 'toolbox_sync'
                    }
                }
            };
        }
        
        // 5. 构造并上传
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
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `数据同步 - ${new Date().toLocaleString()} (V4安全合并)`,
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
    //  核心同步引擎 - 拉取（安全合并，不覆盖）
    // ============================================================
    async syncFromCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        try {
            const url = this.getApiUrl();
            const res = await fetch(url, {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            });

            if (!res.ok) {
                const err = await res.json();
                return { success: false, message: '❌ 拉取失败：' + (err.message || '文件不存在') };
            }

            const data = await res.json();
            if (!data.content) return { success: false, message: '❌ 云端数据为空' };

            const jsonStr = this.decodeBase64(data.content);
            const content = JSON.parse(jsonStr);

            if (!content.modules) {
                return { success: false, message: '❌ 云端格式兼容失败' };
            }

            console.log('☁️ 开始安全拉取（合并模式）...');
            let mergedCount = 0;
            let addedCount = 0;

            for (let [moduleKey, cloudData] of Object.entries(content.modules)) {
                
                // ========== 跑商：配置类，直接覆盖 ==========
                if (moduleKey === 'shopHelper') {
                    localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                    continue;
                }
                
                // ========== 其他模块：安全合并 ==========
                // 1. 读取本地数据
                let localData = {};
                try {
                    const raw = localStorage.getItem(`toolbox_${moduleKey}`);
                    if (raw) localData = JSON.parse(raw);
                } catch (e) { localData = {}; }
                
                // 2. 本地为空，直接用云端
                if (!localData || Object.keys(localData).length === 0) {
                    localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                    continue;
                }
                
                // 3. 归一化本地（防止顶层有数据但 V3 是空的）
                localData = this.normalizeToV3(moduleKey, localData);
                
                const localV3 = localData.__sync_v3 || { history: [], records: [] };
                const cloudV3 = cloudData.__sync_v3 || { history: [], records: [] };
                
                // 4. 合并历史（按 _id 去重）
                const historyMap = new Map();
                // 先放云端的
                (cloudV3.history || []).forEach(h => {
                    if (h._id) historyMap.set(h._id, h);
                });
                const cloudHistoryCount = historyMap.size;
                // 再放本地的
                (localV3.history || []).forEach(h => {
                    if (!h._id) return;
                    const existing = historyMap.get(h._id);
                    if (!existing || (h._createdAt > existing._createdAt)) {
                        historyMap.set(h._id, h);
                    }
                });
                const mergedHistory = Array.from(historyMap.values());
                addedCount += mergedHistory.length - cloudHistoryCount;
                
                // 历史按时间倒序排序
                mergedHistory.sort((a, b) => {
                    const ta = new Date(a._createdAt || 0).getTime();
                    const tb = new Date(b._createdAt || 0).getTime();
                    return tb - ta;
                });
                
                // 5. 合并当前轮次（按 _id 去重）
                const recordsMap = new Map();
                (cloudV3.records || []).forEach(r => {
                    if (r._id) recordsMap.set(r._id, r);
                });
                (localV3.records || []).forEach(r => {
                    if (!r._id) return;
                    const existing = recordsMap.get(r._id);
                    if (!existing || (r._createdAt > existing._createdAt)) {
                        recordsMap.set(r._id, r);
                    }
                });
                const mergedRecords = Array.from(recordsMap.values());
                mergedRecords.sort((a, b) => (a._index || 0) - (b._index || 0));
                
                // 6. 合并后的顶层 history（供页面显示）
                const mergedTopHistory = mergedHistory
                    .map(h => h.payload || h)
                    .filter(Boolean);
                
                // 7. 写回本地
                localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify({
                    ...cloudData,
                    history: mergedTopHistory,  // 🆕 顶层也更新
                    records: localData.records || cloudData.records || [],
                    __sync_v3: {
                        history: mergedHistory,
                        records: mergedRecords,
                        _meta: { version: '3.0', lastUpdated: Date.now() }
                    }
                }));
                
                mergedCount++;
            }

            setTimeout(() => {
                console.log('🔄 页面刷新...');
                location.reload();
            }, 800);

            return { 
                success: true, 
                message: `✅ 拉取成功！已合并 ${mergedCount} 个模块，新增 ${addedCount} 条历史` 
            };
        } catch (error) {
            console.error('❌ 拉取失败:', error);
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
