// ============================================================
//  ☁️ 同步核心 - 支持 petHunt 模块
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

        countData(data) {
            const counts = {};
            let total = 0;
            for (let [key, value] of Object.entries(data)) {
                if (value && typeof value === 'object') {
                    let count = 0;
                    if (key === 'petHunt') {
                        // petHunt 特殊处理
                        const recordsCount = value.records?.length || 0;
                        const petLibraryCount = value.petLibrary?.length || 0;
                        const customScenesCount = value.customScenes?.length || 0;
                        count = recordsCount + petLibraryCount + customScenesCount;
                        counts[key] = { 
                            records: recordsCount, 
                            petLibrary: petLibraryCount, 
                            customScenes: customScenesCount,
                            total: count 
                        };
                    } else {
                        const historyCount = value.history?.length || 0;
                        const recordsCount = value.records?.length || 0;
                        count = historyCount + recordsCount;
                        counts[key] = { history: historyCount, records: recordsCount };
                    }
                    total += count;
                }
            }
            return { total, details: counts };
        },
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

    encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    },

    decodeBase64(base64Str) {
        try {
            return decodeURIComponent(escape(atob(base64Str)));
        } catch (e) {
            try {
                const binaryStr = atob(base64Str);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                return new TextDecoder('utf-8').decode(bytes);
            } catch (e2) {
                return atob(base64Str);
            }
        }
    },

    // ===== 合并两个对象（深度合并） =====
    deepMerge(target, source) {
        const result = { ...target };
        for (let [key, val] of Object.entries(source)) {
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                result[key] = this.deepMerge(target[key] || {}, val);
            } else if (Array.isArray(val)) {
                // 数组不去重合并，直接覆盖（避免重复数据）
                // 但如果两个数组都有值，用源覆盖目标
                result[key] = val;
            } else {
                result[key] = val;
            }
        }
        return result;
    },

    async syncToCloud() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token' };
        }

        let allData = Storage.getAll();
        
        // 排序各模块数据
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

        // 读取云端数据并合并（只对特定模块合并）
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
                                // 处理 petHunt 特有的字段
                                if (key === 'petHunt') {
                                    // petLibrary 和 customScenes 用云端覆盖（去重合并）
                                    if (cloudValue.petLibrary && Array.isArray(cloudValue.petLibrary)) {
                                        const existingNames = new Set(allData[key].petLibrary?.map(p => p.name) || []);
                                        for (let pet of cloudValue.petLibrary) {
                                            if (!existingNames.has(pet.name)) {
                                                allData[key].petLibrary.push(pet);
                                            }
                                        }
                                    }
                                    if (cloudValue.customScenes && Array.isArray(cloudValue.customScenes)) {
                                        const existingScenes = new Set(allData[key].customScenes || []);
                                        for (let scene of cloudValue.customScenes) {
                                            if (!existingScenes.has(scene)) {
                                                allData[key].customScenes.push(scene);
                                            }
                                        }
                                    }
                                    // history 和 records 用原有逻辑
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
                                    // uiSettings 用本地覆盖（用户自己的设置）
                                    if (cloudValue.uiSettings && allData[key].uiSettings) {
                                        // 保留本地设置
                                    }
                                } else {
                                    // petRing / treePlant / equipmentQueryUI 等原有逻辑
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
            console.log('📥 开始拉取数据...');
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

            const cloudStats = this.countData(content.modules || {});
            console.log('☁️ 云端数据:', cloudStats.total, '条');
            console.log('☁️ 各模块详情:', cloudStats.details);

            if (content.modules) {
                // ✅ 覆盖本地（保留宠物库和场景库的合并逻辑）
                const localData = Storage.getAll();
                for (let [key, cloudValue] of Object.entries(content.modules)) {
                    if (key === 'petHunt') {
                        // petHunt 特殊处理：记录和设置覆盖，宠物库和场景库合并
                        const localPetHunt = localData[key] || {};
                        // 记录覆盖
                        if (cloudValue.records) {
                            localPetHunt.records = cloudValue.records;
                        }
                        if (cloudValue.history) {
                            localPetHunt.history = cloudValue.history;
                        }
                        // 宠物库合并（去重）
                        if (cloudValue.petLibrary) {
                            const existingNames = new Set(localPetHunt.petLibrary?.map(p => p.name) || []);
                            for (let pet of cloudValue.petLibrary) {
                                if (!existingNames.has(pet.name)) {
                                    if (!localPetHunt.petLibrary) localPetHunt.petLibrary = [];
                                    localPetHunt.petLibrary.push(pet);
                                }
                            }
                        }
                        // 场景库合并（去重）
                        if (cloudValue.customScenes) {
                            const existingScenes = new Set(localPetHunt.customScenes || []);
                            for (let scene of cloudValue.customScenes) {
                                if (!existingScenes.has(scene)) {
                                    if (!localPetHunt.customScenes) localPetHunt.customScenes = [];
                                    localPetHunt.customScenes.push(scene);
                                }
                            }
                        }
                        // uiSettings 用云端（更全面）
                        if (cloudValue.uiSettings) {
                            localPetHunt.uiSettings = { ...localPetHunt.uiSettings, ...cloudValue.uiSettings };
                        }
                        Storage.set(key, localPetHunt);
                    } else {
                        // 其他模块直接覆盖
                        Storage.set(key, cloudValue);
                    }
                }
                
                const afterStats = this.countData(Storage.getAll());
                console.log('📊 拉取后本地数据:', afterStats.total, '条');
                
                // ✅ 强制刷新页面
                setTimeout(() => {
                    console.log('🔄 页面刷新...');
                    location.reload();
                }, 500);
                
                return { 
                    success: true, 
                    message: `✅ 拉取成功！云端 ${cloudStats.total} 条数据已合并，本地共 ${afterStats.total} 条`,
                    cloudTotal: cloudStats.total,
                    localTotal: afterStats.total,
                    details: cloudStats.details
                };
            } else {
                return { success: false, message: '❌ 数据格式不兼容' };
            }
        } catch (error) {
            console.error('❌ 拉取失败:', error);
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
