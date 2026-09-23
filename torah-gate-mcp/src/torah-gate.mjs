const RULE_PACK_VERSION = "torah-gate/0.1.0";
const HEB_CAL_DOC = "https://www.hebcal.com/home/5058/assur-melacha-work-forbidden-api";

const SOURCES = [
  { id:"torah-shabbat-exodus", title:"Exodus 20:8-11", url:"https://www.sefaria.org/Exodus.20.8-11?lang=bi", role:"Foundational Torah command concerning Shabbat rest." },
  { id:"torah-shabbat-deuteronomy", title:"Deuteronomy 5:12-15", url:"https://www.sefaria.org/Deuteronomy.5.12-15?lang=bi", role:"Foundational Torah command concerning Shabbat observance." },
  { id:"mishnah-shabbat-melachot", title:"Mishnah Shabbat 7:2", url:"https://www.sefaria.org/Mishnah_Shabbat.7.2?lang=bi", role:"Classical source enumerating primary categories of melacha." },
  { id:"hebcal-assur-melacha", title:"Hebcal Assur Melacha API", url:HEB_CAL_DOC, role:"Machine-readable determination of whether melacha is currently prohibited for a specified place and instant." }
];

export const toolDefinition = {
  name:"torah_evaluate_decision",
  title:"Torah-check a decision",
  description:"Evaluate a proposed action against the installed Torah Gate rule pack. Version 0.1 deterministically checks Shabbat/Yom-Tov melacha-time conflicts when structured event facts are supplied and returns HOLD instead of guessing when facts, activity classification, exceptions, or rule coverage are insufficient.",
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
              tzid:{type:"string"}, label:{type:"string"}
            }
          },
          melachaRequirement:{type:"string",enum:["yes","no","unknown"]},
          emergencyOverridePossible:{type:"boolean",default:false},
          activityNotes:{type:"string"}
        }
      }
    }
  },
  outputSchema:{
    type:"object",
    properties:{
      verdict:{type:"string",enum:["PASS","FAIL","HOLD"]},
      rulePackVersion:{type:"string"},scope:{type:"string"},summary:{type:"string"},
      coverage:{type:"object"},gates:{type:"array",items:{type:"object"}},
      sources:{type:"array",items:{type:"object"}},audit:{type:"object"}
    }
  },
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:true,idempotentHint:true}
};

function hasExplicitOffset(value){return typeof value==="string"&&/(Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());}
function parseInstant(value){if(!hasExplicitOffset(value))return null;const ms=Date.parse(value);return Number.isFinite(ms)?new Date(ms):null;}
function validateIanaTimeZone(tzid){try{new Intl.DateTimeFormat("en-US",{timeZone:tzid}).format(new Date());return true;}catch{return false;}}
function sampleInstants(start,end){
  if(!end)return[start];
  const samples=[start],stepMs=12*60*60*1000;
  for(let t=start.getTime()+stepMs;t<end.getTime();t+=stepMs)samples.push(new Date(t));
  if(end.getTime()!==start.getTime())samples.push(end);
  return samples;
}
async function hebcalAssurAt(instant,location,fetchImpl){
  const url=new URL("https://www.hebcal.com/zmanim");
  url.searchParams.set("cfg","json");url.searchParams.set("im","1");
  url.searchParams.set("latitude",String(location.latitude));url.searchParams.set("longitude",String(location.longitude));
  url.searchParams.set("tzid",location.tzid);url.searchParams.set("dt",instant.toISOString());
  const response=await fetchImpl(url,{headers:{accept:"application/json","user-agent":"TorahGate-MCP/0.1"},signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw new Error(`Hebcal returned HTTP ${response.status}`);
  const payload=await response.json();
  if(!payload?.status||typeof payload.status.isAssurBemlacha!=="boolean")throw new Error("Hebcal response did not include status.isAssurBemlacha");
  return {instant:instant.toISOString(),localTime:payload.status.localTime??null,isAssurBemlacha:payload.status.isAssurBemlacha,location:payload.location?.title??location.label??null,hebcalVersion:payload.version??null};
}
function holdResult({scope,summary,gates,coverageReason,auditExtra={}}){
  return {
    verdict:"HOLD",rulePackVersion:RULE_PACK_VERSION,scope,summary,
    coverage:{
      status:"partial",implemented:["shabbat_yomtov.calendar_boundary"],
      notYetImplemented:["activity-level melacha classification","ribbis and finance","truth and misrepresentation","property and theft","contracts and monetary law","speech obligations and prohibitions","damages and interpersonal duties","positive-commandment conflicts and exceptions"],
      reason:coverageReason
    },
    gates,sources:SOURCES,
    audit:{evaluatedAt:new Date().toISOString(),deterministicCalendarProvider:"Hebcal Assur Melacha API",zmanimProfile:"Hebcal Assur Melacha default; end-time calculation uses 8.5-degree solar depression per Hebcal documentation.",...auditExtra}
  };
}
export async function evaluateDecision(input,options={}){
  const fetchImpl=options.fetchImpl??fetch;
  const scope=input?.scope==="shabbat_yomtov_only"?"shabbat_yomtov_only":"full_torah";
  const decision=typeof input?.decision==="string"?input.decision.trim():"";
  if(!decision)return holdResult({scope,summary:"No concrete proposed action was supplied.",gates:[],coverageReason:"A decision statement is required before any gate can be evaluated."});
  if(!input.event)return holdResult({scope,summary:"No calendar-event facts were supplied, so the installed Shabbat/Yom-Tov gate cannot run.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Missing event start time and location."}],coverageReason:"Version 0.1 only contains an executable calendar boundary gate."});

  const event=input.event,start=parseInstant(event.start),end=event.end?parseInstant(event.end):null,location=event.location??{};
  if(!start||(event.end&&!end))return holdResult({scope,summary:"Event time is invalid or lacks an explicit UTC offset.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Invalid ISO-8601 datetime."}],coverageReason:"The calendar gate requires unambiguous instants."});
  if(end&&end<start)return holdResult({scope,summary:"Event end precedes event start.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Invalid event interval."}],coverageReason:"The calendar gate requires a valid interval."});
  if(end&&end.getTime()-start.getTime()>14*24*60*60*1000)return holdResult({scope,summary:"Event interval exceeds the v0.1 evaluation limit of 14 days.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Interval too long for this rule pack."}],coverageReason:"Long-duration plans require a richer calendar evaluation path."});
  if(typeof location.latitude!=="number"||location.latitude<-90||location.latitude>90||typeof location.longitude!=="number"||location.longitude<-180||location.longitude>180||typeof location.tzid!=="string"||!validateIanaTimeZone(location.tzid)){
    return holdResult({scope,summary:"Location is incomplete or invalid.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:"Valid latitude, longitude, and IANA timezone are required."}],coverageReason:"Reliable zmanim require an explicit geographic location and timezone."});
  }

  const samples=sampleInstants(start,end);let firstAssur=null;const checks=[];
  try{
    for(const instant of samples){
      const check=await hebcalAssurAt(instant,location,fetchImpl);checks.push(check);
      if(check.isAssurBemlacha){firstAssur=check;break;}
    }
  }catch(error){
    return holdResult({scope,summary:"The calendar authority could not be verified, so no hard decision is issued.",gates:[{id:"shabbat_yomtov.calendar_boundary",verdict:"HOLD",reason:error instanceof Error?error.message:"Calendar provider error."}],coverageReason:"A hard gate requires successful external verification.",auditExtra:{checkedInstants:checks}});
  }

  const overlapsAssur=Boolean(firstAssur);let gateVerdict="PASS";let gateReason="No checked instant falls within a period that Hebcal marks assur bemelacha.";
  if(overlapsAssur){
    if(event.emergencyOverridePossible===true){gateVerdict="HOLD";gateReason="The event overlaps an assur-bemelacha period, but a serious exception may apply. Human halakhic review is required.";}
    else if(event.melachaRequirement==="yes"){gateVerdict="FAIL";gateReason="The event overlaps an assur-bemelacha period and the supplied facts state that carrying it out requires prohibited melacha.";}
    else if(event.melachaRequirement==="no"){gateVerdict="PASS";gateReason="The event overlaps an assur-bemelacha period, but supplied facts state that it does not require prohibited melacha. This gate does not independently classify the activities.";}
    else {gateVerdict="HOLD";gateReason="The event overlaps an assur-bemelacha period, but whether the event requires prohibited melacha has not been established.";}
  }
  const gate={id:"shabbat_yomtov.calendar_boundary",verdict:gateVerdict,overlapsAssurBemlacha:overlapsAssur,reason:gateReason,firstVerifiedConflict:firstAssur,checkedInstants:checks,method:"Start/end plus 12-hour interior sampling, using Hebcal isAssurBemlacha. Maximum interval: 14 days.",limitations:"This gate determines calendar status only. It does not decide whether a specific act is melacha, whether a rabbinic prohibition applies, or whether an exception overrides the rule."};

  if(gateVerdict==="FAIL")return {verdict:"FAIL",rulePackVersion:RULE_PACK_VERSION,scope,summary:"The proposed action fails the installed Shabbat/Yom-Tov gate on the supplied facts.",coverage:{status:"partial",implemented:["shabbat_yomtov.calendar_boundary"],note:"A failed mandatory gate is sufficient to fail the proposal even though other Torah domains are not yet encoded."},gates:[gate],sources:SOURCES,audit:{evaluatedAt:new Date().toISOString(),deterministicCalendarProvider:"Hebcal Assur Melacha API",zmanimProfile:"Hebcal Assur Melacha default; end-time calculation uses 8.5-degree solar depression per Hebcal documentation."}};
  if(gateVerdict==="HOLD")return holdResult({scope,summary:"The installed calendar gate cannot issue a hard verdict from the supplied facts.",gates:[gate],coverageReason:gateReason,auditExtra:{checkedInstants:checks}});
  if(scope==="shabbat_yomtov_only")return {verdict:"PASS",rulePackVersion:RULE_PACK_VERSION,scope,summary:"The proposal passes the installed Shabbat/Yom-Tov calendar gate on the supplied facts.",coverage:{status:"complete_for_requested_scope",implemented:["shabbat_yomtov.calendar_boundary"],note:"PASS applies only to the requested Shabbat/Yom-Tov calendar scope."},gates:[gate],sources:SOURCES,audit:{evaluatedAt:new Date().toISOString(),deterministicCalendarProvider:"Hebcal Assur Melacha API",zmanimProfile:"Hebcal Assur Melacha default; end-time calculation uses 8.5-degree solar depression per Hebcal documentation."}};
  return holdResult({scope,summary:"The installed Shabbat/Yom-Tov gate passes, but the full Torah rule pack is not yet complete; an overall PASS would be false precision.",gates:[gate],coverageReason:"Full-Torah coverage is intentionally incomplete in version 0.1.",auditExtra:{checkedInstants:checks}});
}
function rpcError(id,code,message,data){const error={code,message};if(data!==undefined)error.data=data;return {jsonrpc:"2.0",id:id??null,error};}
function rpcResult(id,result,modern=false){
  if(!modern)return {jsonrpc:"2.0",id,result};
  return {jsonrpc:"2.0",id,result:{resultType:"complete",...result,_meta:{...(result?._meta??{}),"io.modelcontextprotocol/serverInfo":{name:"torah-gate",version:"0.1.0"}}}};
}
export async function handleMcpMessage(message,options={}){
  const modern=options.modern===true;
  if(!message||message.jsonrpc!=="2.0"||typeof message.method!=="string")return rpcError(message?.id??null,-32600,"Invalid Request");
  const {id,method,params}=message,isNotification=id===undefined||id===null;
  if(method==="initialize"){
    if(isNotification)return null;
    const requested=params?.protocolVersion,protocolVersion=typeof requested==="string"&&!requested.startsWith("2026-")?requested:"2025-11-25";
    return rpcResult(id,{protocolVersion,capabilities:{tools:{listChanged:false}},serverInfo:{name:"torah-gate",version:"0.1.0"},instructions:"Use torah_evaluate_decision when the user asks to Torah-check a proposed action. Never convert missing facts or unimplemented halakhic coverage into PASS. FAIL may be issued when an installed mandatory gate is deterministically violated; otherwise use HOLD."},false);
  }
  if(method==="server/discover"){
    if(isNotification)return null;
    return rpcResult(id,{supportedVersions:["2026-07-28"],capabilities:{tools:{}},instructions:"Use torah_evaluate_decision when the user asks to Torah-check a proposed action. Hard FAIL is allowed only when an installed mandatory gate is deterministically violated; use HOLD for missing facts or incomplete halakhic coverage.",ttlMs:3600000,cacheScope:"public"},true);
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
