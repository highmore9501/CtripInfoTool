// 定义提取文本标签的函数
function extractTextLabels() {
  let final_result = {
    航班信息: [],
    景点信息: [],
    酒店信息: [],
  };

  function extractTextByTitle(title, trip_card_mod, date_info) {
    if (title == "飞机") {
      // 提取城市信息
      const city_spans = trip_card_mod.querySelectorAll("div.city_info span");
      const city_info = Array.from(city_spans)
        .map((span) => span.textContent.trim())
        .filter((text) => text.length > 0)
        .join("-");

      // 提取航班时间和机场信息
      const times = trip_card_mod.querySelectorAll("div.time");
      const time_info = `${times[0].textContent.trim()}-${times[1].textContent.trim()}`;

      // 提取航班号
      const flight_info = trip_card_mod
        .querySelector("div.flight_info")
        .textContent.trim();
      const flight_number = flight_info.match(/([A-Z]{2}\d+)/)[0];

      // 拼接最终结果
      const flight_details = {
        日期: date_info,
        内容: `${city_info} ${time_info} ${flight_number}`,
      };
      final_result["航班信息"].push(flight_details);
    } else if (title == "景点" || title == "特色体验") {
      // 返回景点名称
      const attractionName = trip_card_mod
        .querySelector("div.text_name p.main")
        .textContent.trim();
      const attraction_details = {
        日期: date_info,
        内容: attractionName,
      };
      final_result["景点信息"].push(attraction_details);
    } else if (title == "酒店") {
      // 提取酒店名称
      const hotelName = trip_card_mod
        .querySelector("div.text_name p.main")
        .textContent.trim();
      const hotel_details = {
        日期: date_info,
        内容: hotelName,
      };
      final_result["酒店信息"].push(hotel_details);
    }

    return null;
  }

  const day_list = document.querySelectorAll("div.day_li");
  day_list.forEach((day) => {
    const city_name = day.querySelector("div.city_name");
    const dateText = city_name.textContent.trim();
    const dateMatch = dateText.match(/(\d{1,2}月\d{1,2}日)/);
    const date_info = dateMatch ? dateMatch[0] : null;

    const elements = day.querySelectorAll("div.trip_card_title_mod");
    elements.forEach((element) => {
      const title = element.querySelector("div.trip_card_title").textContent;
      const trip_card_mod = element.querySelector("div.trip_card_mod");
      extractTextByTitle(title, trip_card_mod, date_info);
    });
  });

  // 将文本内容拼接成一个字符串
  console.log(final_result);
  return final_result;
}

// 事件监听器
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
          if (results && results[0] && results[0].result) {
            const finalResult = results[0].result;
            let output = "";

            // 处理航班信息
            output += "航班信息：\n";
            finalResult["航班信息"].forEach((flight) => {
              output += `${flight.日期} ${flight.内容}\n`;
            });
            output += "\n";

            // 处理酒店信息
            output += "酒店信息：\n";
            const hotelInfo = finalResult["酒店信息"];
            let currentHotel = null;
            let currentStartDate = null;
            hotelInfo.forEach((hotel, index) => {
              if (currentHotel === hotel.内容) {
                // 如果酒店名称相同，更新结束日期
                currentEndDate = hotel.日期;
              } else {
                // 如果酒店名称不同，输出之前的酒店信息
                if (currentHotel) {
                  if (currentStartDate === currentEndDate) {
                    output += `${currentStartDate} ${currentHotel}\n`;
                  } else {
                    output += `${currentStartDate}-${currentEndDate} ${currentHotel}\n`;
                  }
                }
                // 更新当前酒店信息
                currentHotel = hotel.内容;
                currentStartDate = hotel.日期;
                currentEndDate = hotel.日期;
              }
              // 输出最后一个酒店信息
              if (index === hotelInfo.length - 1) {
                if (currentStartDate === currentEndDate) {
                  output += `${currentStartDate} ${currentHotel}\n`;
                } else {
                  output += `${currentStartDate}-${currentEndDate} ${currentHotel}\n`;
                }
              }
            });
            output += "\n";

            // 处理景点信息
            output += "景点信息：\n";
            const attractionInfo = finalResult["景点信息"];
            let currentAttractionDate = null;
            let currentAttractions = [];
            attractionInfo.forEach((attraction, index) => {
              if (currentAttractionDate === attraction.日期) {
                // 如果日期相同，添加到当前景点列表
                currentAttractions.push(attraction.内容);
              } else {
                // 如果日期不同，输出之前的景点信息
                if (currentAttractionDate) {
                  output += `${currentAttractionDate} ${currentAttractions.join(
                    "+"
                  )}\n`;
                }
                // 更新当前景点信息
                currentAttractionDate = attraction.日期;
                currentAttractions = [attraction.内容];
              }
              // 输出最后一个景点信息
              if (index === attractionInfo.length - 1) {
                output += `${currentAttractionDate} ${currentAttractions.join(
                  "+"
                )}\n`;
              }
            });

            // 复制到剪贴板
            navigator.clipboard
              .writeText(output)
              .then(() => {
                alert("文本内容已复制到剪贴板");
              })
              .catch((err) => {
                alert("复制到剪贴板失败: " + err);
              });
          } else {
            alert("未能提取文本内容。");
          }
        }
      );
    });
  });
});
