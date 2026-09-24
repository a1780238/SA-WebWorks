import { evaluateDecision } from "../src/torah-gate.mjs";

const input = {
  decision: "Accept an invitation requiring prohibited melacha on Friday evening in Brisbane",
  scope: "shabbat_yomtov_only",
  event: {
    start: "2026-09-18T19:30:00+10:00",
    end: "2026-09-18T21:00:00+10:00",
    location: {
      latitude: -27.4698,
      longitude: 153.0251,
      tzid: "Australia/Brisbane",
      label: "Brisbane, Queensland, Australia",
      calendarRegime: "diaspora"
    },
    zmanimProfile: "hebcal_default_18min_8_5deg",
    melachaRequirement: "yes",
    activityNotes: "The calling AI has already established that carrying out the invitation requires prohibited melacha."
  }
};

const result = await evaluateDecision(input);
console.log(JSON.stringify(result, null, 2));
