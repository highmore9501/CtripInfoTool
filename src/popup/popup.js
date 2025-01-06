document.addEventListener("DOMContentLoaded", function () {
  const extractButton = document.getElementById("extract-button");

  extractButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: extractTextLabels,
        },
        (results) => {
          console.log("results", results);
        }
      );
    });
  });
});

// 定义提取文本标签的函数
function extractTextLabels() {
  function extractTextByTitle(title, trip_card_mod) {
    if (title == "飞机") {
      const city_info =
        trip_card_mod.querySelector("div.city_info").textContent;
      const trip_flt_mod = trip_card_mod.querySelector("div.trip_flt_mod");
      const flight_info =
        trip_flt_mod.querySelector("div.flight_info").textContent;

      return city_info + flight_info;
    }

    return null;
  }

  // 查询所有class包含text-label的div元素
  const elements = document.querySelectorAll("div.trip_card_title_mod");
  elements.forEach((element) => {
    const title = element.querySelector("div.trip_card_title").textContent;
    const trip_card_mod = element.querySelector("div.trip_card_mod");
    const result = extractTextByTitle(title, trip_card_mod);
    console.log(result);
  });
  // 读取它们的文本内容
  const counter = elements.length;
  // 将文本内容拼接成一个字符串
  return counter;
}
