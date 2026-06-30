# 日志分析工具设计文档

## 概述

基于 Web 技术的客户端日志分析工具，支持加载 JSONL 格式的日志文件并进行多维度过滤与分析。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| 构建 | Vite |
| 样式 | UnoCSS (inline utility class + 自定义 shortcuts) |
| 虚拟滚动 | @tanstack/vue-virtual |
| 运行时 | 纯浏览器端，不上传任何文件 |

## 架构

```
用户操作 (文件拖拽/选择 / 点击过滤 / 搜索输入)
  └─→ parser.ts (解析 JSONL，自动探测字段映射)
       └─→ store.ts (响应式状态，computed 自动计算筛选结果)
            ├─→ Toolbar.vue (文件加载 + 等级过滤 + 搜索)
            ├─→ LogTable.vue (虚拟滚动容器)
            │    └─→ LogRow.vue (单行渲染 + 展开详情)
            └─→ StatsBar.vue (统计信息 + 占比条形图)
```

## 核心模块

### 1. 解析器 (`src/parser.ts`)

- `parseJSONL(text: string): LogEntry[]` — 解析 JSONL 文本
- `detectFields(samples: object[]): FieldMapping` — 自动探测字段名
- 支持字段名自动匹配：
  - 日志等级: `level` / `severity` / `log_level` / `loglevel` / `sev`
  - 时间戳: `timestamp` / `@timestamp` / `time` / `datetime` / `date` / `ts`
  - 消息内容: `message` / `msg` / `log` / `content` / `text` / `body`
- 等级标准化：`WARNING → WARN`, `CRITICAL → FATAL`，未知等级默认 `INFO`
- 无效 JSON 行自动跳过

### 2. 状态管理 (`src/store.ts`)

使用 Vue `reactive` + `computed` 管理全局状态：

- `entries` — 原始日志条目
- `filter.levels` — 当前选中的日志等级
- `filter.search` — 搜索关键词
- `filteredEntries` — 自动计算的过滤后列表
- `stats` — 自动计算的统计数据（总条数、等级计数）

### 3. UI 组件

#### Toolbar.vue
- "打开日志" 按钮 → 隐藏的 `<input type="file">`
- 拖拽放置区（支持 `.jsonl` / `.log` / `.txt`）
- 等级多选框（DEBUG / INFO / WARN / ERROR / FATAL），附带各等级数量
- 搜索输入框（实时过滤，大小写不敏感）

#### LogTable.vue
- `@tanstack/vue-virtual` 虚拟滚动，仅渲染可视区域行
- 空状态提示
- 筛选变更时自动滚动到顶部

#### LogRow.vue
- 三列布局：时间戳 | 等级 | 消息内容
- 等级着色：DEBUG=青、INFO=蓝、WARN=黄、ERROR=红、FATAL=红底加粗
- 搜索关键词 `<mark>` 高亮
- 点击展开完整 JSON 详情

#### StatsBar.vue
- 总计 / 筛选后计数
- 各等级占比条形图（颜色编码）
- 各等级详细计数

## 数据格式

### LogEntry

```typescript
interface LogEntry {
  timestamp: string      // 原始时间戳字符串
  level: LogLevel        // DEBUG | INFO | WARN | ERROR | FATAL
  message: string        // 日志消息文本
  raw: Record<string, unknown>  // 原始 JSON 对象
}
```

### 输入格式 (JSONL)

每行一个合法的 JSON 对象。示例：

```json
{"timestamp": "2024-01-01 12:00:00", "level": "ERROR", "message": "连接超时", "pid": 1234}
{"timestamp": "2024-01-01 12:00:01", "level": "INFO", "message": "请求开始", "pid": 1234}
```

## 界面布局

```
┌──────────────────────────────────────────────────┐
│ [打开日志]  拖拽区域          ☑ DEBUG(12)  ...   │  ← Toolbar
│                              [   搜索...   ]      │
├──────────────────────────────────────────────────┤
│ 虚拟滚动日志表格                                  │  ← LogTable
│ 2024-01-01 12:00:00  ERROR  连接超时        ▼    │
│ ...                                              │
│                                                  │
├──────────────────────────────────────────────────┤
│ 总计 380 条           ▃▃▆▇█                     │  ← StatsBar
│ DEBUG=12 INFO=300 WARN=40 ERROR=20 FATAL=8       │
└──────────────────────────────────────────────────┘
```

## 快速开始

```bash
npm install
npm run dev      # 开发服务器 (Vite HMR)
npm run build    # 生产构建 → dist/
npm run preview  # 预览生产构建
```
