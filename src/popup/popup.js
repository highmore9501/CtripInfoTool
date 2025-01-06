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
  let final_result = "";
  function extractTextByTitle(title, trip_card_mod) {
    if (title == "飞机") {
      // 提取城市信息
      const city_spans = trip_card_mod.querySelectorAll("div.city_info span");
      const city_info = Array.from(city_spans)
        .map((span) => span.textContent.trim())
        .filter((text) => text.length > 0)
        .join("-");

      // 提取航班时间和机场信息
      const times = trip_card_mod.querySelectorAll("div.time");
      const airports = trip_card_mod.querySelectorAll("div.airport");
      const time_info = `${times[0].textContent.trim()}-${times[1].textContent.trim()}`;
      const airport_info = `${airports[0].textContent.trim()}-${airports[1].textContent.trim()}`;

      // 提取航班号
      const flight_info = trip_card_mod
        .querySelector("div.flight_info")
        .textContent.trim();
      const flight_number = flight_info.match(/([A-Z]{2}\d+)/)[0];

      // 拼接最终结果
      return `${city_info} ${time_info} ${flight_number} ${airport_info}`;
    } else if (title == "景点") {
      // 检查是否存在"入内参观"的text_label
      const text_labels = trip_card_mod.querySelectorAll("span.text_label");
      const hasInnerVisit = Array.from(text_labels).some(
        (label) => label.textContent.trim() === "入内参观"
      );

      if (hasInnerVisit) {
        // 返回景点名称
        const attractionName = trip_card_mod
          .querySelector("div.text_name p.main")
          .textContent.trim();
        return attractionName;
      }
    }

    return null;
  }

  // 查询所有class包含text-label的div元素
  const elements = document.querySelectorAll("div.trip_card_title_mod");
  elements.forEach((element) => {
    const title = element.querySelector("div.trip_card_title").textContent;
    const trip_card_mod = element.querySelector("div.trip_card_mod");
    const result = extractTextByTitle(title, trip_card_mod);
    final_result += result + "\n";
  });

  // 将文本内容拼接成一个字符串
  console.log(final_result);
  return final_result;
}
