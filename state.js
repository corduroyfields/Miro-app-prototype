// Client-side store shaped after the ERD on the Miro board:
// USER, USERPROFILE, QUIZRESPONSE, PRIORITYRANKING, RECOMMENDATION, FEEDBACK.
// Persisted to localStorage so a refresh resumes where you left off.

const STORAGE_KEY = "livable-prototype-v1";

function emptyState() {
  const now = new Date().toISOString();
  return {
    user: { email: "demo@livable.app", created_at: now, last_active: now },
    userProfile: {
      // Onboarding (Layer 1) answers
      disqualifiers: [],          // ids from DISQUALIFIERS
      minMetroSize: "any",        // id from METRO_SIZE_OPTIONS
      current_zip_code: "",
      target_regions: [],
    },
    quizResponses: [],            // { response_id, question_id, answer_value, answered_at }
    priorityRankings: [],         // { ranking_id, factor_name, rank_order, created_at }
    recommendations: [],          // { recommendation_id, zip_code, city_name, state, match_score, reasoning, generated_at }
    feedback: [],                 // { feedback_id, touchpoint, recommendation_id, rating, comments, submitted_at }
    step: "start",
  };
}

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn("Could not load saved session, starting fresh.", e);
  }
  return emptyState();
}

export function save() {
  state.user.last_active = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = emptyState();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  localStorage.removeItem(STORAGE_KEY);
}

let idCounter = Date.now();
export function nextId(prefix) {
  return `${prefix}_${(idCounter++).toString(36)}`;
}

export function recordQuizResponse(questionId, answerValue) {
  const existing = state.quizResponses.find((r) => r.question_id === questionId);
  if (existing) {
    existing.answer_value = answerValue;
    existing.answered_at = new Date().toISOString();
  } else {
    state.quizResponses.push({
      response_id: nextId("resp"),
      question_id: questionId,
      answer_value: answerValue,
      answered_at: new Date().toISOString(),
    });
  }
  save();
}

export function recordRankings(orderedFactorIds) {
  state.priorityRankings = orderedFactorIds.map((factorId, i) => ({
    ranking_id: nextId("rank"),
    factor_name: factorId,
    rank_order: i + 1,
    created_at: new Date().toISOString(),
  }));
  save();
}

export function recordRecommendations(recs) {
  state.recommendations = recs;
  save();
}

export function recordFeedback(touchpoint, rating, comments, recommendationId = null) {
  state.feedback.push({
    feedback_id: nextId("fb"),
    touchpoint,
    recommendation_id: recommendationId,
    rating,
    comments,
    submitted_at: new Date().toISOString(),
  });
  save();
}
