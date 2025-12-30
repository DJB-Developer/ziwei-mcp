import { astro } from 'iztro';
import { parseDateTimeString, convertGender, convertGenderToZhString } from './lib/utils.js';

export interface ZiweiSolarParams {
  solarDateTime: string; // 阳历日期时间，支持 "YYYY-M-D HH:mm" 或 "YYYY-M-D"
  gender: number; // 性别：0=女，1=男
  fixLeap?: boolean;
  language?: string;
}

export interface ZiweiLunarParams {
  lunarDateTime: string; // 农历日期时间，支持 "YYYY-M-D HH:mm" 或 "YYYY-M-D"
  gender: number; // 性别：0=女，1=男
  isLeapMonth?: boolean;
  fixLeap?: boolean;
  language?: string;
}

export interface ZiweiHoroscopeParams {
  solarDateTime: string; // 出生阳历日期时间
  gender: number; // 性别：0=女，1=男
  targetDate: string;
  fixLeap?: boolean;
  language?: string;
}

/**
 * 通过阳历日期获取星盘信息
 */
export function getZiweiBySolar(params: ZiweiSolarParams) {
  const { solarDateTime, gender, fixLeap = true, language = 'zh-CN' } = params;

  // 解析日期时间并获取时辰索引
  const { dateStr, timeIndex } = parseDateTimeString(solarDateTime);

  // 转换性别
  const genderNum = convertGender(gender);
  const genderZh = convertGenderToZhString(genderNum);

  const astrolabe = astro.bySolar(dateStr, timeIndex, genderZh as any, fixLeap, language as any);
  return astrolabe;
}

/**
 * 通过农历日期获取星盘信息
 */
export function getZiweiByLunar(params: ZiweiLunarParams) {
  const { lunarDateTime, gender, isLeapMonth = false, fixLeap = true, language = 'zh-CN' } = params;

  // 解析日期时间并获取时辰索引
  const { dateStr, timeIndex } = parseDateTimeString(lunarDateTime);

  // 转换性别
  const genderNum = convertGender(gender);
  const genderZh = convertGenderToZhString(genderNum);

  const astrolabe = astro.byLunar(dateStr, timeIndex, genderZh as any, isLeapMonth, fixLeap, language as any);
  return astrolabe;
}

/**
 * 获取运限信息
 */
export function getZiweiHoroscope(params: ZiweiHoroscopeParams) {
  const { solarDateTime, gender, targetDate, fixLeap = true, language = 'zh-CN' } = params;

  // 解析日期时间并获取时辰索引
  const { dateStr, timeIndex } = parseDateTimeString(solarDateTime);

  // 转换性别
  const genderNum = convertGender(gender);
  const genderZh = convertGenderToZhString(genderNum);

  // 先获取星盘
  const astrolabe = astro.bySolar(dateStr, timeIndex, genderZh as any, fixLeap, language as any);

  // 获取运限
  const horoscope = astrolabe.horoscope(new Date(targetDate));
  return horoscope;
}