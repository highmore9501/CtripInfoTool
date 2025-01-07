// 事件监听器
document.addEventListener("DOMContentLoaded", function () {
  const extractButton = document.getElementById("extract-button");

  extractButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // 注入 content.js 并执行 extractTextLabels 函数
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"], // 注入 content.js
        },
        () => {
          // 在 content.js 注入完成后，调用 extractTextLabels
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              // 调用 content.js 中的 extractTextLabels 函数
              if (typeof window.extractTextLabels === "function") {
                return window.extractTextLabels();
              } else {
                throw new Error("extractTextLabels 函数未定义");
              }
            },
          });
        }
      );
    });
  });
});
