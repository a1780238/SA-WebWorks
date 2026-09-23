import http from "node:http";
import { handleMcpBody } from "./src/torah-gate.mjs";

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";
const getHeader = (req, name) => Array.isArray(req.headers[name]) ? req.headers[name][0] : req.headers[name];
const isModern = body => !Array.isArray(body) && body?.params?._meta?.["io.modelcontextprotocol/protocolVersion"] === "2026-07-28";

function modernHeaderError(req, body) {
  if (!isModern(body)) return null;
  if (getHeader(req, "mcp-protocol-version") !== "2026-07-28") return "Missing or mismatched MCP-Protocol-Version header.";
  if (getHeader(req, "mcp-method") !== body.method) return "Missing or mismatched Mcp-Method header.";
  if (body.method === "tools/call" && getHeader(req, "mcp-name") !== body?.params?.name) return "Missing or mismatched Mcp-Name header.";
  return null;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-session-id, mcp-protocol-version, mcp-method, mcp-name");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    return res.end("Torah Gate MCP v0.1\nPOST MCP requests to /mcp\n");
  }

  if (req.url !== "/mcp" || req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json" });
    return res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Method not allowed" } }));
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "null");
    const hdrError = modernHeaderError(req, body);
    if (hdrError) {
      res.writeHead(400, { "content-type": "application/json" });
      return res.end(JSON.stringify({ jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32020, message: hdrError } }));
    }
    const out = await handleMcpBody(body, { modern: isModern(body) });
    if (out === null) {
      res.writeHead(202);
      return res.end();
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(out));
  } catch (error) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error", data: String(error) } }));
  }
});

server.listen(port, host, () => {
  console.error(`Torah Gate MCP listening on http://${host}:${port}/mcp`);
});
