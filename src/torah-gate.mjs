import { classifyActivity } from "./activity-classifier.mjs";
const SERVER_VERSION = "0.3.0";
const RULE_PACK_VERSION = "torah-gate/0.3.0";
const ZMANIM_PROFILE = "hebcal_default_18min_8_5deg";
const HEB_CAL_ASSUR_DOC = "https://www.hebcal.com/home/5058/assur-melacha-work-forbidden-api";
const HEB_CAL_CALENDAR_DOC = "https://www.hebcal.com/home/195/jewish-calendar-rest-api";

const RULE_PACK_META = {
  version: RULE_PACK_VERSION,
  implementationStatus: "TESTED",
  halakhicReviewStatus: "NOT_RABBINICALLY_REVIEWED",
  authorityProfile: ZMANIM_PROFILE,
  decisionRole: "DECISION_SUPPORT_NOT_PSAK",
};

const SOURCES = [
  { id:"torah-shabbat-exodus", title:"Exodus 20:8-11", url:"https://www.sefaria.org/Exodus.20.8-11?lang=bi", role:"Foundational Torah command concerning Shabbat rest." },
  { id:"torah-shabbat-deuteronomy", title:"Deuteronomy 5:12-15", url:"https://www.sefaria.org/Deuteronomy.5.12-15?lang=bi", role:"Foundational Torah command concerning Shabbat observance." },
  { id:"mishnah-shabbat-melachot", title:"Mishnah Shabbat 7:2", url:"https://www.sefaria.org/Mishnah_Shabbat.7.2?lang=bi", role:"Classical source enumerating primary categories of melacha." },
  { id:"hebcal-assur-melacha", title:"Hebcal Assur Melacha API", url:HEB_CAL_ASSUR_DOC, role:"Point-in-time machine-readable determination of assur-bemelacha status." },
  { id:"hebcal-calendar-api", title:"Hebcal Jewish calendar REST API", url:HEB_CAL_CALENDAR_DOC, role:"Candidate candle-lighting and havdalah boundaries used to partition event intervals before point verification." },
];

export const toolDefinition = {
  name:"torah_evaluate_decision",
  title:"Torah-check a decision",
  description:"Evaluate a proposed action against the installed Torah Gate rule pack. Version 0.3 verifies Shabbat/Yom-Tov calendar conflicts by partitioning intervals at Hebcal candle-lighting/havdalah boundaries and point-checking each segment. It returns HOLD rather than silently assuming Israel/Diaspora regime, zmanim profile, activity classification, exceptions, or unimplemented Torah coverage. This is decision support, not rabbinic psak.",
  inputSchema:{
    type:"object", additionalProperties:false, required:["decision"],
    properties:{
      decision:{type:"string",minLength:1},
      scope:{type:"string",enum:["full_torah","shabbat_yomtov_only"],default:"full_torah"},
      facts:{type:"array",items:{type:"string"}},
      event:{
        type:"object",additionalProperties:false,required:["start","location","melachaRequirement"],
        properties:{
          start:{type:"string"}, end:{type:"string"},
          location:{
            type:"object",additionalProperties:false,required:["latitude","longitude","tzid"],
            properties:{
              latitude:{type:"number",minimum:-90,maximum:90},
              longitude:{type:"number",minimum:-180,maximum:180},
              tzid:{type:"string"}, label:{type:"string"},
              calendarRegime:{type:"string",enum:["diaspora","israel"]}
            }
          },
          zmanimProfile:{type:"string",enum:[ZMANIM_PROFILE]},
          melachaRequirement:{type:"string",enum:["yes","no","unknown"]},
          emergencyOverridePossible:{type:"boolean",default:false},
          activityNotes:{type:"string"},
          activity:{type:"object",additionalProperties:false,properties:{description:{type:"string"},actionTags:{type:"array",items:{type:"string"}}}}
        }
      }
    }
  },
  outputSchema:{
    type:"object",
    properties:{
      verdict:{type:"string",enum:["PASS","FAIL","HOLD"]},
      rulePackVersion:{type:"string"},rulePack:{type:"object"},scope:{type:"string"},summary:{type:"string"},
      coverage:{type:"object"},gates:{type:"array",items:{type:"object"}},
      sources:{type:"array",items:{type:"object"}},audit:{type:"object"}
    }
  },
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:true,idempotentHint:true}
};

function hasExplicitOffset(value){return typeof value==="string"&&/(Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());}
function parseInstant(value){if(!hasExplicitOffset(value))return null;const ms=Date.parse(value);return Number.isFinite(ms)?new Date(ms):null;}
function validateIanaTimeZone(tzid){try{new Intl.DateTimeFormat("en-US",{timeZone:tzid}).format(new Date());return true;}catch{return false;}}
function localDateString(instant,tzid){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:tzid,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(instant);
  const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}
function addIsoDays(ymd,days){
  const [y,m,d]=ymd.split("-").map(Number);const dt=new Date(Date.UTC(y,m-1,d+days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,"0")}-${String(dt.getUTCDate()).padStart(2,"0")}`;
}
function uniqueSortedDates(dates){
  const map=new Map();for(const d of dates){if(d instanceof Date&&Number.isFinite(d.getTime()))map.set(d.getTime(),d);}
  return [...map.entries()].sort((a,b)=>a[0]-b[0]).map(([,d])=>d);
}
function midpoint(a,b){return new Date(a.getTime()+Math.floor((b.getTime()-a.getTime())/2));}

async function fetchJson(url,fetchImpl,label){
  const response=await fetchImpl(url,{headers:{accept:"application/json","user-agent":`TorahGate-MCP/${SERVER_VERSION}`},signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw new Error(`${label} returned HTTP ${response.status}`);
  return response.json();
}

async function hebcalAssurAt(instant,location,fetchImpl){
  const url=new URL("https://www.hebcal.com/zmanim");
  url.searchParams.set("cfg","json");url.searchParams.set("im","1");
  url.searchParams.set("latitude",String(location.latitude));url.searchParams.set("longitude",String(location.longitude));
  url.searchParams.set("tzid",location.tzid);url.searchParams.set("dt",instant.toISOString());
  const payload=await fetchJson(url,fetchImpl,"Hebcal Assur Melacha API");
  if(!payload?.status||typeof payload.status.isAssurBemlacha!=="boolean")throw new Error("Hebcal Assur Melacha response did not include status.isAssurBemlacha");
  return {instant:instant.toISOString(),localTime:payload.status.localTime??null,isAssurBemlacha:payload.status.isAssurBemlacha,location:payload.location?.title??location.label??null,hebcalVersion:payload.version??null};
}

async function hebcalBoundaryCandidates(start,end,location,fetchImpl){
  if(!end||end.getTime()<=start.getTime())return [];
  const startDate=addIsoDays(localDateString(start,location.tzid),-1);
  const endDate=addIsoDays(localDateString(end,location.tzid),1);
  const url=new URL("https://www.hebcal.com/hebcal");
  url.searchParams.set("v","1");url.searchParams.set("cfg","json");url.searchParams.set("c","on");
  url.searchParams.set("M","on");url.searchParams.set("b","18");url.searchParams.set("maj","on");
  url.searchParams.set("i",location.calendarRegime==="israel"?"on":"off");
  url.searchParams.set("latitude",String(location.latitude));url.searchParams.set("longitude",String(location.longitude));
  url.searchParams.set("tzid",location.tzid);url.searchParams.set("start",startDate);url.searchParams.set("end",endDate);
  const payload=await fetchJson(url,fetchImpl,"Hebcal calendar API");
  if(!Array.isArray(payload?.items))throw new Error("Hebcal calendar response did not include items[]");
  return payload.items
    .filter(item=>item?.category==="candles"||item?.category==="havdalah")
    .map(item=>({category:item.category,title:item.title??null,date:item.date,instant:new Date(item.date)}))
    .filter(item=>Number.isFinite(item.instant.getTime())&&item.instant>start&&item.instant<end)
    .sort((a,b)=>a.instant-b.instant);
}

function buildVerificationInstants(start,end,boundaries){
  if(!end||end.getTime()<=start.getTime())return [start];
  const cuts=uniqueSortedDates([start,...boundaries.map(b=>b.instant),end]);
  const probes=[start,end];
  for(let i=0;i<cuts.length-1;i++){
    if(cuts[i+1].getTime()>cuts[i].getTime())probes.push(midpoint(cuts[i],cuts[i+1]));
  }
  return uniqueSortedDates(probes);
}

function baseAudit(extra={}){
  return {
    evaluatedAt:new Date().toISOString(),
    deterministicCalendarProvider:"Hebcal Assur Melacha API + Jewish calendar REST API",
    zmanimProfile:ZMANIM_PROFILE,
    religiousAuthorityStatus:"NOT_RABBINICALLY_REVIEWED",
    ...extra
  };
}
function holdResult({scope,summary,gates,coverageReason,auditExtra={}}){
  return {
    verdict:"HOLD",rulePackVersion:RULE_PACK_VERSION,rulePack:RULE_PACK_META,scope,summary,
    coverage:{
      status:"partial",implemented:["shabbat_yomtov.calendar_boundary","shabbat_yomtov.activity_candidate_classifier"],
      notYetImplemented:["rabbinically-reviewed activity adjudication","ribbis and finance","truth and misrepresentation","property and theft","contracts and monetary law","speech obligations and prohibitions","damages and interpersonal duties","positive-commandment conflicts and exceptions"],
      reason:coverageReason
    },
    gates,sources:SOURCES,audit:baseAudit(auditExtra)
  };
}

export async function evaluateDecision(input,options={}){
  const fetchImpl=options.fetchImpl??fetch;
  const scope=input?.scope==="shabbat_yomtov_only"?"shabbat_yomtov_only":"full_torah";
  const decision=typeof input?.decision==="string"?input.decision.trim():"";
  if(!decision)return holdResult({scope,summary:"No concrete proposed action was supplied.",gates:[],coverageReason:"A decision statement is required before any gate can be evaluated."});
  if(!input.event)return holdResult({scope,summary:"No calendar-event facts were supplied, so the installed Shabbat/Yom-Tov gate cannot run.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Missing event start time and location."}],coverageReason:"Version 0.3 only contains an executable Shabbat/Yom-Tov calendar gate."});

  const event=input.event,start=parseInstant(event.start),end=event.end?parseInstant(event.end):null,location=event.location??{};
  if(!start||(event.end&&!end))return holdResult({scope,summary:"Event time is invalid or lacks an explicit UTC offset.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Invalid ISO-8601 datetime."}],coverageReason:"The calendar gate requires unambiguous instants."});
  if(end&&end<start)return holdResult({scope,summary:"Event end precedes event start.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Invalid event interval."}],coverageReason:"The calendar gate requires a valid interval."});
  if(end&&end.getTime()-start.getTime()>14*24*60*60*1000)return holdResult({scope,summary:"Event interval exceeds the v0.3 evaluation limit of 14 days.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Interval too long for this rule pack."}],coverageReason:"Long-duration plans require a larger reviewed calendar evaluation scope."});
  if(typeof location.latitude!=="number"||location.latitude<-90||location.latitude>90||typeof location.longitude!=="number"||location.longitude<-180||location.longitude>180||typeof location.tzid!=="string"||!validateIanaTimeZone(location.tzid)){
    return holdResult({scope,summary:"Location is incomplete or invalid.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Valid latitude, longitude, and IANA timezone are required."}],coverageReason:"Reliable zmanim require an explicit geographic location and timezone."});
  }
  if(location.calendarRegime!=="diaspora"&&location.calendarRegime!=="israel"){
    return holdResult({scope,summary:"Israel/Diaspora calendar regime was not specified, so Torah Gate will not assume one.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Set location.calendarRegime to diaspora or israel."}],coverageReason:"Yom-Tov observance days differ between Israel and the Diaspora."});
  }
  if(event.zmanimProfile!==ZMANIM_PROFILE){
    return holdResult({scope,summary:"A supported zmanim profile was not explicitly selected.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:`Set event.zmanimProfile to ${ZMANIM_PROFILE}.`}],coverageReason:"Version 0.3 refuses to silently choose a candle-lighting/Havdalah convention."});
  }

  let boundaries=[];let checks=[];let firstAssur=null;
  try{
    boundaries=await hebcalBoundaryCandidates(start,end,location,fetchImpl);
    const probes=buildVerificationInstants(start,end,boundaries);
    for(const instant of probes){
      const check=await hebcalAssurAt(instant,location,fetchImpl);checks.push(check);
      if(check.isAssurBemlacha&&!firstAssur)firstAssur=check;
    }
  }catch(error){
    return holdResult({scope,summary:"The calendar authority could not be fully verified, so no hard decision is issued.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:error instanceof Error?error.message:"Calendar provider error."}],coverageReason:"A hard gate requires successful boundary discovery and point verification.",auditExtra:{calendarRegime:location.calendarRegime,boundaryCandidates:boundaries.map(b=>({category:b.category,title:b.title,date:b.date})),checkedInstants:checks}});
  }

  const activityClassification=classifyActivity(event.activity??{description:event.activityNotes??"",actionTags:[]});
  const overlapsAssur=Boolean(firstAssur);let gateVerdict="PASS";let gateReason="No verified interval segment falls within a period that Hebcal marks assur bemelacha.";
  if(overlapsAssur){
    if(event.emergencyOverridePossible===true){gateVerdict="HOLD";gateReason="The event overlaps an assur-bemelacha period, but a serious exception may apply. Competent human halakhic review is required.";}
    else if(event.melachaRequirement==="yes"){gateVerdict="FAIL";gateReason="The event overlaps an assur-bemelacha period and the supplied facts state that carrying it out requires prohibited melacha.";}
    else if(event.melachaRequirement==="no"){gateVerdict="PASS";gateReason="The event overlaps an assur-bemelacha period, but supplied facts state that it does not require prohibited melacha. This gate does not independently classify the activities.";}
    else if(activityClassification.findings.length>0){gateVerdict="HOLD";gateReason="The event overlaps an assur-bemelacha period and the activity classifier found candidate prohibited categories, but those mappings are draft/review-required and cannot create a hard FAIL.";} else {gateVerdict="HOLD";gateReason="The event overlaps an assur-bemelacha period, but whether the event requires prohibited melacha has not been established.";}
  }
  const gate={
    id:"shabbat_yomtov.calendar_boundary",verdict:gateVerdict,overlapsAssurBemlacha:overlapsAssur,reason:gateReason,
    firstVerifiedConflict:firstAssur,
    boundaryCandidates:boundaries.map(b=>({category:b.category,title:b.title,date:b.date})),
    checkedInstants:checks,
    method:"Provider-boundary partitioning: fetch candle-lighting/havdalah candidates for the padded local date range, partition the event interval at those candidates, then verify each segment with Hebcal isAssurBemlacha. Maximum interval: 14 days.",
    activityClassification,
    limitations:"This gate determines calendar status. Activity classification may produce review-required candidate categories but cannot create a hard FAIL unless melachaRequirement=yes is already established from an approved external source or later reviewed rule. The halakhic mapping has not been rabbinically reviewed."
  };
  const auditExtra={calendarRegime:location.calendarRegime,boundaryCandidates:gate.boundaryCandidates,checkedInstants:checks,activityClassification};

  if(gateVerdict==="FAIL")return {verdict:"FAIL",rulePackVersion:RULE_PACK_VERSION,rulePack:RULE_PACK_META,scope,summary:"The proposed action fails the installed Shabbat/Yom-Tov calendar gate on the supplied facts.",coverage:{status:"partial",implemented:["shabbat_yomtov.calendar_boundary"],note:"A failed installed mandatory gate can fail the proposal within this decision-support rule pack even though broader Torah domains are not encoded."},gates:[gate],sources:SOURCES,audit:baseAudit(auditExtra)};
  if(gateVerdict==="HOLD")return holdResult({scope,summary:"The installed calendar gate cannot issue a hard verdict from the supplied facts.",gates:[gate],coverageReason:gateReason,auditExtra});
  if(scope==="shabbat_yomtov_only")return {verdict:"PASS",rulePackVersion:RULE_PACK_VERSION,rulePack:RULE_PACK_META,scope,summary:"The proposal passes the installed Shabbat/Yom-Tov calendar gate on the supplied facts.",coverage:{status:"complete_for_requested_scope",implemented:["shabbat_yomtov.calendar_boundary"],note:"PASS applies only to this installed calendar gate and is not a rabbinic ruling."},gates:[gate],sources:SOURCES,audit:baseAudit(auditExtra)};
  return holdResult({scope,summary:"The installed Shabbat/Yom-Tov gate passes, but the full Torah rule pack is incomplete; an overall PASS would be false precision.",gates:[gate],coverageReason:"Full-Torah coverage is intentionally incomplete in version 0.3.",auditExtra});
}

function rpcError(id,code,message,data){const error={code,message};if(data!==undefined)error.data=data;return {jsonrpc:"2.0",id:id??null,error};}
function rpcResult(id,result,modern=false){
  if(!modern)return {jsonrpc:"2.0",id,result};
  return {jsonrpc:"2.0",id,result:{resultType:"complete",...result,_meta:{...(result?._meta??{}),"io.modelcontextprotocol/serverInfo":{name:"torah-gate",version:SERVER_VERSION}}}};
}
export async function handleMcpMessage(message,options={}){
  const modern=options.modern===true;
  if(!message||message.jsonrpc!=="2.0"||typeof message.method!=="string")return rpcError(message?.id??null,-32600,"Invalid Request");
  const {id,method,params}=message,isNotification=id===undefined||id===null;
  if(method==="initialize"){
    if(isNotification)return null;
    const requested=params?.protocolVersion,protocolVersion=typeof requested==="string"&&!requested.startsWith("2026-")?requested:"2025-11-25";
    return rpcResult(id,{protocolVersion,capabilities:{tools:{listChanged:false}},serverInfo:{name:"torah-gate",version:SERVER_VERSION},instructions:"Use torah_evaluate_decision for Torah Gate decision support. Never convert missing facts, missing calendar regime/zmanim profile, unclassified activity, emergency exceptions, or unimplemented Torah coverage into PASS. This server is not a substitute for rabbinic psak."},false);
  }
  if(method==="server/discover"){
    if(isNotification)return null;
    return rpcResult(id,{supportedVersions:["2026-07-28"],capabilities:{tools:{}},instructions:"Use torah_evaluate_decision for fail-closed Torah decision support. Hard FAIL is allowed only when an installed gate is deterministically violated on supplied facts; use HOLD for unresolved facts or scope. Not rabbinic psak.",ttlMs:3600000,cacheScope:"public"},true);
  }
  if(method==="notifications/initialized")return null;
  if(method==="ping")return isNotification?null:rpcResult(id,{});
  if(method==="tools/list"){
    if(isNotification)return null;
    return rpcResult(id,modern?{tools:[toolDefinition],ttlMs:300000,cacheScope:"public"}:{tools:[toolDefinition]},modern);
  }
  if(method==="tools/call"){
    if(isNotification)return null;
    if(params?.name!==toolDefinition.name)return rpcError(id,-32602,`Unknown tool: ${params?.name??"(missing)"}`);
    try{
      const output=await evaluateDecision(params?.arguments??{});
      return rpcResult(id,{content:[{type:"text",text:`${output.verdict}: ${output.summary}`}],structuredContent:output,isError:false},modern);
    }catch(error){
      return rpcResult(id,{content:[{type:"text",text:`HOLD: Torah Gate encountered an internal evaluation error: ${error instanceof Error?error.message:"unknown error"}`}],isError:true},modern);
    }
  }
  return isNotification?null:rpcError(id,-32601,`Method not found: ${method}`);
}
export async function handleMcpBody(body,options={}){
  if(Array.isArray(body)){
    if(body.length===0)return rpcError(null,-32600,"Invalid Request");
    const responses=(await Promise.all(body.map(message=>handleMcpMessage(message,options)))).filter(Boolean);
    return responses.length?responses:null;
  }
  return handleMcpMessage(body,options);
}
