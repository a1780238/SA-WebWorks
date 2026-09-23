import assert from "node:assert/strict";
import { evaluateDecision, handleMcpMessage } from "../src/torah-gate.mjs";

function fakeHebcal(isAssurBemlacha) {
  return async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        version: "test",
        location: { title: "Test City" },
        status: {
          localTime: "2026-09-18T19:30:00+10:00",
          isAssurBemlacha
        }
      };
    }
  });
}

const base = {
  decision: "Accept Friday evening invitation",
  scope: "shabbat_yomtov_only",
  event: {
    start: "2026-09-18T19:30:00+10:00",
    end: "2026-09-18T21:00:00+10:00",
    location: { latitude: -27.4698, longitude: 153.0251, tzid: "Australia/Brisbane" },
    melachaRequirement: "yes"
  }
};

{
  const out = await evaluateDecision(base, { fetchImpl: fakeHebcal(true) });
  assert.equal(out.verdict, "FAIL");
  assert.equal(out.gates[0].overlapsAssurBemlacha, true);
}

{
  const out = await evaluateDecision(
    { ...base, event: { ...base.event, melachaRequirement: "unknown" } },
    { fetchImpl: fakeHebcal(true) }
  );
  assert.equal(out.verdict, "HOLD");
}

{
  const out = await evaluateDecision(base, { fetchImpl: fakeHebcal(false) });
  assert.equal(out.verdict, "PASS");
}

{
  const out = await evaluateDecision(
    { ...base, scope: "full_torah" },
    { fetchImpl: fakeHebcal(false) }
  );
  assert.equal(out.verdict, "HOLD");
}

{
  const init = await handleMcpMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1" } }
  });
  assert.equal(init.result.serverInfo.name, "torah-gate");

  const list = await handleMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  assert.equal(list.result.tools[0].name, "torah_evaluate_decision");
}

{
  const discover = await handleMcpMessage({
    jsonrpc: "2.0",
    id: "d1",
    method: "server/discover",
    params: {
      _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientCapabilities": {},
        "io.modelcontextprotocol/clientInfo": { name: "test", version: "1" }
      }
    }
  }, { modern: true });
  assert.equal(discover.result.resultType, "complete");
  assert.deepEqual(discover.result.supportedVersions, ["2026-07-28"]);
  assert.equal(discover.result._meta["io.modelcontextprotocol/serverInfo"].name, "torah-gate");

  const list = await handleMcpMessage({
    jsonrpc: "2.0",
    id: "d2",
    method: "tools/list",
    params: { _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28", "io.modelcontextprotocol/clientCapabilities": {} } }
  }, { modern: true });
  assert.equal(list.result.resultType, "complete");
  assert.equal(list.result.cacheScope, "public");
}

console.log("All Torah Gate tests passed.");
