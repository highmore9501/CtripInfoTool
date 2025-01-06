# My Chrome Extension

这是一个简单的Chrome扩展，旨在提取当前网页中的特定信息。

## 项目结构

```
my-chrome-extension
├── src
│   ├── background.js       // 后台脚本，处理扩展的生命周期事件和与其他脚本的通信
│   ├── content.js          // 内容脚本，注入到网页中以提取特定信息
│   ├── manifest.json       // 扩展的配置文件，定义基本信息和权限
│   └── popup
│       ├── popup.html      // 弹出窗口的HTML结构
│       ├── popup.js        // 弹出窗口的JavaScript逻辑
│       └── popup.css       // 弹出窗口的样式表
├── images
│   └── icon.png            // 扩展的图标
└── README.md               // 项目的文档
```

## 安装

1. 下载或克隆此项目。
2. 打开Chrome浏览器，进入 `chrome://extensions/`。
3. 启用开发者模式。
4. 点击“加载已解压的扩展程序”，选择项目的根目录 `my-chrome-extension`。

## 使用

1. 在浏览器中打开任何网页。
2. 点击工具栏中的扩展图标，打开弹出窗口。
3. 根据需要提取特定信息。

## 贡献

欢迎任何形式的贡献！请提交问题或拉取请求。"# CtripInfoTool" 
