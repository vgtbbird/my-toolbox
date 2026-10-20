// ============================================================
//  ☁️ 同步核心 - 精简版（按 runId + 环次 id 合并）
// ============================================================
const GitHubSync = {
    token: '',
    repoOwner: localStorage.getItem('gitee_username') || 'FFzelda',
    repoName: 'my-data',
    filePath: 'db.json',

    // 🆕 配置类模块（只有配置，无历史）
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
    //  合并：配置类模块
    // ============================================================
    mergeConfigModule(moduleKey, localData, cloudData) {
        if (moduleKey === 'shopHelper') {
            if (!cloudData || Object.keys(cloudData).length === 0) return localData;
            return cloudData;
        }
        const localTime = localData?.configLastUpdated || localData?.__sync_v3?._meta?.lastUpdated || 0;
        const cloudTime = cloudData?.configLastUpdated || cloudData?.__sync_v3?._meta?.lastUpdated || 0;
        return (cloudTime > localTime) ? cloudData : localData;
    },

    // ============================================================
    //  合并：数据类模块（有 history + records）
    // ============================================================
    mergeDataModule(moduleKey, localData, cloudData) {
        localData = localData || {};
        cloudData = cloudData || {};
        
        const localV3 = localData.__sync_v3 || { history: [], records: [] };
        const cloudV3 = cloudData.__sync_v3 || { history: [], records: [] };
        
        // ===== 1. 合并 history（按 _id 去重） =====
        const historyMap = new Map();
        for (let h of cloudV3.history || []) {
            if (h._id) historyMap.set(h._id, h);
        }
        for (let h of localV3.history || []) {
            if (!h._id) continue;
            const existing = historyMap.get(h._id);
            if (!existing || (h._createdAt || '') > (existing._createdAt || '')) {
                historyMap.set(h._id, h);
            }
        }
        const mergedHistory = Array.from(historyMap.values());
        mergedHistory.sort((a, b) => {
            const ta = new Date(a._createdAt || 0).getTime();
            const tb = new Date(b._createdAt || 0).getTime();
            return tb - ta;
        });
        
        // ===== 2. 收集已结算的 runId =====
        const settledRunIds = new Set();
        for (let h of mergedHistory) {
            const payload = h.payload || h;
            if (payload.runId) settledRunIds.add(payload.runId);
            if (Array.isArray(payload.rings)) {
                for (let r of payload.rings) {
                    if (r.runId) settledRunIds.add(r.runId);
                }
            }
        }
        
        // ===== 3. 过滤 records 中已结算的 runId =====
        const localRecs = (localV3.records || []).filter(r => {
            const rid = r.runId || r.payload?.runId;
            return rid && !settledRunIds.has(rid);
        });
        const cloudRecs = (cloudV3.records || []).filter(r => {
            const rid = r.runId || r.payload?.runId;
            return rid && !settledRunIds.has(rid);
        });
        
        // ===== 4. 按 runId 分组 =====
        const localByRun = {};
        const cloudByRun = {};
        for (let r of localRecs) {
            const rid = r.runId || r.payload?.runId;
            if (!localByRun[rid]) localByRun[rid] = [];
            localByRun[rid].push(r);
        }
        for (let r of cloudRecs) {
            const rid = r.runId || r.payload?.runId;
            if (!cloudByRun[rid]) cloudByRun[rid] = [];
            cloudByRun[rid].push(r);
        }
        
        // ===== 5. 每个 runId 组内按 id 合并 =====
        const allRunIds = new Set([...Object.keys(localByRun), ...Object.keys(cloudByRun)]);
        const mergedRecords = [];
        for (let runId of allRunIds) {
            const localList = localByRun[runId] || [];
            const cloudList = cloudByRun[runId] || [];
            
            const idMap = new Map();
            for (let r of cloudList) {
                const id = r._id || r.id || r.payload?.id;
                if (id) idMap.set(id, r);
            }
            for (let r of localList) {
                const id = r._id || r.id || r.payload?.id;
                if (!id) continue;
                const existing = idMap.get(id);
                if (!existing) {
                    idMap.set(id, r);
                } else {
                    const tNew = r.deletedAt || r._createdAt || r.createdAt || 0;
                    const tOld = existing.deletedAt || existing._createdAt || existing.createdAt || 0;
                    if (tNew > tOld) idMap.set(id, r);
                }
            }
            
            const list = Array.from(idMap.values());
            list.sort((a, b) => {
                const ia = a._index || a.taskIndex || a.payload?.taskIndex || 0;
                const ib = b._index || b.taskIndex || b.payload?.taskIndex || 0;
                return ia - ib;
            });
            mergedRecords.push(...list);
        }
        
        // ===== 6. 生成顶层数据 =====
        const mergedTopHistory = mergedHistory.map(h => h.payload || h).filter(Boolean);
        const mergedTopRecords = mergedRecords.map(r => r.payload || r).filter(Boolean);
        
        // 🆕 核心修复：如果本地配置是空的，坚决使用云端的配置！
        const finalPrices = Object.keys(localData.prices || {}).length > 0 ? localData.prices : cloudData.prices;
        const finalDeductSettings = Object.keys(localData.deductSettings || {}).length > 0 ? localData.deductSettings : cloudData.deductSettings;
        const finalUiSettings = localData.uiSettings || cloudData.uiSettings;
        const finalExchangeRate = localData.exchangeRate || cloudData.exchangeRate;
        const finalFruitPrice = localData.fruitPrice || cloudData.fruitPrice;

        return {
            ...cloudData,
            ...localData,
            prices: finalPrices,
            deductSettings: finalDeductSettings,
            uiSettings: finalUiSettings,
            exchangeRate: finalExchangeRate,
            fruitPrice: finalFruitPrice,
            history: mergedTopHistory,
            records: mergedTopRecords,
            __sync_v3: {
                history: mergedHistory,
                records: mergedRecords,
                _meta: {
                    version: '3.0',
                    lastUpdated: Date.now(),
                    recordsLastUpdated: Math.max(
                        localV3._meta?.recordsLastUpdated || 0,
                        cloudV3._meta?.recordsLastUpdated || 0
                    )
                }
            }
        };
    },

    // ============================================================
    //  统一入口：合并本地和云端数据
    // ============================================================
    mergeModule(moduleKey, localData, cloudData) {
        if (this.isConfigModule(moduleKey)) {
            return this.mergeConfigModule(moduleKey, localData, cloudData);
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
    //  同步上传
    // ============================================================
    async syncToCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        const localModules = Storage.getAllForSync();
        const finalModules = { ...localModules };
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
                    message: `同步 - ${new Date().toLocaleString()}`,
                    content: this.encodeBase64(JSON.stringify(payload, null, 2)),
                    sha: sha
                })
            });

            if (putRes.ok) {
                return { success: true, message: `✅ 同步成功！数据已上传` };
            } else {
                const err = await putRes.json();
                return { success: false, message: '❌ 同步失败：' + (err.message || '未知错误') };
            }
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    },

    // ============================================================
    //  从云端拉取
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

            console.log('☁️ 开始拉取（合并模式）...');
            let mergedCount = 0;
            let addedHistoryCount = 0;

            for (let [moduleKey, cloudData] of Object.entries(content.modules)) {
                const localData = Storage.get(moduleKey, {});
                
                if (!localData || Object.keys(localData).length === 0) {
                    localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                    continue;
                }
                
                // 🆕 防丢校验（双重保险）
                if (cloudData.prices && Object.keys(cloudData.prices).length > 0) {
                    const localPrices = localData.prices || {};
                    if (Object.keys(localPrices).length === 0) {
                        console.log(`⚠️ ${moduleKey}: 本地配置为空，强制使用云端配置`);
                        localData.prices = cloudData.prices;
                        localData.deductSettings = cloudData.deductSettings;
                        localData.exchangeRate = cloudData.exchangeRate;
                        localData.fruitPrice = cloudData.fruitPrice;
                        localData.uiSettings = cloudData.uiSettings;
                    }
                }
                
                const mergedData = this.mergeModule(moduleKey, localData, cloudData);
                
                const localHistCount = (localData.__sync_v3?.history || localData.history || []).length;
                const mergedHistCount = (mergedData.__sync_v3?.history || []).length;
                addedHistoryCount += Math.max(0, mergedHistCount - localHistCount);
                
                localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(mergedData));
                mergedCount++;
            }

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
