# vercel-react-best-practices: extraction and mapping (steps 1 and 2)

I stopped after step 2 as asked. Nothing has been forked or removed yet.

## Step 1: extraction
- Upstream: `vercel-labs/agent-skills`, `skills/react-best-practices`, version 1.0.0 (January 2026).
- 70 rules, one per file in `rules/` (the two `_`-prefixed files are not rules). Each has a short checkable statement and a source (file plus heading) in the mapping JSON.
- I only read upstream files. I did not run any of its scripts.
- Sample of 10 (spread across the list):
  1. advanced-effect-event-deps: Do not include a useEffectEvent function in a useEffect dependency array.
  2. async-dependencies: Use `better-all` for operations with partial dependencies instead of chained Promise.all.
  3. bundle-preload: Preload heavy bundles on hover/focus before they are needed.
  4. js-cache-storage: Cache localStorage/sessionStorage/document.cookie reads in memory.
  5. js-min-max-loop: Do not sort an array to find min/max; use a single loop.
  6. rendering-hoist-jsx: Static JSX elements must be hoisted out of component functions.
  7. rerender-dependencies: Effect dependency arrays should use primitives, not whole objects.
  8. rerender-move-effect-to-event: Run user-action side effects in the event handler, not via state + effect.
  9. server-after-nonblocking: Use after() for non-blocking logging/analytics after response.
  10. server-parallel-nested-fetching: Chain dependent nested fetches inside each item promise within Promise.all.

## Step 2: mapping to existing lint rules
I installed the plugins in a scratch folder and read each rule ID from the loaded plugin. None came from memory. I then ran each candidate rule on the upstream Incorrect and Correct code blocks, or on my own fixtures where the snippets were fragments.

| Status | Count |
|---|---|
| covered | 9 |
| partial | 5 |
| custom-possible | 20 |
| not-lintable | 36 |
| unverified | 0 |

### Covered (9)
| Skill rule | ESLint rule(s) |
|---|---|
| advanced-effect-event-deps | react-hooks/exhaustive-deps |
| js-set-map-lookups | unicorn/prefer-set-has |
| js-tosorted-immutable | unicorn/no-array-sort |
| rendering-conditional-render | react/jsx-no-leaked-render (validStrategies: ["ternary"]) |
| rendering-script-defer-async | @next/next/no-sync-scripts |
| rerender-derived-state-no-effect | react-you-might-not-need-an-effect/no-derived-state, no-adjust-state-on-prop-change; react-hooks/set-state-in-effect |
| rerender-memo-with-default-value | react/no-object-type-as-default-prop; @eslint-react/no-unstable-default-props |
| rerender-move-effect-to-event | react-you-might-not-need-an-effect/no-event-handler |
| rerender-no-inline-components | react/no-unstable-nested-components (also @eslint-react/no-nested-component-definitions, react-hooks/static-components) |

### Partial (5), so these stay in the skill
- bundle-barrel-imports: barrel-files/avoid-barrel-files only flags declaring a barrel. It did not flag a local barrel import in my fixture. Third-party barrels need a no-restricted-imports list.
- client-passive-event-listeners: unicorn/require-passive-events did not flag the upstream example. It only flags inline handlers that merely read event properties.
- js-min-max-loop: unicorn/no-array-sort-for-min-max only flags `.sort((a,b)=>a-b).at(-1)`. It did not flag the upstream examples.
- rerender-lazy-state-init: @eslint-react/use-state flags `useState(fn())` and `useState(new Map())`. It does not flag `useState(JSON.parse(...))`.
- server-no-shared-module-state: react-hooks/globals only catches reassignment inside components and hooks.

### Other notes
- 20 rules are custom-possible. They have no existing rule (for example useMemo-for-simple-expressions and hoisting RegExp). I checked that react-hooks/use-memo and unicorn/prefer-array-flat-map do not catch the upstream examples.
- 36 rules are not-lintable: architecture, library choice or performance judgement.
- Uncertainty: rendering-conditional-render uses a non-type-aware rule that is stricter than upstream. It also flags `&&` on booleans. @eslint-react/no-leaked-conditional-rendering is the type-aware alternative, and its ID exists, but I did not test its behaviour.
- Uncertainty: the upstream snippets for rerender-memo-with-default-value and js-set-map-lookups are fragments. For those I verified with my own fixtures.
- Scratch tooling note: typescript-eslint 8.71 does not work with TypeScript 7, so I pinned TypeScript 5.9 in scratch. The config step will need a compatible TypeScript pinned.

Mapping file: `repo/mappings/vercel-react-best-practices.json` (git repo initialised, nothing committed).

Next is step 3, forking the skill and removing the 9 covered rules. Say if you want to continue.
