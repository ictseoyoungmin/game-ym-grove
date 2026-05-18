# Ym Grove v0.1 Release Checklist

- `pnpm agent:check` passes.
- `pnpm test:e2e` passes on the mobile viewport.
- `pnpm android:sync` succeeds.
- Android debug or release build succeeds in Android Studio or `docker compose run --rm android-build`.
- Core Ym and 13 variants appear in Collection.
- New game, save reload, idle reward, growth, evolution, and Collection update are verified.
- App icon and splash screen use the Ym Grove navy/white/green identity.
- Privacy policy states that v0.1 uses local storage only.
- Store screenshots show Home, Lab, Collection, and Workspace.
