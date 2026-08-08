// ============================================================
//  🐾 召唤兽装备查询模块 - 纯净拆分版 (含名称映射库)
// ============================================================
const PetEquipmentQueryModule = {
    id: 'petEquipmentQuery',

    uiSettings: {
        bgColor: '#eef2f7',
        btnColor: '#4CAF50',
        btnTextColor: '#ffffff',
        cardBgColor: '#ffffff',
        textColor: '#1a1a2e',
        fontSize: 14,
        scoreBgColor: '#1a2a3a'
    },

    petLevels: [65, 75, 85, 95, 105, 115, 125, 135, 145],
    petCurrentLevel: 115,
    petCurrentPart: '护腕',
    petInputValues: {},

    // ============================================================
    //  🐾 宠装名称映射表（用于识别装备名）
    // ============================================================
    petNameMap: {
        '九曲环': { level: 75, part: '项圈' },
        '笼玉环': { level: 85, part: '项圈' },
        '嵌宝金环': { level: 95, part: '项圈' },
        '玳瑁环': { level: 105, part: '项圈' },
        '七星宝环': { level: 115, part: '项圈' },
        '缚龙圈': { level: 125, part: '项圈' },
        '鸾尾环': { level: 135, part: '项圈' },
        '织锦颈圈': { level: 145, part: '项圈' },
        '冰蚕丝圈': { level: 155, part: '项圈' },

        '连环铠': { level: 75, part: '铠甲' },
        '笼玉甲': { level: 85, part: '铠甲' },
        '嵌宝金甲': { level: 95, part: '铠甲' },
        '玳瑁衣': { level: 105, part: '铠甲' },
        '七星宝甲': { level: 115, part: '铠甲' },
        '缚龙甲': { level: 125, part: '铠甲' },
        '凤凰彩衣': { level: 135, part: '铠甲' },
        '织锦软褡': { level: 145, part: '铠甲' },
        '冰蚕织甲': { level: 155, part: '铠甲' },

        '镂空银镯': { level: 75, part: '护腕' },
        '笼玉镯': { level: 85, part: '护腕' },
        '嵌宝金腕': { level: 95, part: '护腕' },
        '琥珀护腕': { level: 105, part: '护腕' },
        '七星宝腕': { level: 115, part: '护腕' },
        '缚龙筋': { level: 125, part: '护腕' },
        '凤翎护腕': { level: 135, part: '护腕' },
        '织锦彩带': { level: 145, part: '护腕' },
        '冰蚕丝带': { level: 155, part: '护腕' },
    },

    // ============================================================
    //  ✅ 宠装 - 各等级极限属性表
    // ============================================================
    petLimitData: {
        65: { 速度: 27, 防御: 66, 伤害: 36, 力量: 16, 体质: 5, 气血: 56, 敏捷: 13, 耐力: 10, 灵力: 8, 魔力: 10, 命中率: 19 },
        75: { 速度: 30, 防御: 75, 伤害: 41, 力量: 18, 体质: 6, 气血: 64, 敏捷: 15, 耐力: 12, 灵力: 9, 魔力: 12, 命中率: 19 },
        85: { 速度: 33, 防御: 84, 伤害: 46, 力量: 21, 体质: 6, 气血: 72, 敏捷: 17, 耐力: 14, 灵力: 10, 魔力: 14, 命中率: 19 },
        95: { 速度: 36, 防御: 93, 伤害: 51, 力量: 23, 体质: 7, 气血: 80, 敏捷: 19, 耐力: 15, 灵力: 11, 魔力: 15, 命中率: 19 },
        105: { 速度: 39, 防御: 102, 伤害: 56, 力量: 26, 体质: 8, 气血: 88, 敏捷: 21, 耐力: 17, 灵力: 12, 魔力: 17, 命中率: 19 },
        115: { 速度: 42, 防御: 111, 伤害: 60, 力量: 28, 体质: 8, 气血: 96, 敏捷: 23, 耐力: 19, 灵力: 12, 魔力: 19, 命中率: 19 },
        125: { 速度: 45, 防御: 120, 伤害: 65, 力量: 31, 体质: 9, 气血: 104, 敏捷: 25, 耐力: 20, 灵力: 13, 魔力: 20, 命中率: 19 },
        135: { 速度: 48, 防御: 129, 伤害: 70, 力量: 33, 体质: 10, 气血: 112, 敏捷: 27, 耐力: 22, 灵力: 14, 魔力: 22, 命中率: 19 },
        145: { 速度: 51, 防御: 138, 伤害: 75, 力量: 36, 体质: 10, 气血: 120, 敏捷: 29, 耐力: 24, 灵力: 15, 魔力: 24, 命中率: 19 }
    },

    petAttrList: ['伤害', '灵力', '气血', '体质', '耐力', '魔力', '力量', '敏捷', '速度', '防御', '命中率'],

    // ============================================================
    //  生命周期
    // ============================================================
    init() {
        this.loadData();
        this.buildUI();
        this.bindEvents();
        App.register(this);
        this.render();
        setTimeout(() => this.applyUISettings(), 150);
    },

    render() {
        this.updatePetInputs();
        this.updatePetQueryResult();
        this.updatePetValueResult();
        this.updateButtonStates();
        this.saveData();
        setTimeout(() => this.applyUISettings(), 100);
    },

    loadData() {
        const data = Storage.get('petEquipmentQuery', {});
        this.petLevels = data.petLevels || [65, 75, 85, 95, 105, 115, 125, 135, 145];
        this.petCurrentLevel = data.petCurrentLevel || 115;
        this.petCurrentPart = data.petCurrentPart || '护腕';
        this.petInputValues = data.petInputValues || {};
        this.uiSettings = data.uiSettings || { bgColor: '#eef2f7', btnColor: '#4CAF50', btnTextColor: '#ffffff', cardBgColor: '#ffffff', textColor: '#1a1a2e', fontSize: 14, scoreBgColor: '#1a2a3a' };
    },

    saveData() {
        Storage.set('petEquipmentQuery', {
            petLevels: this.petLevels,
            petCurrentLevel: this.petCurrentLevel,
            petCurrentPart: this.petCurrentPart,
            petInputValues: this.petInputValues,
            uiSettings: this.uiSettings
        });
    },

    applyUISettings() {
        const s = this.uiSettings;
        const container = document.getElementById('petEquipmentQueryContainer');
        if (!container) return;
        const tabContent = container.closest('.tab-content');
        if (tabContent) tabContent.style.setProperty('background', s.bgColor, 'important');
        container.querySelectorAll('.module, .eq-result-box, .eq-calc-box').forEach(el => el.style.setProperty('background', s.cardBgColor, 'important'));
        container.querySelectorAll('.module .title, .module .title .hint, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, .melt-tip, .melt-result, .eq-highlight').forEach(el => el.style.setProperty('color', s.textColor, 'important'));
        container.querySelectorAll('.eq-score-module').forEach(el => el.style.setProperty('background', s.scoreBgColor || '#1a2a3a', 'important'));
        const fontSize = s.fontSize + 'px';
        container.querySelectorAll('.module .title, .eq-label, .eq-value, .eq-desc, .eq-result-box, .eq-calc-box, select, input, button').forEach(el => el.style.setProperty('font-size', fontSize, 'important'));
    },

    updateButtonStates() {
        document.querySelectorAll('.pe-btn-level').forEach(btn => { const val = parseInt(btn.dataset.value); if (val === this.petCurrentLevel) { btn.classList.add('active'); btn.style.background = '#4CAF50'; btn.style.color = '#fff'; } else { btn.classList.remove('active'); btn.style.background = '#f0f4f8'; btn.style.color = '#1f3b53'; } });
        document.querySelectorAll('.pe-btn-part').forEach(btn => { const val = btn.dataset.value; if (val === this.petCurrentPart) { btn.classList.add('active'); btn.style.background = '#4CAF50'; btn.style.color = '#fff'; } else { btn.classList.remove('active'); btn.style.background = '#f0f4f8'; btn.style.color = '#1f3b53'; } });
    },

    // ============================================================
    //  图片预处理与OCR错误修正
    // ============================================================
    preprocessImage(imageSource) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageSource;
        });
    },

    correctOcrErrors(text) {
        const corrections = {
            '防 御': '防御', '防 御 ': '防御', '防卸': '防御',
            '气 血': '气血', '气 血 ': '气血',
            '伤 害': '伤害', '伤 害 ': '伤害',
            '命 中': '命中', '命 中 ': '命中', '合中': '命中', '合 中': '命中',
            '灵 力': '灵力', '灵 力 ': '灵力',
            '魔 力': '魔力', '大 力': '魔力', '大力': '魔力', '放力': '魔力', '放 力': '魔力', '谭力': '魔力', '谭 力': '魔力', '摩力': '魔力', '摩 力': '魔力',
            '力 量': '力量', '耐 力': '耐力', '奈力': '耐力', '奈 力': '耐力', '人而力': '耐力', '人 而 力': '耐力', '人 力': '耐力',
            '体 质': '体质', '休质': '体质', '休 质': '体质',
            '敏 捷': '敏捷',
            '耐 久': '耐久', '耐久度': '耐久度', '耐 久 度': '耐久度',
            '等 级': '等级', '五 行': '五行',
            '＋': '+', '－': '-', '—': '-', '＝': '=', '十': '+', '一': '-',
            
            '伤害+': '伤害 +', '命中+': '命中 +', '速度+': '速度 +', '防御+': '防御 +',
            '力量+': '力量 +', '敏捷+': '敏捷 +', '耐力+': '耐力 +', '魔力+': '魔力 +',
            '体质+': '体质 +', '灵力+': '灵力 +', '气血+': '气血 +',
            
            '每捷': '敏捷', '每 捷': '敏捷',
            '命中率': '命中率', '命 中 率': '命中率',
            '中率': '命中率',
        };
        let corrected = text;
        for (let [wrong, right] of Object.entries(corrections)) {
            corrected = corrected.replace(new RegExp(wrong, 'g'), right);
        }
        return corrected;
    },

    // ============================================================
    //  📷 核心识别流程
    // ============================================================
    async recognizePetEquipment(imageSource) {
        const resultEl = document.getElementById('peOcrResult');
        if (!resultEl) return;
        this.petInputValues = {};
        document.querySelectorAll('.pe-attr-input').forEach(input => input.value = '');
        document.querySelectorAll('.pe-btn-level, .pe-btn-part').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.pe-btn-level[data-value="115"]')?.classList.add('active');
        document.querySelector('.pe-btn-part[data-value="护腕"]')?.classList.add('active');

        if (typeof Tesseract === 'undefined') { resultEl.textContent = '❌ OCR库未加载，请刷新页面重试'; resultEl.style.color = '#e06060'; return; }
        resultEl.textContent = '⏳ 正在预处理图片...'; resultEl.style.color = '#8ab0c8';

        try {
            const grayImage = await this.preprocessImage(imageSource);
            resultEl.textContent = '⏳ 正在识别中（约3-8秒），请稍候...';
            const worker = await Tesseract.createWorker('chi_sim');
            const { data: { text } } = await worker.recognize(grayImage);
            await worker.terminate();
            console.log('📷 宠装OCR原始结果:', text);

            const parsed = this.parsePetEquipmentText(text);
            
            if (!parsed || Object.keys(parsed.attrs).length === 0) {
                resultEl.textContent = '⚠️ 未能识别出有效宠装信息，请确认截图清晰';
                resultEl.style.color = '#e0a060';
                return;
            }
            let previewText = `✅ 识别到：`;
            if (parsed.part) previewText += ` ${parsed.part}`;
            if (parsed.level) previewText += ` | ${parsed.level}级`;
            previewText += ` | ${Object.keys(parsed.attrs).length}项属性`;
            resultEl.textContent = previewText;
            resultEl.style.color = '#60d080';

            this.fillPetRecognizedData(parsed);
        } catch (err) { console.error('宠装OCR识别失败:', err); resultEl.textContent = '❌ 识别失败：' + err.message; resultEl.style.color = '#e06060'; }
    },

    // ============================================================
    //  🔢 宠装专用：数字+前文上下文提取
    // ============================================================
    extractPetContext(text) {
        const result = { level: null, part: null, attrs: {} };
        // 🆕 新增：锁定标记。一旦通过主属性识别出部位，就不再变更
        let partLocked = false; 
        const fullText = text.replace(/\s+/g, ' ').trim();
        console.log('🔍 宠装开始数字+前文上下文提取');

        const numberPattern = /([+-]\s*\d+%?|\d+%?)/g;
        let match; const numberMatches = [];
        while ((match = numberPattern.exec(fullText)) !== null) {
            const numStr = match[1].trim();
            const numValue = parseInt(numStr);
            if (isNaN(numValue) || numValue === 0) continue;
            const hasNegativeSign = numStr.includes('-') || numStr.includes('－') || numStr.includes('—');
            const hasPercent = numStr.includes('%'); // 命中率会带%
            numberMatches.push({ value: numValue, startPos: match.index, endPos: match.index + match[0].length, raw: match[0], hasNegativeSign, hasPercent });
        }
        console.log(`📊 宠装找到 ${numberMatches.length} 个数字`);

        for (let i = 0; i < numberMatches.length; i++) {
            const current = numberMatches[i];
            const startPos = current.startPos;
            let prevEndPos = 0;
            if (i > 0) prevEndPos = numberMatches[i - 1].endPos;
            const contextBefore = fullText.substring(prevEndPos, startPos);
            const cleanBefore = contextBefore.replace(/\s/g, '');
            const value = current.value;
            const isNegative = current.hasNegativeSign || contextBefore.includes('-') || contextBefore.includes('－') || contextBefore.includes('—');
            const finalValue = isNegative ? -Math.abs(value) : Math.abs(value);
            console.log(`🔍 数字 ${finalValue}: 前文="${cleanBefore}"`);

                        // 2. 🟢 防御专属提取（铠甲）
            // 校验：宠装防御最高不超过 150（145级极限是138）
            if (cleanBefore.includes('防') || cleanBefore.includes('御')) {
                if (Math.abs(finalValue) > 150) {
                    console.log(`⏭️ 跳过疑似防御: ${finalValue}（超出极限150）`);
                    continue;
                }
                result.attrs['防御'] = Math.abs(finalValue);
                if (!partLocked) {
                    result.part = '铠甲';
                    partLocked = true;
                    console.log(`✅ 宠装防御: ${finalValue} (锁定为铠甲)`);
                } else {
                    console.log(`✅ 宠装防御: ${finalValue} (已锁定，不做部位变更)`);
                }
                continue;
            }

            // 4. 速度（项圈主属性）
            // 校验：宠装速度最高不超过 60（145级极限是51）
            if (cleanBefore.includes('速') && !cleanBefore.includes('耐')) {
                if (Math.abs(finalValue) > 60) {
                    console.log(`⏭️ 跳过疑似速度: ${finalValue}（超出极限60，可能是耐久度误读）`);
                    continue;
                }
                result.attrs['速度'] = Math.abs(finalValue);
                if (!partLocked) {
                    result.part = '项圈';
                    partLocked = true;
                    console.log(`✅ 宠装速度: ${finalValue} (锁定为项圈)`);
                } else {
                    console.log(`✅ 宠装速度: ${finalValue} (已锁定，不做部位变更)`);
                }
                continue;
            }

                        // 5. 命中率（护腕主属性）
            // 校验：宠装命中率上限永远是 19%（不论等级）
            if (cleanBefore.includes('命') || cleanBefore.includes('中')) {
                if (Math.abs(finalValue) > 19) {
                    console.log(`⏭️ 跳过疑似命中率: ${finalValue}（超出极限19%）`);
                    continue;
                }
                result.attrs['命中率'] = Math.abs(finalValue);
                if (!partLocked) {
                    result.part = '护腕';
                    partLocked = true;
                    console.log(`✅ 宠装命中率: ${finalValue} (锁定为护腕)`);
                } else {
                    console.log(`✅ 宠装命中率: ${finalValue} (已锁定，不做部位变更)`);
                }
                continue;
            }

            // 1. 等级提取
            if (cleanBefore.includes('等') || cleanBefore.includes('级')) {
                if (Math.abs(finalValue) >= 65 && Math.abs(finalValue) <= 145) {
                    result.level = Math.abs(finalValue);
                    console.log(`✅ 宠装等级: ${result.level}`);
                    continue;
                }
            }

            // 2. 宠装属性提取
            if (cleanBefore.includes('伤') || cleanBefore.includes('害')) { result.attrs['伤害'] = Math.abs(finalValue); console.log(`✅ 宠装伤害: ${finalValue}`); continue; }
            if (cleanBefore.includes('命') || cleanBefore.includes('中')) { result.attrs['命中率'] = Math.abs(finalValue); console.log(`✅ 宠装命中率: ${finalValue}`); continue; }
             // 🟢 优化1：耐久度必须优先拦截（带“耐”字绝对不能误判为速度）
            if (cleanBefore.includes('耐')) {
                result.attrs['耐久'] = Math.abs(finalValue);
                console.log(`✅ 宠装耐久: ${finalValue}`);
                continue;
            }
            // 🔵 优化2：只有当没有“耐”字，且包含“速”或“度”时，才判定为速度
            if (cleanBefore.includes('速') || cleanBefore.includes('度')) {
                result.attrs['速度'] = Math.abs(finalValue);
                console.log(`✅ 宠装速度: ${finalValue}`);
                continue;
            }
            if (cleanBefore.includes('防') || cleanBefore.includes('御')) { result.attrs['防御'] = Math.abs(finalValue); console.log(`✅ 宠装防御: ${finalValue}`); continue; }
            if (cleanBefore.includes('灵')) { result.attrs['灵力'] = Math.abs(finalValue); console.log(`✅ 宠装灵力: ${finalValue}`); continue; }
            if (cleanBefore.includes('血') || cleanBefore.includes('气')) { result.attrs['气血'] = Math.abs(finalValue); console.log(`✅ 宠装气血: ${finalValue}`); continue; }
            if (cleanBefore.includes('体') || cleanBefore.includes('质')) { result.attrs['体质'] = Math.abs(finalValue); console.log(`✅ 宠装体质: ${finalValue}`); continue; }
            if (cleanBefore.includes('耐') && !cleanBefore.includes('久')) { result.attrs['耐力'] = Math.abs(finalValue); console.log(`✅ 宠装耐力: ${finalValue}`); continue; }
            if (cleanBefore.includes('魔')) { result.attrs['魔力'] = Math.abs(finalValue); console.log(`✅ 宠装魔力: ${finalValue}`); continue; }
            if (cleanBefore.includes('量') || (cleanBefore.includes('力') && !cleanBefore.includes('魔') && !cleanBefore.includes('耐') && !cleanBefore.includes('体') && !cleanBefore.includes('敏') && !cleanBefore.includes('灵'))) { result.attrs['力量'] = Math.abs(finalValue); console.log(`✅ 宠装力量: ${finalValue}`); continue; }
            if (cleanBefore.includes('敏') || cleanBefore.includes('捷')) { result.attrs['敏捷'] = Math.abs(finalValue); console.log(`✅ 宠装敏捷: ${finalValue}`); continue; }
            if (cleanBefore.includes('久') || cleanBefore.includes('度')) { result.attrs['耐久'] = Math.abs(finalValue); console.log(`✅ 宠装耐久: ${finalValue}`); continue; }

            console.log(`⏭️ 宠装未识别: ${finalValue}，前文="${cleanBefore}"`);
        }
        console.log('📦 宠装提取完成:', result);
        return result;
    },

    // ============================================================
    //  📝 解析宠装文本
    // ============================================================
    parsePetEquipmentText(text) {
        const correctedText = this.correctOcrErrors(text);
        const fullText = correctedText.replace(/\s+/g, ' ').trim();
        const result = { name: null, level: null, part: null, attrs: {} };

        console.log('📝 宠装修正后文本:', correctedText);

        // 1. 提取装备名称（优先匹配名称库）
        const cleanFullText = fullText.replace(/\s/g, '');
        let nameMatch = null;
        for (let [name, info] of Object.entries(this.petNameMap)) {
            const cleanName = name.replace(/\s/g, '');
            if (cleanFullText.includes(cleanName)) {
                nameMatch = { name, info };
                break;
            }
        }
        if (nameMatch) {
            result.name = nameMatch.name;
            result.level = nameMatch.info.level;
            result.part = nameMatch.info.part;
            console.log(`✅ 宠装名称匹配: ${result.name} (${result.level}级${result.part})`);
        }

        // 2. 使用“以数字为中心，向前查找上下文”的算法提取所有数据
        const extracted = this.extractPetContext(fullText);
        // 如果名称匹配没有提取到等级，用数字提取的等级补全
        if (!result.level && extracted.level) {
            result.level = extracted.level;
        }
        
        // 3. 属性提取（只取数字提取中的属性）
        for (let [key, val] of Object.entries(extracted.attrs)) {
            if (val !== 0) result.attrs[key] = val;
        }

        // 4. 兜底：如果名称匹配和数字提取都没找到部位，根据属性组合反向推断
        if (!result.part && Object.keys(result.attrs).length > 0) {
            const attrs = result.attrs;
            if (attrs['命中率'] !== undefined) { result.part = '护腕'; console.log(`🔧 宠装属性校准: 有命中率 → 护腕`); }
            else if (attrs['速度'] !== undefined) { result.part = '项圈'; console.log(`🔧 宠装属性校准: 有速度 → 项圈`); }
            else if (attrs['防御'] !== undefined) { result.part = '铠甲'; console.log(`🔧 宠装属性校准: 有防御 → 铠甲`); }
        }

        console.log('📦 宠装解析结果:', result);
        return result;
    },

    // ============================================================
    //  🖊️ 填入宠装识别数据
    // ============================================================
    fillPetRecognizedData(parsed) {
        if (!parsed) return;
        if (parsed.level && this.petLevels.includes(parsed.level)) {
            this.petCurrentLevel = parsed.level;
            document.querySelectorAll('.pe-btn-level').forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.value) === parsed.level));
        }
        if (parsed.part) {
            const partMap = { '护腕': '护腕', '项圈': '项圈', '铠甲': '铠甲' };
            const mappedPart = partMap[parsed.part];
            if (mappedPart) {
                this.petCurrentPart = mappedPart;
                document.querySelectorAll('.pe-btn-part').forEach(btn => btn.classList.toggle('active', btn.dataset.value === mappedPart));
            }
        }
        if (parsed.attrs) {
            this.updatePetInputs();
            for (let [attr, val] of Object.entries(parsed.attrs)) {
                const input = document.getElementById(`peAttr_${attr}`);
                if (input) { input.value = val; this.petInputValues[attr] = val; }
            }
            this.render();
        }
    },

    // ============================================================
    //  🏗️ 构建UI
    // ============================================================
    buildUI() {
        const container = document.getElementById('petEquipmentQueryContainer');
        if (!container) return;
        const petLevelBtns = this.petLevels.map(l => `<button class="pe-btn-level ${l === this.petCurrentLevel ? 'active' : ''}" data-value="${l}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${l === this.petCurrentLevel ? '#4CAF50' : '#f0f4f8'};color:${l === this.petCurrentLevel ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${l}</button>`).join('');
        const petPartBtns = ['护腕', '项圈', '铠甲'].map(p => `<button class="pe-btn-part ${p === this.petCurrentPart ? 'active' : ''}" data-value="${p}" style="padding:4px 12px;border-radius:16px;border:1px solid #bccad9;background:${p === this.petCurrentPart ? '#4CAF50' : '#f0f4f8'};color:${p === this.petCurrentPart ? '#fff' : '#1f3b53'};cursor:pointer;font-size:0.7rem;margin:2px;">${p}</button>`).join('');
        container.innerHTML = `
            <div style="margin-bottom:10px;padding:10px 14px;background:#f0f5fb;border-radius:12px;border:1px dashed #6b8baa;text-align:center;" id="peOcrDropZone">
                <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
                    <span style="font-size:0.8rem;color:#1f3b53;">📷 宠装截图识别</span>
                    <button class="btn-small" id="peOcrBtn" style="background:#6b8baa;color:#fff;border:none;padding:4px 16px;border-radius:30px;cursor:pointer;font-weight:600;">📤 上传截图</button>
                    <span style="font-size:0.65rem;color:#5a7a94;">支持 JPG/PNG，拖拽或 Ctrl+V 粘贴</span>
                </div>
                <div id="peOcrResult" style="font-size:0.75rem;color:#5a7a94;margin-top:4px;min-height:20px;">上传宠装截图，自动识别属性</div>
                <input type="file" id="peOcrFileInput" accept="image/*" style="display:none;">
            </div>
            <div style="margin-bottom:8px;"><div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 等级</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${petLevelBtns}</div></div>
            <div style="margin-bottom:8px;"><div style="font-weight:600;font-size:0.7rem;color:#5a7a94;margin-bottom:4px;">📌 部位</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${petPartBtns}</div></div>
            <div style="display:flex;justify-content:flex-end;margin-bottom:6px;"><button class="btn-small" id="peResetAllBtn" style="background:#b48b5f;color:#fff;border:none;padding:2px 14px;border-radius:30px;cursor:pointer;font-size:0.65rem;">🔄 重置全部</button></div>
            <div id="peAttrInputArea" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:8px 0;border-top:1px solid #eef2f7;"></div>
            <div style="font-size:0.65rem;color:#5a7a94;margin-top:4px;text-align:right;">💡 点击输入框自动放大 · 点击 × 清除数值</div>
            <div class="module" style="margin-top:14px;"><div class="module-header"><div class="title">📊 属性对比</div></div><div class="module-body"><div id="peQueryResult" style="font-size:0.85rem;color:#5a7a94;">请选择等级和部位，输入属性值</div></div></div>
            <div class="module" style="margin-top:14px;"><div class="module-header"><div class="title">💰 价值评估</div></div><div class="module-body"><div id="peValueResult" style="font-size:0.85rem;color:#5a7a94;">输入属性后自动评估</div></div></div>
        `;
    },

    // ============================================================
    //  🔗 绑定事件
    // ============================================================
    bindEvents() {
        document.querySelectorAll('.pe-btn-level').forEach(btn => { btn.addEventListener('click', function() { PetEquipmentQueryModule.petCurrentLevel = parseInt(this.dataset.value); PetEquipmentQueryModule.render(); PetEquipmentQueryModule.bindInputEvents(); }); });
        document.querySelectorAll('.pe-btn-part').forEach(btn => { btn.addEventListener('click', function() { PetEquipmentQueryModule.petCurrentPart = this.dataset.value; PetEquipmentQueryModule.render(); PetEquipmentQueryModule.bindInputEvents(); }); });
        document.getElementById('peResetAllBtn')?.addEventListener('click', function() {
            if (!confirm('确定要清空当前宠装的所有输入值吗？')) return;
            document.querySelectorAll('#peAttrInputArea .pe-attr-input').forEach(input => input.value = '');
            PetEquipmentQueryModule.petInputValues = {};
            PetEquipmentQueryModule.render();
            PetEquipmentQueryModule.bindInputEvents();
        });
        const ocrBtn = document.getElementById('peOcrBtn'), fileInput = document.getElementById('peOcrFileInput'), dropZone = document.getElementById('peOcrDropZone');
        if (ocrBtn && fileInput) { ocrBtn.addEventListener('click', () => fileInput.click()); fileInput.addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => PetEquipmentQueryModule.recognizePetEquipment(ev.target.result); reader.readAsDataURL(file); fileInput.value = ''; }); }
        if (dropZone) {
            dropZone.addEventListener('dragover', function(e) { e.preventDefault(); this.style.borderColor = '#4CAF50'; this.style.background = '#e8f5e9'; });
            dropZone.addEventListener('dragleave', function(e) { e.preventDefault(); this.style.borderColor = '#6b8baa'; this.style.background = '#f0f5fb'; });
            dropZone.addEventListener('drop', function(e) { e.preventDefault(); this.style.borderColor = '#6b8baa'; this.style.background = '#f0f5fb'; const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (ev) => PetEquipmentQueryModule.recognizePetEquipment(ev.target.result); reader.readAsDataURL(file); } });
        }
        document.addEventListener('paste', function(e) { const container = document.getElementById('petEquipmentQueryContainer'); if (!container || !container.closest('.tab-content.active')) return; const target = e.target; const isPetSection = target.closest('#peAttrInputArea') || target.closest('.pe-attr-input') || target.closest('#peOcrDropZone'); if (!isPetSection) return; const items = e.clipboardData && e.clipboardData.items; if (!items) return; for (let item of items) { if (item.type.startsWith('image/')) { const file = item.getAsFile(); if (file) { const reader = new FileReader(); reader.onload = (ev) => PetEquipmentQueryModule.recognizePetEquipment(ev.target.result); reader.readAsDataURL(file); break; } } } });
        document.addEventListener('input', function(e) { if (e.target.classList && e.target.classList.contains('pe-attr-input')) { const attr = e.target.id.replace('peAttr_', ''); const val = parseFloat(e.target.value); if (!isNaN(val)) PetEquipmentQueryModule.petInputValues[attr] = val; PetEquipmentQueryModule.updatePetQueryResult(); PetEquipmentQueryModule.updatePetValueResult(); } });
        this.bindInputEvents();
    },

    bindInputEvents() {
        document.querySelectorAll('#peAttrInputArea .pe-clear-btn').forEach(btn => { btn.removeEventListener('click', btn._clearHandler); btn._clearHandler = function() { const input = document.getElementById(this.dataset.target); if (input) { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); } }; btn.addEventListener('click', btn._clearHandler); });
        document.querySelectorAll('#peAttrInputArea .pe-attr-input').forEach(input => { input.removeEventListener('focus', input._focusHandler); input.removeEventListener('blur', input._blurHandler); input._focusHandler = function() { this.style.fontSize = '1.1rem'; this.style.padding = '8px 35px 8px 12px'; this.style.borderColor = '#4CAF50'; this.style.boxShadow = '0 0 8px rgba(76,175,80,0.3)'; }; input._blurHandler = function() { this.style.fontSize = '0.85rem'; this.style.padding = '6px 30px 6px 10px'; this.style.borderColor = '#bccad9'; this.style.boxShadow = 'none'; }; input.addEventListener('focus', input._focusHandler); input.addEventListener('blur', input._blurHandler); });
    },

    updatePetInputs() {
        const container = document.getElementById('peAttrInputArea');
        if (!container) return;
        let html = '';
        for (let attr of this.petAttrList) {
            const val = this.petInputValues[attr] !== undefined ? this.petInputValues[attr] : '';
            html += `<div style="display:flex;align-items:center;gap:4px;font-size:0.8rem;position:relative;"><label style="font-weight:500;min-width:40px;color:#1f3b53;">${attr}：</label><input type="number" id="peAttr_${attr}" class="pe-attr-input" step="0.1" value="${val}" placeholder="数值" style="flex:1;min-width:80px;padding:6px 30px 6px 10px;border:1px solid #bccad9;border-radius:12px;font-size:0.85rem;text-align:center;transition:all 0.2s;"><button class="pe-clear-btn" data-target="peAttr_${attr}" style="position:absolute;right:6px;background:transparent;border:none;color:#999;cursor:pointer;font-size:0.9rem;padding:0 4px;line-height:1;">×</button></div>`;
        }
        container.innerHTML = html;
        this.bindInputEvents();
    },

    updatePetQueryResult() {
        const level = this.petCurrentLevel, part = this.petCurrentPart, el = document.getElementById('peQueryResult');
        const limits = this.petLimitData[level];
        if (!limits) { el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无数据</div>'; return; }
        const values = {};
        document.querySelectorAll('.pe-attr-input').forEach(inp => { const attr = inp.id.replace('peAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val) && val !== 0) values[attr] = val; });
        if (Object.keys(values).length === 0) { el.innerHTML = '<div style="color:#5a7a94;">请输入属性值</div>'; return; }
        let html = `<div style="font-weight:600;color:#1f3b53;margin-bottom:8px;">${level}级 ${part}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">`;
        let hasResult = false;
        for (let [attr, val] of Object.entries(values)) {
            const limit = limits[attr]; if (!limit) { html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;color:#b45a5a;"><span>${attr}</span><span>⚠️ 该等级无此属性数据</span></div>`; continue; }
            let status = '', statusColor = '#5a7a94', bgColor = '#f8faff';
            if (val >= limit) { status = '⭐ 满属性！'; statusColor = '#dbbd7c'; bgColor = '#f5f0e8'; }
            else if (val >= limit * 0.8) { status = '✅ 优秀'; statusColor = '#2d6b2d'; bgColor = '#f0f8f0'; }
            else if (val >= limit * 0.6) { status = '📊 中等'; statusColor = '#b48b3a'; bgColor = '#f8f5e8'; }
            else if (val > 0) { status = '⚠️ 偏低'; statusColor = '#c0392b'; bgColor = '#f8e8e8'; }
            else { status = '⬇️ 减属性'; statusColor = '#8a6a8a'; bgColor = '#f5eef5'; }
            html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid #f0f4f8;border-radius:4px;background:${bgColor};"><span>${attr}</span><span><span style="font-weight:600;color:#1f3b53;">${val}</span><span style="font-size:0.7rem;color:#5a7a94;">/ ${limit}</span><span style="color:${statusColor};font-weight:600;margin-left:6px;font-size:0.7rem;">${status}</span></span></div>`;
            hasResult = true;
        }
        html += `</div>`;
        el.innerHTML = hasResult ? html : '<div style="color:#5a7a94;">请输入有效属性值</div>';
    },

    updatePetValueResult() {
        const el = document.getElementById('peValueResult');
        const values = {};
        document.querySelectorAll('.pe-attr-input').forEach(inp => { const attr = inp.id.replace('peAttr_', ''); const val = parseFloat(inp.value); if (!isNaN(val) && val !== 0) values[attr] = val; });
        if (Object.keys(values).length === 0) { el.innerHTML = '<div style="color:#5a7a94;">输入属性后自动评估价值</div>'; return; }
        const level = this.petCurrentLevel; const limits = this.petLimitData[level];
        if (!limits) { el.innerHTML = '<div style="color:#c0392b;">⚠️ 该等级暂无数据</div>'; return; }
        const damage = values['伤害'] || 0, strength = values['力量'] || 0, attackValue = damage + strength;
        const magic = values['魔力'] || 0, spirit = values['灵力'] || 0, magicValue = magic + spirit;
        const speed = values['速度'] || 0, agility = values['敏捷'] || 0, speedValue = speed + agility;
        const defense = values['防御'] || 0;
        const scoreBg = this.uiSettings.scoreBgColor || '#1a2a3a';
        let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">`;
        const attackLimit = (limits['伤害'] || 0) + (limits['力量'] || 0);
        let attackRating = '', attackColor = '#5a7a94';
        if (attackValue >= attackLimit * 0.9) { attackRating = '🌟 超极品！'; attackColor = '#dbbd7c'; }
        else if (attackValue >= attackLimit * 0.7) { attackRating = '🔥 极品'; attackColor = '#2d6b2d'; }
        else if (attackValue >= attackLimit * 0.5) { attackRating = '📊 优秀'; attackColor = '#b48b3a'; }
        else if (attackValue > 0) { attackRating = '📉 一般'; attackColor = '#5a7a94'; }
        else { attackRating = '⬇️ 低价值'; attackColor = '#8a6a8a'; }
        html += `<div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);"><div style="font-weight:600;color:#e0e8f0;">⚔️ 攻宠价值</div><div style="font-size:1.2rem;font-weight:700;color:${attackColor};">${attackValue.toFixed(1)}</div><div style="font-size:0.7rem;color:#8ab0c8;">伤害+力量 = ${damage.toFixed(1)} + ${strength.toFixed(1)} | 极限 ${attackLimit}</div><div style="font-weight:600;color:${attackColor};">${attackRating}</div></div>`;
        const magicLimit = (limits['魔力'] || 0) + (limits['灵力'] || 0);
        let magicRating = '', magicColor = '#5a7a94';
        if (magicValue >= magicLimit * 0.9) { magicRating = '🌟 超极品！'; magicColor = '#dbbd7c'; }
        else if (magicValue >= magicLimit * 0.7) { magicRating = '🔥 极品'; magicColor = '#2d6b2d'; }
        else if (magicValue >= magicLimit * 0.5) { magicRating = '📊 优秀'; magicColor = '#b48b3a'; }
        else if (magicValue > 0) { magicRating = '📉 一般'; magicColor = '#5a7a94'; }
        else { magicRating = '⬇️ 低价值'; magicColor = '#8a6a8a'; }
        html += `<div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);"><div style="font-weight:600;color:#e0e8f0;">🔮 法宠价值</div><div style="font-size:1.2rem;font-weight:700;color:${magicColor};">${magicValue.toFixed(1)}</div><div style="font-size:0.7rem;color:#8ab0c8;">魔力+灵力 = ${magic.toFixed(1)} + ${spirit.toFixed(1)}| 极限 ${magicLimit}</div><div style="font-weight:600;color:${magicColor};">${magicRating}</div></div>`;
        const speedLimit = (limits['速度'] || 0) + (limits['敏捷'] || 0);
        let speedRating = '', speedColor = '#5a7a94';
        if (speedValue >= speedLimit * 0.9) { speedRating = '🌟 超极品！'; speedColor = '#dbbd7c'; }
        else if (speedValue >= speedLimit * 0.7) { speedRating = '🔥 极品'; speedColor = '#2d6b2d'; }
        else if (speedValue >= speedLimit * 0.5) { speedRating = '📊 优秀'; speedColor = '#b48b3a'; }
        else if (speedValue > 0) { speedRating = '📉 一般'; speedColor = '#5a7a94'; }
        else { speedRating = '⬇️ 低价值'; speedColor = '#8a6a8a'; }
        html += `<div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);"><div style="font-weight:600;color:#e0e8f0;">💨 配速价值</div><div style="font-size:1.2rem;font-weight:700;color:${speedColor};">${speedValue.toFixed(1)}</div><div style="font-size:0.7rem;color:#8ab0c8;">速度+敏捷 = ${speed.toFixed(1)} + ${agility.toFixed(1)} | 极限 ${speedLimit}</div><div style="font-weight:600;color:${speedColor};">${speedRating}</div></div>`;
        const defLimit = limits['防御'] || 0;
        let defRating = '', defColor = '#5a7a94';
        if (defense >= defLimit * 0.9) { defRating = '🌟 超极品！'; defColor = '#dbbd7c'; }
        else if (defense >= defLimit * 0.7) { defRating = '🔥 极品'; defColor = '#2d6b2d'; }
        else if (defense >= defLimit * 0.5) { defRating = '📊 优秀'; defColor = '#b48b3a'; }
        else if (defense > 0) { defRating = '📉 一般'; defColor = '#5a7a94'; }
        else { defRating = '⬇️ 低价值'; defColor = '#8a6a8a'; }
        html += `<div style="background:${scoreBg};border-radius:12px;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);"><div style="font-weight:600;color:#e0e8f0;">🛡️ 防御价值</div><div style="font-size:1.2rem;font-weight:700;color:${defColor};">${defense.toFixed(1)}</div><div style="font-size:0.7rem;color:#8ab0c8;">防御 = ${defense.toFixed(1)} | 极限 ${defLimit}</div><div style="font-weight:600;color:${defColor};">${defRating}</div></div>`;
        html += `</div>`;
        el.innerHTML = html;
    }
};

// ============================================================
//  自动初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PetEquipmentQueryModule.init());
} else {
    PetEquipmentQueryModule.init();
}

window.PetEquipmentQueryModule = PetEquipmentQueryModule;
