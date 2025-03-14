# Dify WebUI 🤖

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

基于 Dify API 构建的现代化桌面智能对话应用，为企业提供开箱即用的AI对话解决方案。支持多轮深度思考模式，帮助用户进行系统化分析和深度探讨。

**由于设备限制，目前仅提供Windows平台安装包。其他平台需要clone代码自行构建。**

## 🌟 深度思考模式
**最新支持 OpenAI 格式的各种模型供应商，支持深度思考模式，通过多轮迭代提供更全面的分析和见解。**

| 思考过程展示 | 多轮思考改进 |
|---------|---------|
| ![Think Process](doc/image/think.png) | ![Think Message](doc/image/think-message.png) |

## 🔄 多应用支持
| 多应用配置 | 应用切换 |
|---------|---------|
| ![Settings](doc/image/multiyapp.png) | ![Choose](doc/image/chooseapp.png) |
| 思考过程（折叠） | 思考过程（展开） |
| ![Process Folded](doc/image/deepseek-1.png) | ![Process Unfolded](doc/image/deepseek-2.png) |

## ✨ 核心优势

| 特性 | 描述 |
|------|------|
| 🧠 深度思考 | 支持3-10轮深度思考，每轮都在前一轮基础上进行优化和完善 |
| 🎨 主题定制 | 支持企业级主题配置，提供10+预设配色方案，CSS变量深度定制 |
| 💬 智能对话 | 支持上下文感知对话，消息历史管理，智能对话分支回溯（未来将支持） |
| 📝 专业渲染 | 完整支持GFM标准，数学公式/流程图/甘特图专业渲染 |
| 💻 开发友好 | 代码块语法高亮支持50+编程语言，黑暗模式编码体验 |
| 🌐 多端适配 | 响应式布局完美适配4K显示器/笔记本/平板设备 |

## 🚀 快速入门

### 环境要求
- Node.js 18+
- npm 9+
- Dify 有效API Key

### 安装步骤
```bash
# 克隆仓库
git clone https://github.com/machaojin1917939763/Dify-WebUI.git

# 安装依赖
cd Dify-WebUI && npm install

# 开发模式
npm run start

# 生产构建
npm run publish:win   # Windows版本
npm run publish:mac   # macOS版本
npm run publish:linux # Linux版本

# 或直接运行网页版
直接打开 index.html
```

### Dify配置指引
1. 登录[Dify控制台](https://cloud.dify.ai/)
2. 创建新应用 → 选择"对话型应用"
3. 获取API端点与密钥
4. 在设置面板中填入配置信息

## 🖥 界面预览

| 欢迎页面 | 对话界面 |
|---------|---------|
| ![Welcome](doc/image/welcome.png) | ![Chat](doc/image/conversation.png) |

| 设置面板 | 语音交互 |
|---------|---------|
| ![Settings](doc/image/settings.png) | ![Voice](doc/image/voice.png) |

## 🛠 功能架构

```mermaid
graph TD
    A[用户界面] --> B[API网关]
    B --> C{功能模块}
    C --> D[对话管理]
    C --> E[知识库检索]
    C --> F[配置中心]
    D --> G[上下文处理]
    D --> H[消息持久化]
    E --> I[文档解析]
    E --> J[向量检索]
    F --> K[主题管理]
    F --> L[API配置]
```

## 📌 版本路线

### v1.2 (当前版本)
- ✅ Dify API 标准集成
- ✅ 多轮思考模式
- ✅ 主题配置系统
- ✅ 响应式布局框架

### v1.3 (开发中)
- 🕶️ 全局黑暗模式
- 📤 思考记录导出(PDF/Markdown)
- 🌍 多语言支持(中/英/日)
- 🧩 插件市场原型

### v1.4 (规划中)
- 🔐 企业级权限管理
- 📊 思考分析仪表盘
- 🤖 多AI供应商支持
- 📱 移动端适配优化

## 🤝 参与贡献

欢迎通过以下方式参与项目：
1. 提交 [Issues](https://github.com/machaojin1917939763/Dify-WebUI/issues) 报告问题
2. 发起 [Pull Requests](https://github.com/machaojin1917939763/Dify-WebUI/pulls) 贡献代码
3. 参与 [Discussions](https://github.com/machaojin1917939763/Dify-WebUI/discussions) 讨论功能
4. 完善 [项目文档](doc/)

请先阅读 [贡献指南](CONTRIBUTING.md) 了解开发规范。

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源，可自由用于商业项目。使用须知：
- 保留原始版权声明
- 不得用于违法用途
- 不对使用结果承担责任