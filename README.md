# Log Tools

基于 Web 的客户端日志分析工具，支持 JSONL 和 Nginx 访问日志的解析与过滤。

## 技术栈

Vue 3 + TypeScript + Vite + UnoCSS + @tanstack/vue-virtual

## 快速开始

```bash
npm install
npm run dev      # 开发服务器 (HMR)
npm run build    # 生产构建 → dist/
npm run preview  # 预览生产构建
```

## 支持格式

| 格式 | 检测方式 | 说明 |
|------|----------|------|
| **JSONL** | 行首 `{` / `[` + JSON.parse | 自动探测 timestamp / level / message 字段名 |
| **Nginx Combined** | 正则匹配 | `$request $status` 作为消息，状态码映射日志等级 |
| **Nginx CLF** | 正则匹配 | 同上（无 referer / user-agent） |
| **纯文本** | 回退 | 全部归为 INFO |

等级映射（Nginx）：5xx → ERROR, 4xx → WARN, 其他 → INFO

## 功能

- 拖拽 / 文件选择器加载日志
- 按日志等级过滤（DEBUG / INFO / WARN / ERROR / FATAL）
- 搜索词实时过滤（大小写不敏感，全字段匹配）
- 虚拟滚动（万级日志流畅渲染）
- 点击日志行 → 右侧详情面板（展示完整 JSON）
- 自动检测输入格式

## 项目结构

```
log-tools/
├── index.html
├── vite.config.ts          # UnoCSS 主题色配置
├── src/
│   ├── main.ts
│   ├── App.vue             # 主布局：工具栏 + 日志区 + 详情面板
│   ├── parser.ts           # 格式自动检测 + JSONL/Nginx 解析
│   ├── store.ts            # 响应式状态管理
│   ├── types.ts            # 类型定义
│   └── components/
│       ├── Toolbar.vue     # 工具栏（打开、等级过滤、搜索）
│       ├── LogTable.vue    # 虚拟滚动日志列表
│       ├── LogRow.vue      # 单行渲染
│       └── DetailPanel.vue # 右侧详情面板
└── docs/
    └── design.md           # 设计文档
```

## License

Apache 2.0
