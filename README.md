# Kids Zone

A build-free Safari web app for older iPad minis. Kids can create profiles, take turns logging chores, and earn age-adjusted points. Includes a typing trainer and optional OpenRouter-powered AI helper.

## Run
- Open `index.html` directly in Safari. No build step required.
- For local verification (including Codex Cloud/browser automation):
  - `python -m http.server 8000`
  - or `pnpm run watch:serve`

## Notes
- All data is stored locally in `localStorage`.
- The OpenRouter API key is saved on-device only.
