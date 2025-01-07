// 此文件是扩展的后台脚本，负责处理扩展的生命周期事件和与其他脚本的通信。

chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展已安装");
});

// 监听来自 content.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("接收到消息: ", request);
  if (request.action === "copyToClipboard" && request.text) {
    console.log("接收到行程信息，准备复制到剪贴板: ", request.text);
    navigator.clipboard
      .writeText(request.text)
      .then(() => {
        console.log("行程信息已复制到剪贴板");
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error("复制到剪贴板失败: ", err);
        sendResponse({ success: false, error: err });
      });
    return true; // 保持消息通道打开
  } else {
    console.error("未知的 action: ", request.action);
    sendResponse({ success: false, error: "未知的 action" });
  }
});
