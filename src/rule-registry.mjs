export const REVIEW_STATES = Object.freeze({
  DRAFT:"DRAFT",
  SOURCE_VETTED:"SOURCE_VETTED",
  SOURCE_VETTED_DISPUTED:"SOURCE_VETTED_DISPUTED",
  RABBINICALLY_REVIEWED:"RABBINICALLY_REVIEWED",
  RETIRED:"RETIRED"
});

export const SOURCE_CLASSES = Object.freeze({
  CANONICAL_PRIMARY:"CANONICAL_PRIMARY",
  CANONICAL_CODIFICATION:"CANONICAL_CODIFICATION",
  MODERN_RESPONSUM_CITATION:"MODERN_RESPONSUM_CITATION",
  INSTITUTIONAL_HALACHIC_SUMMARY:"INSTITUTIONAL_HALACHIC_SUMMARY"
});

export const SOURCE_REGISTRY = Object.freeze({
  "exodus-35-3":{
    id:"exodus-35-3",title:"Exodus 35:3",sourceClass:SOURCE_CLASSES.CANONICAL_PRIMARY,
    url:"https://www.sefaria.org/Exodus.35.3?lang=bi",
    supports:["Kindling fire on Shabbat is expressly prohibited."],
    limitations:["Does not itself resolve modern electrical-device classifications."]
  },
  "mishnah-shabbat-7-2":{
    id:"mishnah-shabbat-7-2",title:"Mishnah Shabbat 7:2",sourceClass:SOURCE_CLASSES.CANONICAL_PRIMARY,
    url:"https://www.sefaria.org/Mishnah_Shabbat.7.2?lang=bi",
    supports:["Enumerates the thirty-nine avot melachot, including sowing, harvesting, sorting, grinding, kneading, baking, sewing, tearing, cutting, writing, erasing, extinguishing, kindling, and transferring between domains."],
    limitations:["Practical application often depends on definitions, shiurim, intent, manner, derivatives, rabbinic restrictions, and exceptions."]
  },
  "rambam-shabbat-7":{
    id:"rambam-shabbat-7",title:"Mishneh Torah, Sabbath 7:1-2",sourceClass:SOURCE_CLASSES.CANONICAL_CODIFICATION,
    url:"https://www.sefaria.org/Mishneh_Torah%2C_Sabbath.7.1?lang=bi",
    supports:["Codifies the thirty-nine primary categories and the concept of analogous/derivative activities."],
    limitations:["A category-level mapping is not a complete practical ruling for every modern act."]
  },
  "shulchan-aruch-oc-318":{
    id:"shulchan-aruch-oc-318",title:"Shulchan Arukh, Orach Chayim 318",sourceClass:SOURCE_CLASSES.CANONICAL_CODIFICATION,
    url:"https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.318?lang=bi",
    supports:["Codifies practical rules concerning cooking on Shabbat and heat derivatives."],
    limitations:["Specific cooking scenarios require state/temperature/medium and other facts."]
  },
  "shulchan-aruch-oc-340":{
    id:"shulchan-aruch-oc-340",title:"Shulchan Arukh, Orach Chayim 340",sourceClass:SOURCE_CLASSES.CANONICAL_CODIFICATION,
    url:"https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.340?lang=bi",
    supports:["Codifies practical rules relevant to erasing and writing."],
    limitations:["Digital display/text questions require modern authority analysis."]
  },
  "shulchan-aruch-oc-345-346":{
    id:"shulchan-aruch-oc-345-346",title:"Shulchan Arukh, Orach Chayim 345-346",sourceClass:SOURCE_CLASSES.CANONICAL_CODIFICATION,
    url:"https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.345-346?lang=bi",
    supports:["Defines Shabbat domains and core transfer/carrying rules."],
    limitations:["Practical carrying also depends on domain facts, object movement, distance, eruv status, and rabbinic rules."]
  },
  "star-k-electricity-2025":{
    id:"star-k-electricity-2025",title:"STAR-K: Keeping Your Cool — Electricity and Halacha",sourceClass:SOURCE_CLASSES.INSTITUTIONAL_HALACHIC_SUMMARY,
    url:"https://www.star-k.org/articles/kashrus-kurrents/14383/keeping-your-cool-using-a-refrigerator-on-shabbos/",
    supports:[
      "Reports a dispute in mechanism: Chazon Ish treats circuit activation as boneh; Rav Shlomo Zalman Auerbach rejects an inherent Torah-level melacha in ordinary circuit switching and analyzes the resulting action.",
      "Provides citations to Chazon Ish O.C. 50:9 and Minchas Shlomo 1:9-11."
    ],
    limitations:["Institutional summary, not the full text of the cited responsa.","Device-specific practical rulings vary."]
  },
  "chabad-electricity":{
    id:"chabad-electricity",title:"Chabad.org: Electricity on Shabbat",sourceClass:SOURCE_CLASSES.INSTITUTIONAL_HALACHIC_SUMMARY,
    url:"https://www.chabad.org/library/article_cdo/aid/1159378/jewish/Electricity-on-Shabbat.htm",
    supports:["Surveys halachic approaches and cites Achiezer, Igrot Moshe, Chazon Ish, and Shemirat Shabbat Kehilchato."],
    limitations:["Secondary practical survey; not a substitute for reviewing cited responsa."]
  },
  "ou-39-melachot":{
    id:"ou-39-melachot",title:"Orthodox Union: The Thirty-Nine Categories of Sabbath Work",sourceClass:SOURCE_CLASSES.INSTITUTIONAL_HALACHIC_SUMMARY,
    url:"https://www.ou.org/holidays/the_thirty_nine_categories_of_sabbath_work_prohibited_by_law/",
    supports:["Treats automobile combustion as an application of burning/kindling and notes observant practice concerning electricity."],
    limitations:["Educational summary rather than a source-critical responsum."]
  },
  "chabad-driving-shabbat":{
    id:"chabad-driving-shabbat",title:"Chabad.org: Shabbat — driving and burning",sourceClass:SOURCE_CLASSES.INSTITUTIONAL_HALACHIC_SUMMARY,
    url:"https://www.chabad.org/library/article_cdo/aid/2313772/jewish/Shabbat.htm",
    supports:["States that driving an internal-combustion vehicle is included under burning because acceleration creates combustion in the engine."],
    limitations:["Practical educational summary; emergency and vehicle-technology distinctions remain outside this source."]
  }
});

const CLASSICAL = {
  ignite_flame_or_combustion:{category:"mavir",sources:["exodus-35-3","mishnah-shabbat-7-2","rambam-shabbat-7"]},
  extinguish_flame_or_combustion:{category:"mechabeh",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  cook_or_bake_with_heat:{category:"ofeh_bishul",sources:["mishnah-shabbat-7-2","rambam-shabbat-7","shulchan-aruch-oc-318"]},
  write_or_print_durable_text:{category:"kotev",sources:["mishnah-shabbat-7-2","rambam-shabbat-7","shulchan-aruch-oc-340"]},
  erase_for_writing:{category:"mochek",sources:["mishnah-shabbat-7-2","rambam-shabbat-7","shulchan-aruch-oc-340"]},
  sew_stitches:{category:"tofer",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  tear_for_repair:{category:"korea",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  cut_to_measure:{category:"mechatech",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  grind_material:{category:"tochen",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  sort_select_mixture:{category:"borer",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  knead_dough_or_paste:{category:"lash",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  harvest_detach_growing:{category:"kotzer",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  plant_or_promote_growth:{category:"zorea",sources:["mishnah-shabbat-7-2","rambam-shabbat-7"]},
  carry_between_domains:{category:"hotzaah",sources:["mishnah-shabbat-7-2","rambam-shabbat-7","shulchan-aruch-oc-345-346"]}
};

const classicalRules = Object.fromEntries(Object.entries(CLASSICAL).map(([tag,v])=>[
  `activity.${tag}`,
  {
    id:`activity.${tag}`,activityTag:tag,reviewState:REVIEW_STATES.SOURCE_VETTED,
    candidateCategories:[v.category],sourceIds:v.sources,
    proposition:`The action tag ${tag} is a candidate mapping to the classical melacha category ${v.category}.`,
    unresolved:["Practical predicates, derivatives, manner, intent, thresholds, rabbinic restrictions, and exceptions require review."],
    hardDecisionEligible:false
  }
]));

export const RULE_REGISTRY = Object.freeze({
  ...classicalRules,
  "activity.drive_combustion_vehicle":{
    id:"activity.drive_combustion_vehicle",activityTag:"drive_combustion_vehicle",reviewState:REVIEW_STATES.SOURCE_VETTED,
    candidateCategories:["mavir","additional_vehicle_effects"],
    sourceIds:["exodus-35-3","mishnah-shabbat-7-2","ou-39-melachot","chabad-driving-shabbat"],
    proposition:"Operation/acceleration of an internal-combustion vehicle is a candidate application of kindling/burning; other vehicle effects may create additional issues.",
    unresolved:["Vehicle technology must actually involve combustion.","Emergency/pikuach-nefesh exceptions must be handled before a hard decision.","Additional electrical, carrying, boundary/travel and other effects are not adjudicated here."],
    hardDecisionEligible:false
  },
  "activity.operate_electric_appliance":{
    id:"activity.operate_electric_appliance",activityTag:"operate_electric_appliance",reviewState:REVIEW_STATES.SOURCE_VETTED_DISPUTED,
    candidateCategories:["electricity_authority_dependent","resulting_melacha_may_apply"],
    sourceIds:["star-k-electricity-2025","chabad-electricity"],
    proposition:"Ordinary electrical operation on Shabbat is treated as prohibited in observant practice, while major authorities disagree on the precise halachic mechanism and Torah/rabbinic classification for non-incandescent circuits.",
    unresolved:["Authority profile must select or reconcile the Chazon Ish / Rav Shlomo Zalman Auerbach and other approaches.","Device output may independently create a classical melacha.","Indirect causation, sensors, timers, medical need and other exceptions require separate rules."],
    hardDecisionEligible:false
  },
  "activity.operate_printer":{
    id:"activity.operate_printer",activityTag:"operate_printer",reviewState:REVIEW_STATES.SOURCE_VETTED_DISPUTED,
    candidateCategories:["kotev","electricity_authority_dependent"],
    sourceIds:["mishnah-shabbat-7-2","shulchan-aruch-oc-340","star-k-electricity-2025","chabad-electricity"],
    proposition:"Physical printing is a candidate application of writing and also involves electrical operation.",
    unresolved:["Durability, medium, indirect act, device mechanism and authority profile require review."],
    hardDecisionEligible:false
  }
});

export const REVIEW_GATE_REQUIREMENTS = Object.freeze([
  "reviewState must equal RABBINICALLY_REVIEWED",
  "reviewer identity and competence scope recorded",
  "authorityProfile recorded",
  "reviewedAt timestamp recorded",
  "effectiveFrom recorded",
  "source chain reviewed against originals where available",
  "material disagreements either resolved by authority profile or explicitly scoped out",
  "applicability predicates and required facts specified",
  "exceptions and emergency rules specified",
  "test cases approved",
  "no unresolved item marked material"
]);

export function evaluateReviewEligibility(rule){
  const reasons=[];
  if(!rule) return {eligible:false,reasons:["Rule does not exist."]};
  if(rule.reviewState!==REVIEW_STATES.RABBINICALLY_REVIEWED) reasons.push("Rule is not rabbinically reviewed.");
  if(!rule.review?.reviewer) reasons.push("Reviewer identity is absent.");
  if(!rule.review?.competenceScope) reasons.push("Reviewer competence scope is absent.");
  if(!rule.review?.authorityProfile) reasons.push("Authority profile is absent.");
  if(!rule.review?.reviewedAt) reasons.push("Review timestamp is absent.");
  if(!rule.review?.effectiveFrom) reasons.push("Effective-from date is absent.");
  if(!Array.isArray(rule.review?.approvedTests)||rule.review.approvedTests.length===0) reasons.push("No approved test set is recorded.");
  if(Array.isArray(rule.unresolved)&&rule.unresolved.length>0) reasons.push("Material unresolved issues remain.");
  return {eligible:reasons.length===0,reasons};
}

export function getRuleByActivityTag(tag){
  return RULE_REGISTRY[`activity.${tag}`]??null;
}

export function getRuleReviewPack({ruleId=null,activityTag=null}={}){
  const rule=ruleId?RULE_REGISTRY[ruleId]:activityTag?getRuleByActivityTag(activityTag):null;
  if(rule){
    return {
      mode:"single",
      rule,
      sources:rule.sourceIds.map(id=>SOURCE_REGISTRY[id]).filter(Boolean),
      reviewGate:{requirements:REVIEW_GATE_REQUIREMENTS,...evaluateReviewEligibility(rule)}
    };
  }
  return {
    mode:"catalog",
    rules:Object.values(RULE_REGISTRY),
    sources:Object.values(SOURCE_REGISTRY),
    reviewGate:{requirements:REVIEW_GATE_REQUIREMENTS,note:"Every current rule remains ineligible for hard decisions until an explicit rabbinic review record is attached."}
  };
}
