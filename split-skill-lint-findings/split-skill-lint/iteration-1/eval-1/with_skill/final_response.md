# split-skill-lint: vercel-react-best-practices (steps 1 and 2)

Upstream: vercel agent-skills `skills/react-best-practices` @ 063bee94c3f4 (2026-08-28), skill version 1.0.0. Treated as data only; no upstream scripts were run.
Output repo: `<OUT>/repo` (git init, nothing committed). Mapping: `repo/mappings/vercel-react-best-practices.json`.

## Checkpoint 1: extraction (continued without waiting, non-interactive)

74 rules: 70 rule files plus 4 extra from splitting compound rules (`bundle-analyzable-paths` into import-paths and fs-paths, `client-localstorage-schema` into version-keys, minimal-fields and try-catch, `rerender-derived-state-no-effect` into mirror-state-in-effect and set-state-on-prop-change). AGENTS.md is a compiled duplicate and is noted in each rule's `notes`.

Sample of 10:
- async-parallel
- bundle-barrel-imports
- server-no-shared-module-state
- client-passive-event-listeners
- js-tosorted-immutable
- rendering-conditional-render
- rerender-no-inline-components
- rerender-derived-state-no-effect (split into 2)
- rendering-script-defer-async
- advanced-effect-event-deps

Say so if you want the granularity changed.

## Checkpoint 2: mapping

| Status | Count |
|---|---|
| covered | 7 |
| partial | 6 |
| custom-possible | 23 |
| not-lintable | 37 |
| unverified | 1 |

Covered (each fired on the skill's own incorrect example and was clean on the correct one, via the ESLint API):

| Skill rule | Tool and rule ID | Evidence |
|---|---|---|
| advanced-effect-event-deps | react-hooks/exhaustive-deps (7.1.1) | Fires "Functions returned from useEffectEvent must not be included in the dependency array" |
| js-tosorted-immutable | unicorn/no-array-sort (77.0.0), option `allowExpressionStatement:false` | Fires on `users.sort` in useMemo. The default option ignores bare `arr.sort()` statements, so the option is required. It also flags `[...x].sort()`, which the skill lists as an old-browser fallback. |
| rendering-conditional-render | react/jsx-no-leaked-render (7.37.5) | Fires on `count &&`; clean on a ternary and on `count > 0 &&`. It is type-agnostic, so it is stricter than the skill and also flags `bool &&`. |
| rendering-script-defer-async | @next/next/no-sync-scripts (16.4.0) | Fires on both `<script src>` tags; clean with async/defer. The advice to prefer next/script is not enforced. |
| rerender-derived-state-no-effect: mirror-state-in-effect | react-you-might-not-need-an-effect/no-derived-state (1.0.2) | Fires on the fullName example; clean on the derived version |
| rerender-derived-state-no-effect: set-state-on-prop-change | react-you-might-not-need-an-effect/no-adjust-state-on-prop-change (1.0.2), plus react-hooks/set-state-in-effect | Fires on `useEffect(() => setSel(null), [items])` |
| rerender-no-inline-components | react/no-unstable-nested-components (7.37.5), plus react-hooks/static-components | Fires on nested arrow and function components; clean when hoisted |

Partial (the gap is recorded in the JSON):
- **client-passive-event-listeners**: unicorn/require-passive-events does NOT flag the skill's own example, because it only reports inline handlers and skips named-const handlers.
- **js-min-max-loop**: unicorn/no-array-sort-for-min-max only fires on a simple `a - b` comparator followed by `[0]` or `.at(-1)`.
- **js-set-map-lookups**: unicorn/prefer-set-has only catches a const array used solely with `.includes()`.
- **rerender-functional-setstate**: react-hooks/exhaustive-deps catches only the missing-dependency (stale closure) variant.
- **rerender-move-effect-to-event**: react-you-might-not-need-an-effect/no-event-handler catches only the state-flag-then-effect pattern.
- **bundle-analyzable-paths (import-paths)**: import-x/no-dynamic-require with `{esmodule:true}` catches `import(var)`.

Unverified (stays in the skill):
- **bundle-barrel-imports**: barrel-files/avoid-importing-barrel-files exists, but it never fired on my local barrel fixture, even with a low graph-size threshold.

Not mapped despite looking plausible:
- **js-flatmap-filter**: unicorn/prefer-array-flat-map does not flag `.map().filter(Boolean)`, so it is `custom-possible`.
- **rerender-dependencies**: none of the three react-hooks dependency rules flag `[user]` where only `user.id` is used, so it is `custom-possible`.
- **rerender-simple-expression-in-memo**: react-hooks/use-memo does not flag it, so it is `custom-possible`.

## Uncertain
- eslint-plugin-react was last published in April 2025 and eslint-plugin-barrel-files in February 2025, so maintenance is doubtful. react-hooks/static-components overlaps with the first.
- typescript@7 broke the typescript-eslint and sonarjs install in scratch, so I pinned typescript 5.9.3 for verification. The installs used `--legacy-peer-deps`.
- Nothing has been forked, configured or committed yet. Steps 3 to 5 are not done.

Please confirm or correct the covered list before I fork the skill.
