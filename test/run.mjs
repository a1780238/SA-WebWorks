import assert from "node:assert/strict";
import { evaluateDecision, handleMcpMessage } from "../src/torah-gate.mjs";

const ZMANIM_PROFILE = "hebcal_default_18min_8_5deg";

function fakeProvider({assurStart=null,assurEnd=null,boundaries=[],failCalendar=false,failAssur=false}={}) {
  return async input => {
    const url = new URL(input.toString());
    if (url.pathname.endsWith("/hebcal")) {
      if (failCalendar) return {ok:false,status:503,async json(){return {};}};
      return {ok:true,status:200,async json(){return {items:boundaries.map(b=>({category:b.category,title:b.title,date:b.date}))};}};
    }
    if (url.pathname.endsWith("/zmanim")) {
      if (failAssur) return {ok:false,status:503,async json(){return {};}};
      const t=Date.parse(url.searchParams.get("dt"));
      const isAssurBemlacha=assurStart!==null&&assurEnd!==null&&t>=Date.parse(assurStart)&&t<Date.parse(assurEnd);
      return {ok:true,status:200,async json(){return {version:"test",location:{title:"Test City"},status:{localTime:new Date(t).toISOString(),isAssurBemlacha}};}};
    }
    throw new Error(`unexpected URL ${url}`);
  };
}

const base = {
  decision: "Accept Friday evening invitation",
  scope: "shabbat_yomtov_only",
  event: {
    start: "2026-09-18T15:00:00+10:00",
    end: "2026-09-18T23:00:00+10:00",
    location: { latitude: -27.4698, longitude: 153.0251, tzid: "Australia/Brisbane", calendarRegime:"diaspora" },
    zmanimProfile: ZMANIM_PROFILE,
    melachaRequirement: "yes"
  }
};

{
  const fetchImpl=fakeProvider({
    assurStart:"2026-09-18T17:00:00+10:00",assurEnd:"2026-09-18T17:10:00+10:00",
    boundaries:[
      {category:"candles",title:"Candles",date:"2026-09-18T17:00:00+10:00"},
      {category:"havdalah",title:"Havdalah",date:"2026-09-18T17:10:00+10:00"}
    ]
  });
  const out=await evaluateDecision(base,{fetchImpl});
  assert.equal(out.verdict,"FAIL");
  assert.equal(out.gates[0].overlapsAssurBemlacha,true);
  assert.equal(out.gates[0].boundaryCandidates.length,2);
  assert.equal(out.rulePack.halakhicReviewStatus,"NOT_RABBINICALLY_REVIEWED");
}

{
  const fetchImpl=fakeProvider({
    assurStart:"2026-09-18T17:00:00+10:00",assurEnd:"2026-09-18T17:10:00+10:00",
    boundaries:[{category:"candles",date:"2026-09-18T17:00:00+10:00"},{category:"havdalah",date:"2026-09-18T17:10:00+10:00"}]
  });
  const out=await evaluateDecision({...base,event:{...base.event,melachaRequirement:"unknown",activity:{description:"Drive a petrol car",actionTags:["drive_combustion_vehicle"]}}},{fetchImpl});
  assert.equal(out.verdict,"HOLD");
  assert.equal(out.gates[0].activityClassification.status,"CANDIDATE_PROHIBITION_REVIEW_REQUIRED");
  assert.equal(out.gates[0].activityClassification.hardDecisionEligible,false);
  assert.ok(out.gates[0].activityClassification.candidateCategories.includes("mavir"));
}

{
  const fetchImpl=fakeProvider({
    assurStart:"2026-09-18T17:00:00+10:00",assurEnd:"2026-09-18T17:10:00+10:00",
    boundaries:[{category:"candles",date:"2026-09-18T17:00:00+10:00"},{category:"havdalah",date:"2026-09-18T17:10:00+10:00"}]
  });
  const out=await evaluateDecision({...base,event:{...base.event,melachaRequirement:"unknown",activity:{description:"Use an electrical appliance",actionTags:["operate_electric_appliance"]}}},{fetchImpl});
  assert.equal(out.verdict,"HOLD");
  assert.ok(out.gates[0].activityClassification.candidateCategories.includes("electricity_authority_dependent"));
}

{
  const out=await evaluateDecision(base,{fetchImpl:fakeProvider()});
  assert.equal(out.verdict,"PASS");
}

{
  const out=await evaluateDecision({...base,scope:"full_torah"},{fetchImpl:fakeProvider()});
  assert.equal(out.verdict,"HOLD");
}

{
  const event={...base.event,location:{...base.event.location}};delete event.location.calendarRegime;
  const out=await evaluateDecision({...base,event},{fetchImpl:fakeProvider()});
  assert.equal(out.verdict,"HOLD");
  assert.match(out.summary,/calendar regime/i);
}

{
  const event={...base.event};delete event.zmanimProfile;
  const out=await evaluateDecision({...base,event},{fetchImpl:fakeProvider()});
  assert.equal(out.verdict,"HOLD");
  assert.match(out.summary,/zmanim profile/i);
}

{
  const out=await evaluateDecision(base,{fetchImpl:fakeProvider({failCalendar:true})});
  assert.equal(out.verdict,"HOLD");
}

{
  const init=await handleMcpMessage({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-11-25",capabilities:{},clientInfo:{name:"test",version:"1"}}});
  assert.equal(init.result.serverInfo.name,"torah-gate");
  assert.equal(init.result.serverInfo.version,"0.4.0");
  const list=await handleMcpMessage({jsonrpc:"2.0",id:2,method:"tools/list",params:{}});
  assert.equal(list.result.tools[0].name,"torah_evaluate_decision");
  assert.equal(list.result.tools[1].name,"torah_get_rule_review_pack");
}

{
  const discover=await handleMcpMessage({jsonrpc:"2.0",id:"d1",method:"server/discover",params:{_meta:{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"io.modelcontextprotocol/clientInfo":{name:"test",version:"1"}}}},{modern:true});
  assert.equal(discover.result.resultType,"complete");
  assert.deepEqual(discover.result.supportedVersions,["2026-07-28"]);
  assert.equal(discover.result._meta["io.modelcontextprotocol/serverInfo"].version,"0.4.0");
}

{
  const review=await handleMcpMessage({jsonrpc:"2.0",id:"r1",method:"tools/call",params:{name:"torah_get_rule_review_pack",arguments:{activityTag:"operate_electric_appliance"}}});
  assert.equal(review.result.structuredContent.mode,"single");
  assert.equal(review.result.structuredContent.rule.reviewState,"SOURCE_VETTED_DISPUTED");
  assert.equal(review.result.structuredContent.reviewGate.eligible,false);
  assert.ok(review.result.structuredContent.reviewGate.reasons.length>0);
  assert.ok(review.result.structuredContent.sources.some(s=>s.id==="star-k-electricity-2025"));
}

{
  const review=await handleMcpMessage({jsonrpc:"2.0",id:"r2",method:"tools/call",params:{name:"torah_get_rule_review_pack",arguments:{activityTag:"drive_combustion_vehicle"}}});
  assert.equal(review.result.structuredContent.rule.reviewState,"SOURCE_VETTED");
  assert.equal(review.result.structuredContent.reviewGate.eligible,false);
  assert.ok(review.result.structuredContent.rule.candidateCategories.includes("mavir"));
}

console.log("All Torah Gate v0.4 tests passed.");
