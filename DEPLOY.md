# Deploy Torah Gate to ChatGPT

## 1. Publish the server

This repository has no runtime dependencies.

Deploy the `torah-gate-mcp` directory as a Vercel project. Set the project root directory to `torah-gate-mcp`.

The public MCP URL will be:

`https://<your-domain>/mcp`

`vercel.json` rewrites `/mcp` to the Node function at `api/mcp.js`.

## 2. Verify the production endpoint

### Current MCP 2026-07-28 discovery

```bash
curl -s https://<your-domain>/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  -d '{"jsonrpc":"2.0","id":"discover-1","method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0"}}}}'
```

Expected: `supportedVersions` includes `2026-07-28` and serverInfo name is `torah-gate`.

## 3. Connect in ChatGPT

1. Open ChatGPT Settings.
2. Enable Developer mode.
3. Open Plugins and add a developer-mode MCP server.
4. Enter the public URL `https://<your-domain>/mcp`.
5. Confirm the discovered tool is `torah_evaluate_decision`.

## Fail-closed behavior

If Hebcal cannot be reached, activity classification is unknown, an emergency override may apply, or the user requests full-Torah coverage beyond v0.1, the tool returns `HOLD` rather than manufacturing a ruling.
