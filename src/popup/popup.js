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

  const extractGuestInfoButton = document.getElementById(
    "extract-guest-info-button"
  );

  extractGuestInfoButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // 注入 content.js 并执行 extract_guest_info 函数
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"], // 注入 content.js
        },
        () => {
          // 在 content.js 注入完成后，调用 extract_guest_info
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              // 调用 content.js 中的 extract_guest_info 函数
              if (typeof window.extract_guest_info === "function") {
                return window.extract_guest_info();
              } else {
                throw new Error("extract_guest_info 函数未定义");
              }
            },
          });
        }
      );
    });
  });

  const extractAirplaneInfoButton = document.getElementById(
    "extract-airplane-info-button"
  );

  extractAirplaneInfoButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // 注入 content.js 并执行 extract_airplane_info 函数
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"], // 注入 content.js
        },
        () => {
          // 在 content.js 注入完成后，调用 extract_airplane_info
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              // 调用 content.js 中的 extract_airplane_info 函数
              if (typeof window.extract_airplane_info === "function") {
                return window.extract_airplane_info();
              } else {
                throw new Error("extract_airplane_info 函数未定义");
              }
            },
          });
        }
      );
    });
  });
});
