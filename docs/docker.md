# Docker Development

Ym Grove is set up so the host machine does not need Node or pnpm installed.

```bash
docker compose up app
```

Open `http://localhost:5173`.

Run the agent verification gate in the same container environment:

```bash
docker compose run --rm check
```

Run Playwright E2E in the official browser image:

```bash
docker compose run --rm e2e
```

For one-off package commands:

```bash
docker compose run --rm app pnpm test
docker compose run --rm app pnpm build
```
