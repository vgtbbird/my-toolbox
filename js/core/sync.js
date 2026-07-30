// ============================================================
//  ☁️ 同步核心 - 带数据核对
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

    // ===== 统计数据条数 =====
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

        // 获取所有数据
        let allData = Storage.getAll();
        
        // 统计本地数据
        const localStats = this.countData(allData);
        console.log('📊 本地数据统计:');
        for (let [key, val] of Object.entries(localStats.details)) {
            console.log(`  └─ ${key}: history ${val.history} 条, records ${val.records} 条`);
        }
        console.log(`  └─ 📌 本地总计: ${localStats.total} 条`);

        // 获取云端当前数据
        let cloudStats = { total: 0, details: {} };
        let cloudData = null;
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
                    cloudData = JSON.parse(jsonStr);
                    if (cloudData.modules) {
                        cloudStats = this.countData(cloudData.modules);
                    }
                }
            }
        } catch(e) {
            console.log('⚠️ 无法读取云端数据，将创建新文件');
        }

        console.log('☁️ 云端数据统计:');
        if (cloudStats.total > 0) {
            for (let [key, val] of Object.entries(cloudStats.details)) {
                console.log(`  └─ ${key}: history ${val.history} 条, records ${val.records} 条`);
            }
            console.log(`  └─ 📌 云端总计: ${cloudStats.total} 条`);
        } else {
            console.log('  └─ 云端暂无数据');
        }

        // 上传前排序
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

        // 合并云端和本地数据（如果云端有数据）
        if (cloudData && cloudData.modules) {
            for (let [key, cloudValue] of Object.entries(cloudData.modules)) {
                if (allData[key]) {
                    // 合并 history
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
                    // 合并 records
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

        // 重新统计合并后的数据
        const mergedStats = this.countData(allData);
        console.log('📊 合并后数据统计:');
        for (let [key, val] of Object.entries(mergedStats.details)) {
            console.log(`  └─ ${key}: history ${val.history} 条, records ${val.records} 条`);
        }
        console.log(`  └─ 📌 合并后总计: ${mergedStats.total} 条`);

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
                console.log(`✅ 同步成功！云端数据总计: ${mergedStats.total} 条`);
                return { 
                    success: true, 
                    message: `✅ 同步成功！云端总计 ${mergedStats.total} 条数据`,
                    total: mergedStats.total,
                    details: mergedStats.details
                };
            } else {
                const err = await putRes.json();
                console.error('❌ 同步失败:', err);
                return { success: false, message: '❌ 同步失败：' + (err.message || '未知错误') };
            }
        } catch (error) {
            console.error('❌ 网络错误:', error);
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
                console.error('❌ 拉取失败:', err);
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
            console.log('☁️ 云端数据统计:');
            for (let [key, val] of Object.entries(cloudStats.details)) {
                console.log(`  └─ ${key}: history ${val.history} 条, records ${val.records} 条`);
            }
            console.log(`  └─ 📌 云端总计: ${cloudStats.total} 条`);

            if (content.modules) {
                Storage.mergeAll(content.modules);
                console.log('✅ 拉取合并完成！');
                
                // 统计本地数据
                const localStats = this.countData(Storage.getAll());
                console.log('📊 本地数据统计:');
                for (let [key, val] of Object.entries(localStats.details)) {
                    console.log(`  └─ ${key}: history ${val.history} 条, records ${val.records} 条`);
                }
                console.log(`  └─ 📌 本地总计: ${localStats.total} 条`);
                
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
                    message: `✅ 拉取成功！云端 ${cloudStats.total} 条数据已合并，本地总计 ${localStats.total} 条`,
                    cloudTotal: cloudStats.total,
                    localTotal: localStats.total,
                    data: content 
                };
            } else {
                return { success: false, message: '❌ 数据格式不兼容' };
            }
        } catch (error) {
            console.error('❌ 网络错误:', error);
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
