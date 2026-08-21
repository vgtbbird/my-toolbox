// ============================================================
//  ☁️ 同步核心 - V3 锚点校验架构
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

            // 统计云端数据
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
                const historyCount = value.__sync_v3?.history?.length || value.history?.length || 0;
                const recordsCount = value.__sync_v3?.records?.length || value.records?.length || 0;
                counts[key] = { history: historyCount, records: recordsCount };
                total += historyCount + recordsCount;
            }
        }
        return { total, details: counts };
    },

    // ===== 核心同步引擎 =====
    async syncToCloud() {
        const token = this.getToken();
        if (!token) return { success: false, message: '❌ 请先设置 Gitee Token' };

        // 1. 获取本地所有 V3 结构数据
        let localModules = Storage.getAllForSync();
        
        // 2. 尝试拉取云端数据，用于锚点比对
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

        // 3. 执行锚点合并逻辑 (防覆盖、防丢失、防重复)
        const finalModules = {};
        for (let [moduleKey, localData] of Object.entries(localModules)) {
            const cloudData = cloudModules ? cloudModules[moduleKey] : null;
            const localV3 = localData.__sync_v3 || { history: [], records: [], _meta: { lastUpdated: 0 } };
            const cloudV3 = cloudData ? cloudData.__sync_v3 : null;

            // ==========================================================
            // 🏃 跑商助手：配置类数据采用“最新时间戳直接替换”模式
            // ==========================================================
            if (moduleKey === 'shopHelper') {
                const localTime = localV3._meta?.lastUpdated || 0;
                const cloudTime = cloudV3?._meta?.lastUpdated || 0;
                if (cloudTime > localTime) {
                    finalModules['shopHelper'] = cloudData;
                } else {
                    finalModules['shopHelper'] = localData;
                }
                continue; 
            }
            // ==========================================================

            // 跑宠环/抓宠/种树等走原有逻辑（绝对ID去重、合并）
            let historyMap = new Map();
            if (cloudV3 && cloudV3.history) {
                cloudV3.history.forEach(h => historyMap.set(h._id, h));
            }
            localV3.history.forEach(h => {
                if (!historyMap.has(h._id) || h._createdAt > historyMap.get(h._id)._createdAt) {
                    historyMap.set(h._id, h);
                }
            });
            const finalHistory = Array.from(historyMap.values());

            let recordsMap = new Map();
            if (cloudV3 && cloudV3.records) {
                cloudV3.records.forEach(r => recordsMap.set(r._id, r));
            }
            localV3.records.forEach(r => {
                if (!recordsMap.has(r._id) || r._createdAt > recordsMap.get(r._id)._createdAt) {
                    recordsMap.set(r._id, r);
                }
            });
            let finalRecords = Array.from(recordsMap.values());
            finalRecords.sort((a, b) => (a._index || 0) - (b._index || 0));

            finalModules[moduleKey] = {
                ...localData,
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
        
        // 4. 构造并上传最终的 db.json
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
                    message: `数据同步 - ${new Date().toLocaleString()} (V3架构)`,
                    content: this.encodeBase64(JSON.stringify(payload, null, 2)),
                    sha: sha
                })
            });

            if (putRes.ok) {
                return { success: true, message: `✅ 同步成功！` };
            } else {
                const err = await putRes.json();
                return { success: false, message: '❌ 同步失败：' + (err.message || '未知错误') };
            }
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    },

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

            if (content.modules) {
                console.log('☁️ 开始安全拉取...');
                // 直接写入本地，因为是全量精准数据
                for (let [moduleKey, cloudData] of Object.entries(content.modules)) {
                    // ==========================================================
                    // 🏃 跑商助手：配置类数据直接覆盖，防止拉取出错
                    // ==========================================================
                    if (moduleKey === 'shopHelper' && cloudData && cloudData.__sync_v3) {
                        localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                        continue; 
                    }
                    // ==========================================================
                    
                    // 其他模块（跑环、抓宠、种树等）保留原有逻辑
                    if (cloudData && cloudData.__sync_v3) {
                        localStorage.setItem(`toolbox_${moduleKey}`, JSON.stringify(cloudData));
                    }
                }

                setTimeout(() => {
                    console.log('🔄 页面刷新...');
                    location.reload();
                }, 500);

                return { success: true, message: '✅ 拉取成功！所有模块数据已同步至最新。' };
            } else {
                return { success: false, message: '❌ 云端格式兼容失败' };
            }
        } catch (error) {
            console.error('❌ 拉取失败:', error);
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
