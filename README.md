# 紫微斗数排盘 MCP 服务

[![Build and Publish Docker Image](https://github.com/djb-developer/ziwei-mcp/actions/workflows/docker-build.yml/badge.svg)](https://github.com/djb-developer/ziwei-mcp/actions/workflows/docker-build.yml)
[![GitHub Container Registry](https://img.shields.io/badge/GHCR-latest-blue)](https://github.com/djb-developer/ziwei-mcp/pkgs/container/ziwei-mcp)
[![npm version](https://badge.fury.io/js/ziweidoushu-mcp.svg)](https://www.npmjs.com/package/ziweidoushu-mcp)

基于 [iztro](https://github.com/SylarLong/iztro) 库的紫微斗数排盘 Model Context Protocol (MCP) 服务。

支持 **Streamable HTTP** 和 **SSE** 传输协议。

## 功能特性

| 工具 | 描述 |
|------|------|
| `getZiweiBySolar` | 通过阳历日期时间获取星盘信息 |
| `getZiweiByLunar` | 通过农历日期时间获取星盘信息 |
| `getZiweiHoroscope` | 获取运限信息（大限、流年、流月、流日、流时） |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
# 编译并启动 HTTP 服务器
npm start

# 或分步执行
npm run tsc        # 编译
node dist/httpServer.js  # 启动
```

服务将在 `http://localhost:3000` 启动。

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST/GET/DELETE | `/mcp` | Streamable HTTP 传输 |
| GET | `/sse` | SSE 连接 |
| POST | `/messages` | SSE 消息 |
| GET | `/health` | 健康检查 |

## 时间格式

支持以下格式：

```
2000-8-16 14:30       # 标准格式
2000-8-16             # 仅日期（默认午时）
2000-08-16 14:30:00+08  # ISO 格式带时区
2000-08-16T14:30:00Z    # ISO UTC 格式
```

### 时辰对照表

| 时间 | 时辰 | 时间 | 时辰 |
|------|------|------|------|
| 00:00-00:59 | 早子时 | 12:00-12:59 | 午时 |
| 01:00-02:59 | 丑时 | 13:00-14:59 | 未时 |
| 03:00-04:59 | 寅时 | 15:00-16:59 | 申时 |
| 05:00-06:59 | 卯时 | 17:00-18:59 | 酉时 |
| 07:00-08:59 | 辰时 | 19:00-20:59 | 戌时 |
| 09:00-10:59 | 巳时 | 21:00-22:59 | 亥时 |
| 11:00-11:59 | 午时 | 23:00-23:59 | 晚子时 |

## Docker 部署

```bash
# 使用 GitHub Container Registry
docker run -p 3000:3000 ghcr.io/djb-developer/ziwei-mcp:latest

# 或本地构建
docker build -t ziweidoushu-mcp .
docker run -p 3000:3000 ziweidoushu-mcp
```

### Docker Compose

```bash
docker-compose up -d
```

## 客户端配置

### Claude Desktop (stdio 模式)

```json
{
  "mcpServers": {
    "Ziwei": {
      "command": "npx",
      "args": ["ziweidoushu-mcp"]
    }
  }
}
```

### HTTP 客户端

```bash
# 健康检查
curl http://localhost:3000/health

# 初始化 MCP 会话
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'
```

## 使用示例

在 Claude Desktop 中：

```
请使用 getZiweiBySolar 工具，为我排一个 2000年8月16日下午2点30分出生的女性的紫微斗数星盘
参数：{"solarDateTime": "2000-8-16 14:30", "gender": 0}
```

```
请使用 getZiweiHoroscope 工具，查看上述命盘在 2024年12月20日的运限情况
参数：{"solarDateTime": "2000-8-16 14:30", "gender": 0, "targetDate": "2024-12-20"}
```

## 返回数据结构

MCP 响应格式：

```json
{
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"solarDate\":\"2025-12-30\",\"lunarDate\":\"乙巳年十月十一\",...}"
    }]
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

`text` 字段为 JSON 字符串，包含 iztro 库返回的完整星盘或运限数据。

## 许可证

MIT
