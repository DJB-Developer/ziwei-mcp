#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp.js';

async function main() {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('服务器启动失败:', error);
    process.exit(1);
});
