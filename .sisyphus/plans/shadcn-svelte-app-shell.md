# Shadcn-Svelte App Shell

## TL;DR
> **Summary**: Bootstrap a brand-new Bun + SvelteKit + shadcn-svelte frontend in this empty workspace, then deliver a TaskFlux-aligned app shell with an empty sidebar, topbar, and MainView, plus a TaskFlux-parity dark-mode transition, Storybook-based story management, and automated verification.
> **Deliverables**:
> - Bun-managed SvelteKit app with shadcn-svelte configured for Tailwind v4 and Svelte 5
> - Empty app shell with responsive sidebar/topbar/MainView structure
> - Animated light/dark toggle aligned to the TaskFlux reference
> - Vitest, Playwright, and Storybook wired into the project scripts
> - Agent-executable verification for `bun run dev`, unit tests, E2E, and Storybook
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 3 → 4 → 6 → 7

## Context
### Original Request
- 在当前空工作区交付一个 `shadcn-svelte` App 骨架，包含 sidebar/topbar/MainView。
- topbar 必须包含 sidebar collapse 按钮和深色模式切换按钮。
- sidebar 和 MainView 保持空实现，不放任何业务元素。
- 样式完整按照 `~/Desktop/RustArk/TaskFlux` 迁移，且深色模式按钮动画要完整对齐。
- 使用 `bun`。
- 参考 `https://www.shadcn-svelte.com/llms.txt`。
- 最终应支持通过 `bun run dev` 查看样式进行测试。
- 额外纳入 stories 组件管理。

### Interview Summary
- Current workspace `/Users/realxlfd/Desktop/Todo/shadcn-startup` is empty, so the implementation must be greenfield rather than an in-place refactor.
- The closest visual and structural reference is TaskFlux frontend in `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend`, especially `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/routes/(app)/+layout.svelte`, `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/app.css`, and `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/lib/components/ModeSwitcher.svelte`.
- Test strategy is confirmed as `Vitest + E2E`, not manual QA only.
- “stories 组件管理” is interpreted as Storybook integration and story-driven component/shell management.

### Metis Review (gaps addressed)
- Theme state must have a single source of truth; this plan chooses `mode-watcher` for mode persistence/class application and layers the TaskFlux radial animation on top of that API instead of porting the TaskFlux theme store wholesale.
- The user asked for a dark-mode toggle button, not a three-state mode cycle, so this plan defaults to a strict `light ↔ dark` toggle while preserving the TaskFlux transition effect and reduced-motion fallback.
- “Migrate styling from TaskFlux” is constrained to the shell-relevant token set, sidebar tokens, base surfaces, and scrollbar/body styles required for parity; the full multi-theme palette switcher is explicitly out of scope.
- Storybook is treated as both local component management and a buildable artifact, so the plan includes `storybook` dev startup and `build-storybook` verification.
- Storybook compatibility risks are reduced by extracting presentational shell components that do not depend directly on SvelteKit routing APIs; only thin route wrappers may touch route-level concerns.

## Work Objectives
### Core Objective
- Deliver a runnable frontend shell in this workspace that visually follows TaskFlux, uses shadcn-svelte layout primitives, runs under Bun, and can be validated through dev server, unit tests, E2E tests, and Storybook.

### Deliverables
- `package.json`, Bun lockfile, SvelteKit/Tailwind/shadcn-svelte baseline config, and project scripts.
- Global styles and tokens migrated from TaskFlux into the new app’s CSS foundation.
- Shell components for `AppShell`, `AppSidebar`, `AppTopbar`, `MainView`, and animated `ModeToggle`.
- Root/layout wiring using `ModeWatcher`, `Sidebar.Provider`, `Sidebar.Inset`, and `Sidebar.Trigger`.
- Storybook configuration with shared app CSS, theme toolbar/global control, and shell stories.
- Vitest coverage for mode behavior and shell rendering contracts.
- Playwright coverage for shell rendering, sidebar collapse, and dark-mode toggling in the browser.

### Definition of Done (verifiable conditions with commands)
- `bun install` completes successfully in `/Users/realxlfd/Desktop/Todo/shadcn-startup`.
- `bun run check` exits `0` with no Svelte or TypeScript errors.
- `bun run test:unit` exits `0` and covers the mode toggle/state contract.
- `bun run test:e2e` exits `0` and proves shell load, sidebar collapse, and dark-mode switching.
- `bun run storybook -- --ci --port 6006` starts successfully with shell stories available.
- `bun run build-storybook` exits `0` and produces a static Storybook artifact.
- `bun run dev -- --host 127.0.0.1 --port 4173` serves `/` without hydration/runtime errors and renders the empty shell correctly.

### Must Have
- Bun-first project bootstrap and scripts.
- SvelteKit + Svelte 5 + Tailwind v4 + shadcn-svelte configuration aligned to current docs.
- Root-level `ModeWatcher` integration.
- `Sidebar.Provider` + `Sidebar.Inset` + `Sidebar.Trigger` shell structure.
- Empty sidebar content area and empty MainView content area.
- Topbar with exactly the required shell controls: collapse trigger and dark-mode toggle.
- TaskFlux-aligned tokens, surfaces, and dark-mode radial transition.
- Storybook as the stories management surface for shell components/states.
- Automated verification with Vitest and Playwright.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No auth flows, onboarding, command palette, theme palette switcher, demo charts, seeded nav items, or placeholder business content.
- No port of TaskFlux app stores, API clients, route guards, or any non-shell product logic.
- No second theme source of truth besides `mode-watcher`.
- No visual redesign away from TaskFlux shell styling.
- No reliance on manual-only QA or visual-only acceptance criteria.
- No Storybook setup that uses obsolete packages such as `@storybook/svelte-vite` or direct legacy Vite builder packages.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: TDD with `Vitest` for unit/component behavior and `Playwright` for browser flows.
- QA policy: Every implementation task includes both happy-path and failure/edge scenarios.
- Story policy: Storybook is both component management tooling and a verification surface for shell states.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}` plus generated Playwright screenshots/videos where applicable.

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. Shared infra lands in Wave 1 so UI work can proceed in parallel afterward.

Wave 1: project bootstrap, shadcn-svelte baseline, QA/story tooling, global design-token migration.
Wave 2: animated mode toggle, shell components, route wiring, full browser/story verification.

### Dependency Matrix (full, all tasks)
- 1 blocks 2, 3, 4, 5, 6, 7.
- 2 blocks 5 and 6.
- 3 blocks 5, 6, and 7.
- 4 blocks 5 and 6.
- 5 blocks 6 and 7.
- 6 blocks 7.
- 7 feeds the final verification wave.

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `quick`, `unspecified-high`, `visual-engineering`
- Wave 2 → 3 tasks → `visual-engineering`, `unspecified-high`
- Final Verification → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Bootstrap the Bun + SvelteKit baseline

  **What to do**: Initialize the empty workspace as a TypeScript SvelteKit app using the official Svelte CLI with Bun and Tailwind CSS v4. Use the minimal template, keep the default SvelteKit structure, and produce a Bun-managed project with `package.json`, `bun.lock`, `src/app.html`, `src/routes/+layout.svelte`, `src/app.css`, `svelte.config.js`, `vite.config.ts`, and `tsconfig.json`. Normalize scripts immediately so the repo exposes `dev`, `build`, `preview`, `check`, `test:unit`, `test:e2e`, `storybook`, and `build-storybook` names even before later tasks fill in the implementations.
  **Must NOT do**: Do not choose a demo template, do not add unrelated add-ons, and do not leave package-manager ambiguity by generating npm/pnpm/yarn lockfiles.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: CLI-driven scaffold work with deterministic output.
  - Skills: [`frontend-ui-ux`] — why needed: keeps the initial shell scaffold aligned with the intended UI direction instead of generic defaults.
  - Omitted: [`playwright`] — why not needed: no browser automation is required for the initial scaffold.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 6, 7 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - External: `https://svelte.dev/docs/cli/sv-create` — official `sv create` options for `minimal`, `ts`, `--add`, and Bun installation.
  - External: `https://svelte.dev/docs/cli/tailwind` — official Tailwind add-on behavior for SvelteKit.
  - External: `https://tailwindcss.com/docs/guides/sveltekit` — Tailwind v4 + SvelteKit Vite plugin baseline.
  - External: `https://www.shadcn-svelte.com/docs/installation/sveltekit` — confirms Bun-first shadcn-svelte setup flow.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun install` exits `0` in `/Users/realxlfd/Desktop/Todo/shadcn-startup` and creates `bun.lock`.
  - [ ] `bun run check` exits `0` with the freshly scaffolded SvelteKit app.
  - [ ] `bun run build` exits `0` before any shell-specific implementation starts.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Clean scaffold compiles
    Tool: Bash
    Steps: Run `bun install`, then `bun run check`, then `bun run build` in `/Users/realxlfd/Desktop/Todo/shadcn-startup`.
    Expected: All three commands exit `0`; `bun.lock` exists; no missing-config or missing-dependency errors appear.
    Evidence: .sisyphus/evidence/task-1-bootstrap.txt

  Scenario: Wrong package manager artifacts are absent
    Tool: Bash
    Steps: After scaffold, list root files and verify `package-lock.json`, `pnpm-lock.yaml`, and `yarn.lock` are not present.
    Expected: Only Bun is represented by lockfile/script usage; no alternate lockfile is created.
    Evidence: .sisyphus/evidence/task-1-bootstrap-lockfiles.txt
  ```

  **Commit**: YES | Message: `chore(app): scaffold bun sveltekit baseline` | Files: [`package.json`, `bun.lock`, `src/app.css`, `src/routes/+layout.svelte`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`]

- [x] 2. Initialize shadcn-svelte and shell primitives

  **What to do**: Run `shadcn-svelte` initialization against the new app using Bun, then lock the config to the TaskFlux-aligned choices: style `new-york`, base color `zinc`, CSS file `src/app.css`, and default `$lib`-based aliases. Add only the UI primitives required for this shell: `button`, `sidebar`, and `separator`. Preserve the generated `components.json`, `src/lib/utils.ts`, and `src/lib/components/ui/*` layout exactly as the CLI expects.
  **Must NOT do**: Do not add unrelated components such as charts, forms, dropdown menus, command palette, or theme-switcher UI; do not point the CLI at any CSS file other than `src/app.css`.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: deterministic CLI setup plus light config normalization.
  - Skills: [`frontend-ui-ux`] — why needed: ensures the generated primitives remain consistent with the desired shell styling system.
  - Omitted: [`playwright`] — why not needed: this task is config/component generation only.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/components.json:1` — TaskFlux uses `new-york`, `zinc`, CSS variables, and `$lib` aliases.
  - External: `https://www.shadcn-svelte.com/docs/installation/sveltekit` — official init flow and prompt meanings.
  - External: `https://www.shadcn-svelte.com/docs/components/sidebar` — required sidebar provider/inset/trigger composition.
  - External: `https://www.shadcn-svelte.com/docs/components/button` — button primitive usage.
  - External: `https://www.shadcn-svelte.com/docs/components/separator` — separator primitive usage.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run check` exits `0` after `components.json` and the generated UI primitives are added.
  - [ ] `bun run build` exits `0` with the generated shadcn-svelte files in place.
  - [ ] `components.json` contains `style: "new-york"`, `baseColor: "zinc"`, `css: "src/app.css"`, and `$lib`-based aliases.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: shadcn-svelte baseline compiles
    Tool: Bash
    Steps: Run `bun run check` and `bun run build` after `bun x shadcn-svelte@latest init` and `bun x shadcn-svelte@latest add button sidebar separator` are completed.
    Expected: Both commands exit `0`; generated imports resolve; no alias or CSS-file errors appear.
    Evidence: .sisyphus/evidence/task-2-shadcn-baseline.txt

  Scenario: Config drift is prevented
    Tool: Bash
    Steps: Inspect `components.json` and `svelte.config.js` after init.
    Expected: Alias targets match the generated code paths and `src/app.css` is the configured global stylesheet target.
    Evidence: .sisyphus/evidence/task-2-components-config.txt
  ```

  **Commit**: YES | Message: `chore(ui): initialize shadcn-svelte shell primitives` | Files: [`components.json`, `src/lib/utils.ts`, `src/lib/components/ui/**/*`, `src/app.css`]

- [x] 3. Add QA and Storybook infrastructure

  **What to do**: Use the official Svelte CLI add-ons to install `vitest`, `playwright`, and `storybook` with Bun. Rename or normalize any generated scripts so the final script contract is exactly: `check`, `test:unit`, `test:e2e`, `storybook`, and `build-storybook`. Configure Storybook to use `@storybook/sveltekit`, include `@storybook/addon-svelte-csf`, import the real app stylesheet in `.storybook/preview.ts`, and prepare a shared theme/global decorator that can force `light` or `dark` mode in stories without requiring SvelteKit route APIs.
  **Must NOT do**: Do not keep obsolete Storybook packages (`@storybook/svelte-vite`, standalone Vite builders, legacy `svelteOptions`); do not leave default demo stories or demo Playwright specs in place.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: multi-tool configuration across testing and story infrastructure.
  - Skills: [`frontend-ui-ux`] — why needed: Storybook needs to inherit the app’s actual CSS/theming instead of a disconnected default skin.
  - Omitted: [`playwright`] — why not needed: Playwright is being configured here, not yet used for browser verification.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6, 7 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/vitest.config.ts:1` — minimal Vitest baseline used by the reference app.
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/lib/stores/lists.store.test.ts:1` — example of Vitest mocking/assertion style in the reference codebase.
  - External: `https://svelte.dev/docs/cli/sv-add` — official multi-addon installation syntax.
  - External: `https://svelte.dev/docs/cli/vitest` — official Vitest add-on options.
  - External: `https://svelte.dev/docs/cli/playwright` — official Playwright add-on expectations.
  - External: `https://storybook.js.org/docs/9/get-started/frameworks/sveltekit` — Storybook framework package, SvelteKit mocks, and `svelteOptions` removal.
  - External: `https://storybook.js.org/docs/9/configure/styling-and-css` — import shared app CSS in `.storybook/preview.ts`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run test:unit -- --passWithNoTests` exits `0` with the baseline test setup in place.
  - [ ] `bun run test:e2e -- --list` exits `0` and enumerates the configured Playwright project(s).
  - [ ] `bun run build-storybook` exits `0` with `.storybook/main.ts` using `@storybook/sveltekit`.
  - [ ] No demo stories or example E2E specs remain in the repository after cleanup.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Test and story toolchain is runnable
    Tool: Bash
    Steps: Run `bun run test:unit -- --passWithNoTests`, `bun run test:e2e -- --list`, and `bun run build-storybook`.
    Expected: All commands exit `0`; Storybook builds with the SvelteKit framework; Playwright config is valid.
    Evidence: .sisyphus/evidence/task-3-tooling.txt

  Scenario: Legacy Storybook config is absent
    Tool: Bash
    Steps: Inspect `.storybook/main.ts` and `package.json` dependencies after setup.
    Expected: `framework` is `@storybook/sveltekit`, `@storybook/addon-svelte-csf` is enabled, and obsolete Svelte/Vite Storybook packages are not installed.
    Evidence: .sisyphus/evidence/task-3-storybook-config.txt
  ```

  **Commit**: YES | Message: `test(tooling): add vitest playwright and storybook` | Files: [`.storybook/**/*`, `playwright.config.*`, `vitest.config.*`, `package.json`, `tests/**/*`]

- [x] 4. Migrate TaskFlux shell tokens and theme foundation

  **What to do**: Replace the generic scaffold CSS with a TaskFlux-aligned `src/app.css` that includes the shell-relevant root tokens, dark tokens, sidebar tokens, `@theme inline` mappings, and base scrollbar/body styling from the reference app. Keep the palette scope intentionally narrow: preserve the default `zinc` light/dark appearance and the sidebar-specific variables, but do not port the full alternate theme palette matrix. Update `src/routes/+layout.svelte` so it imports `../app.css`, renders `<ModeWatcher />`, and provides the root shell render path required by shadcn-svelte dark mode docs.
  **Must NOT do**: Do not port TaskFlux’s custom theme store, theme palette dropdown, or extra palette variants (`neutral`, `stone`, `slate`, `gray`); do not split the global CSS across multiple competing files.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: exact visual-token migration and theming parity are the core of this task.
  - Skills: [`frontend-ui-ux`] — why needed: this is where the TaskFlux visual language is established.
  - Omitted: [`playwright`] — why not needed: the browser will be used later for interaction verification, not during token migration.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/app.css:1` — source of token names, sidebar variables, `@theme inline`, and base scrollbar/body styling.
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/routes/+layout.svelte:1` — root layout import pattern for `app.css`.
  - External: `https://www.shadcn-svelte.com/docs/theming` — CSS-variable theming model expected by shadcn-svelte.
  - External: `https://shadcn-svelte.com/docs/dark-mode/svelte` — `ModeWatcher` root integration pattern.
  - External: `https://www.shadcn-svelte.com/docs/components/sidebar` — sidebar-specific color variables required in global CSS.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run check` exits `0` after `src/app.css` and `src/routes/+layout.svelte` are updated.
  - [ ] `bun run build` exits `0` with `ModeWatcher` mounted in the root layout.
  - [ ] `src/app.css` contains `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, and `--sidebar-ring` tokens.
  - [ ] `src/routes/+layout.svelte` imports `../app.css` and renders `<ModeWatcher />` before children.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme foundation compiles
    Tool: Bash
    Steps: Run `bun run check` and `bun run build` after replacing `src/app.css` and updating `src/routes/+layout.svelte`.
    Expected: Both commands exit `0`; no missing CSS-variable, import, or ModeWatcher errors appear.
    Evidence: .sisyphus/evidence/task-4-theme-foundation.txt

  Scenario: Palette scope remains constrained
    Tool: Bash
    Steps: Inspect `src/app.css` for migrated variables and theme sections.
    Expected: Default zinc light/dark and sidebar tokens are present; alternate TaskFlux palette blocks are not copied wholesale.
    Evidence: .sisyphus/evidence/task-4-theme-scope.txt
  ```

  **Commit**: YES | Message: `feat(theme): migrate taskflux shell tokens` | Files: [`src/app.css`, `src/routes/+layout.svelte`]

- [x] 5. Implement the animated dark-mode toggle component

  **What to do**: Create a dedicated `ModeToggle` component that uses `mode-watcher` as the only mode authority and reproduces the TaskFlux `startViewTransition` radial reveal effect on click. Keep behavior as a strict `light ↔ dark` toggle, not the TaskFlux `system/light/dark` cycle. Reproduce the reference fallbacks: if reduced motion is enabled, if `document.startViewTransition` is unavailable, or if the next mode would not change the resolved appearance, switch mode immediately without animation. Add unit tests for storage/class changes and fallbacks, and add Storybook stories for light and dark states.
  **Must NOT do**: Do not introduce a parallel custom theme store, do not add a dropdown/system mode UI, and do not make animation a hard requirement for functional mode changes.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: combines interaction, theming, and animation fidelity.
  - Skills: [`frontend-ui-ux`] — why needed: preserves the TaskFlux motion feel rather than a generic icon swap.
  - Omitted: [`playwright`] — why not needed: this task’s primary verification is unit/story coverage; browser E2E comes later.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6, 7 | Blocked By: 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/lib/components/ModeSwitcher.svelte:1` — source of the radial reveal animation logic and reduced-motion/startViewTransition fallback behavior.
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/lib/stores/theme.svelte.ts:55` — reference for mode toggling intent, but do not port the store itself.
  - External: `https://shadcn-svelte.com/docs/dark-mode/svelte` — official `mode-watcher` API and toggle pattern.
  - External: `https://storybook.js.org/docs/9/essentials/toolbars-and-globals` — Storybook globals for forcing light/dark story states.
  - Test: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/lib/stores/lists.store.test.ts:1` — Vitest mocking style to follow.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run test:unit` exits `0` with tests covering normal toggle, reduced-motion fallback, and missing-`startViewTransition` fallback.
  - [ ] `bun run build-storybook` exits `0` with light and dark stories for the mode toggle.
  - [ ] The button exposes `aria-label="Toggle dark mode"` and renders with TaskFlux-style radial transition logic in the component source.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Toggle changes html class without animation support
    Tool: Bash
    Steps: Run `bun run test:unit` with a spec that stubs `document.startViewTransition = undefined`, clicks the toggle, and asserts the `<html>` class list changes between light and dark.
    Expected: The test passes and proves mode changes still occur without the View Transitions API.
    Evidence: .sisyphus/evidence/task-5-mode-toggle-unit.txt

  Scenario: Reduced motion disables radial animation path
    Tool: Bash
    Steps: Run `bun run test:unit` with a spec that mocks `prefers-reduced-motion: reduce`, clicks the toggle, and inspects that no transition animation branch is invoked.
    Expected: The test passes and mode still flips correctly while skipping the animated path.
    Evidence: .sisyphus/evidence/task-5-mode-toggle-reduced-motion.txt
  ```

  **Commit**: YES | Message: `feat(theme): add animated dark mode toggle` | Files: [`src/lib/components/app/mode-toggle.svelte`, `src/lib/components/app/mode-toggle.test.ts`, `src/lib/components/app/mode-toggle.stories.svelte`]

- [x] 6. Build the empty shell components and story states

  **What to do**: Extract the app shell into presentational components under `src/lib/components/app/`: `AppShell`, `AppSidebar`, `AppTopbar`, and `MainView`. Compose them using shadcn-svelte’s `Sidebar.Provider`, `Sidebar.Inset`, `Sidebar.Trigger`, and `Separator` patterns, but keep the actual sidebar and main-view content containers empty. The topbar must contain only the sidebar collapse button on the left and the dark-mode toggle on the right, with a flexible spacer between them. Standardize test selectors and accessibility hooks: `data-testid="app-shell"`, `data-testid="app-sidebar"`, `data-testid="app-topbar"`, `data-testid="main-view"`, `aria-label="Toggle sidebar"`, and `aria-label="Toggle dark mode"`. Add Storybook stories for desktop expanded, desktop collapsed, and mobile drawer-open shell states.
  **Must NOT do**: Do not add titles, breadcrumbs, placeholder nav links, logo text, empty-state copy, or any extra topbar actions; do not couple these presentational shell components directly to `$app/*` modules.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: this is the primary shell composition and responsive layout task.
  - Skills: [`frontend-ui-ux`] — why needed: the shell has to feel intentional and TaskFlux-aligned without drifting into boilerplate dashboard chrome.
  - Omitted: [`playwright`] — why not needed: stories and unit rendering are the first-line verification for this step.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/routes/(app)/+layout.svelte:75` — source of the sidebar provider/inset/header arrangement.
  - External: `https://www.shadcn-svelte.com/docs/components/sidebar` — official provider, inset, trigger, rail, and mobile behavior patterns.
  - External: `https://www.shadcn-svelte.com/blocks/sidebar` — shell-oriented sidebar block compositions and header placement guidance.
  - External: `https://storybook.js.org/docs/9/essentials/viewport` — Storybook viewport controls for mobile and desktop shell stories.
  - External: `https://storybook.js.org/docs/9/writing-stories/build-pages-with-storybook` — presentational shell/screen story composition guidance.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run test:unit` exits `0` with rendering tests that assert the presence of `app-shell`, `app-sidebar`, `app-topbar`, and `main-view` test ids.
  - [ ] `bun run build-storybook` exits `0` with at least three shell stories: desktop expanded, desktop collapsed, and mobile open.
  - [ ] `AppSidebar` and `MainView` render as empty containers with no seeded child content beyond structural wrappers required by shadcn-svelte.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Shell stories cover responsive states
    Tool: Bash
    Steps: Run `bun run build-storybook` after adding stories for desktop expanded, desktop collapsed, and mobile drawer-open states.
    Expected: Build exits `0`; generated story index contains the three shell state stories.
    Evidence: .sisyphus/evidence/task-6-shell-stories.txt

  Scenario: Structural containers stay empty
    Tool: Bash
    Steps: Run `bun run test:unit` with assertions that `data-testid="app-sidebar"` and `data-testid="main-view"` are present and empty of placeholder text or seeded items.
    Expected: The test passes and confirms no filler UI leaks into the shell.
    Evidence: .sisyphus/evidence/task-6-shell-emptiness.txt
  ```

  **Commit**: YES | Message: `feat(shell): add empty app shell components` | Files: [`src/lib/components/app/app-shell.svelte`, `src/lib/components/app/app-sidebar.svelte`, `src/lib/components/app/app-topbar.svelte`, `src/lib/components/app/main-view.svelte`, `src/lib/components/app/app-shell.test.ts`, `src/lib/components/app/app-shell.stories.svelte`]

- [x] 7. Wire the route, browser tests, and final runtime verification

  **What to do**: Mount the presentational shell at the root route so `/` renders the final app skeleton. Keep the route wrapper thin: it should render the `AppShell` and no business content. Add Playwright specs for desktop and mobile viewport behavior, asserting shell render, sidebar collapse/expand, mobile drawer open/close, and light/dark toggle behavior. Use the exact selectors defined in Task 6, and record at least one screenshot artifact for the default shell and one for dark mode. Ensure Storybook and dev server both consume the same CSS/theming setup, and remove any remaining starter/demo route content.
  **Must NOT do**: Do not create extra pages, do not add mock business data, and do not rely on pixel-perfect assertions for the animation itself.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: integrates routing, runtime behavior, and full browser verification.
  - Skills: [`playwright`, `frontend-ui-ux`] — why needed: Playwright is mandatory for browser automation; UI skill keeps final shell parity aligned while wiring the route.
  - Omitted: [`git-master`] — why not needed: no git action is part of this task.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: final verification wave | Blocked By: 3, 5, 6

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/routes/(app)/+layout.svelte:78` — header/main split inside the inset area.
  - Pattern: `/Users/realxlfd/Desktop/RustArk/TaskFlux/frontend/src/routes/+layout.svelte:1` — root layout CSS import pattern.
  - External: `https://www.shadcn-svelte.com/docs/components/sidebar` — official sidebar mobile/desktop behavior and trigger usage.
  - External: `https://storybook.js.org/docs/9/get-started/frameworks/sveltekit` — story mocks if any thin route wrapper touches SvelteKit-specific modules.
  - External: `https://shadcn-svelte.com/docs/dark-mode/svelte` — expected light/dark class behavior via `mode-watcher`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bun run test:e2e` exits `0` with Playwright tests for desktop expanded/collapsed state, mobile drawer behavior, and dark-mode toggle.
  - [ ] `bun run dev -- --host 127.0.0.1 --port 4173` serves `/`, and a Playwright smoke flow confirms no hydration/runtime errors in the browser console.
  - [ ] `bun run storybook -- --ci --port 6006` starts successfully and serves the shell stories using the shared app CSS.
  - [ ] Screenshot evidence is captured for the default shell and dark-mode shell states.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Desktop shell interactions work end-to-end
    Tool: Playwright
    Steps: Start `bun run dev -- --host 127.0.0.1 --port 4173`; open `http://127.0.0.1:4173/`; assert `[data-testid="app-shell"]`, `[data-testid="app-topbar"]`, `[data-testid="app-sidebar"]`, and `[data-testid="main-view"]` exist; click `button[aria-label="Toggle sidebar"]`; verify sidebar width/state changes; click `button[aria-label="Toggle dark mode"]`; verify `<html>` toggles the `dark` class; capture screenshots before and after mode change.
    Expected: All assertions pass, the sidebar responds to the trigger, dark mode toggles without console errors, and screenshots are saved.
    Evidence: .sisyphus/evidence/task-7-shell-desktop.png

  Scenario: Mobile drawer fallback works and console stays clean
    Tool: Playwright
    Steps: Run the same dev server; emulate a mobile viewport; open `/`; click `button[aria-label="Toggle sidebar"]`; verify the sidebar opens as an off-canvas surface and closes cleanly; collect browser console messages during the flow.
    Expected: The mobile sidebar opens and closes successfully; no uncaught runtime or hydration errors appear in the console log.
    Evidence: .sisyphus/evidence/task-7-shell-mobile.png
  ```

  **Commit**: YES | Message: `test(shell): verify routed shell interactions` | Files: [`src/routes/+page.svelte`, `e2e/app-shell.spec.ts`, `.storybook/preview.ts`]

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Runtime QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `chore: scaffold bun sveltekit app with tailwind and shadcn baseline`
- Commit 2: `test: add vitest playwright and storybook tooling`
- Commit 3: `feat: migrate shell theme tokens and dark-mode foundation`
- Commit 4: `test: cover mode state and shell rendering behavior`
- Commit 5: `feat: add empty app shell with collapsible sidebar and topbar controls`
- Commit 6: `test: add e2e and stories for shell interactions`

## Success Criteria
- The workspace becomes a runnable Bun-managed SvelteKit frontend instead of an empty directory.
- The shell at `/` matches the requested structure and TaskFlux visual language without introducing extra product content.
- The dark-mode toggle preserves TaskFlux-style animated transition while remaining robust under unsupported-browser and reduced-motion conditions.
- Storybook becomes the canonical story surface for shell components and shell states.
- All scripted verification passes without human intervention.
