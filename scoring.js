// Recommendation engine implementing the three-layer model from the Miro board:
//   Layer 1 — hard filters: onboarding disqualifiers remove non-viable candidates
//   Layer 2 — soft matching: quiz answers build a preference vector and a match score
//   Layer 3 — weighted scoring: stack-ranked factors become a weight vector
// The final score blends Layers 2 and 3, and each result gets a templated
// rationale (prototype stand-in for the board's "AI rationale generation" step).

import { CITIES, DISQUALIFIERS, METRO_SIZE_OPTIONS, QUIZ_QUESTIONS, FACTORS } from "./data.js";

// --- Layer 1: hard filters ---------------------------------------------------

export function layer1Filter(profile) {
  const active = DISQUALIFIERS.filter((d) => profile.disqualifiers.includes(d.id));
  const metro = METRO_SIZE_OPTIONS.find((m) => m.id === profile.minMetroSize) ?? METRO_SIZE_OPTIONS[0];

  const viable = [];
  const removed = [];
  for (const city of CITIES) {
    const failures = active.filter((d) => !d.test(city)).map((d) => d.reason);
    if (city.metroPop < metro.min) failures.push(`metro is smaller than your ${metro.label.toLowerCase()} cutoff`);
    if (failures.length) removed.push({ city, reasons: failures });
    else viable.push(city);
  }
  return { viable, removed };
}

// --- Layer 2: soft matching --------------------------------------------------

// Build a preference vector over factor ids from quiz answers.
export function preferenceVector(quizResponses) {
  const prefs = {};
  for (const resp of quizResponses) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === resp.question_id);
    const option = question?.options.find((o) => o.id === resp.answer_value);
    if (!option) continue;
    for (const [factor, boost] of Object.entries(option.boosts)) {
      prefs[factor] = (prefs[factor] ?? 0) + boost;
    }
  }
  return prefs;
}

// 0–100: how well a city's attributes line up with the boosted factors.
export function layer2Match(prefs, city) {
  const entries = Object.entries(prefs);
  if (!entries.length) return 50; // neutral when quiz expressed no preferences
  let total = 0;
  let weightSum = 0;
  for (const [factor, boost] of entries) {
    total += (city[factor] ?? 5) * boost;
    weightSum += boost;
  }
  return Math.round((total / weightSum) * 10);
}

// --- Layer 3: weighted scoring -----------------------------------------------

// Inverse-rank weights: rank 1 of n gets weight n, rank n gets weight 1, normalized.
export function layer3Weights(priorityRankings) {
  const n = priorityRankings.length;
  if (!n) return {};
  const sum = (n * (n + 1)) / 2;
  const weights = {};
  for (const r of priorityRankings) {
    weights[r.factor_name] = (n - r.rank_order + 1) / sum;
  }
  return weights;
}

export function layer3Score(weights, city) {
  let total = 0;
  for (const [factor, w] of Object.entries(weights)) {
    total += (city[factor] ?? 5) * w;
  }
  return Math.round(total * 10); // 0–100
}

// --- Full pipeline -------------------------------------------------------------

const FINAL_BLEND = { layer3: 0.7, layer2: 0.3 };
const SHORTLIST_SIZE = 5;

export function generateRecommendations(profile, quizResponses, priorityRankings) {
  const { viable, removed } = layer1Filter(profile);
  const prefs = preferenceVector(quizResponses);
  const weights = layer3Weights(priorityRankings);

  const scored = viable.map((city) => {
    const matchL2 = layer2Match(prefs, city);
    const scoreL3 = layer3Score(weights, city);
    const match_score = Math.round(scoreL3 * FINAL_BLEND.layer3 + matchL2 * FINAL_BLEND.layer2);
    return { city, matchL2, scoreL3, match_score };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  const shortlist = scored.slice(0, SHORTLIST_SIZE);

  const recommendations = shortlist.map((s, i) => ({
    recommendation_id: `rec_${s.city.zip}`,
    rank: i + 1,
    zip_code: s.city.zip,
    city_name: s.city.city,
    state: s.city.state,
    match_score: s.match_score,
    reasoning: buildRationale(s.city, weights, prefs, s.match_score),
    generated_at: new Date().toISOString(),
    breakdown: topFactorBreakdown(s.city, weights),
  }));

  return { recommendations, removed, viableCount: viable.length };
}

// --- Rationale templates --------------------------------------------------------
// Prototype stand-in for the AI rationale step on the board: deterministic
// templates assembled from the user's top-ranked factors and quiz preferences.

function topFactorBreakdown(city, weights, count = 4) {
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([factorId, weight]) => ({
      factorId,
      label: FACTORS.find((f) => f.id === factorId)?.label ?? factorId,
      weight,
      value: city[factorId] ?? 5,
    }));
}

const STRENGTH_PHRASES = {
  costOfLiving: "your money goes noticeably further here",
  jobMarket: "the local job market is one of the stronger ones on your list",
  climate: "the climate stays comfortable for most of the year",
  safety: "it ranks among the safer places that made your cut",
  outdoors: "trails, water, and open space are right at hand",
  culture: "the food, music, and arts scene punches above its weight",
  schools: "local schools rate well",
  walkability: "much of daily life works on foot",
};

const TRADEOFF_PHRASES = {
  costOfLiving: "housing costs will stretch your budget",
  jobMarket: "the local job market is thinner than elsewhere on your list",
  climate: "the weather brings more extremes than you might like",
  safety: "safety scores trail your other matches",
  outdoors: "big outdoor escapes take more effort to reach",
  culture: "the cultural scene is quieter than your other matches",
  schools: "school ratings lag your other options",
  walkability: "you'll want a car for most errands",
};

function buildRationale(city, weights, prefs, score) {
  const ranked = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const strengths = ranked.filter(([f]) => (city[f] ?? 5) >= 7).slice(0, 2);
  const tradeoff = [...ranked].reverse().find(([f]) => (city[f] ?? 5) <= 4);

  const parts = [`${city.city}, ${city.state} scores ${score}/100 against your profile.`];
  if (strengths.length) {
    const phrases = strengths.map(([f]) => STRENGTH_PHRASES[f] ?? `${f} is a strong point`);
    parts.push(`On the factors you ranked highest, ${phrases.join(", and ")}.`);
  } else {
    parts.push(`It's a balanced all-rounder rather than a standout on any single factor you ranked.`);
  }
  if (tradeoff) {
    parts.push(`The trade-off: ${TRADEOFF_PHRASES[tradeoff[0]] ?? `${tradeoff[0]} is weaker`}.`);
  }
  const topPref = Object.entries(prefs).sort((a, b) => b[1] - a[1])[0];
  if (topPref && (city[topPref[0]] ?? 5) >= 7) {
    const label = FACTORS.find((f) => f.id === topPref[0])?.label?.toLowerCase() ?? topPref[0];
    parts.push(`It also fits the ${label} preference that came through in your quiz answers.`);
  }
  return parts.join(" ");
}
