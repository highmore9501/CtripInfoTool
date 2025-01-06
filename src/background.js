// 此文件是扩展的后台脚本，负责处理扩展的生命周期事件和与其他脚本的通信。

chrome.runtime.onInstalled.addListener(() => {
    console.log("扩展已安装");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        // 处理来自内容脚本的请求
        sendResponse({ data: "这是从后台脚本返回的数据" });
    }
});