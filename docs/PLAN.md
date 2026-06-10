# Miro-app-prototype: Build prototype web app from Miro "Web App MVP" board

*This is the implementation plan written and approved in Claude Code plan mode on June 10, 2026, before any code was written. Kept as documentation of the design-board-to-app workflow. See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for the outcomes.*

## Context

The user has an app workflow designed on their Miro board **"Web App MVP"** (https://miro.com/app/board/uXjVHLZLYTA=/) and wants a clickable prototype web app built from it, in a **new repo** at `/Users/jwhite/Projects/Miro-app-prototype`, pushed to a **public** GitHub repo under `corduroyfields`. This is a fresh build (not reusing the earlier Cursor-built prototype in `livable-lab/prototype`, though it exists as prior art). Stack: **vanilla HTML/CSS/JS, no build step** — Node.js is not installed on this machine; Python 3.8 and `gh` (authenticated) are available.

## Source of truth: the three Miro diagrams

1. **UX flow diagram**: Start → Onboarding → feedback → Quiz (with Help) → in-flow feedback → Priority Ranking (with Help) → rank feedback → View Results → results feedback → End. Feedback pulse-checks after every major stage; help available during quiz and ranking.
2. **ERD**: USER, USERPROFILE (zip, target regions), QUIZRESPONSE, PRIORITYRANKING (factor_name, rank_order), RECOMMENDATION (zip, city, state, match_score, reasoning, generated_at), FEEDBACK (rating, comments) — a personalized "best places to live" recommender.
3. **Recommendation engine flow**: three layers —
   - **Layer 1 (hard filters)**: disqualifiers from onboarding remove non-viable candidates
   - **Layer 2 (soft matching)**: quiz preferences score/cluster the viable set
   - **Layer 3 (weighted scoring)**: stack-ranked factors become a weight vector → ranked shortlist
   - Plus: generated rationale per recommendation, results with explanations, feedback loop that refines the profile and re-runs scoring.

## Deliverable

A static single-page app implementing the full journey:

- **Screens** (one SPA with step navigation): Start → Onboarding (disqualifier toggles, e.g. max winter severity, min metro size, state exclusions) → Quiz (lifestyle preference questions with help tooltips) → Ranking (drag-or-button stack-rank of factors: cost of living, climate, jobs, safety, outdoors, culture, etc.) → Results (ranked shortlist of cities with match score breakdown and a templated rationale paragraph) → End/refine.
- **Feedback widgets** after onboarding, quiz, ranking, and results (1–5 rating + optional comment), per the board's four feedback touchpoints. Results feedback offers a "refine" path looping back to the quiz with answers preserved.
- **Engine** (`scoring.js`): implements the 3 layers exactly as diagrammed — filter → preference match → weighted score from rank order (e.g. weights proportional to inverse rank). Rationale text is template-generated client-side and labeled as such (no API calls).
- **State** mirrors the ERD as a client-side store persisted to `localStorage` (profile, quizResponses, priorityRankings, recommendations, feedback) so the data model from the board is visibly represented in code.
- **Sample data** (`data.js`): ~15–20 US cities/zips with demo attribute values, clearly marked as illustrative.

### File layout

```
Miro-app-prototype/
├── index.html      # app shell
├── styles.css      # visual design
├── app.js          # step flow, rendering, feedback widgets
├── scoring.js      # 3-layer engine + rationale templates
├── data.js         # questions, factors, disqualifiers, sample cities
├── state.js        # ERD-shaped store + localStorage persistence
├── README.md       # board → app mapping, how to run, screenshots of flow
└── .gitignore
```

ES modules, so it needs a local server: `python3 -m http.server` (documented in README). Once on GitHub Pages it just works.

## Steps

1. Create `/Users/jwhite/Projects/Miro-app-prototype`, `git init -b main`.
2. Build the app files above.
3. **Verify locally**: serve with `python3 -m http.server`, then use the Claude Preview browser tools (`preview_start`, `preview_click`, `preview_screenshot`) to click through the entire journey: set disqualifiers → answer quiz → rank factors → confirm results show filtered, scored, explained cities → submit feedback → refine loop returns to quiz with state intact. Also verify localStorage persistence across reload and check the console for errors.
4. Commit, then `gh repo create corduroyfields/Miro-app-prototype --public --source=. --push` with a description referencing the Miro board.
5. Enable GitHub Pages from `main` branch root via `gh api repos/corduroyfields/Miro-app-prototype/pages -f "source[branch]=main" -f "source[path]=/"`, wait for deploy, and verify the live URL loads.
6. Report back: local path, repo URL, Pages URL, and how each Miro diagram maps to the code.

## Out of scope (prototype)

- No backend/database — ERD is modeled client-side only.
- No real AI rationale API — templated text, labeled as prototype output.
- No real city statistics — demo data only.
