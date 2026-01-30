# Kids Zone – Product Requirements Document

## Overview
Kids Zone is a lightweight, build-free Safari web app for older iPad minis. It lets kids create profiles, take turns reporting real-world chores, and earn points scaled by age. A small typing trainer mini-game adds practice and extra points. Parents can enable a microphone + AI helper (OpenRouter) for fun prompts and encouragement.

## Goals
- **Run without build tools**: Open `index.html` in Safari and play.
- **Age-adjusted scoring**: Younger kids get more points for the same effort to keep competition fair.
- **Turn-based flow**: Kids take turns reporting chores and playing mini games.
- **Offline-first**: Uses `localStorage` for persistence.
- **Optional AI helper**: OpenRouter integration with locally stored API key.

## Non-Goals
- No server-side storage or authentication.
- No accounts or multi-device sync.

## Primary Users
- Children aged 3, 7, and 14 using a shared iPad mini with keyboard.

## Key Features
1. **Profile Creation**
   - Name, age, avatar color.
   - Stored in `localStorage`.
2. **Turn-Based Chore Reporting**
   - Select current player, enter chore, choose complexity (1–5).
   - Score uses age multiplier to balance fairness.
3. **Scoreboard**
   - Total score, last action summary, and turn order.
4. **Typing Trainer Mini-Game**
   - Short prompts, timer, WPM estimate.
   - Extra points scaled by age.
5. **Microphone + AI Helper (Optional)**
   - Allow API key input for OpenRouter.
   - Provide simple prompts for encouragement.

## UX Principles
- Large buttons, minimal steps per action, clear labels.
- Encourage siblings with positive language.
- Keep visuals calm and readable for small screens.

## Technical Notes
- Vanilla HTML/CSS/JS.
- Use `localStorage` for all data.
- Use Fetch for OpenRouter requests when enabled.

## Success Metrics
- Kids can create profiles and take turns in under 2 minutes.
- Scoreboard updates reliably after each action.
- Works in Safari without build steps.

## Roadmap
### Phase 1 – MVP
- Profile creation, turn system, chore reporting.
- Scoreboard and age scaling.
- Basic typing trainer.

### Phase 2 – Polish
- Better avatar customization.
- Improved prompts and animations.
- Parents’ settings screen.

### Phase 3 – AI Enhancements
- Voice prompts (if supported by Safari).
- AI-generated encouragement and new mini-game ideas.
