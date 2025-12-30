/**
 * 根据小时数获取时辰索引
 * @param hour 小时数 (0-23)
 * @returns 时辰索引 (0-12)
 */
export function getTimeIndexFromHour(hour: number): number {
  if (hour >= 23 || hour === 0) {
    // 23:00-23:59 是晚子时(12)，00:00-00:59 是早子时(0)
    return hour === 0 ? 0 : 12;
  } else if (hour >= 1 && hour <= 2) {
    return 1; // 丑时
  } else if (hour >= 3 && hour <= 4) {
    return 2; // 寅时
  } else if (hour >= 5 && hour <= 6) {
    return 3; // 卯时
  } else if (hour >= 7 && hour <= 8) {
    return 4; // 辰时
  } else if (hour >= 9 && hour <= 10) {
    return 5; // 巳时
  } else if (hour >= 11 && hour <= 12) {
    return 6; // 午时
  } else if (hour >= 13 && hour <= 14) {
    return 7; // 未时
  } else if (hour >= 15 && hour <= 16) {
    return 8; // 申时
  } else if (hour >= 17 && hour <= 18) {
    return 9; // 酉时
  } else if (hour >= 19 && hour <= 20) {
    return 10; // 戌时
  } else if (hour >= 21 && hour <= 22) {
    return 11; // 亥时
  }

  throw new Error(`无效的小时数: ${hour}`);
}

/**
 * 解析日期时间字符串，提取日期部分和时辰索引
 * 支持格式：
 * - "2000-8-16 14:30" 
 * - "2000-8-16 14:30:00"
 * - "2000-8-16" (默认为午时)
 * - "2000-08-16 00:40:00+00" (ISO格式带时区)
 * - "2000-08-16T00:40:00+00:00" (标准ISO格式)
 * - "2000-08-16T00:40:00Z" (UTC时间)
 */
export function parseDateTimeString(dateTimeStr: string): { dateStr: string; timeIndex: number } {
  const trimmed = dateTimeStr.trim();

  // 检查是否为ISO格式（带时区信息）
  // 匹配: +00, +00:00, -08:00, Z 等
  const isoTimezoneRegex = /[+-]\d{2}(:\d{2})?$|Z$/;
  const hasTimezone = isoTimezoneRegex.test(trimmed);

  if (hasTimezone) {
    // 处理ISO格式，直接从字符串提取日期和时间，避免时区转换问题
    // 紫微斗数需要的是出生地当地时间，而不是转换后的本地时间
    const isoString = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');

    // 提取日期部分: YYYY-MM-DD
    const dateMatch = isoString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!dateMatch) {
      throw new Error(`无效的ISO日期格式: ${dateTimeStr}`);
    }

    // 提取时间部分: HH:mm
    const timeMatch = isoString.match(/T(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      throw new Error(`无效的ISO时间格式: ${dateTimeStr}`);
    }

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const day = parseInt(dateMatch[3]);
    const hour = parseInt(timeMatch[1]);

    return {
      dateStr: `${year}-${month}-${day}`,
      timeIndex: getTimeIndexFromHour(hour)
    };
  }

  // 检查是否包含时间部分（非时区格式）
  if (trimmed.includes(' ') || trimmed.includes('T')) {
    const separator = trimmed.includes('T') ? 'T' : ' ';
    const [datePart, timePart] = trimmed.split(separator);
    const hour = parseInt(timePart.split(':')[0]);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      throw new Error(`无效的小时: ${timePart}`);
    }

    return {
      dateStr: datePart,
      timeIndex: getTimeIndexFromHour(hour)
    };
  } else {
    // 没有时间部分，默认为午时 (11:00-12:59)
    return {
      dateStr: trimmed,
      timeIndex: 6
    };
  }
}

/**
 * 转换性别字符串为数字
 * @param gender 性别字符串或数字
 * @returns 0=女，1=男
 */
export function convertGender(gender: string | number): number {
  if (typeof gender === 'number') {
    if (gender === 0 || gender === 1) {
      return gender;
    }
    throw new Error(`无效的性别数字: ${gender}，应为 0(女) 或 1(男)`);
  }

  if (gender === '女' || gender === 'female' || gender === 'F' || gender === 'f') {
    return 0;
  } else if (gender === '男' || gender === 'male' || gender === 'M' || gender === 'm') {
    return 1;
  }

  throw new Error(`无效的性别: ${gender}，应为 "男"(1) 或 "女"(0)`);
}

/**
 * 转换数字性别为中文字符串（用于 iztro 库）
 */
export function convertGenderToZhString(genderNum: number): string {
  return genderNum === 1 ? '男' : '女';
} 