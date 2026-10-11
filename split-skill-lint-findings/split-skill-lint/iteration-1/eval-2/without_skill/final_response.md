# Split of vercel-react-best-practices into skill + lint config

Repo: `outputs/repo` (fresh git repo, 1 commit). Upstream was treated as data only: no upstream script was run; plugins were installed with `--ignore-scripts` in a scratch folder.

## Checkpoint 1 - rule extraction (auto-continued)

70 rules (one per `rules/*.md`, excluding `_template.md` and `_sections.md`) across 8 sections: async 6, bundle 6, server 10, client 4, rerender 15, rendering 11, js 14, advanced 4. Granularity: one rule per upstream rule file (some files hold two sub-rules, e.g. import vs fs paths in bundle-analyzable-paths; these are tracked in the gap column).

Sample of 10 (id - statement - source):
1. async-parallel - Use Promise.all() for independent async operations - rules/async-parallel.md#Promise.all() for Independent Operations
2. bundle-barrel-imports - Import from source files, not barrel files - rules/bundle-barrel-imports.md#Avoid Barrel File Imports
3. server-auth-actions - Authenticate/authorize inside every Server Action - rules/server-auth-actions.md
4. client-passive-event-listeners - Add { passive: true } to touch/wheel listeners that do not preventDefault - rules/client-passive-event-listeners.md
5. rerender-no-inline-components - Do not define components inside components - rules/rerender-no-inline-components.md
6. rendering-conditional-render - Ternary instead of && when the condition can be 0/NaN - rules/rendering-conditional-render.md
7. js-tosorted-immutable - Use toSorted() instead of sort() - rules/js-tosorted-immutable.md
8. js-hoist-regexp - Hoist RegExp creation out of render/loops - rules/js-hoist-regexp.md
9. advanced-effect-event-deps - Do not put useEffectEvent results in dependency arrays - rules/advanced-effect-event-deps.md
10. rendering-script-defer-async - Script tags need defer or async - rules/rendering-script-defer-async.md

(Full list: `mappings/vercel-react-best-practices.json`.)

## Checkpoint 2 - mapping (auto-continued; approved on condition that every covered rule was verified)

All rule IDs were checked by installing 13 plugins (react-hooks 7.1.1, @eslint-react 5.26.0, react 7.37.5, @next/next 16.4.0, unicorn 77.0.0, barrel-files 3.0.1, react-perf, react-you-might-not-need-an-effect 1.0.2, promise, regexp, import-x, n, typescript-eslint 8.71.1) and by (a) a differential scan of all ~1,000 rules against the upstream incorrect/correct snippets, then (b) targeted behaviour tests per candidate. Verification caught several wrong guesses: `unicorn/require-passive-events` and `@eslint-react/use-state` do not catch the upstream example forms, `unicorn/no-array-sort-for-min-max` misses the sorted-copy-in-a-variable form, `react/no-object-type-as-default-prop` does not see `memo(function ...)`, and `barrel-files/avoid-importing-barrel-files` needs a low `maxModuleGraphSizeAllowed` for local barrels and aborts natively on barrels with unresolvable deps. Those became `partial` (kept in the skill) or were dropped.

Counts: covered 8, partial 7, custom-possible 6, not-lintable 49, unverified 0 (total 70).

Covered (removed from skill), each verified bad-fires / good-clean:
- advanced-effect-event-deps -> react-hooks/exhaustive-deps
- js-tosorted-immutable -> unicorn/no-array-sort (+ no-array-reverse)
- rendering-conditional-render -> @eslint-react/no-leaked-conditional-rendering (type-aware)
- rendering-script-defer-async -> @next/next/no-sync-scripts
- rerender-derived-state-no-effect -> react-you-might-not-need-an-effect/no-derived-state, no-adjust-state-on-prop-change
- rerender-memo-with-default-value -> @eslint-react/no-unstable-default-props
- rerender-move-effect-to-event -> react-you-might-not-need-an-effect/no-event-handler
- rerender-no-inline-components -> react/no-unstable-nested-components, react-hooks/static-components

Partial (stay in skill): bundle-barrel-imports, client-passive-event-listeners, js-min-max-loop, js-set-map-lookups, rerender-functional-setstate, rerender-lazy-state-init, server-no-shared-module-state.
Custom-possible (stay): async-cheap-condition-before-await, bundle-analyzable-paths, client-localstorage-schema, js-flatmap-filter, js-hoist-regexp, rerender-simple-expression-in-memo (selectors verified in `mappings/*.verification.md`, not shipped).

## Steps 3-5 (fork, lint config, docs)

- Fork: `skills/vercel-react-best-practices/` - 8 rule files and their quick-reference bullets removed; description now carries the fork note + upstream version (v1.0.0, commit 063bee9); body says 62 rules and points to the lint config. Not carried: AGENTS.md (generated 108 KB compile of all 70 rules), upstream README/metadata.json, `_template.md`.
- Lint: `lint/vercel-react-best-practices.config.mjs` (flat config, comment per rule linking to the skill rule; covered rules + 6 partial rules enabled, barrel rule shipped "off" with explanation), `lint/eslint.config.mjs` (registry), `lint/tsconfig.base.json`, `lint/package.json` (exact pins), `lint/runtime-checks.md`, `lint/verify/vercel-react-best-practices.verify.mjs`.
- Docs: `mappings/vercel-react-best-practices.json`, `.removed.md`, `.verification.md`, `README.md` (fork table, must-use-with-lint statement, re-run instructions).
- Re-validated from a clean copy of `lint/`: `npm install` with the pinned versions, the verify script (all cases PASS incl. real lucide-react barrel), and `eslint` with the registered config on a fixture file (fired no-derived-state, no-unstable-nested-components, no-leaked-conditional-rendering, static-components, no-array-sort).

## Final summary

- Removed: 8 of 70 rules (11%).
- Size: rule files 110,590 B -> 97,750 B (-11.6%, -12,840 B); SKILL.md 7,251 -> 7,374 B (+123 B from the fork note, net of bullets removed). Upstream's AGENTS.md (108,261 B) is dropped entirely, so if an agent loaded it before, the load falls by about 108 KB; compared with SKILL.md + all rules the saving is ~10.8%. Honest takeaway: with this skill only ~11% of rules are cleanly lintable; most of it is judgement/architecture guidance.
- Uncertainties:
  1. "Covered" means the lint rule fires on the upstream incorrect examples and stays quiet on the correct ones; it does not prove no false negatives elsewhere (e.g. no-event-handler is heuristic; no-leaked-conditional-rendering needs type-aware linting and does not flag `string &&`).
  2. rerender-memo-with-default-value: the lint rule is stricter (also flags non-memoized components). rerender-derived-state-no-effect: the "keyed reset" advice is not enforced.
  3. js-tosorted-immutable: the old-browser spread fallback note disappeared with the rule; tsconfig lib must include ES2023.
  4. Several plugin versions here (typescript-eslint 8.71.1, unicorn 77, eslint-react 5.26, TypeScript 7 was auto-installed by npm and replaced by 5.9.3 for type-aware linting) are newer than my background knowledge, so all behaviour claims rest on the tests, not memory.
  5. eslint-plugin-barrel-files can abort ESLint natively on barrels with unresolvable deps (seen with @mui/material); hence "off" by default.
  6. Other skill files untouched (only this repo exists); fixtures/tests used synthetic snippets derived from upstream examples, not real codebases.
- Runtime checks (bundle size, traces, hydration, SVGO) are listed but not executed.
