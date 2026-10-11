# split-skill-lint: vercel-react-best-practices

Repo: `<OUT>/repo` (git, one commit). Upstream: vercel-labs/agent-skills `skills/react-best-practices` @ 063bee9 (2026-08-28), skill v1.0.0. Upstream was read only, no scripts run.

## Checkpoint 1: extraction (auto-continued)
70 rules, one per `rules/*.md` file (matches SKILL.md "70 rules"; AGENTS.md is the compiled duplicate of the same rules, so it was forked in step 3, not counted again; `_sections.md` and `_template.md` are not rules). Sample of 10: async-parallel, bundle-barrel-imports, server-auth-actions, client-passive-event-listeners, rerender-no-inline-components, rerender-derived-state-no-effect, rendering-conditional-render, js-tosorted-immutable, js-hoist-regexp, advanced-effect-event-deps. Granularity: upstream is already one checkable rule per file, kept as is. Approved per the task.

## Checkpoint 2: mapping (auto-continued)
Counts: covered 6, partial 2, custom-possible 21, not-lintable 41, unverified 0.

Covered (all verified by running the skill's bad and good examples through ESLint 9.39.5; each fired on bad, clean on good):
| Skill rule | Tool / rule | Evidence |
|---|---|---|
| rerender-no-inline-components | react/no-unstable-nested-components (eslint-plugin-react 7.37.5) | fires on both inline components |
| rendering-conditional-render | react/jsx-no-leaked-render (default options) | fires on `count && <span/>`; also flags `boolean && X` (not type-aware), accepts `!!n &&` |
| rerender-derived-state-no-effect | react-you-might-not-need-an-effect/no-derived-state + no-adjust-state-on-prop-change (1.0.2) | fires on fullName effect and on setState-on-prop-change snippet |
| rerender-move-effect-to-event | react-you-might-not-need-an-effect/no-event-handler (1.0.2) | fires on submitted-state + effect example |
| rendering-script-defer-async | @next/next/no-sync-scripts (16.4.0) | fires on both `<script src>` without async/defer |
| advanced-effect-event-deps | react-hooks/exhaustive-deps (7.1.1) | message names useEffectEvent explicitly |

Partial (kept in the fork): js-tosorted-immutable (unicorn/no-array-sort also flags the `[...arr].sort()` fallback the skill allows; toSpliced/with not covered), js-set-map-lookups (unicorn/prefer-set-has only catches const arrays used solely with `.includes`).

Tested and found NOT to cover (stay in skill): rerender-dependencies (exhaustive-deps does not flag `[user]`), js-flatmap-filter (prefer-array-flat-map is a different pattern), async-parallel (no-await-in-loop does not flag), rerender-simple-expression-in-memo (react-hooks/use-memo silent), rerender-memo-with-default-value, rerender-lazy-state-init, js-hoist-regexp.

## Steps 3-5
- Fork `skills/vercel-react-best-practices`: removed the 6 covered rule files, their SKILL.md quick-reference entries, their AGENTS.md TOC entries and sections (remaining sections in categories 5, 6, 8 renumbered, anchors updated); count 70 to 64; description extended with fork note. No cross-references to removed rules existed.
- `lint/`: `vercel-react-best-practices.config.mjs` (9 rule IDs for the 6 covered + 2 partial skill rules, each commented), `eslint.config.mjs`, `package.json` (exact pins), `tsconfig.base.json` (no flags needed, empty), `runtime-checks.md` (nothing to list).
- Validated in scratch: `npm install` from lint/package.json, `eslint --print-config` resolves all 9 rule IDs, and linting the fixtures reproduces the fire/clean results.
- `mappings/vercel-react-best-practices.json` (70 entries), `.removed.md`, `README.md`, `.gitignore`.

## Final summary
- Rules removed: 6 of 70 (8.6%).
- Size (words / lines): SKILL.md 948 / 149 to 933 / 143 (words nearly flat because the fork notice in the description adds about 60 words); AGENTS.md 13174 / 3810 to 12119 / 3512; whole skill dir (rules + SKILL + AGENTS + README + metadata) 28547 words / 8096 lines / 230 KB to 26312 / 7461 / 212 KB, roughly 57.6k to 53.0k tokens by the 4-bytes-per-token rule of thumb (estimate, not measured). Reduction is about 8%; rules/ and AGENTS.md duplicate each other, so an agent loads one of them.
- Status counts: covered 6, partial 2, custom-possible 21, not-lintable 41, unverified 0.

Uncertain / not verified:
- Lint coverage is small because most of this skill is performance judgment; the 21 custom-possible rules were only sketched, not built.
- Search was not exhaustive: I checked eslint-plugin-react, react-hooks (incl. compiler rules), next, unicorn, react-perf, sonarjs, ryn, typescript-eslint, and core rules, not every plugin, so some `custom-possible` rules may have an existing rule I did not find.
- jsx-no-leaked-render over-reports on boolean-typed conditions (no type info); no-event-handler is heuristic and may miss variants of the pattern; no-array-sort will flag the skill-approved spread fallback.
- eslint-plugin-unicorn pinned to 63 (later versions need ESLint >= 10.4, eslint-plugin-react supports <= 9); eslint-plugin-react-you-might-not-need-an-effect is a young, single-maintainer plugin (v1.0.2), so its maintenance is the main doubt. react-hooks 7 is new; rule behavior should be re-checked on upgrade.
- Plugin docs are not shipped in the npm packages for several plugins, so evidence is the snippet runs plus rule messages, not doc text.
- Upstream's stale "40+ rules" in AGENTS.md abstract and metadata.json left untouched.
