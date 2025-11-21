# Stealth Vocab 技术设计方案 V1.0

## 1. 技术架构总览

### 1.1 技术栈选择

| **技术组件** | **选型** | **选择理由** |
|-------------|----------|-------------|
| **扩展平台** | Chrome Extension Manifest V3 | 原生支持、性能最优、安全可靠 |
| **UI 框架** | 原生 HTML + CSS + JavaScript | 零框架开销、响应速度最快、体积最小 |
| **存储方案** | Chrome Storage API (local) | 瞬时访问、离线可用、自动持久化 |
| **UI 组件** | Chrome Side Panel API | 原生侧边栏、系统集成度高、用户习惯 |
| **快捷键** | Chrome Commands API | 全局热键支持、冲突管理、标准化 |

### 1.2 性能要求

- **所有交互响应时间 < 150ms**
- **UI 显示/隐藏 < 100ms**
- **状态读取/写入 < 10ms**
- **卡片翻面 < 20ms**
- **下一个词加载 < 30ms**

## 2. 系统架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────┐
│                 Chrome Extension                │
├─────────────────────────────────────────────────┤
│  Background Script (background.js)              │
│  ├─ Commands API Listener (Ctrl+Shift+V)       │
│  ├─ State Management                           │
│  ├─ Side Panel Control                         │
│  └─ Storage Operations                         │
├─────────────────────────────────────────────────┤
│  Side Panel UI (sidepanel.html/js/css)         │
│  ├─ Vocabulary Display                         │
│  ├─ Card Flip Animation                        │
│  ├─ Three-state Feedback                       │
│  └─ Progress Indicator                         │
├─────────────────────────────────────────────────┤
│  Storage Layer                                 │
│  ├─ chrome.storage.local (Current State)       │
│  ├─ chrome.storage.local (Vocabulary Data)     │
│  └─ chrome.storage.local (User Progress)       │
└─────────────────────────────────────────────────┘
```

### 2.2 核心模块设计

#### 2.2.1 背景脚本 (background.js)

**职责:**
- 监听全局快捷键 `Ctrl+Shift+V`
- 管理 Side Panel 显示/隐藏
- 处理状态持久化
- 协调各组件通信

**核心功能:**
```javascript
// 快捷键处理
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-sidepanel') {
    toggleSidePanel();
  }
});

// Side Panel 控制
async function toggleSidePanel() {
  const currentPanel = await chrome.sidePanel.getOptions();
  // 切换显示/隐藏逻辑
}

// 状态管理
class StateManager {
  async getCurrentState() { /* 获取当前学习状态 */ }
  async updateState(newState) { /* 更新学习状态 */ }
  async resetDailyProgress() { /* 重置每日进度 */ }
}
```

#### 2.2.2 侧边栏界面 (sidepanel.html/js/css)

**UI 设计原则:**
- 深色主题，低对比度
- 极简设计，无动画效果
- 窄高布局，类似侧边栏
- 元素大小适中，便于快速点击

**核心组件:**
```html
<!-- 主要结构 -->
<div class="stealth-container">
  <!-- 进度指示器 -->
  <div class="progress-indicator">今日已复习 <span id="count">0</span> 个词</div>

  <!-- 词汇卡片 -->
  <div class="vocabulary-card" id="wordCard">
    <div class="card-front">
      <div class="chinese-definition" id="chineseText"></div>
    </div>
    <div class="card-back" style="display:none;">
      <div class="english-word" id="englishText"></div>
      <div class="phonetic" id="phoneticText"></div>
    </div>
  </div>

  <!-- 反馈按钮 -->
  <div class="feedback-buttons">
    <button class="feedback-btn mastered" data-state="mastered">✅</button>
    <button class="feedback-btn vague" data-state="vague">❓</button>
    <button class="feedback-btn forgotten" data-state="forgotten">❌</button>
  </div>
</div>
```

#### 2.2.3 存储层设计

**数据结构:**
```javascript
// 学习状态 (studyState)
{
  "currentWordId": "word_123",           // 当前单词ID
  "isFlipped": false,                    // 是否已翻面
  "currentIndex": 5,                     // 当前复习列表索引
  "todayReviewCount": 12,                // 今日复习数量
  "lastReviewDate": "2025-11-21",        // 最后复习日期
  "sessionStartTime": 1642780800000,     // 当前会话开始时间
  "wordStatuses": {                      // 单词掌握状态
    "word_123": "mastered",
    "word_124": "vague",
    "word_125": "forgotten"
  }
}

// 词汇数据 (vocabData)
{
  "word_123": {
    "chinese": "例证；说明",
    "english": "illustration",
    "phonetic": "/ˌɪləˈstreɪʃn/",
    "difficulty": "medium",
    "category": "学术词汇"
  }
  // ... 更多词汇
}
```

**存储策略:**
- `chrome.storage.local` - 所有数据存储在本地
- 实时保存用户状态和进度
- 支持快速读写操作

## 3. MVP 功能清单

### 3.1 核心功能模块

#### C1: 核心唤醒/隐藏
- [ ] 全局快捷键 `Ctrl+Shift+V` 注册
- [ ] Side Panel 瞬时显示 (< 100ms)
- [ ] Side Panel 瞬时隐藏 (< 100ms)
- [ ] 快捷键冲突检测和处理

#### C2: 瞬时上下文恢复
- [ ] 当前单词 ID 状态保存
- [ ] 卡片翻面状态保存
- [ ] 复习列表索引保存
- [ ] 重启浏览器后状态恢复

#### C3: 极简复习界面
- [ ] 深色低对比度 UI 设计
- [ ] 窄高侧边栏布局
- [ ] 中文释义显示区域
- [ ] 英文单词+音标显示区域
- [ ] 三态反馈按钮
- [ ] 极简进度条

#### C4: 自测与翻面
- [ ] 首次仅显示中文释义
- [ ] 点击卡片翻面功能
- [ ] 空格键翻面支持
- [ ] 翻面状态实时保存

#### C5: 三态反馈与跳转
- [ ] `✅ 掌握` 按钮功能
- [ ] `❓ 模糊` 按钮功能
- [ ] `❌ 遗忘` 按钮功能
- [ ] 反馈状态实时存储
- [ ] 自动跳转至下一个词

#### C6: 简易复习算法
- [ ] 优先展示"遗忘"词汇逻辑
- [ ] 固定顺序展示逻辑
- [ ] 复习队列管理
- [ ] 词汇状态更新机制

#### D1: 进度与数据
- [ ] "今日已复习 X 个词"显示
- [ ] 实时进度更新
- [ ] 数据持久化存储
- [ ] 每日进度重置逻辑

### 3.2 文件结构

```
stealth-vocab/
├── manifest.json                 # 扩展配置文件
├── background.js                 # 后台脚本
├── sidepanel.html               # 主界面HTML
├── sidepanel.js                 # 界面交互逻辑
├── sidepanel.css                # 样式文件
├── data/
│   └── vocabulary.json          # IELTS词汇数据
└── utils/
    ├── storage.js               # 存储操作封装
    └── algorithm.js             # 复习算法实现
```

## 4. 实现细节

### 4.1 CSS 样式设计

**色彩方案 (低对比度深色主题):**
```css
:root {
  --background: #1a1a1a;        /* 非常深的灰色 */
  --surface: #252525;           /* 稍亮的表面色 */
  --text-primary: #606060;      /* 非常低对比度的文字 */
  --text-secondary: #404040;    /* 更低对比度的次要文字 */
  --accent-subtle: #353535;     /* 几乎看不见的高亮 */
  --border: #2a2a2a;            /* 最小边框 */
  --success: #4a5a4a;           /* 掌握按钮色 */
  --warning: #5a5a4a;           /* 模糊按钮色 */
  --error: #5a4a4a;             /* 遗忘按钮色 */
}
```

**关键样式规则:**
- 无任何动画或过渡效果
- 最小化边框和分割线
- 字体大小 14px 基础 (小但可读)
- 按钮尺寸适中，便于快速点击

### 4.2 性能优化策略

1. **预渲染UI元素**: 保持DOM元素就绪，仅切换可见性
2. **批量存储操作**: 合并多个状态变更
3. **使用CSS变换**: 硬件加速动画
4. **按需加载词汇**: 仅在需要时加载词数据
5. **内存管理**: 及时清理不需要的DOM引用

### 4.3 错误处理和容错

- **存储失败处理**: 检测存储API异常，提供重试机制
- **数据损坏检测**: 验证存储数据格式完整性
- **快捷键冲突**: 检测并处理与其他扩展的冲突
- **词汇数据缺失**: 处理词汇文件加载失败情况

## 5. 开发计划

### 5.1 开发阶段

**阶段1: 基础架构 (1-2小时)**
- 创建项目文件结构
- 配置 manifest.json
- 建立基础的 Side Panel

**阶段2: 核心UI开发 (3-4小时)**
- 实现极简深色主题UI
- 开发词汇卡片组件
- 添加三态反馈按钮

**阶段3: 交互逻辑 (2-3小时)**
- 实现快捷键系统
- 开发翻面功能
- 添加状态管理

**阶段4: 数据和算法 (2-3小时)**
- 实现存储系统
- 开发复习算法
- 添加进度追踪

**阶段5: 优化和测试 (1-2小时)**
- 性能优化
- 功能测试
- 用户体验调优

### 5.2 成功指标

- **响应时间**: 所有交互 < 150ms
- **稳定性**: 浏览器重启后状态100%恢复
- **兼容性**: 在 Chrome/Edge 上正常工作
- **隐蔽性**: 在办公环境中不易被发现

## 6. 风险评估

### 6.1 技术风险

- **Side Panel API限制**: 宽度限制可能影响UI设计
- **快捷键冲突**: 与其他软件的快捷键冲突
- **性能要求**: 严格的性能要求可能需要额外优化

### 6.2 缓解策略

- **备用方案**: 准备自定义浮窗作为Side Panel的备选
- **热键自定义**: 允许用户自定义快捷键
- **性能监控**: 持续监控和优化关键路径性能

---

*本设计方案基于 Chrome Extension Manifest V3 规范，确保最佳的兼容性和性能表现。*