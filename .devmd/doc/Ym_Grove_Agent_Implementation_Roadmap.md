# Ym Grove v0.1 Agent Implementation Roadmap

작성일: 2026-05-19  
대상 저장소: `ictseoyoungmin/game-ym-grove`  
문서 목적: 현재 구현 상태를 기준으로 v0.1 릴리즈까지 남은 전체 작업을 Agent가 바로 수행할 수 있는 작업 카드 형태로 정리한다.

---

## 0. 기준 문서와 목표

### 기준 문서

- `ym_grove_v0_1_game_design_doc(1).docx`: 게임 기획 기준.
- `ym_grove_v0_1_development_plan(1).docx`: 개발 환경, Agent workflow, harness, test 기준.
- 현재 GitHub 저장소 `ictseoyoungmin/game-ym-grove`의 `main` 브랜치.

### v0.1의 고정 목표

v0.1은 서버, 로그인, 결제, 광고, 온라인 랭킹 없이 **로컬 저장 기반의 작고 완성된 Web-first 방치형 수집 게임**으로 완성한다.

릴리즈 가능한 상태의 최소 기준은 다음이다.

1. Core Ym + 13개 variant, 총 14종이 Collection에 표시된다.
2. Core Ym을 터치하면 Spark가 증가한다.
3. 시간 경과에 따라 자동 Spark가 증가한다.
4. 5개 성장 스탯이 Spark 비용을 소비해 증가한다.
5. 스탯 조건과 비용을 만족하면 variant가 해금된다.
6. 해금된 variant는 Collection에 등록되고 선택 가능하다.
7. 해금된 variant 효과는 Workspace와 생산량 계산에 반영된다.
8. 진행 상태는 새로고침/재실행 후 유지된다.
9. 모바일 viewport에서 UI가 깨지지 않고 조작 가능하다.
10. `pnpm agent:check`와 핵심 Playwright E2E가 통과한다.

---

## 1. 현재 저장소 구현 현황

### 1.1 프로젝트/환경

현재 저장소는 Vite + React + TypeScript 기반으로 구성되어 있고, `pnpm` 스크립트에 `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `assets:check`, `balance:check`, `agent:check`, `agent:full`, Capacitor Android 관련 명령이 이미 정의되어 있다.

확인된 핵심 스크립트:

```json
{
  "dev": "vite --host 0.0.0.0",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "assets:check": "node scripts/check-assets.mjs",
  "balance:check": "node scripts/check-balance.mjs",
  "agent:check": "pnpm lint && pnpm typecheck && pnpm test && pnpm assets:check && pnpm balance:check && pnpm build",
  "agent:full": "pnpm agent:check && pnpm test:e2e"
}
```

Capacitor 설정 파일도 존재하며 `appId='com.ym.grove'`, `appName='Ym Grove'`, `webDir='dist'`로 구성되어 있다.

판정: **M0 Repo bootstrap은 완료. Android RC는 설정만 존재하며 실제 빌드 검증은 미완료로 본다.**

---

### 1.2 App Shell / 화면 구성

`src/main.tsx`는 `src/app/App.tsx`를 렌더링한다. `App.tsx`는 다음 4개 탭을 제공한다.

- `Grove` → `Home`
- `Lab` → `Lab`
- `Collection` → `Collection`
- `Workspace` → `Workspace`

기획서의 4개 주요 화면은 모두 코드에 존재한다.

판정: **화면 골격 완료.**

남은 점:

- 화면 전환은 상태 기반 탭으로만 되어 있으며 route는 없다. v0.1에서는 허용.
- Settings/Reset/About 화면은 없다. `resetGame` action은 store에 있으나 사용자 UI는 없다.

---

### 1.3 데이터 모델

`src/types/game.ts`에 다음 타입이 정의되어 있다.

- `ResourceKey = 'spark' | 'insight' | 'trust'`
- `StatKey = 'intelligence' | 'curiosity' | 'stability' | 'growth' | 'connection'`
- `YmVariantId`: core 포함 14종
- `YmVariant`
- `EvolutionRule`
- `GameState`

`src/game/state.ts`에는 `resourceKeys`, `statKeys`, `variantIds`, `createInitialState(nowMs)`가 있다. 초기 상태는 다음과 같다.

- resources: spark/insight/trust = 0
- stats: 5개 모두 0
- unlocked: core만 true
- selectedYm: core
- lastOfflineGain: `{}`
- lastSavedAt: nowMs

판정: **기획서와 개발 계획서의 핵심 데이터 모델은 구현 완료.**

---

### 1.4 Variant 데이터

`src/data/variants.json`에는 Core 1종 + Variant 13종, 총 14종이 모두 존재한다.

목록:

1. Core Ym
2. AI / Agents Ym
3. ML / Deep Learning Ym
4. JEPA / Vision Ym
5. Security Ym
6. Data / Analytics Ym
7. Cloud / Infra Ym
8. Gaming / RL Ym
9. Research Ym
10. Education Ym
11. Premium / Pro Ym
12. Sustainability Ym
13. API / Integrations Ym
14. Tools / Utilities Ym

각 variant는 `id`, `name`, `icon`, `tags`, `effect`, `description`을 갖는다.

판정: **Variant manifest 완료.**

남은 점:

- 효과 수치가 임시 밸런스에 가깝다.
- 일부 효과 설명과 실제 효과가 1:1로 대응하지 않는다. 예: ML은 “성장 효율 증가” 컨셉이지만 현재 effect는 Spark/sec 증가이다.
- v0.1에서는 허용 가능하지만, 릴리즈 전에 “설명과 실제 효과 불일치”를 줄이는 것을 권장한다.

---

### 1.5 Evolution Rule 데이터

`src/data/evolutionRules.json`에는 core를 제외한 13개 variant에 대한 rule이 존재한다.

예시:

- AI / Agents: intelligence 4 + connection 4, spark 300
- ML / Deep Learning: intelligence 6, spark 300
- JEPA / Vision: curiosity 4 + intelligence 4, spark 300
- Security: stability 6, spark 300
- Premium / Pro: 5개 스탯 모두 3, spark 360
- API / Integrations: connection 7, spark 300

판정: **기획서의 진화 조건 체계는 구현 완료.**

남은 점:

- rule visible 정책은 “ready rule 우선, 아니면 missing stat이 적은 rule 3개”인데, Insight를 써서 힌트를 여는 구조는 아직 없다.
- `hintCostInsight`가 balance에 있으나 실제 “힌트 구매”가 아니라 `spendInsightForTrust` 비용으로 사용된다.

---

### 1.6 Resource / Idle / Offline Gain

`src/game/resources.ts`는 다음을 구현한다.

- `getProductionPerSecond(state)`
- `applyTapGain(state)`
- `applyOfflineGain(state, nowMs)`

현재 효과:

- Tap: Spark +1
- Gaming / RL 해금 시 tap Spark +1 추가
- Offline gain은 `lastSavedAt` 기준 elapsed time을 계산하고 8시간 cap을 적용한다.
- 생산량은 해금된 variant의 `effect` 합산 + sustainability/premium/api_integrations 보정으로 계산한다.

판정: **터치/방치/오프라인 보상 로직은 구현되어 있음.**

중요 보정 필요:

- 현재 `getProductionPerSecond`는 `{ spark: balance.baseSparkPerSecond, insight: 0, trust: 0 }`에서 시작하고, core가 해금되어 있으므로 Core effect `{ spark: 0.1 }`까지 더한다. 그 결과 초기 Spark/sec가 0.2가 된다.
- 기획서의 밸런스 초안은 “기본 초당 Spark 0.1”이다.
- 따라서 source of truth를 하나로 통일해야 한다.

권장 수정:

- `src/data/balance.ts`의 `baseSparkPerSecond`를 `0`으로 바꾸고, Core variant의 effect `{ spark: 0.1 }`를 기본 생산량의 source로 삼는다.
- 또는 Core effect를 `0`으로 바꾸고 baseSparkPerSecond를 유지한다.
- 이 문서에서는 data-driven 설계를 위해 **baseSparkPerSecond = 0, Core effect = 0.1 유지**를 권장한다.

---

### 1.7 Growth / Lab

`src/game/growth.ts`는 다음을 구현한다.

- `getGrowthCost(state, stat)`
- `growStat(state, stat)`

현재 비용:

- 기본 20 Spark
- 스탯 1 증가마다 +5 Spark
- Education 해금 시 10% 할인

`src/screens/Lab.tsx`는 `statKeys`를 순회하므로 5개 스탯 모두 UI에서 성장 가능하다. 이전 정적 목업에서 누락됐던 Growth feed 문제는 현재 React 구현에서는 해결되어 있다.

판정: **성장 시스템 구현 완료.**

남은 점:

- 버튼 텍스트가 스탯 이름 중심이라 “feed item” 판타지가 약하다.
- v0.1 기능에는 충분하지만 polish 단계에서 feed item 이름 또는 작은 설명을 추가하면 좋다.

---

### 1.8 Evolution Logic / Lab UI

`src/game/evolution.ts`는 다음을 구현한다.

- `canAffordRule`
- `meetsStatRequirements`
- `getEvolutionCandidates`
- `getStatReadyRules`
- `getVisibleEvolutionRules`
- `getMissingStats`
- `unlockEvolutionCandidate`
- `unlockFirstCandidate`

`src/screens/Lab.tsx`는 visible rule을 카드로 보여주고, 조건과 비용을 만족하면 `Evolve` 버튼을 활성화한다. 진화 성공 시 해당 variant를 unlock하고 `selectedYm`으로 설정한다.

판정: **진화 시스템 핵심 로직과 UI는 구현 완료.**

남은 점:

- 진화 성공 후 card flip/glow/scale-up 같은 명확한 unlock 연출이 없다.
- “조건 미충족 시 아직 방향성이 부족하다” 같은 문구가 rule별 missing stat으로만 표현되어 있다.
- `evolve` action은 있으나 UI에서는 `evolveByRule`만 사용한다. 문제는 아니지만 테스트 대상에 포함해야 한다.

---

### 1.9 Collection

`src/screens/Collection.tsx`는 전체 variant grid를 렌더링한다. `src/components/CollectionCard.tsx`는 다음을 처리한다.

- 해금 variant: 이름, description, 선택 가능
- 잠금 variant: `Locked Ym`, tags 표시, disabled
- 선택된 variant: `Active` pill 표시
- test id: `collection-card-${variant.id.replaceAll('_', '-')}`

판정: **도감 기본 grid는 구현 완료.**

남은 점:

- 해금된 Ym의 상세 보기 패널/모달이 없다.
- 미해금 Ym의 힌트 확인 UI가 없다.
- disabled 카드라 잠금 카드 클릭으로 힌트 패널을 열 수 없다.
- 기획서의 “해금된 Ym 상세 보기, 미해금 Ym 힌트 확인”을 완료하려면 카드 클릭/상세 sheet가 필요하다.

---

### 1.10 Workspace

`src/screens/Workspace.tsx`는 다음을 보여준다.

- 현재 unlock된 Ym 개수
- Spark/sec, Insight/sec, Trust/sec
- 해금된 variant별 active effect 카드

현재 v0.1 정책인 “해금된 Ym 효과 자동 적용”과 잘 맞는다.

판정: **Workspace 기본 구현 완료.**

남은 점:

- “배치 슬롯” 기능은 없다. 다만 기획서에서 v0.1은 자동 적용도 가능하다고 했으므로 필수는 아니다.
- 효과가 없는 경우나 초반 core만 있는 경우의 안내가 약하다.
- Active effect가 어떤 계산으로 total에 반영되는지 사용자가 이해하기 어렵다.

---

### 1.11 Persistence / Migration

`src/store/gameStore.ts`는 Zustand persist + localStorage를 사용한다. `partialize`로 게임 상태만 저장하고, `merge`에서 `migrateSave`를 호출한다.

`src/game/save.ts`는 corrupted save를 기본값으로 복구하고 missing field를 채운다.

판정: **로컬 저장과 save migration 구현 완료.**

주의점:

- `merge` 시점에서 `Date.now()`를 직접 호출한다. 개발 계획서의 “게임 로직 함수는 Date.now()를 직접 호출하지 않는다” 원칙은 순수 game 함수 기준으로는 지켜지고 있으나, store/persist 계층에서는 Date.now를 사용한다. 허용 가능하다.
- `lastOfflineGain`은 저장되지만 migrate 시 `{}`로 reset된다. 좋은 선택이다.

---

### 1.12 Asset / Balance Harness

`src/data/variants.json`과 실제 SVG asset의 일치를 검증하는 `scripts/check-assets.mjs`가 존재한다.

검증 항목:

- asset 존재 여부
- `.svg` 확장자 여부
- `<image` 또는 `href=`로 PNG 링크가 들어간 SVG 금지
- `<path` 존재 여부

`check-balance.mjs`도 존재한다.

검증 항목:

- core 제외 모든 variant에 rule 존재
- rule target이 variants에 존재
- effect가 음수/NaN 아님
- cost가 0 이하/NaN 아님
- requiredStats 조건 완전 중복 금지

판정: **asset/balance harness 구현 완료.**

남은 점:

- CI에서 자동 실행되는지 확인 필요.
- `agent:check`는 정의되어 있으므로 GitHub Actions만 붙이면 된다.

---

### 1.13 Test 현황

확인된 Vitest unit test:

- `src/game/resources.test.ts`
- `src/game/evolution.test.ts`
- `src/game/growth.test.ts`
- `src/game/save.test.ts`

판정: **순수 로직 unit test는 최소 구현 완료.**

부족한 테스트:

- store action test 없음.
- component test 없음.
- Playwright E2E spec 파일은 확인 범위에서 발견되지 않았다. `playwright.config.ts`는 `tests/e2e`를 바라보므로, spec이 없으면 `pnpm test:e2e`의 검증력이 없거나 실패할 수 있다.
- 모바일 viewport, persist-reload, evolve-first-variant E2E가 반드시 필요하다.

---

## 2. 현재 단계 판정

개발 계획서의 M0~M7 기준으로 보면 다음 상태로 판단한다.

| 단계 | 상태 | 근거 |
|---|---|---|
| M0 Repo bootstrap | 완료 | Vite/React/TS, package scripts, harness scripts 존재 |
| M1 Asset integration | 완료 | variants.json + assets:check 존재 |
| M2 Core loop | 완료 | Home tap/idle, resource logic, persist 존재 |
| M3 Growth/Lab | 완료 | 5 stat growth + cost + Lab UI 존재 |
| M4 Evolution | 기능 완료 / UX 미완 | rule, unlock, Lab card 존재. unlock 연출/상세 피드백 부족 |
| M5 Workspace | 기본 완료 | 자동 효과, 생산량 요약 존재. 슬롯형 배치는 미구현이나 v0.1 허용 |
| M6 Polish | 미완 | unlock animation, collection detail, mobile QA, sound, onboarding 부족 |
| M7 Android RC | 부분 | Capacitor config 존재. 실제 Android build 검증 미확인 |

정리하면 현재 저장소는 **정적 목업을 넘어 실제 플레이어블 v0.1 core loop까지 상당 부분 구현된 상태**다. 남은 핵심은 “완성도”, “검증”, “릴리즈 포장”이다.

---

## 3. 즉시 수정해야 하는 P0 이슈

### P0-1. 초기 Spark/sec 0.2 문제

현재 구조상 `balance.baseSparkPerSecond=0.1`과 Core effect `{ spark: 0.1 }`가 중복 적용되어 초기 Spark/sec가 0.2가 된다.

#### 수정 지시

- `src/data/balance.ts`
  - `baseSparkPerSecond: 0`으로 변경.
- `src/game/resources.test.ts`
  - 10초 offline gain 기대값을 `2`에서 `1`로 변경.
  - 또는 test명을 “uses Core Ym effect as base production”으로 명확화.
- `src/game/resources.ts`
  - production 합산 로직은 유지.

#### Acceptance Criteria

- 새 게임 시작 직후 Workspace/Home의 Spark/sec는 `0.10`으로 표시된다.
- `applyOfflineGain(createInitialState(0), 10_000).resources.spark`는 `1`에 가깝다.
- `pnpm agent:check` 통과.

---

### P0-2. E2E spec 부재 보강

`playwright.config.ts`는 존재하지만 실제 E2E spec은 확인되지 않았다. v0.1 릴리즈에는 E2E가 필수다.

#### 생성 파일

- `tests/e2e/core-loop.spec.ts`

#### 테스트 시나리오

1. `new-player-smoke`
   - `/` 접속
   - `Ym Grove`, `Spark`, `Core Ym` 표시 확인
   - `Spark` 값 0 또는 floor 기준 0 확인
   - Collection으로 이동 후 `1 of 14` 또는 core 해금 상태 확인

2. `tap-and-grow`
   - `Tap Ym` 클릭
   - `spark-value` 증가 확인
   - 필요한 만큼 tap 또는 state seed를 사용해 Lab 성장 버튼 활성화
   - `Intelligence` 성장 후 `stat-intelligence` 값 증가 확인

3. `evolve-first-variant`
   - E2E에서 긴 tap 반복은 느리므로 localStorage seed 또는 테스트 전용 helper를 사용한다.
   - `resources.spark=300`, `stats.intelligence=4`, `stats.connection=4` 상태를 주입.
   - Lab에서 AI / Agents 카드의 `Evolve` 클릭.
   - Collection에서 AI / Agents가 unlocked 상태인지 확인.
   - Home selected Ym이 AI / Agents인지 확인.

4. `persist-reload`
   - Spark/stat/unlocked 상태를 만든 뒤 reload.
   - reload 후 상태 유지 확인.

5. `mobile-layout`
   - Pixel 5 viewport에서 tabbar, Tap Ym, Lab 버튼, Collection card가 보이는지 확인.

#### Acceptance Criteria

- `pnpm test:e2e` 통과.
- `pnpm agent:full` 통과.

---

### P0-3. CI 추가

현재 `agent:check`는 있으나 GitHub Actions workflow가 확인되지 않았다. Agent 작업 안정성을 위해 PR/push gate가 필요하다.

#### 생성 파일

- `.github/workflows/ci.yml`

#### 내용

- Node.js 20
- pnpm 9
- `pnpm install --frozen-lockfile`
- `pnpm agent:check`

#### Acceptance Criteria

- push/PR에서 CI가 실행된다.
- CI에서 lint/typecheck/unit/assets/balance/build가 모두 검증된다.

---

## 4. 남은 전체 작업 카드

아래 작업 카드는 순서대로 진행한다. 각 Agent는 지정된 파일 범위를 우선 지키고, 작업 후 반드시 required harness를 실행한다.

---

## Task A-001: Fix Base Production Source of Truth

### Goal
초기 Spark/sec가 기획서와 일치하도록 기본 생산량 중복을 제거한다.

### Context
현재 `baseSparkPerSecond=0.1`과 Core effect `{ spark: 0.1 }`가 동시에 적용되어 시작 생산량이 0.2가 된다. v0.1 밸런스 초안은 기본 초당 Spark 0.1이다.

### Allowed files

- `src/data/balance.ts`
- `src/game/resources.test.ts`
- 필요 시 `src/game/resources.ts`

### Requirements

1. `balance.baseSparkPerSecond`를 `0`으로 변경한다.
2. Core Ym의 `effect.spark=0.1`을 기본 생산량으로 사용한다.
3. 10초 offline gain test 기대값을 `1`로 수정한다.
4. initial production 관련 unit test를 추가한다.

### Non-goals

- variant effect 전체 밸런스 재설계 금지.
- UI 개편 금지.

### Acceptance Criteria

- 새 게임의 `getProductionPerSecond(state).spark`가 `0.1`이다.
- 10초 offline gain이 Spark `1` 근처다.
- `pnpm test` 통과.
- `pnpm agent:check` 통과.

---

## Task A-002: Add Core E2E Test Suite

### Goal
v0.1 핵심 사용자 루프를 Playwright로 검증한다.

### Context
`playwright.config.ts`는 `tests/e2e`를 바라보지만, 확인된 E2E spec이 없다. 릴리즈 전 `agent:full`이 실질적 검증이 되도록 해야 한다.

### Allowed files

- `tests/e2e/core-loop.spec.ts`
- 필요 시 `playwright.config.ts`
- 필요 시 test id 추가를 위한 `src/screens/*.tsx`, `src/components/*.tsx`

### Requirements

1. new-player smoke test 작성.
2. tap-and-grow test 작성.
3. evolve-first-variant test 작성.
4. persist-reload test 작성.
5. mobile-layout test 작성.
6. 테스트 데이터 주입은 localStorage seed를 사용한다.
7. production 코드에 test-only branch를 넣지 않는다.

### Suggested localStorage seed helper

Zustand persist는 `ym-grove-v0.1` key를 사용한다. E2E에서 다음 형태의 state를 주입한다.

```ts
await page.addInitScript(() => {
  localStorage.setItem(
    'ym-grove-v0.1',
    JSON.stringify({
      state: {
        version: '0.1.0',
        resources: { spark: 300, insight: 0, trust: 0 },
        stats: {
          intelligence: 4,
          curiosity: 0,
          stability: 0,
          growth: 0,
          connection: 4,
        },
        unlocked: {
          core: true,
          ai_agents: false,
          ml_deep_learning: false,
          jepa_vision: false,
          security: false,
          data_analytics: false,
          cloud_infra: false,
          gaming_rl: false,
          research: false,
          education: false,
          premium_pro: false,
          sustainability: false,
          api_integrations: false,
          tools_utilities: false,
        },
        selectedYm: 'core',
        lastOfflineGain: {},
        lastSavedAt: Date.now(),
      },
      version: 0,
    }),
  );
});
```

### Acceptance Criteria

- `pnpm test:e2e` 통과.
- `pnpm agent:full` 통과.
- 테스트가 390x844 또는 Pixel 5 viewport에서 핵심 버튼 표시를 검증한다.

---

## Task A-003: Add Store Action Tests

### Goal
Zustand store action의 회귀를 방지한다.

### Context
순수 game function test는 있으나 `tapYm`, `claimOfflineGain`, `growStat`, `evolveByRule`, `selectYm`, `spendInsightForTrust`, `resetGame` action을 직접 검증하는 store test가 없다.

### Allowed files

- `src/store/gameStore.test.ts`
- 필요 시 `src/test/*`
- 필요 시 `vitest.config.ts`

### Requirements

1. 테스트 전 localStorage를 clear한다.
2. `resetGame(nowMs)`가 초기 상태로 복구되는지 확인한다.
3. `tapYm()`가 Spark를 증가시키는지 확인한다.
4. `claimOfflineGain(nowMs)`가 lastSavedAt과 resource를 갱신하는지 확인한다.
5. `growStat('growth')` 등 5개 중 최소 1개 stat 성장 확인.
6. `evolveByRule('rule_ai_agents')`가 조건 충족 시 unlock/selectedYm/cost 차감을 수행하는지 확인.
7. locked variant는 `selectYm`으로 선택되지 않는지 확인한다.
8. unlocked variant는 `selectYm`으로 선택되는지 확인한다.

### Acceptance Criteria

- `pnpm test` 통과.
- store action과 pure game logic이 중복 구현되지 않는다.

---

## Task A-004: Improve Collection Detail and Locked Hint UX

### Goal
Collection에서 해금 캐릭터 상세와 미해금 힌트를 확인할 수 있게 한다.

### Context
현재 Collection card는 locked 상태에서 disabled라 사용자가 미해금 힌트를 열 수 없다. 기획서의 Collection 상호작용은 “해금된 Ym 상세 보기, 미해금 Ym 힌트 확인”이다.

### Allowed files

- `src/screens/Collection.tsx`
- `src/components/CollectionCard.tsx`
- 필요 시 `src/components/CollectionDetailSheet.tsx`
- `src/game/evolution.ts`
- `src/styles.css`
- 관련 component/e2e test

### Requirements

1. Collection card는 locked 상태에서도 클릭 가능해야 한다.
2. unlocked card 클릭 시 상세 sheet 또는 panel을 연다.
3. 상세에는 이름, icon, description, tags, effect, active 여부를 표시한다.
4. locked card 클릭 시 다음 정보를 표시한다.
   - `Locked Ym`
   - tags 기반 방향성
   - 관련 evolution rule의 hint
   - missing stats 또는 “Train more in Lab” 안내
5. unlocked card의 `Select` action은 detail sheet 안에서 제공해도 된다.
6. disabled 버튼으로 힌트 접근을 막지 않는다.

### Suggested UX

- 모바일에서는 bottom sheet 형태.
- 데스크톱/넓은 화면에서는 우측 또는 하단 panel.
- `Esc` 또는 Close 버튼으로 닫을 수 있게 한다.

### Acceptance Criteria

- locked card 클릭 시 hint panel이 열린다.
- unlocked card 클릭 시 detail panel이 열린다.
- unlocked card에서 선택하면 selectedYm이 바뀐다.
- E2E 또는 component test로 locked hint와 unlocked select를 검증한다.

---

## Task A-005: Add Evolution Success Feedback

### Goal
진화 성공 순간을 게임 이벤트처럼 느끼게 한다.

### Context
현재 `Evolve` 클릭 후 바로 unlock/selected만 바뀐다. 기획서의 애니메이션 방향에는 evolution glow + scale up이 포함되어 있다.

### Allowed files

- `src/store/gameStore.ts`
- `src/types/game.ts`
- `src/screens/Lab.tsx`
- `src/components/YmCharacter.tsx` 또는 신규 component
- `src/styles.css`
- 관련 test

### Requirements

1. GameState 또는 UI local state에 `lastUnlockedYm` 또는 `evolutionEvent`를 추가한다.
2. `evolveByRule` 성공 시 target id를 event로 남긴다.
3. Lab에서 success banner/modal을 보여준다.
4. Home 또는 YmCharacter에 짧은 glow/scale animation class를 적용한다.
5. event는 사용자가 닫거나 일정 시간 후 사라진다.
6. save migration에서 새 필드가 추가된다면 안전하게 기본값을 채운다.

### Non-goals

- 실패/돌연변이 시스템 추가 금지. v0.1은 조건 미충족 안내만 유지한다.
- Lottie 도입 금지. CSS animation으로 충분하다.

### Acceptance Criteria

- Evolve 성공 후 “New Ym Registered” 또는 유사 banner가 보인다.
- Collection count가 증가한다.
- selectedYm이 target으로 바뀐다.
- `pnpm test`와 `pnpm test:e2e` 통과.

---

## Task A-006: Separate Passive Tick From Offline Claim Banner

### Goal
초당 idle tick 때문에 “Idle gain claimed” banner가 계속 노출되는 문제를 방지한다.

### Context
현재 Home은 mount 시 `claimOfflineGain()`을 호출하고, 이후 1초마다 같은 action을 호출한다. 이 action은 `lastOfflineGain`을 매번 갱신하므로 banner가 계속 표시될 수 있다.

### Allowed files

- `src/game/resources.ts`
- `src/store/gameStore.ts`
- `src/screens/Home.tsx`
- `src/game/resources.test.ts`
- 관련 store/e2e test

### Recommended design

Action을 분리한다.

1. `claimOfflineGain(nowMs)`
   - 앱 시작/복귀/수동 Claim용.
   - `lastOfflineGain`을 갱신한다.
   - banner 표시 대상.

2. `tickProduction(nowMs)` 또는 `applyPassiveTick(nowMs)`
   - 실시간 초당 증가용.
   - resources와 lastSavedAt만 갱신한다.
   - `lastOfflineGain`은 갱신하지 않는다.

3. banner threshold
   - `lastOfflineGain.spark + insight + trust >= 1`일 때만 banner 표시.
   - 또는 elapsed time이 30초 이상일 때만 표시.

### Acceptance Criteria

- 앱 실행 직후 의미 있는 오프라인 보상만 banner로 보인다.
- 플레이 중 매초 banner가 새로 뜨지 않는다.
- idle 생산은 계속 증가한다.
- unit test가 claim과 tick의 차이를 검증한다.

---

## Task A-007: Make Insight and Trust Meaningful in v0.1

### Goal
Insight와 Trust가 단순 숫자가 아니라 최소한의 역할을 갖도록 한다.

### Context
현재 Insight는 일부 variant 해금 후 생산되고, `Stabilize` 버튼으로 5 Insight를 1 Trust로 바꿀 수 있다. 하지만 v0.1에는 실패 확률이 없으므로 Trust의 목적이 약하다. 또한 `hintCostInsight`라는 이름과 실제 사용처가 어긋난다.

### Allowed files

- `src/data/balance.ts`
- `src/game/evolution.ts`
- `src/game/resources.ts`
- `src/store/gameStore.ts`
- `src/screens/Lab.tsx`
- `src/types/game.ts`
- tests

### Recommended v0.1 policy

복잡한 실패 시스템은 넣지 않는다. 대신 다음 중 최소 하나를 구현한다.

#### Option A: Insight Hint Reveal

- 기본 visible rule은 3개 유지.
- locked Collection 또는 Lab에서 `Reveal Hint` 버튼 제공.
- 5 Insight를 소비하면 특정 target의 exact required stats를 표시한다.
- reveal 상태는 save에 저장한다.

#### Option B: Trust Stabilization Discount

- Trust가 1 이상이면 다음 evolution cost를 소폭 할인한다.
- 예: Trust 1당 evolution Spark cost 1% 감소, 최대 10%.
- 진화 시 Trust를 소비하지 않는 passive benefit으로 처리.

#### Option C: Stabilize as Simple Conversion

- 현재 구조를 유지하되 이름을 `Convert Insight to Trust`로 바꾸고, Trust의 설명을 “v0.2 failure system 준비 자원”으로 명시한다.
- 이 경우 기능 구현은 작지만 게임성은 약하다.

### Recommended decision

v0.1에서는 **Option A + 작은 Option C**를 권장한다.

- `Reveal Hint`를 구현해 Insight 사용처를 명확히 만든다.
- Trust는 아직 failure가 없으므로 “stability reserve”로 설명하고 Workspace/ResourceBar에서 의미를 설명한다.

### Acceptance Criteria

- Insight를 소비하는 명확한 action이 있다.
- action 이름과 `balance.hintCostInsight`가 일치한다.
- save migration이 reveal state를 안전하게 처리한다.
- unit/component/e2e 중 최소 하나로 hint reveal을 검증한다.

---

## Task A-008: Workspace Readability Polish

### Goal
Workspace가 단순 리스트가 아니라 “해금된 Ym 효과가 실제로 적용 중”임을 명확히 보여준다.

### Context
현재 Workspace는 생산량 총합과 active card를 보여준다. 기능은 맞지만 계산 근거와 early state 안내가 약하다.

### Allowed files

- `src/screens/Workspace.tsx`
- `src/components/*` 신규 가능
- `src/styles.css`
- component/e2e test

### Requirements

1. total production summary에 “Base/Core”, “Variant effects”, “Multiplier” 구분을 추가한다.
2. active effect card에는 resource icon/label과 `+0.xx/sec`를 명확히 표시한다.
3. 아직 core만 있을 때 다음 unlock 유도 문구를 표시한다.
4. v0.1에서 slot 배치는 구현하지 않는다. 대신 “Effects auto-active in v0.1”을 명확히 한다.

### Acceptance Criteria

- Workspace에서 총 생산량과 개별 효과를 이해할 수 있다.
- core만 있는 초반 상태에서도 빈 화면처럼 보이지 않는다.
- mobile viewport에서 card가 overflow되지 않는다.

---

## Task A-009: Add Settings / Reset / About Panel

### Goal
로컬 저장 게임에서 QA와 사용자 초기화를 가능하게 한다.

### Context
store에는 `resetGame` action이 있지만 UI에서 접근할 수 없다. 개발/QA 중 새 게임 상태 테스트가 어렵다.

### Allowed files

- `src/app/App.tsx`
- `src/screens/Settings.tsx` 또는 `src/components/SettingsPanel.tsx`
- `src/store/gameStore.ts`
- `src/styles.css`
- tests/e2e

### Requirements

1. Header 또는 tabbar 근처에 Settings 접근 버튼 추가.
2. Settings panel에는 다음을 표시한다.
   - Version: 0.1.0
   - Save: localStorage only
   - Reset Game 버튼
   - No login / no server / no personal data copy
3. Reset은 확인 단계를 둔다.
4. Reset 후 core만 unlocked, Spark=0 상태로 돌아간다.

### Acceptance Criteria

- Reset 후 상태가 초기화된다.
- reload 후 초기화 상태가 유지된다.
- E2E로 reset flow를 검증한다.

---

## Task A-010: Mobile Visual Polish and Safe Area

### Goal
스마트폰 기준으로 실제 앱처럼 보이게 polish한다.

### Context
현재 CSS는 기본 모바일 대응이 되어 있으나, v0.1 배포용 polish가 더 필요하다.

### Allowed files

- `src/styles.css`
- `src/app/App.tsx`
- `src/screens/*.tsx`
- `src/components/*.tsx`

### Requirements

1. `safe-area-inset-bottom`을 tabbar padding에 반영한다.
2. `.app-shell`이 모바일에서 100dvh 기준으로 안정적으로 보이게 한다.
3. 버튼 min-height 44px 유지.
4. Evolution card와 Collection card가 320px 폭에서 overflow되지 않게 한다.
5. unlock/evolution glow animation을 추가한다.
6. prefers-reduced-motion를 고려해 animation을 줄인다.

### CSS note

```css
.app-shell {
  min-height: 100dvh;
}

.tabbar {
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Acceptance Criteria

- Playwright Pixel 5에서 주요 UI가 조작 가능하다.
- 320px width에서도 horizontal scroll이 생기지 않는다.
- animation이 과하지 않고 브랜드 톤과 맞는다.

---

## Task A-011: README and Agent Handoff Docs

### Goal
저장소만 보고 설치/실행/검증/작업이 가능하게 문서를 정리한다.

### Context
현재 README 존재 여부는 확인되지 않았다. Agent와 사람이 동일한 명령으로 검증할 수 있어야 한다.

### Allowed files

- `README.md`
- `docs/AGENT_IMPLEMENTATION_ROADMAP.md`
- `docs/RELEASE_CHECKLIST.md`

### README Requirements

1. 프로젝트 소개.
2. Stack.
3. Setup.
4. Dev server.
5. Test/harness.
6. Build.
7. Android packaging.
8. Project structure.
9. Agent workflow.

### RELEASE_CHECKLIST Requirements

1. `pnpm agent:full` 통과.
2. localStorage reset/reload 확인.
3. 14종 Collection 표시 확인.
4. 최소 3개 variant 일반 플레이로 해금 가능 확인.
5. Android `cap sync` 확인.
6. 앱 아이콘/splash/스토어 스크린샷 준비.
7. 개인정보처리방침 문구 준비.

### Acceptance Criteria

- 새 Agent가 README만 보고 `pnpm install`, `pnpm dev`, `pnpm agent:check`를 실행할 수 있다.
- release checklist가 v0.1 기준을 모두 포함한다.

---

## Task A-012: Add GitHub Actions CI

### Goal
main/PR에서 harness가 자동으로 실행되게 한다.

### Allowed files

- `.github/workflows/ci.yml`

### Workflow

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  web-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm agent:check
```

### Acceptance Criteria

- GitHub Actions에서 CI가 실행된다.
- 실패 시 원인이 lint/typecheck/test/assets/balance/build 중 어디인지 알 수 있다.

---

## Task A-013: Android Dry Run

### Goal
Web-first 구현을 Capacitor Android로 패키징 가능한지 확인한다.

### Context
`capacitor.config.ts`와 Android 관련 scripts는 존재한다. 실제 `android` directory와 Gradle build 성공 여부는 별도 확인이 필요하다.

### Allowed files

- `capacitor.config.ts`
- `package.json`
- Android 생성 파일들
- `docs/RELEASE_CHECKLIST.md`

### Required commands

```bash
pnpm build
pnpm exec cap sync android
pnpm exec cap open android
```

또는 CLI 환경에서:

```bash
pnpm android:sync
```

### Requirements

1. Android project가 없으면 `pnpm android:add` 수행.
2. `dist` build 후 `cap sync android` 성공 확인.
3. 앱 icon/splash는 아직 placeholder여도 되지만 checklist에 남긴다.
4. native 파일이 대량 생성되므로 별도 commit으로 분리한다.

### Acceptance Criteria

- `pnpm android:sync` 성공.
- Android Studio에서 열 수 있음.
- Web build와 Android webview에서 핵심 화면 동작 차이가 없음.

---

## Task A-014: Balance Pass for First 5 Minutes

### Goal
첫 5분 내 최소 1개 variant를 해금할 수 있게 초반 진행감을 조정한다.

### Context
기획서의 리스크 대응은 첫 5분 내 variant 1개 해금이다. 현재 비용 구조에서는 active tapping 기준 가능할 수 있으나, 실제 플레이 검증이 필요하다.

### Allowed files

- `src/data/balance.ts`
- `src/data/evolutionRules.json`
- `src/game/growth.ts`
- `src/game/*.test.ts`
- `docs/BALANCE_NOTES.md`

### Requirements

1. “첫 5분 플레이 시나리오”를 문서화한다.
2. 첫 variant 추천 루트 하나를 정한다.
   - 예: AI / Agents: Intelligence 4 + Connection 4 + 300 Spark
   - 또는 ML: Intelligence 6 + 300 Spark
3. 필요 시 첫 해금용 조건/비용을 낮춘다.
4. 최소 3개 variant는 일반 플레이로 해금 가능해야 한다.
5. 밸런스 변경 후 `balance:check`와 unit test를 갱신한다.

### Acceptance Criteria

- BALANCE_NOTES에 “expected first unlock route”가 있다.
- 첫 unlock까지 예상 tap/idle 시간이 계산되어 있다.
- `pnpm agent:check` 통과.

---

## Task A-015: Release Candidate QA

### Goal
v0.1 릴리즈 후보를 실제 사용 흐름으로 검증한다.

### Required checklist

1. `pnpm install --frozen-lockfile`
2. `pnpm agent:check`
3. `pnpm test:e2e`
4. `pnpm build`
5. `pnpm preview`
6. 모바일 브라우저 viewport 수동 확인
7. 새 게임 시작 확인
8. Spark tap 확인
9. idle gain 확인
10. stat growth 확인
11. first evolution 확인
12. Collection unlock/selected 확인
13. Workspace production update 확인
14. reload persistence 확인
15. reset 확인
16. corrupted localStorage recovery 확인
17. Android sync 확인

### QA report format

```md
# Ym Grove v0.1 QA Report

## Environment
- OS:
- Node:
- pnpm:
- Browser:

## Commands
- pnpm agent:check: PASS/FAIL
- pnpm test:e2e: PASS/FAIL
- pnpm build: PASS/FAIL
- pnpm android:sync: PASS/FAIL/N/A

## Manual Flow
- New player smoke:
- Tap:
- Growth:
- Evolution:
- Collection:
- Workspace:
- Persistence:
- Reset:

## Bugs
| Severity | Area | Description | Repro | Status |
|---|---|---|---|---|

## Release decision
- GO / NO-GO
```

---

## 5. 권장 작업 순서

Agent는 아래 순서로 진행한다.

1. **A-001** Base production 중복 수정.
2. **A-003** Store action tests 추가.
3. **A-002** Core E2E test suite 추가.
4. **A-004** Collection detail / locked hint UX.
5. **A-005** Evolution success feedback.
6. **A-006** Passive tick과 offline claim banner 분리.
7. **A-007** Insight/Trust 사용처 정리.
8. **A-008** Workspace readability polish.
9. **A-009** Settings / Reset / About panel.
10. **A-010** Mobile visual polish.
11. **A-011** README / release docs.
12. **A-012** GitHub Actions CI.
13. **A-014** First 5 minutes balance pass.
14. **A-013** Android dry run.
15. **A-015** Release candidate QA.

주의: A-013 Android native 파일 생성은 diff가 커질 수 있으므로 마지막에 별도 branch/commit으로 수행한다.

---

## 6. Agent 공통 지시

모든 Agent는 다음 규칙을 따른다.

1. 작업 시작 전 현재 상태에서 `pnpm agent:check`를 실행한다.
2. 실패하면 실패 로그를 먼저 기록하고, 자신의 task와 직접 관련된 실패만 수정한다.
3. 지정된 allowed files 밖의 수정은 최소화한다.
4. 테스트, lint, typecheck를 끄지 않는다.
5. `any` 타입으로 우회하지 않는다.
6. UI 변경 시 접근 가능한 버튼 이름과 `data-testid`를 함께 고려한다.
7. game logic은 가능한 `src/game/*` 순수 함수로 두고, screen에서 직접 비즈니스 로직을 만들지 않는다.
8. 저장 스키마 변경 시 `migrateSave`와 save test를 반드시 갱신한다.
9. variant/evolution/balance 변경 시 `scripts/check-balance.mjs`가 통과해야 한다.
10. asset 추가/변경 시 `scripts/check-assets.mjs`가 통과해야 한다.

---

## 7. 완료 보고 양식

각 Agent는 작업 완료 후 아래 형식으로 보고한다.

```md
## Summary
- 구현한 결과:

## Files changed
- `path`: 변경 이유

## Commands run
- `pnpm agent:check`: PASS/FAIL
- `pnpm test:e2e`: PASS/FAIL/N/A
- 기타:

## Test evidence
- 핵심 출력 요약:

## Manual verification
- 확인한 화면/동작:

## Known limitations
- 남은 제한/후속 작업:
```

---

## 8. 최종 v0.1 Definition of Done

아래가 모두 참이면 v0.1 완료로 본다.

### Functional DoD

- [ ] Core Ym + 13개 variant가 Collection에 표시된다.
- [ ] 새 게임에서 Core만 unlocked다.
- [ ] Tap Ym으로 Spark가 증가한다.
- [ ] idle/passive tick으로 Spark가 증가한다.
- [ ] offline cap 8시간이 적용된다.
- [ ] 5개 스탯이 모두 성장 가능하다.
- [ ] evolution rule 조건과 비용이 적용된다.
- [ ] 최소 3개 variant가 일반 플레이로 해금 가능하다.
- [ ] 해금 variant 선택이 Home 캐릭터에 반영된다.
- [ ] Workspace 생산량이 해금 효과를 반영한다.
- [ ] localStorage 저장/로드가 동작한다.
- [ ] corrupted save가 복구된다.
- [ ] reset이 동작한다.

### UX DoD

- [ ] 모바일 viewport에서 주요 버튼이 44px 이상이고 조작 가능하다.
- [ ] Evolution 성공 피드백이 있다.
- [ ] Collection에서 unlocked detail과 locked hint를 확인할 수 있다.
- [ ] Workspace에서 active effect 의미를 이해할 수 있다.
- [ ] safe area와 320px 폭 대응이 되어 있다.

### Test / Harness DoD

- [ ] `pnpm lint` 통과.
- [ ] `pnpm typecheck` 통과.
- [ ] `pnpm test` 통과.
- [ ] `pnpm assets:check` 통과.
- [ ] `pnpm balance:check` 통과.
- [ ] `pnpm build` 통과.
- [ ] `pnpm test:e2e` 통과.
- [ ] `pnpm agent:full` 통과.
- [ ] GitHub Actions CI 통과.

### Release DoD

- [ ] Web preview 확인.
- [ ] README 작성.
- [ ] Release checklist 작성.
- [ ] Android `cap sync` 성공.
- [ ] 앱 아이콘/splash 준비 또는 TODO 명시.
- [ ] 개인정보처리방침 문구 준비.

---

## 9. 현재 구현 기준 최종 판단

현재 `main`은 이미 단순 정적 목업이 아니라 다음을 갖춘 상태다.

- React/TS 앱 구조
- 4개 주요 화면
- localStorage persist
- tap/idle/offline resource logic
- stat growth
- data-driven variants/rules
- evolution unlock
- collection grid
- workspace production summary
- asset/balance harness
- 일부 unit test

따라서 남은 작업의 성격은 “기능을 처음부터 구현”보다는 다음에 가깝다.

1. 밸런스/세부 버그 수정
2. E2E와 CI로 검증 체계 완성
3. Collection/Evolution/Workspace UX 완성
4. 모바일 polish
5. Android release dry run
6. README/릴리즈 문서화

Agent는 우선 P0 이슈와 E2E부터 처리하고, 이후 polish를 진행해야 한다.
