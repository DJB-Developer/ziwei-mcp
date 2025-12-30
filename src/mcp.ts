import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';
import { getZiweiBySolar, getZiweiByLunar, getZiweiHoroscope, ZiweiSolarParams, ZiweiLunarParams, ZiweiHoroscopeParams } from './index.js';

// 时辰说明
const TIME_DESC = `
时间格式说明：
- 支持完整时间：YYYY-M-D HH:mm （例如：2000-8-16 14:30）
- 支持仅日期：YYYY-M-D （默认为午时11:00-12:59）
- 支持ISO格式：YYYY-MM-DD HH:mm:ss+TZ （例如：2000-08-16 14:30:00+08）
- 自动根据时间转换为对应时辰：
  * 00:00-00:59 → 早子时
  * 01:00-02:59 → 丑时
  * 03:00-04:59 → 寅时
  * 05:00-06:59 → 卯时
  * 07:00-08:59 → 辰时
  * 09:00-10:59 → 巳时
  * 11:00-12:59 → 午时
  * 13:00-14:59 → 未时
  * 15:00-16:59 → 申时
  * 17:00-18:59 → 酉时
  * 19:00-20:59 → 戌时
  * 21:00-22:59 → 亥时
  * 23:00-23:59 → 晚子时
`;

/**
 * 创建 MCP 服务器实例
 */
export function createMcpServer(): McpServer {
    const server = new McpServer({
        name: 'Ziwei',
        version: '0.0.1',
    });

    server.tool(
        'getZiweiBySolar',
        `通过阳历日期时间获取紫微斗数星盘信息。${TIME_DESC}`,
        {
            solarDateTime: z.string().describe('阳历日期时间，格式：YYYY-M-D 或 YYYY-M-D HH:mm，例如：2000-8-16 14:30'),
            gender: z.number().min(0).max(1).describe('性别：0=女，1=男'),
            fixLeap: z.boolean().optional().default(true).describe('是否调整闰月，默认为true'),
            language: z.enum(['zh-CN', 'zh-TW', 'en-US', 'ko-KR', 'ja-JP']).optional().default('zh-CN').describe('返回数据的语言'),
        },
        async (data) => {
            const result = getZiweiBySolar(data as ZiweiSolarParams);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        },
    );

    server.tool(
        'getZiweiByLunar',
        `通过农历日期时间获取紫微斗数星盘信息。${TIME_DESC}`,
        {
            lunarDateTime: z.string().describe('农历日期时间，格式：YYYY-M-D 或 YYYY-M-D HH:mm，例如：2000-7-17 14:30'),
            gender: z.number().min(0).max(1).describe('性别：0=女，1=男'),
            isLeapMonth: z.boolean().optional().default(false).describe('是否闰月，默认为false'),
            fixLeap: z.boolean().optional().default(true).describe('是否调整闰月，默认为true'),
            language: z.enum(['zh-CN', 'zh-TW', 'en-US', 'ko-KR', 'ja-JP']).optional().default('zh-CN').describe('返回数据的语言'),
        },
        async (data) => {
            const result = getZiweiByLunar(data as ZiweiLunarParams);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        },
    );

    server.tool(
        'getZiweiHoroscope',
        `获取紫微斗数运限信息，包括大限、流年、流月、流日、流时等。${TIME_DESC}`,
        {
            solarDateTime: z.string().describe('出生阳历日期时间，格式：YYYY-M-D 或 YYYY-M-D HH:mm，例如：2000-8-16 14:30'),
            gender: z.number().min(0).max(1).describe('性别：0=女，1=男'),
            targetDate: z.string().describe('要查询运限的日期，格式：YYYY-MM-DD 或 ISO 日期字符串'),
            fixLeap: z.boolean().optional().default(true).describe('是否调整闰月，默认为true'),
            language: z.enum(['zh-CN', 'zh-TW', 'en-US', 'ko-KR', 'ja-JP']).optional().default('zh-CN').describe('返回数据的语言'),
        },
        async (data) => {
            const result = getZiweiHoroscope(data as ZiweiHoroscopeParams);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        },
    );

    return server;
}
