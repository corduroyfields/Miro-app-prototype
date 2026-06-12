# Miro App Prototype — "Livable"

A clickable web prototype of a **personalized "best places to live" recommender**, built directly from the [**Web App MVP** Miro board](https://miro.com/app/board/uXjVHLZLYTA=/) using Claude Code and the Miro MCP server. The board's three diagrams -  a UX flow, a database ERD, and a three-layer recommendation engine flowchart, are the source of truth for everything in this repo.

Vanilla HTML/CSS/JS with ES modules.

## Run it locally

```bash
python3 -m http.server 5173
```

Then open <http://localhost:5173>. (Browsers block ES modules from `file://` URLs, so use a local server rather than double-clicking `index.html`.)

## How the Miro board maps to the code

### 1. UX flow diagram → `app.js`

The board's journey is implemented step-for-step:

> Start → Onboarding → feedback → Quiz (with Help) → in-flow feedback → Priority Ranking (with Help) → rank feedback → View Results → results feedback → End

- Every stage on the board is a screen in the SPA, including all **four feedback pulse-checks** (star rating + optional comment, skippable).
- **Help** is available exactly where the board places it: per-question `?` toggles in the quiz and a `?` on the ranking screen.
- The results feedback screen offers **"Refine my answers"** — the board's refine loop — which returns to the quiz with all previous answers preserved and re-runs the engine.

### 2. Entity-relationship diagram → `state.js`

The client-side store mirrors the board's schema, persisted to `localStorage`:

| Board entity | Store key | Fields kept |
|---|---|---|
| USER | `user` | email, created_at, last_active |
| USERPROFILE | `userProfile` | disqualifiers, min metro size, zip, target regions |
| QUIZRESPONSE | `quizResponses` | response_id, question_id, answer_value, answered_at |
| PRIORITYRANKING | `priorityRankings` | ranking_id, factor_name, rank_order, created_at |
| RECOMMENDATION | `recommendations` | zip_code, city_name, state, match_score, reasoning, generated_at |
| FEEDBACK | `feedback` | feedback_id, recommendation_id, rating, comments, submitted_at |

### 3. Three-layer engine flowchart → `scoring.js`

| Board layer | Implementation |
|---|---|
| **Layer 1 — hard filters** | `layer1Filter()` removes cities failing any onboarding dealbreaker (winters, heat, coastal access, metro size) and reports *why* each was removed |
| **Layer 2 — soft matching** | `preferenceVector()` + `layer2Match()` turn quiz answers into factor boosts and a 0–100 fit score |
| **Layer 3 — weighted scoring** | `layer3Weights()` converts the stack-rank into inverse-rank weights (#1 ≈ 8× the weight of #8); `layer3Score()` applies them |
| **AI rationale generation** | `buildRationale()` — deterministic templates (strengths, trade-off, quiz-preference callout), clearly labeled in the UI as prototype output rather than a live model |

Final score = 70% weighted factors + 30% quiz match, top 5 shown with score-bar breakdowns.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell, header with journey progress |
| `styles.css` | Visual design |
| `app.js` | Step flow, screens, feedback widgets, help toggles |
| `scoring.js` | Three-layer engine + rationale templates |
| `state.js` | ERD-shaped store with localStorage persistence |
| `data.js` | Quiz questions, factors, dealbreakers, sample cities |

## Honest limitations

- **Demo data only.** The ~20 cities and all their attribute values in `data.js` are illustrative placeholders, not real statistics.
- **No backend.** The ERD is modeled entirely client-side; nothing leaves your browser.
- **No real AI.** Rationales are template-generated; a production version would call a model with the score breakdown as context.

## Related work

- [`livable-lab`](../livable-lab) — Python scoring pipeline experiments for the same product idea
- An earlier prototype of this board was built with Cursor; this repo is a fresh build of the same journey with Claude Code, including the newer three-layer engine diagram.
