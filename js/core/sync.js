// ============================================================
//  ☁️ 同步核心 - 完整版（含查询功能）
// ============================================================
const GitHubSync = {
    token: '',
    repoOwner: 'FFzelda',
    repoName: 'my-data',
    filePath: 'db.json',

    config(options) {
        Object.assign(this, options);
        if (options.token) {
            localStorage.setItem('gitee_token', options.token);
        }
    },

    getToken() {
        if (this.token) return this.token;
        const stored = localStorage.getItem('gitee_token');
        if (stored) {
            this.token = stored;
            return stored;
        }
        return '';
    },

    setToken(token) {
        this.token = token;
        localStorage.setItem('gitee_token', token);
    },

    hasToken() {
        return !!this.getToken();
    },

    getApiUrl() {
        return `https://gitee.com/api/v5/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
    },

    // ===== 统计模块数据条数 =====
    countData(data) {
        const counts = {};
        let total = 0;
        for (let [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object') {
                const historyCount = value.history?.length || 0;
                const recordsCount = value.records?.length || 0;
                counts[key] = { history: historyCount, records: recordsCount };
                total += historyCount + recordsCount;
            }
        }
        return { total, details: counts };
    },

    // ===== 查询云端数据总数 =====
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

    // ===== Base64 编码（安全版本） =====
    encodeBase64(str) {
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(str);
        let binary = '';
        for (let i = 0; i < dataBytes.length; i++) {
            binary += String.fromCharCode(dataBytes[i]);
        }
        return btoa(binary);
    },

    // ===== Base64 解码（安全版本） =====
    decodeBase64(base64Str) {
        const binaryStr = atob(base64Str);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    },

    // ===== 同步到云端 =====
    async syncToCloud() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token' };
        }

        let allData = Storage.getAll();
        
        for (let [key, value] of Object.entries(allData)) {
            if (value && typeof value === 'object') {
                if (value.history && Array.isArray(value.history)) {
                    value.history.sort((a, b) => {
                        if (a.date && b.date) {
                            return new Date(b.date) - new Date(a.date);
                        }
                        return 0;
                    });
                }
                if (value.records && Array.isArray(value.records)) {
                    value.records.sort((a, b) => {
                        if (a.date && b.date) {
                            return new Date(b.date) - new Date(a.date);
                        }
                        return 0;
                    });
                }
            }
        }

        // 合并云端和本地数据
        try {
            const checkRes = await fetch(this.getApiUrl(), {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.content) {
                    const jsonStr = this.decodeBase64(checkData.content);
                    const cloudData = JSON.parse(jsonStr);
                    if (cloudData.modules) {
                        for (let [key, cloudValue] of Object.entries(cloudData.modules)) {
                            if (allData[key]) {
                                if (cloudValue.history && allData[key].history) {
                                    const combined = [...cloudValue.history, ...allData[key].history];
                                    const seen = new Set();
                                    const unique = [];
                                    for (let item of combined) {
                                        const key2 = item.date || JSON.stringify(item);
                                        if (!seen.has(key2)) {
                                            seen.add(key2);
                                            unique.push(item);
                                        }
                                    }
                                    unique.sort((a, b) => {
                                        if (a.date && b.date) {
                                            return new Date(b.date) - new Date(a.date);
                                        }
                                        return 0;
                                    });
                                    allData[key].history = unique;
                                }
                                if (cloudValue.records && allData[key].records) {
                                    const combined = [...cloudValue.records, ...allData[key].records];
                                    const seen = new Set();
                                    const unique = [];
                                    for (let item of combined) {
                                        const key2 = item.date || JSON.stringify(item);
                                        if (!seen.has(key2)) {
                                            seen.add(key2);
                                            unique.push(item);
                                        }
                                    }
                                    allData[key].records = unique;
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {
            console.log('⚠️ 无法读取云端数据，将创建新文件');
        }

        const stats = this.countData(allData);
        console.log(`📊 上传数据总计: ${stats.total} 条`);

        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            modules: allData
        };

        const url = this.getApiUrl();
        let sha = null;

        try {
            const getRes = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (getRes.ok) {
                const info = await getRes.json();
                sha = info.sha;
            }

            const jsonStr = JSON.stringify(data, null, 2);
            const content = this.encodeBase64(jsonStr);

            const putRes = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `更新数据 - ${new Date().toLocaleString()}`,
                    content: content,
                    sha: sha
                })
            });

            if (putRes.ok) {
                console.log('✅ 同步成功！');
                // 同步后查询云端数据
                const checkResult = await this.checkCloudData();
                return { 
                    success: true, 
                    message: checkResult.success ? `✅ 同步成功！云端共 ${checkResult.total} 条数据` : '✅ 同步成功！',
                    total: checkResult.total || stats.total,
                    details: checkResult.details || stats.details
                };
            } else {
                const err = await putRes.json();
                return { success: false, message: '❌ 同步失败：' + (err.message || '未知错误') };
            }
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    },

    // ===== 从云端拉取 =====
    async syncFromCloud() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token' };
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
                return { success: false, message: '❌ 拉取失败：' + (err.message || '文件不存在') };
            }

            const data = await res.json();
            
            if (!data.content) {
                return { success: false, message: '❌ 数据格式错误' };
            }

            const jsonStr = this.decodeBase64(data.content);
            const content = JSON.parse(jsonStr);

            // 统计云端数据
            const cloudStats = this.countData(content.modules || {});

            if (content.modules) {
                Storage.mergeAll(content.modules);
                
                // 统计本地数据
                const localStats = this.countData(Storage.getAll());
                
                if (typeof PetRingModule !== 'undefined' && PetRingModule.render) {
                    PetRingModule.render();
                }
                if (typeof TreePlantModule !== 'undefined' && TreePlantModule.render) {
                    TreePlantModule.render();
                }
                if (typeof App !== 'undefined' && App.refreshAll) {
                    App.refreshAll();
                }
                
                return { 
                    success: true, 
                    message: `✅ 拉取成功！云端 ${cloudStats.total} 条数据已合并，本地共 ${localStats.total} 条`,
                    cloudTotal: cloudStats.total,
                    localTotal: localStats.total,
                    details: cloudStats.details
                };
            } else {
                return { success: false, message: '❌ 数据格式不兼容' };
            }
        } catch (error) {
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
