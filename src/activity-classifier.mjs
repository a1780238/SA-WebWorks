import { getRuleByActivityTag, evaluateReviewEligibility } from "./rule-registry.mjs";

export const ACTIVITY_CLASSIFIER_VERSION = "0.4.0";

export const ACTIVITY_TAGS = [
  "ignite_flame_or_combustion",
  "extinguish_flame_or_combustion",
  "cook_or_bake_with_heat",
  "write_or_print_durable_text",
  "erase_for_writing",
  "sew_stitches",
  "tear_for_repair",
  "cut_to_measure",
  "grind_material",
  "sort_select_mixture",
  "knead_dough_or_paste",
  "harvest_detach_growing",
  "plant_or_promote_growth",
  "carry_between_domains",
  "drive_combustion_vehicle",
  "operate_electric_appliance",
  "operate_printer",
  "unknown_other"
];

export function classifyActivity(activity={}) {
  const description=typeof activity?.description==="string"?activity.description.trim():"";
  const inputTags=Array.isArray(activity?.actionTags)?activity.actionTags:[];
  const tags=[...new Set(inputTags.filter(tag=>typeof tag==="string"))];
  const findings=[];
  const unknownTags=[];

  for(const tag of tags){
    if(tag==="unknown_other")continue;
    const rule=getRuleByActivityTag(tag);
    if(!rule){unknownTags.push(tag);continue;}
    const reviewEligibility=evaluateReviewEligibility(rule);
    findings.push({
      tag,
      ruleId:rule.id,
      reviewState:rule.reviewState,
      candidateCategories:rule.candidateCategories,
      sourceIds:rule.sourceIds,
      proposition:rule.proposition,
      unresolved:rule.unresolved,
      reviewEligibility,
      hardDecisionEligible:reviewEligibility.eligible
    });
  }

  const candidateCategories=[...new Set(findings.flatMap(f=>f.candidateCategories))];
  const anyHardEligible=findings.some(f=>f.hardDecisionEligible);
  let status="INSUFFICIENT_ACTIVITY_FACTS";
  if(tags.length>0&&findings.length===0)status="NO_INSTALLED_MAPPING";
  if(findings.length>0&&!anyHardEligible)status="CANDIDATE_PROHIBITION_REVIEW_REQUIRED";
  if(findings.length>0&&anyHardEligible)status="REVIEWED_RULE_MATCH_PRESENT";

  return {
    classifierVersion:ACTIVITY_CLASSIFIER_VERSION,
    registryBacked:true,
    decisionEffect:anyHardEligible
      ?"REVIEWED_RULES_MAY_SUPPORT_HARD_DECISIONS_SUBJECT_TO_APPLICABILITY"
      :"SOURCE_VETTED_FINDINGS_CAN_FORCE_HOLD_BUT_NEVER_FAIL",
    description,
    inputTags:tags,
    unknownTags,
    status,
    candidateCategories,
    findings,
    hardDecisionEligible:anyHardEligible
  };
}
