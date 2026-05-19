# Ym Grove Play Store Assets

This folder contains draft Google Play listing assets for Ym Grove.

## Files

- `icon-512.png`: Play Console app icon, generated from `public/assets/ym/core-brand.svg`.
- `screenshots/phone/01-grove.png`: Main Grove/tap loop.
- `screenshots/phone/02-lab.png`: Growth Lab and evolution preview.
- `screenshots/phone/03-collection.png`: Ym Collection/Dex.
- `screenshots/phone/04-workspace.png`: Passive production workspace.
- `store-listing-ko.md`: Korean store listing draft and release checklist.

## Regenerate

Run this from Docker. It builds the web app, starts a local Vite preview inside the same
container, then refreshes icons and screenshots:

```bash
docker compose -f docker-compose.yml run --rm e2e sh -lc "corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile && pnpm build && pnpm exec vite preview --host 127.0.0.1 >/tmp/ym-preview.log 2>&1 & for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS http://127.0.0.1:4173/ >/dev/null && break; sleep 1; done; node scripts/generate-play-store-assets.mjs"
```

The script also refreshes Android launcher PNGs under `android/app/src/main/res/mipmap-*`.
