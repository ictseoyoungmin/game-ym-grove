# Ym Grove

Ym Grove is a small web-first idle collection game. v0.1 is local-only: no login, no server, no ads, no payments, and progress is saved in `localStorage`.

## Stack

- Vite, React, TypeScript
- Zustand persist for local save state
- Vitest and Testing Library for unit/component tests
- Playwright for mobile E2E tests
- Capacitor Android packaging

## Setup

Docker is the recommended development environment, so the host machine does not need Node or pnpm:

```bash
docker compose -f docker-compose.yml build app
```

Local setup is also supported:

```bash
pnpm install --frozen-lockfile
```

## Development

Docker:

```bash
docker compose -f docker-compose.yml up app
```

Local:

```bash
pnpm dev
```

The app runs at `http://127.0.0.1:5173` by default.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm assets:check
pnpm balance:check
pnpm build
pnpm test:e2e
```

Agent-friendly harness:

```bash
docker compose -f docker-compose.yml run --rm check
docker compose -f docker-compose.yml run --rm e2e
```

Local equivalents:

```bash
pnpm agent:check
pnpm agent:full
```

## Android

Docker:

```bash
docker compose -f docker-compose.yml run --rm android-build
```

Local:

```bash
pnpm android:sync
pnpm android:build
```

The Capacitor app id is `com.ym.grove`, app name is `Ym Grove`, and web output is loaded from `dist`.

## Project Structure

- `src/app`: application shell and tabs
- `src/screens`: Grove, Lab, Collection, Workspace views
- `src/components`: reusable UI
- `src/game`: pure game logic
- `src/data`: variants, evolution rules, balance values
- `src/store`: Zustand game store
- `tests/e2e`: Playwright release-flow checks
- `docs`: release, privacy, and project notes

## Agent Workflow

1. Read `docs/project-structure.md` and the current task context.
2. Run `pnpm agent:check` before broad edits when the toolchain is available.
3. Keep game rules in `src/game` and screen code focused on UI.
4. Update migration tests when save shape changes.
5. Run `pnpm agent:full` before release handoff.
