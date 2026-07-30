// ============================================================
//  ☁️ 同步核心 - 修复 CSP 问题
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
                return { success: true, message: '✅ 同步成功！' };
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

            if (content.modules) {
                Storage.mergeAll(content.modules);
                
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
            return { success: false, message: '❌ 网络错误：' + error.message };
        }
    }
};

window.GitHubSync = GitHubSync;
