// ============================================================
//  ☁️ 同步核心 - 统一排序版
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

    // ===== 同步到云端 =====
    async syncToCloud() {
        const token = this.getToken();
        if (!token) {
            return { success: false, message: '❌ 请先设置 Gitee Token' };
        }

        // 获取所有数据
        let allData = Storage.getAll();
        
        // ===== 上传前统一排序所有模块的数据 =====
        for (let [key, value] of Object.entries(allData)) {
            if (value && typeof value === 'object') {
                if (value.history && Array.isArray(value.history)) {
                    value.history.sort((a, b) => {
                        if (a.date && b.date) {
                            return new Date(b.date) - new Date(a.date);
                        }
                        return 0;
                    });
                    console.log(`  └─ ${key}.history 已排序，共 ${value.history.length} 条`);
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

        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            modules: allData
        };

        console.log('📤 准备上传的数据:');
        for (let [key, value] of Object.entries(data.modules)) {
            if (value && typeof value === 'object') {
                console.log(`  └─ ${key}.history: ${value.history?.length || 0} 条`);
            }
        }

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

            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
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
                return { success: true, message: '✅ 同步成功！' };
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
            let content;
            if (data.content) {
                content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
            } else {
                return { success: false, message: '❌ 数据格式错误' };
            }

            console.log('📥 云端数据模块:', Object.keys(content.modules || {}));
            
            if (content.modules) {
                for (let [key, value] of Object.entries(content.modules)) {
                    if (value && typeof value === 'object') {
                        console.log(`  └─ ${key}.history: ${value.history?.length || 0} 条`);
                    }
                }
            }

            if (content.modules) {
                Storage.mergeAll(content.modules);
                console.log('✅ 拉取合并完成！');
                
                // ===== 强制刷新所有模块显示 =====
                if (typeof PetRingModule !== 'undefined' && PetRingModule.render) {
                    PetRingModule.render();
                }
                if (typeof TreePlantModule !== 'undefined' && TreePlantModule.render) {
                    TreePlantModule.render();
                }
                if (typeof App !== 'undefined' && App.refreshAll) {
                    App.refreshAll();
                }
                
                return { success: true, message: '✅ 拉取成功！数据已合并', data: content };
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