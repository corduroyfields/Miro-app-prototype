// Step flow for the Livable prototype, following the UX flow on the Miro board:
// Start → Onboarding → feedback → Quiz (help) → in-flow feedback →
// Ranking (help) → rank feedback → Results → results feedback → End,
// with the results feedback offering a refine loop back to the quiz.

import { DISQUALIFIERS, METRO_SIZE_OPTIONS, QUIZ_QUESTIONS, FACTORS } from "./data.js";
import { generateRecommendations } from "./scoring.js";
import {
  state, save, resetState,
  recordQuizResponse, recordRankings, recordRecommendations, recordFeedback,
} from "./state.js";

const STEPS = [
  { id: "start", label: "Start" },
  { id: "onboarding", label: "Onboarding" },
  { id: "feedback-onboarding", label: "Pulse", sub: true },
  { id: "quiz", label: "Quiz" },
  { id: "feedback-quiz", label: "Pulse", sub: true },
  { id: "ranking", label: "Priorities" },
  { id: "feedback-ranking", label: "Pulse", sub: true },
  { id: "results", label: "Results" },
  { id: "feedback-results", label: "Pulse", sub: true },
  { id: "end", label: "Done" },
];

const app = document.getElementById("app");

// Working copy of the ranking order while the user is on the ranking screen.
let rankingOrder = null;

function goTo(stepId) {
  state.step = stepId;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  renderProgress();
  const renderers = {
    "start": renderStart,
    "onboarding": renderOnboarding,
    "feedback-onboarding": () => renderFeedback("onboarding", "How was getting set up?", "quiz"),
    "quiz": renderQuiz,
    "feedback-quiz": () => renderFeedback("quiz", "How did those questions feel?", "ranking"),
    "ranking": renderRanking,
    "feedback-ranking": () => renderFeedback("ranking", "Was ranking your priorities easy?", "results"),
    "results": renderResults,
    "feedback-results": renderResultsFeedback,
    "end": renderEnd,
  };
  (renderers[state.step] ?? renderStart)();
}

function renderProgress() {
  const majorSteps = STEPS.filter((s) => !s.sub);
  const currentIdx = STEPS.findIndex((s) => s.id === state.step);
  const nav = document.getElementById("progress");
  nav.innerHTML = majorSteps.map((s) => {
    const idx = STEPS.findIndex((t) => t.id === s.id);
    const cls = idx === currentIdx || (currentIdx > 0 && STEPS[currentIdx].sub && idx === currentIdx - 1)
      ? "current" : idx < currentIdx ? "done" : "";
    return `<span class="progress-step ${cls}">${s.label}</span>`;
  }).join('<span class="progress-sep">›</span>');
}

// --- Screens -----------------------------------------------------------------

function renderStart() {
  app.innerHTML = `
    <section class="card hero">
      <h1>Find where you should live next</h1>
      <p>Answer a short quiz, rank what matters most to you, and get a shortlist
      of US places matched to your life — with a plain-English reason for every pick.</p>
      <ol class="model-steps">
        <li><strong>Dealbreakers</strong> — knock out places you'd never consider</li>
        <li><strong>Lifestyle quiz</strong> — shape what a good fit looks like</li>
        <li><strong>Priorities</strong> — rank the factors that matter most</li>
      </ol>
      <button class="primary-btn" id="start-btn">Get started</button>
      <p class="fine-print">Takes about 2 minutes. Demo data only.</p>
    </section>`;
  document.getElementById("start-btn").onclick = () => goTo("onboarding");
}

function renderOnboarding() {
  const p = state.userProfile;
  app.innerHTML = `
    <section class="card">
      <h2>First, your dealbreakers</h2>
      <p class="subtitle">Anything you switch on here removes places entirely — they won't appear in your results no matter how well they score. <em>(Layer 1: hard filters)</em></p>
      <div class="option-list">
        ${DISQUALIFIERS.map((d) => `
          <label class="check-row">
            <input type="checkbox" data-dq="${d.id}" ${p.disqualifiers.includes(d.id) ? "checked" : ""} />
            <span><strong>${d.label}</strong><br><small>${d.detail}</small></span>
          </label>`).join("")}
      </div>
      <h3>Smallest metro you'd consider</h3>
      <div class="option-list">
        ${METRO_SIZE_OPTIONS.map((m) => `
          <label class="check-row">
            <input type="radio" name="metro" value="${m.id}" ${p.minMetroSize === m.id ? "checked" : ""} />
            <span>${m.label}</span>
          </label>`).join("")}
      </div>
      <div class="actions">
        <button class="primary-btn" id="onboarding-next">Continue</button>
      </div>
    </section>`;

  app.querySelectorAll("[data-dq]").forEach((el) => {
    el.onchange = () => {
      const id = el.dataset.dq;
      if (el.checked) p.disqualifiers.push(id);
      else p.disqualifiers = p.disqualifiers.filter((x) => x !== id);
      save();
    };
  });
  app.querySelectorAll('input[name="metro"]').forEach((el) => {
    el.onchange = () => { p.minMetroSize = el.value; save(); };
  });
  document.getElementById("onboarding-next").onclick = () => goTo("feedback-onboarding");
}

function renderQuiz() {
  app.innerHTML = `
    <section class="card">
      <h2>Your lifestyle, in six questions</h2>
      <p class="subtitle">These shape how we match places to you — there are no wrong answers. <em>(Layer 2: soft matching)</em></p>
      ${QUIZ_QUESTIONS.map((q) => {
        const answer = state.quizResponses.find((r) => r.question_id === q.id)?.answer_value;
        return `
        <fieldset class="question">
          <legend>${q.text}
            <button type="button" class="help-btn" data-help="${q.id}" aria-label="Help for this question">?</button>
          </legend>
          <div class="help-panel" id="help-${q.id}" hidden>${q.help}</div>
          <div class="option-list">
            ${q.options.map((o) => `
              <label class="check-row">
                <input type="radio" name="${q.id}" value="${o.id}" ${answer === o.id ? "checked" : ""} />
                <span>${o.label}</span>
              </label>`).join("")}
          </div>
        </fieldset>`;
      }).join("")}
      <div class="actions">
        <button class="primary-btn" id="quiz-next">Continue</button>
        <span class="hint" id="quiz-hint" hidden>Please answer every question first.</span>
      </div>
    </section>`;

  app.querySelectorAll(".help-btn").forEach((btn) => {
    btn.onclick = () => {
      const panel = document.getElementById(`help-${btn.dataset.help}`);
      panel.hidden = !panel.hidden;
    };
  });
  app.querySelectorAll('input[type="radio"]').forEach((el) => {
    el.onchange = () => recordQuizResponse(el.name, el.value);
  });
  document.getElementById("quiz-next").onclick = () => {
    const unanswered = QUIZ_QUESTIONS.filter(
      (q) => !state.quizResponses.some((r) => r.question_id === q.id)
    );
    if (unanswered.length) {
      document.getElementById("quiz-hint").hidden = false;
      return;
    }
    goTo("feedback-quiz");
  };
}

function renderRanking() {
  if (!rankingOrder) {
    rankingOrder = state.priorityRankings.length
      ? [...state.priorityRankings].sort((a, b) => a.rank_order - b.rank_order).map((r) => r.factor_name)
      : FACTORS.map((f) => f.id);
  }

  app.innerHTML = `
    <section class="card">
      <h2>Rank what matters most</h2>
      <p class="subtitle">Drag the order in your head, click the arrows in reality. #1 carries the most weight in your match score. <em>(Layer 3: weighted scoring)</em>
        <button type="button" class="help-btn" id="rank-help-btn" aria-label="Help with ranking">?</button>
      </p>
      <div class="help-panel" id="rank-help" hidden>
        Your #1 factor counts roughly 8× more than your last one. Don't overthink it —
        you can come back and reshuffle after seeing your results.
      </div>
      <ol class="rank-list" id="rank-list"></ol>
      <div class="actions">
        <button class="primary-btn" id="rank-next">See my results</button>
      </div>
    </section>`;

  document.getElementById("rank-help-btn").onclick = () => {
    const panel = document.getElementById("rank-help");
    panel.hidden = !panel.hidden;
  };

  drawRankList();

  document.getElementById("rank-next").onclick = () => {
    recordRankings(rankingOrder);
    const recs = generateRecommendations(state.userProfile, state.quizResponses, state.priorityRankings);
    recordRecommendations(recs.recommendations);
    state.lastRunMeta = { viableCount: recs.viableCount, removed: recs.removed.map((r) => ({ name: `${r.city.city}, ${r.city.state}`, reasons: r.reasons })) };
    save();
    goTo("feedback-ranking");
  };
}

function drawRankList() {
  const list = document.getElementById("rank-list");
  list.innerHTML = rankingOrder.map((fid, i) => {
    const f = FACTORS.find((x) => x.id === fid);
    return `
      <li class="rank-row">
        <span class="rank-num">${i + 1}</span>
        <span class="rank-label" title="${f.help}">${f.label}</span>
        <span class="rank-controls">
          <button class="move-btn" data-dir="-1" data-idx="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move ${f.label} up">▲</button>
          <button class="move-btn" data-dir="1" data-idx="${i}" ${i === rankingOrder.length - 1 ? "disabled" : ""} aria-label="Move ${f.label} down">▼</button>
        </span>
      </li>`;
  }).join("");

  list.querySelectorAll(".move-btn").forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.idx);
      const j = i + Number(btn.dataset.dir);
      [rankingOrder[i], rankingOrder[j]] = [rankingOrder[j], rankingOrder[i]];
      drawRankList();
    };
  });
}

function renderResults() {
  const recs = state.recommendations;
  const meta = state.lastRunMeta ?? { viableCount: "?", removed: [] };

  app.innerHTML = `
    <section class="card">
      <h2>Your shortlist</h2>
      <p class="subtitle">${meta.viableCount} places survived your dealbreakers; here are the top ${recs.length}, scored against your quiz answers and priorities.</p>
      ${recs.map((r) => `
        <article class="result-card">
          <div class="result-head">
            <span class="result-rank">#${r.rank}</span>
            <h3>${r.city_name}, ${r.state} <small class="zip">${r.zip_code}</small></h3>
            <span class="score-badge">${r.match_score}<small>/100</small></span>
          </div>
          <div class="bars">
            ${r.breakdown.map((b) => `
              <div class="bar-row">
                <span class="bar-label">${b.label}</span>
                <span class="bar-track"><span class="bar-fill" style="width:${b.value * 10}%"></span></span>
              </div>`).join("")}
          </div>
          <p class="reasoning">${r.reasoning}</p>
          <p class="ai-note">Prototype rationale — generated from templates, not a live AI model.</p>
        </article>`).join("")}
      ${meta.removed.length ? `
        <details class="removed">
          <summary>${meta.removed.length} places removed by your dealbreakers</summary>
          <ul>${meta.removed.map((r) => `<li><strong>${r.name}</strong> — ${r.reasons.join("; ")}</li>`).join("")}</ul>
        </details>` : ""}
      <div class="actions">
        <button class="primary-btn" id="results-next">Finish</button>
      </div>
    </section>`;

  document.getElementById("results-next").onclick = () => goTo("feedback-results");
}

// Shared pulse-check feedback screen (board touchpoints: onboarding, quiz, ranking).
function renderFeedback(touchpoint, title, nextStep) {
  app.innerHTML = `
    <section class="card pulse">
      <h2>${title}</h2>
      <p class="subtitle">Quick pulse check — totally optional.</p>
      ${ratingWidget()}
      <textarea id="fb-comment" rows="2" placeholder="Anything confusing or missing? (optional)"></textarea>
      <div class="actions">
        <button class="primary-btn" id="fb-submit">Send & continue</button>
        <button class="ghost-btn" id="fb-skip">Skip</button>
      </div>
    </section>`;
  wireRating();
  document.getElementById("fb-submit").onclick = () => {
    recordFeedback(touchpoint, selectedRating, document.getElementById("fb-comment").value.trim());
    goTo(nextStep);
  };
  document.getElementById("fb-skip").onclick = () => goTo(nextStep);
}

// Results feedback adds the refine loop from the board.
function renderResultsFeedback() {
  app.innerHTML = `
    <section class="card pulse">
      <h2>How did we do?</h2>
      <p class="subtitle">Rate your shortlist. If it missed the mark, refine your answers and we'll re-run the match.</p>
      ${ratingWidget()}
      <textarea id="fb-comment" rows="2" placeholder="What felt right or wrong about these picks? (optional)"></textarea>
      <div class="actions">
        <button class="primary-btn" id="fb-submit">Looks good — finish</button>
        <button class="secondary-btn" id="fb-refine">Refine my answers</button>
      </div>
    </section>`;
  wireRating();
  const submitFb = () =>
    recordFeedback("results", selectedRating, document.getElementById("fb-comment").value.trim(),
      state.recommendations[0]?.recommendation_id ?? null);
  document.getElementById("fb-submit").onclick = () => { submitFb(); goTo("end"); };
  document.getElementById("fb-refine").onclick = () => {
    submitFb();
    rankingOrder = null; // re-derive from saved rankings so edits persist
    goTo("quiz");        // answers are preserved in state
  };
}

function renderEnd() {
  const fbCount = state.feedback.length;
  const top = state.recommendations[0];
  app.innerHTML = `
    <section class="card hero">
      <h1>That's a wrap 🎉</h1>
      ${top ? `<p>Your best match: <strong>${top.city_name}, ${top.state}</strong> at ${top.match_score}/100.</p>` : ""}
      <p>Your profile, answers, rankings, and ${fbCount} piece${fbCount === 1 ? "" : "s"} of feedback are saved in this browser
      — refresh anytime and pick up where you left off.</p>
      <div class="actions">
        <button class="secondary-btn" id="again-refine">Refine & re-run</button>
        <button class="ghost-btn" id="again-fresh">Start completely over</button>
      </div>
    </section>`;
  document.getElementById("again-refine").onclick = () => { rankingOrder = null; goTo("quiz"); };
  document.getElementById("again-fresh").onclick = startOver;
}

// --- Rating widget helpers -----------------------------------------------------

let selectedRating = 0;
function ratingWidget() {
  selectedRating = 0;
  return `<div class="stars" id="stars">${[1, 2, 3, 4, 5].map((n) =>
    `<button class="star" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div>`;
}
function wireRating() {
  document.querySelectorAll(".star").forEach((btn) => {
    btn.onclick = () => {
      selectedRating = Number(btn.dataset.n);
      document.querySelectorAll(".star").forEach((b) =>
        b.classList.toggle("on", Number(b.dataset.n) <= selectedRating));
    };
  });
}

function startOver() {
  resetState();
  rankingOrder = null;
  goTo("start");
}

document.getElementById("reset-btn").onclick = startOver;

render();
