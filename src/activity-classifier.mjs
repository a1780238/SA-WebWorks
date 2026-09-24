export const ACTIVITY_CLASSIFIER_VERSION = "0.3.0";
export const ACTIVITY_CLASSIFIER_STATUS = "DRAFT_REVIEW_REQUIRED";

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

const RULES = {
  ignite_flame_or_combustion: {
    candidateCategories:["mavir"],
    sourceIds:["mishnah-shabbat-melachot","chabad-mavir"],
    rationale:"The supplied action tag describes kindling or sustaining combustion, which maps directly to the classical category of mavir at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  extinguish_flame_or_combustion: {
    candidateCategories:["mechabeh"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes extinguishing combustion, which maps to the classical category of mechabeh at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  cook_or_bake_with_heat: {
    candidateCategories:["ofeh_bishul"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes cooking or baking with heat, which maps to the classical baking/cooking category at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  write_or_print_durable_text: {
    candidateCategories:["kotev"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes durable writing or printing, which maps to kotev at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  erase_for_writing: {
    candidateCategories:["mochek"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes erasing for the purpose of writing, which maps to mochek at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  sew_stitches: {
    candidateCategories:["tofer"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes sewing, which maps to tofer at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  tear_for_repair: {
    candidateCategories:["korea"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes constructive tearing for repair, which maps to korea at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  cut_to_measure: {
    candidateCategories:["mechatech"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes cutting to a defined measure, which maps to mechatech at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  grind_material: {
    candidateCategories:["tochen"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes grinding, which maps to tochen at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  sort_select_mixture: {
    candidateCategories:["borer"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes selecting or sorting from a mixture, which maps to borer at a candidate level.",
    complexity:"highly_condition_dependent"
  },
  knead_dough_or_paste: {
    candidateCategories:["lash"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes kneading or forming a mixture into a paste/dough, which maps to lash at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  harvest_detach_growing: {
    candidateCategories:["kotzer"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes detaching something from its place of growth, which maps to kotzer at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  plant_or_promote_growth: {
    candidateCategories:["zorea"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes planting or promoting growth, which maps to zorea at a candidate level.",
    complexity:"classical_category_with_practical_conditions"
  },
  carry_between_domains: {
    candidateCategories:["hotzaah"],
    sourceIds:["mishnah-shabbat-melachot"],
    rationale:"The supplied action tag describes transfer between domains, which maps to hotzaah at a candidate level.",
    complexity:"requires_domain_eruv_and_object_facts"
  },
  drive_combustion_vehicle: {
    candidateCategories:["mavir","additional_vehicle_effects"],
    sourceIds:["chabad-mavir","chabad-electricity"],
    rationale:"A combustion vehicle creates or sustains combustion; contemporary practical treatments identify driving as involving mavir, while other vehicle effects may add further issues.",
    complexity:"contemporary_application_review_required"
  },
  operate_electric_appliance: {
    candidateCategories:["electricity_authority_dependent","resulting_melacha_may_apply"],
    sourceIds:["star-k-electricity","chabad-electricity"],
    rationale:"Contemporary authorities agree ordinary electrical operation on Shabbat is generally prohibited, but the halachic mechanism is treated differently by major poskim; device output can independently create a classical melacha.",
    complexity:"authority_dependent"
  },
  operate_printer: {
    candidateCategories:["kotev","electricity_authority_dependent"],
    sourceIds:["mishnah-shabbat-melachot","chabad-electricity"],
    rationale:"Printing creates writing and also involves electrical operation; this mapping remains review-required for practical adjudication.",
    complexity:"contemporary_application_review_required"
  },
  unknown_other: {
    candidateCategories:[],
    sourceIds:[],
    rationale:"No installed deterministic activity mapping applies.",
    complexity:"unmapped"
  }
};

export function classifyActivity(activity={}) {
  const description=typeof activity?.description==="string"?activity.description.trim():"";
  const inputTags=Array.isArray(activity?.actionTags)?activity.actionTags:[];
  const tags=[...new Set(inputTags.filter(tag=>typeof tag==="string"))];
  const findings=[];
  const unknownTags=[];
  for(const tag of tags){
    const rule=RULES[tag];
    if(!rule){unknownTags.push(tag);continue;}
    if(tag==="unknown_other")continue;
    findings.push({
      tag,
      ...rule,
      reviewStatus:ACTIVITY_CLASSIFIER_STATUS,
      hardDecisionEligible:false
    });
  }
  const candidateCategories=[...new Set(findings.flatMap(f=>f.candidateCategories))];
  let status="INSUFFICIENT_ACTIVITY_FACTS";
  if(tags.length>0&&findings.length===0)status="NO_INSTALLED_MAPPING";
  if(findings.length>0)status="CANDIDATE_PROHIBITION_REVIEW_REQUIRED";
  return {
    classifierVersion:ACTIVITY_CLASSIFIER_VERSION,
    classifierStatus:ACTIVITY_CLASSIFIER_STATUS,
    decisionEffect:"CANDIDATE_FINDINGS_CAN_FORCE_HOLD_BUT_NEVER_FAIL",
    description,
    inputTags:tags,
    unknownTags,
    status,
    candidateCategories,
    findings,
    hardDecisionEligible:false
  };
}
