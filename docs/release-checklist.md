# Ym Grove v0.1 Release Checklist

- `pnpm agent:full` passes.
- `pnpm test:e2e` passes on the Pixel 5/mobile viewport.
- `pnpm android:sync` succeeds.
- Android debug or release build succeeds in Android Studio or `docker compose run --rm android-build`.
- Core Ym and 13 variants appear in Collection.
- New game starts with Core Ym only and Spark at 0.
- Tap Ym, idle production, growth, first evolution, Collection selection, and Workspace production are verified.
- Reload persistence keeps Spark, stats, unlocks, selected Ym, and revealed hints.
- Settings Reset returns the save to Core-only state and survives reload.
- Corrupted localStorage recovers to a playable default save.
- At least three variants can be unlocked by ordinary play routes.
- App icon and splash screen use the Ym Grove navy/white/green identity or are tracked as release TODOs.
- Privacy policy states that v0.1 uses local storage only.
- Store screenshots show Home, Lab, Collection, and Workspace.
