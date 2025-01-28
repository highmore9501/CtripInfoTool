// 定义提取文本标签的函数
function extractTextLabels() {
  const tourActivityTypes = [
    "特色体验",
    "美食美酒",
    "深度人文",
    "温泉",
    "一日游",
    "户外探索",
    "体检",
    "文化艺术",
    "户外野奢",
    "游艇帆船",
    "游艇",
    "帆船",
    "游轮",
    "全球户外",
    "主题团建",
    "流行时尚",
    "会议会务",
    "宗教文化",
    "旅拍",
    "骑行",
    "潜水",
    "商务考察",
    "徒步登山",
    "露营",
    "高空项目",
    "自驾",
    "摄影",
    "滑雪",
    "人文家访",
    "骑马",
    "动物观察",
    "非遗体验",
    "直升机",
    "极地探索",
    "徒步",
    "登山",
    "禅修养生",
    "海钓",
    "冲浪",
    "漂流",
    "越野ATV",
    "个人自驾",
    "大咖讲解",
    "高尔夫",
    "教学讲解",
    "农耕体验",
    "健康医疗",
    "固定翼飞机",
    "体育赛事",
    "房车",
    "天文课堂",
    "皮划艇",
    "赛事庆典",
    "滑翔伞",
    "军事探秘",
    "探洞",
    "节日庆典",
    "滑沙",
    "攀岩",
    "跳伞",
    "婚礼",
    "演出",
    "演唱会",
    "地理课堂",
    "动植物课堂",
    "投资置业",
    "音乐节",
    "溯溪",
    "潜水考证",
    "桨板",
    "马拉松",
    "潜水摄影",
    "蹦极",
    "婚纱摄影",
    "体育赛事",
    "瑜伽冥想",
    "手作体验",
    "主题乐园",
  ];
  let final_result = {
    航班信息: [],
    景点信息: [],
    酒店信息: [],
    用车信息: [],
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
      let flight_number_match = flight_info.match(/([A-Z]{2}\d+)/);

      if (!flight_number_match || !flight_number_match[0]) {
        // 如果默认匹配模式取不到结果，使用另一个匹配模式
        flight_number_match = flight_info.match(/(\d+[A-Z]{1}\d+)/);
      }

      const flight_number =
        flight_number_match && flight_number_match[0]
          ? flight_number_match[0]
          : "未知航班号";

      // 拼接最终结果
      const flight_details = {
        日期: date_info,
        内容: `${city_info} ${time_info} ${flight_number}`,
      };
      final_result["航班信息"].push(flight_details);
    } else if (title == "景点" || tourActivityTypes.includes(title)) {
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
    } else if (title == "用车") {
      // 提取用车信息
      const carInfo = trip_card_mod
        .querySelector("p.city_name.open_time")
        .textContent.trim();

      const car_details = {
        日期: date_info,
        内容: carInfo,
      };
      final_result["用车信息"].push(car_details);
    }

    return null;
  }

  console.log("提取行程信息...");
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

  // 寻找酒店明细元素，是一个div，而且它的index="酒店"
  const hotel_details = document.querySelector("div[index='酒店']");

  let hotel_room_map = {};

  // 如果找到酒店明细元素，提取酒店房间信息
  if (hotel_details) {
    const quotaion_card_mods = hotel_details.querySelectorAll(
      "div.quotaion_card_mod"
    );
    quotaion_card_mods.forEach((quotaion_card_mod) => {
      const hotel_name = quotaion_card_mod
        .querySelector("div.price_text")
        .textContent.trim();
      const hotel_detail_mod = quotaion_card_mod.querySelector(
        "div.hotel_detail_mod"
      );
      const room_title = hotel_detail_mod
        .querySelector("div.title")
        .textContent.trim();
      const price_num = quotaion_card_mod
        .querySelector("span.price_num")
        .textContent.trim();
      hotel_room_map[hotel_name] = room_title + " " + price_num;
    });
  }

  // 处理 final_result 并生成输出字符串
  let output = "";

  // 处理航班信息
  output += "航班信息：\n";
  final_result["航班信息"].forEach((flight) => {
    output += `${flight.日期} ${flight.内容}\n`;
  });
  output += "\n";

  // 处理酒店信息
  output += "酒店信息：\n";
  const hotelInfo = final_result["酒店信息"];
  let currentHotel = null;
  let currentStartDate = null;
  let currentEndDate = null;
  hotelInfo.forEach((hotel, index) => {
    if (currentHotel === hotel.内容) {
      // 如果酒店名称相同，更新结束日期
      currentEndDate = hotel.日期;
    } else {
      // 如果酒店名称不同，输出之前的酒店信息
      if (currentHotel) {
        if (currentStartDate === currentEndDate) {
          output += `${currentStartDate} ${currentHotel}`;
        } else {
          output += `${currentStartDate}-${currentEndDate} ${currentHotel}`;
        }
        // 添加房型信息
        if (hotel_room_map[currentHotel]) {
          output += ` (${hotel_room_map[currentHotel]})`;
        }
        output += "\n";
      }
      // 更新当前酒店信息
      currentHotel = hotel.内容;
      currentStartDate = hotel.日期;
      currentEndDate = hotel.日期;
    }
    // 输出最后一个酒店信息
    if (index === hotelInfo.length - 1) {
      if (currentStartDate === currentEndDate) {
        output += `${currentStartDate} ${currentHotel}`;
      } else {
        output += `${currentStartDate}-${currentEndDate} ${currentHotel}`;
      }
      // 添加房型信息
      if (hotel_room_map[currentHotel]) {
        output += ` (${hotel_room_map[currentHotel]})`;
      }
      output += "\n";
    }
  });
  output += "\n";

  // 处理景点信息
  output += "景点信息：\n";
  const attractionInfo = final_result["景点信息"];
  let currentAttractionDate = null;
  let currentAttractions = [];
  attractionInfo.forEach((attraction, index) => {
    if (currentAttractionDate === attraction.日期) {
      // 如果日期相同，添加到当前景点列表
      currentAttractions.push(attraction.内容);
    } else {
      // 如果日期不同，输出之前的景点信息
      if (currentAttractionDate) {
        output += `${currentAttractionDate} ${currentAttractions.join("+")}\n`;
      }
      // 更新当前景点信息
      currentAttractionDate = attraction.日期;
      currentAttractions = [attraction.内容];
    }
    // 输出最后一个景点信息
    if (index === attractionInfo.length - 1) {
      output += `${currentAttractionDate} ${currentAttractions.join("+")}\n`;
    }
  });
  output += "\n";

  // 处理用车信息
  output += "用车信息：\n";
  final_result["用车信息"].forEach((car) => {
    output += `${car.日期} ${car.内容}\n`;
  });

  console.log("提取结果：", final_result);

  // 在 extractTextLabels 中调用 copyToClipboard
  fallbackCopyToClipboard(output);

  return output;
}

// 复制到剪贴板
function copyToClipboard(text) {
  // 尝试使用 navigator.clipboard.writeText
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("行程信息已复制到剪贴板");
      })
      .catch((err) => {
        // 如果 navigator.clipboard 失败，尝试使用 document.execCommand
        fallbackCopyToClipboard(text);
      });
  } else {
    // 如果不支持 navigator.clipboard，直接使用 document.execCommand
    console.log("navigator.clipboard 不可用");
    fallbackCopyToClipboard(text);
  }
}

// 备用复制方法
function fallbackCopyToClipboard(text) {
  console.log("使用备用方法");
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; // 避免滚动到输入框
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      alert("行程信息已复制到剪贴板");
    } else {
      alert("复制到剪贴板失败");
    }
  } catch (err) {
    alert("复制到剪贴板失败: " + err);
  }

  document.body.removeChild(textArea);
}

function extract_guest_info() {
  // 1. 在当前页面中寻找class为`ant-table-tbody`的所有div
  const cardBodys = document.querySelectorAll("div.ant-card-body");
  // 使用最后一个cardBody
  const cardBody = cardBodys[cardBodys.length - 1];

  if (!cardBody) {
    console.error("未找到 class 为 'ant-card-body' 的div元素");
    return;
  }

  const tableBody = cardBody.querySelector("tbody.ant-table-tbody");

  if (!tableBody) {
    console.error("未找到 class 为 'ant-table-tbody' 的td元素");
    return;
  }

  // 2. 寻找表格下面所有的`tr`元素，也就是表格里的每一行
  const rows = tableBody.querySelectorAll("tr");

  const columnsToExtract = [1, 5, 13]; // 定义要提取的列的数组

  // 3. 把每一行里的每一个`td`里的内容都提取出来，也就是表格里每个单元格的内容
  const tableData = [];
  rows.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (columnsToExtract.includes(index)) {
        let cellContent = cell.textContent.trim();
        if (cellContent) {
          // 如果是第13列，提取内容并用空格分割，取分割后的后面一个元素
          if (index === 13) {
            const parts = cellContent.split(" ");
            cellContent = parts[parts.length - 1];
          }
          rowData.push(cellContent);
        }
      }
    });
    tableData.push(rowData);
  });

  console.log("提取的表格数据：", tableData);

  let output = "";
  tableData.forEach((row) => {
    output += row.join(" ") + "\n";
  });

  fallbackCopyToClipboard(output);

  // 返回提取的数据
  return tableData;
}

// 暴露函数给外部调用
window.extract_guest_info = extract_guest_info;
window.extractTextLabels = extractTextLabels;
