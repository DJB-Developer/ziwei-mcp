#!/usr/bin/env node

import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMcpServer } from './mcp.js';

const app = express();
app.use(express.json());

// Session storage for Streamable HTTP
const streamableTransports: Record<string, StreamableHTTPServerTransport> = {};

// SSE transports storage
const sseTransports: Record<string, SSEServerTransport> = {};

// ========== Streamable HTTP Transport ==========

// Handle POST /mcp - Main request handler for Streamable HTTP
app.post('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && streamableTransports[sessionId]) {
        // Reuse existing transport
        transport = streamableTransports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
        // New session - create transport with session ID generator
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
        });

        // Create and connect MCP server
        const server = createMcpServer();
        await server.connect(transport);

        // Store transport after connection
        transport.onclose = () => {
            const sid = Object.keys(streamableTransports).find(
                (key) => streamableTransports[key] === transport
            );
            if (sid) {
                delete streamableTransports[sid];
                console.log(`Session closed: ${sid}`);
            }
        };

        // Store after handling request
        res.on('finish', () => {
            const sid = res.getHeader('mcp-session-id') as string;
            if (sid && !streamableTransports[sid]) {
                streamableTransports[sid] = transport;
                console.log(`New session created: ${sid}`);
            }
        });
    } else {
        // Invalid request
        res.status(400).json({ error: 'Bad request: missing session ID or not an initialize request' });
        return;
    }

    await transport.handleRequest(req, res, req.body);
});

// Handle GET /mcp - SSE stream for server notifications
app.get('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !streamableTransports[sessionId]) {
        res.status(400).json({ error: 'Invalid or missing session ID' });
        return;
    }

    const transport = streamableTransports[sessionId];
    await transport.handleRequest(req, res);
});

// Handle DELETE /mcp - Close session
app.delete('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !streamableTransports[sessionId]) {
        res.status(400).json({ error: 'Invalid or missing session ID' });
        return;
    }

    const transport = streamableTransports[sessionId];
    await transport.handleRequest(req, res);
});

// ========== SSE Transport ==========

// Handle GET /sse - Establish SSE connection
app.get('/sse', async (req: Request, res: Response) => {
    const sessionId = randomUUID();
    console.log(`New SSE connection: ${sessionId}`);

    const transport = new SSEServerTransport('/messages', res);
    sseTransports[sessionId] = transport;

    // Create and connect MCP server
    const server = createMcpServer();
    await server.connect(transport);

    transport.onclose = () => {
        delete sseTransports[sessionId];
        console.log(`SSE session closed: ${sessionId}`);
    };

    // Send session ID to client
    res.setHeader('X-Session-Id', sessionId);

    await transport.start();
});

// Handle POST /messages - Send messages to SSE transport
app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId || !sseTransports[sessionId]) {
        res.status(400).json({ error: 'Invalid or missing session ID' });
        return;
    }

    const transport = sseTransports[sessionId];
    await transport.handlePostMessage(req, res, req.body);
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', name: 'ziwei-mcp', version: '0.0.1' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Ziwei MCP Server running on http://localhost:${PORT}`);
    console.log(`   Streamable HTTP: POST/GET/DELETE /mcp`);
    console.log(`   SSE: GET /sse, POST /messages`);
    console.log(`   Health: GET /health`);
});
