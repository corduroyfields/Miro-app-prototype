# Miro App Prototype — Project Summary

*June 10, 2026 — built with Claude Code from the "Web App MVP" Miro board*

## What was built

**Livable** — a clickable web prototype of a personalized "best places to live in the USA" recommender, generated directly from the three diagrams on the [Web App MVP Miro board](https://miro.com/app/board/uXjVHLZLYTA=/) via the Miro MCP server. Vanilla HTML/CSS/JS with ES modules — no build step, no dependencies, no backend.

## Links

| What | Where |
|---|---|
| Live app (GitHub Pages) | https://corduroyfields.github.io/Miro-app-prototype/ |
| GitHub repo (public) | https://github.com/corduroyfields/Miro-app-prototype |
| Local folder | `/Users/jwhite/Projects/Miro-app-prototype` |
| Design source of truth | Miro board "Web App MVP" |

## How the Miro board maps to the code

**1. UX flow diagram → `app.js`**
The board's journey is implemented step-for-step: Start → Onboarding → Quiz → Priority Ranking → Results → End, including:
- All **four feedback pulse-checks** (star rating + optional comment, skippable) — after onboarding, quiz, ranking, and results
- **Help** exactly where the board places it: `?` toggles on every quiz question and on the ranking screen
- The **refine loop**: results feedback offers "Refine my answers," which returns to the quiz with all previous answers preserved and re-runs the engine

**2. Database ERD → `state.js`**
All six entities from the board (USER, USERPROFILE, QUIZRESPONSE, PRIORITYRANKING, RECOMMENDATION, FEEDBACK) are mirrored as a client-side store persisted to `localStorage`, so a page refresh resumes the session where you left off.

**3. Three-layer engine flowchart → `scoring.js`**
- **Layer 1 — hard filters**: onboarding dealbreakers (winters, heat, coastal access, metro size) remove cities entirely, and the results page reports *why* each was removed
- **Layer 2 — soft matching**: quiz answers build a preference vector and a 0–100 fit score
- **Layer 3 — weighted scoring**: the stack-rank becomes inverse-rank weights (#1 counts ~8× more than #8)
- Final match score = 70% weighted factors + 30% quiz match; top 5 shown with score-bar breakdowns
- **Rationales** are template-generated (strengths, trade-off, quiz callout) and labeled in the UI as prototype output — no live AI calls

## Verification outcomes (tested in a real browser before publishing)

- Dealbreakers correctly removed **13 of 20** demo cities, each with a stated reason; 7 survived
- Shortlist rendered with ranks, zip codes, match scores, score bars, and rationale paragraphs
- The **refine loop re-ran the engine**: changing one quiz answer (outdoors → museums) flipped the top pick from Salt Lake City (65/100) to Pittsburgh
- Feedback recorded at every touchpoint with correct ratings and comments
- Session **survives a page reload** (resumed at the end screen); "Start over" fully resets state and storage
- Quiz validation blocks continuing with unanswered questions; help panels toggle correctly
- **Zero console errors or warnings**
- GitHub Pages deploy went live ~40 seconds after push

## Run it locally

```bash
cd /Users/jwhite/Projects/Miro-app-prototype
python3 -m http.server 5173
```

Then open <http://localhost:5173>. (Browsers block ES modules from `file://` URLs, so use the local server rather than double-clicking `index.html`.)

## Repo contents

| File | Purpose |
|---|---|
| `index.html` | App shell, header with journey progress |
| `styles.css` | Visual design |
| `app.js` | Step flow, screens, feedback widgets, help toggles |
| `scoring.js` | Three-layer engine + rationale templates |
| `state.js` | ERD-shaped store with localStorage persistence |
| `data.js` | Quiz questions, factors, dealbreakers, ~20 sample cities |
| `README.md` | Board-to-code mapping and run instructions |

## Known limitations / next steps

- **Demo data only** — city attribute values in `data.js` are illustrative placeholders, not real statistics. Swapping in real data (or wiring it to the `livable-lab` Python pipeline) is the natural next step.
- **No backend** — the ERD is modeled entirely client-side; nothing leaves the browser.
- **No real AI** — rationales are templated; a production version would call a model with the score breakdown as context.
