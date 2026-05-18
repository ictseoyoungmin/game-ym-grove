# Ym Grove Project Structure

This repository follows the v0.1 development plan and game design document.

```text
public/assets/ym/      SVG source assets for Core Ym and variants
src/app/               App shell and tab navigation
src/components/        Reusable UI components
src/data/              Variant metadata, evolution rules, balance constants
src/game/              Pure game logic
src/screens/           Home, Lab, Collection, Workspace screens
src/store/             Zustand store and persistence
src/test/              Test setup and helpers
src/types/             Shared TypeScript types
scripts/               Agent harness checks
tests/e2e/             Playwright scenarios
docs/                  Project notes derived from design/dev docs
```

M0 is complete when `pnpm agent:check` passes in Docker.
