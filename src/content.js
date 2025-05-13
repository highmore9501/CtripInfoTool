function extractTextLabels() {
  if (window.location.hostname.includes("ctrip.com")) {
    extractCtripTextLabels();
  } else if (window.location.hostname.includes("qunar.com")) {
    extractQunarTextLabels();
  } else {
    console.error("无法识别当前网页所属平台");
  }
}

function extractQunarTextLabels() {
  console.log("提取去哪儿行程信息...");

  const scheduleItems = document.querySelectorAll("div.schedule-item");
  const categories = {
    交通: [],
    住宿: [],
    用车: [],
    行程: {},
  };

  scheduleItems.forEach((item) => {
    const scheduleDay = item
      .querySelector("div.schedule-day")
      .textContent.trim();
    const dayNumber = parseInt(scheduleDay.split(" ")[1], 10);

    item.querySelectorAll("div.day-detail-item").forEach((detail) => {
      const type = detail
        .querySelector("div.day-detail-type")
        .textContent.trim();
      const content = extractTextByActivityType(type, detail);

      // 分类处理
      if (["飞机", "火车", "汽车", "轮船"].includes(type)) {
        categories.交通.push(`${scheduleDay} ${type} ${content}`);
      } else if (type === "住宿") {
        categories.住宿.push({ day: dayNumber, content });
      } else if (type === "用车") {
        categories.用车.push({ day: dayNumber, content });
      } else {
        if (!categories.行程[dayNumber]) categories.行程[dayNumber] = [];
        categories.行程[dayNumber].push(content);
      }
    });
  });

  // 合并连续天数
  const mergeDays = (entries, type) => {
    const grouped = {};
    entries.forEach((entry) => {
      if (!grouped[entry.content]) grouped[entry.content] = [];
      grouped[entry.content].push(entry.day);
    });

    const result = [];
    Object.entries(grouped).forEach(([content, days]) => {
      days.sort((a, b) => a - b);
      let start = days[0],
        end = days[0];

      for (let i = 1; i < days.length; i++) {
        if (days[i] === end + 1) end = days[i];
        else {
          result.push({ start, end, content, type });
          start = end = days[i];
        }
      }
      result.push({ start, end, content, type });
    });

    return result.map(
      ({ start, end, content, type }) =>
        `DAY ${start}${start !== end ? `-${end}` : ""} ${type} ${content}`
    );
  };

  // 处理住宿和用车
  categories.住宿 = mergeDays(categories.住宿, "住宿");
  categories.用车 = mergeDays(categories.用车, "用车");

  // 处理行程
  categories.行程 = Object.entries(categories.行程)
    .sort(([a], [b]) => a - b)
    .map(([day, items]) => `DAY ${day} ${items.join("+")}`);

  // 输出结果
  const output = [
    "交通：\n" + categories.交通.join("\n"),
    "住宿：\n" + categories.住宿.join("\n"),
    "行程：\n" + categories.行程.join("\n"),
    "用车：\n" + categories.用车.join("\n"),
  ].join("\n\n");

  console.log(output);
  fallbackCopyToClipboard(output);

  // 原提取函数保持不变
  function extractTextByActivityType(activityType, day_detail_item) {
    const getValueByPlaceholder = (placeholder) =>
      day_detail_item.querySelector(`input[placeholder='${placeholder}']`)
        ?.value || "";

    const getValueByLabel = (labelFor) => {
      const label = day_detail_item.querySelector(`label[for='${labelFor}']`);
      return label?.parentElement?.querySelector("input")?.value || "";
    };

    const getTimeValue = (labelFor) => {
      const label = day_detail_item.querySelector(`label[for='${labelFor}']`);
      return (
        label
          ?.closest("div.el-form-item")
          ?.querySelector("input[placeholder='选择时间']")?.value || ""
      );
    };

    const getSelectedRadioLabel = () => {
      const radio = [
        ...day_detail_item.querySelectorAll("input.el-radio__original"),
      ].find((r) => r.checked);
      return (
        radio
          ?.closest(".el-radio")
          ?.querySelector(".el-radio__label")
          ?.textContent?.trim() || ""
      );
    };

    const handlers = {
      飞机: () =>
        [
          getValueByPlaceholder("航班号"),
          `${getValueByPlaceholder("出发城市")}-${getValueByPlaceholder(
            "到达城市"
          )}`,
          `${getTimeValue("depTime")}-${getTimeValue("arrTime")}`,
        ].join(" "),

      火车: () =>
        [
          getValueByPlaceholder("车次号"),
          `${getValueByPlaceholder("出发城市")}-${getValueByPlaceholder(
            "到达城市"
          )}`,
          `${getTimeValue("depTime")}-${getTimeValue("arrTime")}`,
        ].join(" "),

      汽车: () =>
        [
          getValueByLabel("carType"),
          `${getValueByLabel("depPlace")}-${getValueByLabel("arrPlace")}`,
          `${getValueByLabel("depTime")}-${getValueByLabel("arrTime")}`,
        ].join(" "),

      轮船: () =>
        [
          getValueByLabel("shipName"),
          `${getValueByLabel("depPlace")}-${getValueByLabel("arrPlace")}`,
          `${getValueByLabel("depTime")}-${getValueByLabel("arrTime")}`,
        ].join(" "),

      用车: () => {
        const [hour, minute] = ["0~24之间的整数", "0~60之间的整数"].map(
          getValueByPlaceholder
        );
        return `${getSelectedRadioLabel()} ${hour}小时${minute}分钟`;
      },

      住宿: () => getValueByPlaceholder("请输入酒店名称"),
      景点: () =>
        getValueByPlaceholder("请输入景点名称").split(".").pop().trim(),
      餐饮: () => getValueByPlaceholder("请选择"),
      购物: () => getValueByPlaceholder("50个汉字"),
      活动: () => getValueByPlaceholder("请输入活动名称"),
    };

    return handlers[activityType]?.() || "";
  }
}

// 定义提取文本标签的函数
function extractCtripTextLabels() {
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
  if (window.location.hostname.includes("ctrip.com")) {
    extract_ctrip_guest_info();
  } else if (window.location.hostname.includes("qunar.com")) {
    extract_qunar_guest_info();
  } else {
    console.error("无法识别当前网页所属平台");
  }
}

function extract_ctrip_guest_info() {
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

function extract_qunar_guest_info() {
  const guestInfo = [];
  const PassengerInfoBody = document.querySelector("#PassengerInfo");

  // 查找所有包含客人信息的元素
  const guestElements = PassengerInfoBody.querySelectorAll(
    ".m-grid-items.m-traveller-item"
  );

  guestElements.forEach((guest) => {
    const name = guest
      .querySelectorAll("div")[1]
      .querySelector("span:nth-child(2)")
      ?.textContent.trim();
    const idNumber = guest
      .querySelectorAll("div")[7]
      .querySelector("span:nth-child(2)")
      ?.textContent.replace("解密", "")
      .trim();

    if (name && idNumber) {
      guestInfo.push({ name, idNumber });
    }
  });

  console.log("提取的客人信息：", guestInfo);

  let output = "";
  guestInfo.forEach((guest) => {
    output += `${guest.name} ${guest.idNumber}\n`;
  });

  fallbackCopyToClipboard(output);

  // 返回提取的数据
  return guestInfo;
}

function extract_airplane_info() {
  if (window.location.hostname.includes("ctrip.com")) {
    return ctrip_airplane_info();
  } else if (window.location.hostname.includes("qunar.com")) {
    return qunar_airplane_info();
  } else {
    console.error("无法识别当前网页所属平台");
  }
}

function qunar_airplane_info() {
  let final_result = "";
  const m_flightinfo = document.querySelector("div#m-flightinfo");
  const childrenOfChildren = Array.from(m_flightinfo.children).flatMap(
    (child) => Array.from(child.children)
  );

  childrenOfChildren.forEach((flightinfo) => {
    const flight_card_item = flightinfo.querySelector("div.section-hd");

    let title_text_list = [];
    const h2_div = flight_card_item.querySelector("h2");
    h2_div.childNodes.forEach((node) => {
      const text = node.textContent.trim();
      title_text_list.push(text);
    });
    const title_text = title_text_list.join(" ");

    const flightDetail = flightinfo.querySelector("div.section-bd");

    const flightFrom = flightDetail.querySelector("div.flight-from");
    const flightInfo = flightDetail.querySelector("div.flight-info");
    const flightTo = flightDetail.querySelector("div.flight-to");

    // 提取起飞时间和机场信息
    const departureTime = flightFrom
      .querySelector("span.time")
      .textContent.trim();
    const departureAirport = flightFrom
      .querySelector("span.airport")
      .textContent.trim();

    // 提取飞行时长、航空公司名称、航班号和舱位信息
    const timeCost = flightInfo
      .querySelector("span.time-cost")
      .textContent.trim();
    const airlineName = flightInfo
      .querySelector("span.airline-name")
      .textContent.trim();

    // 提取降落时间和机场信息
    const arrivalTime = flightTo.querySelector("span.time").textContent.trim();
    const arrivalAirport = flightTo
      .querySelector("span.airport")
      .textContent.trim();

    // 格式化输出
    const result = `${title_text}\n${airlineName}\n${timeCost} ${departureAirport}-${arrivalAirport}\n${departureTime}-${arrivalTime}`;
    console.log(result);
    final_result += result + "\n";
  });

  const refund_cont = document.querySelector("div.refund-cont.refund-open");
  if (refund_cont) {
    const tgq_table_container = refund_cont.querySelector(
      "div.tgq-table-container"
    );
    const tgq_items = tgq_table_container.querySelectorAll("div.tgq-item");
    tgq_items.forEach((tgq_item) => {
      const tgq_title = tgq_item
        .querySelector("h3.tgq-title")
        .textContent.trim();
      if (tgq_title == "成人退改签说明") {
        const tgq_tbody = tgq_item.querySelector("tbody");
        const liElements = tgq_tbody.querySelectorAll("li"); // 获取所有的 <li> 标签
        const liTexts = Array.from(liElements).map((li) =>
          li.textContent.trim()
        ); // 提取文本并去除多余空格

        const result = liTexts.join("\n"); // 用 \n 分隔
        console.log(result);
        final_result += result + "\n";
      }
    });
  }

  fallbackCopyToClipboard(final_result);
}

function ctrip_airplane_info() {
  // 使用属性选择器抓取所有id包含'flightTGQ'的元素
  const airplane_elements = document.querySelectorAll("[id*='flightTGQ']");

  if (airplane_elements.length === 0) {
    console.error("未找到 id 包含 'flightTGQ' 的元素");
    return;
  }

  const airplane_info_texts = [];
  airplane_elements.forEach((element) => {
    const text = element.textContent.trim();
    if (text) {
      const processAirplaneInfoResult = processAirplaneInfo(text);
      airplane_info_texts.push(processAirplaneInfoResult);
    }
  });

  let airplane_info_text = airplane_info_texts.join("\n");

  const luggageInfoHover = document.querySelectorAll("[id*='luggageInfo']")[0];
  if (luggageInfoHover) {
    let luggageInfo = luggageInfoHover.textContent.trim();
    airplane_info_text += "\n" + luggageInfo;
  }
  console.log("提取的飞机信息：", airplane_info_text);

  fallbackCopyToClipboard(airplane_info_text);

  return airplane_info_text;
}

function processAirplaneInfo(text) {
  // 去掉多余的空格和制表符
  text = text.replace(/\s+/g, " ").trim();
  console.log("处理飞机信息：", text);

  // 定义正则表达式来匹配日期和费用信息
  const dateRegex = /\d{4}年\d{2}月\d{2}日\d{2}:\d{2}(前|后)/g;
  const refundFeeRegex = /¥\d+\/人/g;
  const changeFeeRegex = /¥\d+\/人/g;

  // 提取所有日期
  const dates = text.match(dateRegex);
  console.log("dates", dates);

  // 提取所有退订费和改期费
  const refundFees = [];
  const changeFees = [];
  const refundFeeStartIndex = text.indexOf("套餐退订费");
  const changeFeeStartIndex = text.indexOf("同舱改期费");
  const changeFeeEndIndex = text.indexOf("签转条件");

  if (
    refundFeeStartIndex !== -1 &&
    changeFeeStartIndex !== -1 &&
    changeFeeEndIndex !== -1
  ) {
    const refundFeeText = text
      .substring(refundFeeStartIndex, changeFeeStartIndex)
      .replace("套餐退订费", "")
      .trim();
    const changeFeeText = text
      .substring(changeFeeStartIndex, changeFeeEndIndex)
      .replace("同舱改期费", "")
      .trim();

    refundFeeText
      .match(refundFeeRegex)
      .forEach((fee) => refundFees.push(`退订费${fee}`));
    changeFeeText
      .match(changeFeeRegex)
      .forEach((fee) => changeFees.push(`改期费${fee}`));
  }

  console.log("refundFees", refundFees);
  console.log("changeFees", changeFees);

  // 检查是否提取到所有信息
  if (
    !dates ||
    !refundFees ||
    !changeFees ||
    dates.length !== refundFees.length ||
    dates.length !== changeFees.length
  ) {
    console.error("提取信息失败，请检查输入格式");
    return;
  }

  // 生成输出字符串
  let output = "";
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i].replace("2025年", ""); // 去掉年份
    const refundFee = refundFees[i];
    const changeFee = changeFees[i];
    output += `${date} ${refundFee} ${changeFee}\n`;
  }
  console.log("处理后的飞机信息：", output);

  return output;
}

// 暴露函数给外部调用
window.extract_guest_info = extract_guest_info;
window.extractTextLabels = extractTextLabels;
window.extract_airplane_info = extract_airplane_info;
