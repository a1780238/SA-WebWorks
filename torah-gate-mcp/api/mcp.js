import { handleMcpBody } from "../src/torah-gate.mjs";

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : null;
}

function header(req, name) {
  const value = req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function modernEnvelope(body) {
  if (!body || Array.isArray(body)) return false;
  return body?.params?._meta?.["io.modelcontextprotocol/protocolVersion"] === "2026-07-28";
}

function validateModernHeaders(req, body) {
  if (!modernEnvelope(body)) return null;
  const version = header(req, "mcp-protocol-version");
  const method = header(req, "mcp-method");
  const name = header(req, "mcp-name");
  if (version !== "2026-07-28") return "Missing or mismatched MCP-Protocol-Version header.";
  if (method !== body.method) return "Missing or mismatched Mcp-Method header.";
  if (body.method === "tools/call" && name !== body?.params?.name) return "Missing or mismatched Mcp-Name header.";
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-session-id, mcp-protocol-version, mcp-method, mcp-name");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32000, message: "Method not allowed. This server uses stateless Streamable HTTP POST requests." }
    });
  }

  try {
    const body = await readBody(req);
    const modernError = validateModernHeaders(req, body);
    if (modernError) {
      return res.status(400).json({ jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32020, message: modernError } });
    }
    const response = await handleMcpBody(body, { modern: modernEnvelope(body) });
    if (response === null) return res.status(202).end();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error",
        data: error instanceof Error ? error.message : "Invalid JSON"
      }
    });
  }
}
