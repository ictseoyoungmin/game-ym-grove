# Ym Grove v0.1 수정 지침서

본 문서는 `ictseoyoungmin/game-ym-grove` 저장소의 최신 수정본을 기준으로, 현재 코드 검토에서 확인된 기능 결함과 UI 목업 일치성 향상 작업을 Agent가 바로 수행할 수 있도록 정리한 작업 지침서이다.

대상 저장소: `https://github.com/ictseoyoungmin/game-ym-grove`  
권장 작업 브랜치: `fix/v0.1-rc-polish`  
목표 상태: `pnpm agent:check` 및 `pnpm agent:full` 통과, 모바일 목업 기준 UI 일관성 향상

---

## 0. 현재 구현 상태 요약

현재 저장소는 단순 정적 목업이 아니라 다음 요소를 이미 갖춘 React/TypeScript 기반 v0.1 구현체이다.

- Vite + React + TypeScript 앱 구조
- `Home / Lab / Collection / Workspace` 4개 주요 화면
- Zustand persist 기반 localStorage 저장
- Spark tap, passive tick, offline gain
- stat growth, evolution rule, unlock flow
- Collection locked card detail / hint reveal
- Workspace production summary
- Settings / Reset panel
- Vitest unit test 일부
- Playwright E2E core-loop test
- asset/balance harness
- Capacitor Android 구성 일부
- Docker compose 기반 check/e2e/android-build 서비스

다만 현재 코드에는 release candidate 이전에 반드시 수정해야 할 blocker가 남아 있다.

---

## 1. 반드시 먼저 수정할 Blocker

### B-001. 시작 생산량 중복 계산 수정

#### 문제

`src/game/resources.ts`의 `getProductionPerSecond()`는 초기 production을 다음처럼 시작한다.

```ts
{ spark: balance.baseSparkPerSecond, insight: 0, trust: 0 }
```

그런데 `src/data/variants.json`에서 `core` variant도 다음 effect를 갖고 있다.

```json
"effect": { "spark": 0.1 }
```

Core Ym은 초기부터 unlocked 상태이므로 실제 시작 Spark/sec는 `0.1 + 0.1 = 0.2`가 된다. 하지만 테스트와 기획 의도는 시작 생산량 `0.1 Spark/sec`이다.

#### 수정 방향

`Core Ym effect`를 기본 생산량의 source of truth로 둔다. 즉, `balance.baseSparkPerSecond`는 직접 생산량 계산에 더하지 않는다.

#### 수정 파일

- `src/game/resources.ts`
- `src/screens/Workspace.tsx`
- 필요 시 `src/data/balance.ts`
- 필요 시 `src/game/resources.test.ts`

#### 구현 지침

`src/game/resources.ts`에서 reduce 초기값을 다음처럼 바꾼다.

```ts
export function getProductionPerSecond(state: GameState): Record<ResourceKey, number> {
  const production = variants.reduce(
    (totals, variant) => {
      if (!state.unlocked[variant.id]) return totals;

      for (const [resource, value] of Object.entries(variant.effect)) {
        totals[resource as ResourceKey] += value ?? 0;
      }

      return totals;
    },
    { spark: 0, insight: 0, trust: 0 },
  );

  if (state.unlocked.sustainability) {
    production.spark *= 1.1;
  }

  if (state.unlocked.premium_pro) {
    production.spark *= 1.08;
    production.insight *= 1.08;
    production.trust *= 1.08;
  }

  if (state.unlocked.api_integrations) {
    production.spark += variants.filter((variant) => state.unlocked[variant.id]).length * 0.03;
  }

  return production;
}
```

`src/screens/Workspace.tsx`에서도 Base/Core breakdown이 중복되지 않도록 수정한다.

현재 문제가 되는 형태:

```ts
const coreSpark = state.unlocked.core ? (variantById.core.effect.spark ?? 0) : 0;
...
<strong>{formatRate(balance.baseSparkPerSecond + coreSpark)} Spark/sec</strong>
```

권장 수정:

```ts
const coreSpark = state.unlocked.core ? (variantById.core.effect.spark ?? 0) : 0;
...
<strong>{formatRate(coreSpark)} Spark/sec</strong>
```

또는 label을 명확히 바꾼다.

```tsx
<span>Core</span>
<strong>{formatRate(coreSpark)} Spark/sec</strong>
```

`balance.baseSparkPerSecond`가 더 이상 사용되지 않으면 다음 중 하나를 선택한다.

1. `balance.baseSparkPerSecond`를 제거한다.
2. 향후 migration 대비로 유지하되 주석으로 “v0.1에서는 Core variant effect를 사용한다”고 명시한다.

권장안은 2번이다. 삭제하면 다른 문서나 밸런스 설명과 어긋날 수 있다.

#### Acceptance Criteria

- 새 게임 시작 시 Home의 Spark/sec가 `+0.10`으로 표시된다.
- `applyOfflineGain(createInitialState(0), 10_000)` 결과 Spark 증가량이 `1.0`이다.
- `applyPassiveTick()`도 10초 기준 Spark 증가량이 `1.0`이다.
- `pnpm test` 통과.
- `pnpm agent:check` 통과.

---

### B-002. `lastUnlockedYm` clear timer를 전역 레벨로 이동

#### 문제

현재 evolution success event인 `lastUnlockedYm`은 Home의 celebration 조건에도 사용된다. 그런데 이 이벤트를 clear하는 timer가 `Lab.tsx` 안에 있다. 사용자가 진화 직후 Lab을 벗어나면 `Lab`이 unmount되면서 timer cleanup이 실행되고, `lastUnlockedYm`이 계속 남을 수 있다.

#### 수정 방향

`lastUnlockedYm`은 화면 단위 상태가 아니라 app-level transient event이다. `Lab.tsx`에서 timer를 제거하고 `App.tsx`에서 clear한다.

#### 수정 파일

- `src/app/App.tsx`
- `src/screens/Lab.tsx`

#### 구현 지침

`App.tsx`에 `useEffect`와 store selector를 추가한다.

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
```

`App()` 내부에 추가한다.

```tsx
const lastUnlockedYm = useGameStore((state) => state.lastUnlockedYm);
const clearEvolutionEvent = useGameStore((state) => state.clearEvolutionEvent);

useEffect(() => {
  if (!lastUnlockedYm) return undefined;

  const timer = window.setTimeout(() => clearEvolutionEvent(), 3200);
  return () => window.clearTimeout(timer);
}, [clearEvolutionEvent, lastUnlockedYm]);
```

`Lab.tsx`에서는 다음 import와 effect를 제거한다.

```tsx
import { useEffect } from 'react';
```

그리고 다음 block 제거:

```tsx
useEffect(() => {
  if (!state.lastUnlockedYm) return undefined;

  const timer = window.setTimeout(() => clearEvolutionEvent(), 3200);
  return () => window.clearTimeout(timer);
}, [clearEvolutionEvent, state.lastUnlockedYm]);
```

`clearEvolutionEvent`는 Lab의 Close 버튼에서 계속 사용해도 된다.

#### Acceptance Criteria

- 진화 직후 Lab에 머물면 success banner가 3.2초 뒤 사라진다.
- 진화 직후 Home으로 이동해도 celebration이 3.2초 뒤 종료된다.
- `lastUnlockedYm`이 localStorage에 persist되지 않는다.
- `pnpm test` 통과.
- `pnpm agent:check` 통과.

---

### B-003. Playwright Docker image와 package version 정합성 맞추기

#### 문제

`package.json`의 `@playwright/test` 버전과 `docker-compose.yml`의 Playwright image 버전이 다르다. 브라우저 binary revision mismatch로 Docker E2E가 실패할 수 있다.

#### 수정 방향

둘 중 하나로 통일한다.

권장안: package version을 기준으로 Docker image를 낮춘다.

#### 수정 파일

- `docker-compose.yml`
- 또는 `package.json`, `pnpm-lock.yaml`

#### 구현 지침

현재 `package.json`이 `@playwright/test` `^1.53.0` 기준이면 compose image를 다음처럼 맞춘다.

```yaml
e2e:
  image: mcr.microsoft.com/playwright:v1.53.0-noble
```

반대로 Playwright를 최신으로 올릴 경우:

```bash
pnpm add -D @playwright/test@1.60.0
pnpm exec playwright install
```

단, 버전 upgrade는 lockfile diff와 테스트 영향이 크므로 v0.1 RC에서는 Docker image를 맞추는 쪽을 우선한다.

#### Acceptance Criteria

- `docker compose -f docker-compose.yml run --rm e2e`에서 browser revision mismatch가 발생하지 않는다.
- `pnpm test:e2e` 통과.

---

### B-004. Android Docker build가 Capacitor sync를 포함하도록 수정

#### 문제

`package.json`의 local Android build는 `pnpm android:build`를 통해 web build와 `cap sync android` 후 Gradle build를 수행한다. 하지만 `docker-compose.yml`의 `android-build` service는 `/workspace/android`에서 바로 `./gradlew assembleDebug`만 실행한다. 이러면 최신 `dist`와 Capacitor sync가 반영되지 않을 수 있다.

#### 수정 방향

Docker Android build도 루트에서 `pnpm android:build`를 실행하도록 통일한다.

#### 수정 파일

- `docker-compose.yml`

#### 구현 지침

권장 수정:

```yaml
android-build:
  image: ghcr.io/cirruslabs/android-sdk:35
  working_dir: /workspace
  command: >
    sh -lc "corepack enable &&
    corepack prepare pnpm@9.15.0 --activate &&
    pnpm install --frozen-lockfile &&
    pnpm android:build"
  volumes:
    - .:/workspace
    - node-modules:/workspace/node_modules
    - gradle-cache:/root/.gradle
```

만약 Docker image에 Node/Corepack이 없다면 별도 Android+Node base image를 쓰거나, Android build는 local/CI release gate로 분리한다.

#### Acceptance Criteria

- `docker compose -f docker-compose.yml run --rm android-build`가 web build, cap sync, Gradle build 순서로 실행된다.
- 실패 시 README에 Docker Android build 제한사항을 명시한다.

---

## 2. 기능 품질 보강 작업

### F-001. Store action test 보강

현재 store test가 추가되어 있으나 다음 case를 더 넣으면 좋다.

#### 추가 테스트 대상

- `revealHint()`가 이미 reveal된 hint에 대해 Insight를 중복 차감하지 않는지
- `spendInsightForTrust()`가 Insight 부족 시 state를 변경하지 않는지
- `clearEvolutionEvent()`가 `lastUnlockedYm`만 null로 만들고 다른 state를 유지하는지
- `tickProduction()`이 `lastOfflineGain`을 보존하는지
- `resetGame()` 후 `revealedHints`와 `lastUnlockedYm`이 초기화되는지

#### 수정 파일

- `src/store/gameStore.test.ts`

#### Acceptance Criteria

- 위 case가 모두 테스트된다.
- `pnpm test` 통과.

---

### F-002. Save migration test 보강

`GameState`에 `revealedHints`와 `lastUnlockedYm`이 추가되었으므로 migration test도 이를 명확히 검증해야 한다.

#### 추가 테스트 대상

- 구버전 save에 `revealedHints`가 없어도 `{}` 또는 false-map으로 복구되는지
- 잘못된 `revealedHints` 값은 true로 인정되지 않는지
- `lastUnlockedYm`은 persisted save에서 복원하지 않고 항상 `null`로 시작하는지
- locked variant가 selectedYm으로 저장되어 있으면 `core`로 복구되는지

#### 수정 파일

- `src/game/save.test.ts`

#### Acceptance Criteria

- corrupted save / old save / partial save 모두 복구된다.
- `pnpm test` 통과.

---

### F-003. Evolution rule visibility UX 점검

현재 `getVisibleEvolutionRules()`는 ready rule이 있으면 ready rule 3개를 보여주고, 없으면 missing stat 총량이 작은 rule 3개를 보여준다. 이 구조는 v0.1에 적합하다.

다만 ready 상태에서 unrevealed rule에도 `rule.hint`가 그대로 보인다. “Reveal exact stats”의 의미가 약해질 수 있다.

#### 권장 UX 정책

- unrevealed 상태: 방향성/태그만 노출
- revealed 상태: 정확한 stat requirement와 cost 노출
- ready 상태: cost는 노출해도 좋지만 required stats는 reveal 이후 노출

#### 수정 파일

- `src/screens/Lab.tsx`
- `src/components/CollectionDetailSheet.tsx`

#### Acceptance Criteria

- 미해금/미공개 variant는 exact requirement를 바로 보여주지 않는다.
- reveal 이후 required stat, missing stat, cost가 표시된다.
- ready 상태에서도 reveal이 gameplay 의미를 가진다.

---

## 3. 목업 UI 일치성 향상 작업

현재 UI는 기능적으로는 좋아졌지만, 처음 스마트폰 목업의 “브랜드 보드 같은 정돈된 인상”과 비교하면 spacing, radius, visual hierarchy, card polish가 더 다듬어져야 한다. 아래 작업은 기능 변경보다 시각 일관성을 높이는 작업이다.

---

### UI-001. 디자인 토큰을 CSS 변수로 고정

#### 문제

현재 CSS에 색상, radius, shadow 값이 직접 반복된다. 목업과 장기 유지보수 측면에서 token화가 필요하다.

#### 수정 파일

- `src/styles.css`

#### 구현 지침

`:root`에 다음 변수를 추가한다.

```css
:root {
  --color-navy: #042a6b;
  --color-text: #152447;
  --color-muted: #6b7280;
  --color-border: #e6e8ef;
  --color-surface: #ffffff;
  --color-bg: #f7f8fb;
  --color-soft-cyan: #effcff;
  --color-green: #69e7b6;
  --color-premium: #f5d27a;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --shadow-card: 0 14px 36px rgb(21 36 71 / 10%);
  --shadow-hero: 0 22px 58px rgb(4 42 107 / 18%);
  --mobile-max-width: 430px;
}
```

그 후 주요 color/radius/shadow를 변수로 치환한다.

#### Acceptance Criteria

- CSS의 반복 hex 값이 크게 줄어든다.
- 브랜드 컬러 수정 시 `:root`만 수정하면 대부분 반영된다.
- 기존 UI와 기능 회귀가 없다.

---

### UI-002. 스마트폰 목업 기준 app shell 폭 조정

#### 문제

현재 `.app-shell`은 `width: min(100%, 720px)`이다. 모바일 게임 목업 기준으로는 너무 넓다. Desktop web preview에서는 phone-like canvas 느낌이 약해진다.

#### 수정 방향

Web demo는 중앙 phone canvas처럼 보이게 하고, 실제 모바일에서는 100%를 사용한다.

#### 수정 파일

- `src/styles.css`

#### 구현 예시

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgb(4 42 107 / 10%), transparent 36%),
    #eef2f7;
}

.app-shell {
  width: min(100%, var(--mobile-max-width));
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--color-surface);
  box-shadow: 0 0 0 1px rgb(21 36 71 / 6%), 0 24px 80px rgb(21 36 71 / 16%);
}

@media (max-width: 480px) {
  .app-shell {
    width: 100%;
    box-shadow: none;
  }
}
```

#### Acceptance Criteria

- Desktop에서 목업이 phone-like card로 보인다.
- 390×844 viewport에서 horizontal scroll이 없다.
- `mobile-layout` E2E가 통과한다.

---

### UI-003. Topbar를 mockup hero header에 가깝게 개선

#### 문제

현재 topbar는 기능적으로 충분하지만, 목업의 브랜드/프리미엄 느낌에 비해 평평하다.

#### 수정 파일

- `src/styles.css`
- 필요 시 `src/app/App.tsx`

#### 구현 지침

- Topbar radius-bottom 또는 soft gradient 추가
- Settings button을 pill 형태로 변경
- Header text hierarchy 강화

예시:

```css
.topbar {
  padding: calc(18px + env(safe-area-inset-top)) 18px 16px;
  background:
    radial-gradient(circle at 80% 10%, rgb(105 231 182 / 20%), transparent 34%),
    var(--color-navy);
  color: #fff;
  border-bottom-right-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
}

.topbar button {
  min-height: 38px;
  border-radius: 999px;
  border-color: rgb(255 255 255 / 26%);
  background: rgb(255 255 255 / 12%);
  backdrop-filter: blur(8px);
}
```

#### Acceptance Criteria

- Header가 브랜드 앱 첫인상처럼 보인다.
- Settings button이 과하게 튀지 않는다.
- Safe area inset이 적용된다.

---

### UI-004. Home hero card polish

#### 문제

Home은 게임의 핵심 화면이다. 목업 기준으로 캐릭터 카드의 중심성이 더 강해야 한다.

#### 수정 파일

- `src/styles.css`
- 필요 시 `src/screens/Home.tsx`

#### 구현 지침

- `.ym-character` radius 확대
- 캐릭터 주변 glow 추가
- `.tap-stage`에 pseudo-element로 subtle aura 추가
- `Tap Ym` primary CTA를 더 크게

예시:

```css
.ym-character {
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 50% 30%, rgb(105 231 182 / 16%), transparent 32%),
    var(--color-navy);
  box-shadow: var(--shadow-hero);
}

.action-row .primary-action {
  min-height: 52px;
  border-radius: var(--radius-md);
  font-size: 1rem;
}
```

#### Acceptance Criteria

- Home에서 Core Ym이 명확한 focal point가 된다.
- Tap animation이 캐릭터 주변에서 자연스럽게 보인다.
- CTA row가 작은 폰에서도 눌리기 쉽다.

---

### UI-005. Card radius와 spacing 통일

#### 문제

현재 대부분의 card radius가 `8px`이다. 초기 목업의 부드러운 mobile game card 느낌에는 조금 딱딱하다.

#### 수정 파일

- `src/styles.css`

#### 구현 지침

다음 class의 radius를 `var(--radius-md)` 이상으로 통일한다.

- `.resource-item`
- `.tool-panel`
- `.collection-card`
- `.workspace-card`
- `.evolution-card`
- `.detail-sheet`
- `.settings-panel`
- `.offline-banner`

권장:

```css
.resource-item,
.tool-panel,
.collection-card,
.workspace-card,
.evolution-card,
.detail-sheet,
.settings-panel,
.offline-banner {
  border-radius: var(--radius-md);
}
```

#### Acceptance Criteria

- 카드 UI의 둥근 정도가 전체적으로 통일된다.
- 목업의 “soft card” 인상과 가까워진다.

---

### UI-006. Collection detail을 모바일 bottom sheet 느낌으로 개선

#### 문제

현재 `CollectionDetailSheet`는 grid 내부의 inline panel로 렌더링된다. 기능적으로는 좋지만 모바일 게임 UI에서는 카드 클릭 후 bottom sheet가 뜨는 느낌이 더 자연스럽다.

#### 수정 방향

v0.1에서는 복잡한 portal 없이 CSS로 sheet를 더 뚜렷하게 만든다. 가능하면 overlay/backdrop까지 구현한다.

#### 수정 파일

- `src/screens/Collection.tsx`
- `src/components/CollectionDetailSheet.tsx`
- `src/styles.css`

#### 간단 구현안

`Collection.tsx`에서 detail sheet를 grid 위에 두는 구조는 유지하되, CSS에서 sticky/card modal 느낌을 강화한다.

```css
.detail-sheet {
  position: sticky;
  top: 12px;
  z-index: 4;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgb(21 36 71 / 18%);
}
```

#### 고급 구현안

Backdrop wrapper 추가:

```tsx
{inspectedVariant ? (
  <div className="sheet-backdrop" onClick={() => setInspectedId(null)}>
    <div onClick={(event) => event.stopPropagation()}>
      <CollectionDetailSheet ... />
    </div>
  </div>
) : null}
```

CSS:

```css
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  align-items: end;
  background: rgb(21 36 71 / 28%);
}

.sheet-backdrop > div {
  width: min(100%, var(--mobile-max-width));
  margin: 0 auto;
  padding: 12px;
}

.sheet-backdrop .detail-sheet {
  max-height: min(72dvh, 620px);
  overflow-y: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
```

주의: E2E에서 `getByRole('dialog', { name: 'Collection detail' })`가 그대로 동작해야 한다.

#### Acceptance Criteria

- locked card 클릭 시 상세 정보가 목업 앱의 bottom sheet처럼 보인다.
- Escape key close 유지.
- reveal hint E2E가 통과한다.
- 모바일에서 sheet가 화면 밖으로 넘치지 않는다.

---

### UI-007. Evolution card action layout 정리

#### 문제

Evolution card는 4-column grid이고, Reveal과 Evolve 버튼이 동시에 나오면 좁은 화면에서 다소 복잡해질 수 있다.

#### 수정 파일

- `src/styles.css`
- 필요 시 `src/screens/Lab.tsx`

#### 구현 지침

Desktop/넓은 화면에서는 현재 구조를 유지하되, 모바일에서는 버튼을 하단 2-column 또는 stack으로 정리한다.

```css
@media (max-width: 480px) {
  .evolution-card {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .evolution-card button {
    grid-column: 1 / -1;
  }

  .evolution-card button + button {
    margin-top: -4px;
  }
}
```

또는 action wrapper를 추가해 더 안정적으로 구성한다.

#### Acceptance Criteria

- 390px viewport에서 evolution card가 가로 overflow를 만들지 않는다.
- Reveal/Evolve 버튼이 명확하게 구분된다.
- `mobile-layout` E2E 통과.

---

### UI-008. ResourceBar 숫자 안정성 개선

#### 문제

Spark/Insight/Trust 값이 커질 경우 resource card가 흔들릴 수 있다. 목업에서는 숫자 영역이 안정적으로 보여야 한다.

#### 수정 파일

- `src/styles.css`
- 필요 시 `src/game/format.ts`

#### 구현 지침

```css
.resource-item {
  min-width: 0;
}

.resource-item dd {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
```

`formatNumber()`는 현재 K/M 축약이 있으므로 충분하다. 다만 `NaN`, negative 방어를 넣으면 더 안전하다.

```ts
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (safe < 1000) return Math.floor(safe).toString();
  if (safe < 1_000_000) return `${(safe / 1000).toFixed(1)}K`;
  return `${(safe / 1_000_000).toFixed(1)}M`;
}
```

#### Acceptance Criteria

- 큰 숫자에서도 UI가 깨지지 않는다.
- 음수/NaN이 표시되지 않는다.

---

### UI-009. Settings panel을 앱 모달처럼 정리

#### 문제

현재 settings panel은 absolute로 하단에 뜬다. 기능은 충분하지만 backdrop이 없어 다른 화면 요소와 섞여 보일 수 있다.

#### 수정 파일

- `src/app/App.tsx`
- `src/components/SettingsPanel.tsx`
- `src/styles.css`

#### 구현 지침

`App.tsx`에서 wrapper 추가:

```tsx
{settingsOpen ? (
  <div className="sheet-backdrop" onClick={() => setSettingsOpen(false)}>
    <div onClick={(event) => event.stopPropagation()}>
      <SettingsPanel onClose={() => setSettingsOpen(false)} />
    </div>
  </div>
) : null}
```

`SettingsPanel` 자체는 role dialog 유지.

#### Acceptance Criteria

- Settings가 명확한 modal/sheet로 보인다.
- backdrop 클릭으로 닫힌다.
- Reset E2E가 통과한다.

---

### UI-010. Tabbar active state polish

#### 문제

하단 tabbar는 기능적으로 충분하지만, game app 느낌을 위해 active state를 더 명확히 만들 수 있다.

#### 수정 파일

- `src/styles.css`

#### 구현 지침

```css
.tabbar {
  border-top: 1px solid var(--color-border);
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(10px);
}

.tab-button {
  border-radius: 999px;
  border-color: transparent;
  background: transparent;
}

.tab-button[aria-current='page'] {
  border-color: rgb(4 42 107 / 12%);
  background: #edf4ff;
  color: var(--color-navy);
}
```

#### Acceptance Criteria

- 현재 탭이 한눈에 보인다.
- iOS/Android bottom nav 느낌이 난다.
- 작은 화면에서 버튼 label이 잘리지 않는다.

---

## 4. Visual QA 지침

Agent는 기능 테스트만 보지 말고 아래 viewport에서 직접 확인해야 한다.

### 필수 viewport

- 390 × 844: 기본 스마트폰 목업 기준
- 360 × 740: 작은 Android 기준
- 430 × 932: 큰 iPhone 기준
- 768 × 1024: tablet/web fallback 기준

### 필수 화면

- Home / Grove
- Lab: 초기 상태
- Lab: evolution ready 상태
- Collection: locked card detail open
- Collection: unlocked detail open
- Workspace: Core only
- Workspace: 3개 이상 variant unlocked
- Settings open
- Reset confirm state

### 체크리스트

- 가로 스크롤 없음
- 하단 tabbar가 safe-area와 겹치지 않음
- Tap/Grow/Evolve/Reveal/Reset 버튼 모두 44px 이상 터치 영역 유지
- Card radius와 shadow가 전체적으로 통일됨
- Navy/white/soft cyan/green 색상이 목업과 일관됨
- Locked/Unlocked/Active 상태가 한눈에 구분됨
- Evolution success banner가 너무 오래 남지 않음
- Offline gain banner가 passive tick마다 갱신되어 깜빡이지 않음
- Resource 숫자가 커져도 layout shift가 크지 않음

---

## 5. E2E 보강 지침

현재 `tests/e2e/core-loop.spec.ts`가 기능 흐름을 잘 포함하고 있다. UI polish 후 아래 assertion을 추가하면 좋다.

### E2E-001. Spark/sec 기본값 검증

```ts
await expect(page.getByText('+0.10')).toBeVisible();
```

이미 비슷한 검증이 있으므로 B-001 수정 후 반드시 유지한다.

### E2E-002. Evolution event auto clear 검증

```ts
await expect(page.getByTestId('evolution-success')).toBeVisible();
await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Grove' }).click();
await expect(page.getByTestId('selected-ym')).toContainText('AI / Agents Ym');
await expect.poll(async () => {
  return page.locator('.is-celebrating').count();
}).toBe(0);
```

단, animation class 직접 검증이 brittle하면 store 값 검증으로 대체한다.

### E2E-003. Settings backdrop close 검증

Settings를 backdrop modal로 바꾼 경우:

```ts
await page.getByRole('button', { name: 'Settings' }).click();
await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
await page.keyboard.press('Escape'); // Escape close를 구현한 경우
await expect(page.getByRole('dialog', { name: 'Settings' })).toBeHidden();
```

Escape close를 구현하지 않을 경우 이 테스트는 추가하지 않는다.

---

## 6. 권장 작업 순서

Agent는 아래 순서대로 작업한다.

1. `B-001` 생산량 중복 수정
2. `Workspace` breakdown 수정
3. `pnpm test`
4. `B-002` evolution event clear timer 전역화
5. `pnpm test && pnpm agent:check`
6. `B-003` Playwright Docker version 정합성 수정
7. `docker compose -f docker-compose.yml run --rm e2e`
8. `B-004` Android Docker build 흐름 수정
9. UI token 추가
10. App shell / Topbar / Home hero polish
11. Collection detail bottom sheet 또는 sticky modal 개선
12. Settings panel backdrop 개선
13. Tabbar active state polish
14. `pnpm agent:full`
15. 390×844 viewport에서 수동 visual QA

---

## 7. 최종 완료 기준

### Functional DoD

- `pnpm lint` 통과
- `pnpm typecheck` 통과
- `pnpm test` 통과
- `pnpm assets:check` 통과
- `pnpm balance:check` 통과
- `pnpm build` 통과
- `pnpm test:e2e` 통과
- `pnpm agent:check` 통과
- `pnpm agent:full` 통과

### UI DoD

- 390×844 viewport에서 Home/Lab/Collection/Workspace/Settings가 목업 앱처럼 정돈되어 보임
- `app-shell`이 desktop에서 phone canvas처럼 보임
- bottom tabbar가 safe-area와 충돌하지 않음
- card radius, spacing, color token이 통일됨
- Collection locked detail과 Settings가 modal/sheet처럼 명확히 분리됨
- Home의 캐릭터 stage가 focal point로 보임
- 진화 성공, tap pop, idle floating animation이 과하지 않고 자연스러움

### Release Candidate DoD

- 새 게임에서 Core Ym과 Spark/sec `+0.10` 표시
- Tap으로 Spark 증가
- Growth로 stat 증가
- AI / Agents Ym 첫 진화 가능
- Collection에서 locked/unlocked 상태 및 hint 확인 가능
- Workspace에서 active production breakdown 확인 가능
- Reset 후 core-only save로 복구
- 새로고침 후 save 유지
- Android sync/build 경로가 문서와 실제 command에서 일치

---

## 8. Agent 보고 형식

Agent는 작업 완료 후 아래 형식으로 보고한다.

```md
## Summary
- <무엇을 수정했는지>

## Files changed
- `src/...`: <수정 이유>

## Commands run
- `pnpm test`: PASS/FAIL
- `pnpm agent:check`: PASS/FAIL
- `pnpm test:e2e`: PASS/FAIL or N/A
- `docker compose -f docker-compose.yml run --rm e2e`: PASS/FAIL or N/A

## UI QA
- Viewport 390x844: PASS/FAIL
- Home: PASS/FAIL
- Lab: PASS/FAIL
- Collection detail: PASS/FAIL
- Workspace: PASS/FAIL
- Settings: PASS/FAIL

## Known limitations
- <남은 이슈>
```
