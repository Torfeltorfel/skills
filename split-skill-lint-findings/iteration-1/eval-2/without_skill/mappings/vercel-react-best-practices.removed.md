# Rules removed from the vercel-react-best-practices fork

Upstream: vercel-labs/agent-skills `skills/react-best-practices` v1.0.0, commit 063bee94c3f4df8453406c830b0a7df0f2860278.
These 8 of 70 rules are completely enforced by the listed lint rules (each verified by installing the plugin and running it on the upstream incorrect/correct examples, see `vercel-react-best-practices.verification.md`). They were deleted from `skills/vercel-react-best-practices/` (SKILL.md quick reference + rule file). Enable `lint/vercel-react-best-practices.config.mjs` to get them.

## advanced-effect-event-deps

- Rule: Do not include useEffectEvent results in effect dependency arrays
- Upstream source: `rules/advanced-effect-event-deps.md#Do Not Put Effect Events in Dependency Arrays` (impact LOW)
- Enforced by: eslint-plugin-react-hooks -> `react-hooks/exhaustive-deps`
- Known gap / caveat: Requires eslint-plugin-react-hooks >= 6.1 (verified with 7.1.1)
- Verification: Verified on the upstream ChatRoom example

## js-tosorted-immutable

- Rule: Use toSorted() instead of sort() (and other non-mutating methods)
- Upstream source: `rules/js-tosorted-immutable.md#Use toSorted() Instead of sort() for Immutability` (impact MEDIUM-HIGH)
- Enforced by: eslint-plugin-unicorn -> `unicorn/no-array-sort, unicorn/no-array-reverse`
- Known gap / caveat: Needs lib ES2023 in tsconfig; the Array spread fallback note for old runtimes is dropped with the rule
- Verification: Verified: sort()/reverse() flagged, toSorted()/toReversed() clean

## rendering-conditional-render

- Rule: Use ternaries, not &&, when the condition can be 0/NaN
- Upstream source: `rules/rendering-conditional-render.md#Use Explicit Conditional Rendering` (impact LOW)
- Enforced by: @eslint-react/eslint-plugin -> `@eslint-react/no-leaked-conditional-rendering`
- Known gap / caveat: Type-aware: requires typed linting (parserOptions.projectService) and strictNullChecks
- Verification: Verified: `count: number && <X/>` flagged; ternary and boolean && clean. String-typed && is NOT flagged by default

## rendering-script-defer-async

- Rule: Script tags need defer or async
- Upstream source: `rules/rendering-script-defer-async.md#Use defer or async on Script Tags` (impact HIGH)
- Enforced by: @next/eslint-plugin-next -> `@next/next/no-sync-scripts`
- Known gap / caveat: Next.js-specific; the "prefer next/script" note is advice, not enforced
- Verification: Verified: `<script src>` flagged; defer/async clean

## rerender-derived-state-no-effect

- Rule: Derive values during render; do not mirror props/state into state via effects
- Upstream source: `rules/rerender-derived-state-no-effect.md#Calculate Derived State During Rendering` (impact MEDIUM)
- Enforced by: eslint-plugin-react-you-might-not-need-an-effect -> `react-you-might-not-need-an-effect/no-derived-state, react-you-might-not-need-an-effect/no-adjust-state-on-prop-change`
- Known gap / caveat: Keyed-reset suggestion is not enforced (react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change did not fire on a test snippet, so it is not relied on)
- Verification: Verified: fullName mirror and setSelection(null)-on-prop-change flagged, derived/clean forms not

## rerender-memo-with-default-value

- Rule: Hoist non-primitive default prop values of memoized components to constants
- Upstream source: `rules/rerender-memo-with-default-value.md#Extract Default Non-primitive Parameter Value from Memoized Component to Constant` (impact MEDIUM)
- Enforced by: @eslint-react/eslint-plugin -> `@eslint-react/no-unstable-default-props`
- Known gap / caveat: Also flags non-memoized components (stricter than the rule); no memo-only detection
- Verification: react/no-object-type-as-default-prop was tested and does NOT detect memo(function ...) wrapped components, so it is not used

## rerender-move-effect-to-event

- Rule: Run user-action side effects in the event handler, not via state + effect
- Upstream source: `rules/rerender-move-effect-to-event.md#Put Interaction Logic in Event Handlers` (impact MEDIUM)
- Enforced by: eslint-plugin-react-you-might-not-need-an-effect -> `react-you-might-not-need-an-effect/no-event-handler`
- Known gap / caveat: Heuristic: only the state-flag-then-effect shape is detected
- Verification: Verified on the upstream submitted/useEffect example; handler version clean

## rerender-no-inline-components

- Rule: Do not define components inside components
- Upstream source: `rules/rerender-no-inline-components.md#Don't Define Components Inside Components` (impact HIGH)
- Enforced by: eslint-plugin-react / eslint-plugin-react-hooks -> `react/no-unstable-nested-components, react-hooks/static-components`
- Known gap / caveat: Props-passing advice is implied, not enforced
- Verification: Both tools verified on the upstream Avatar/Stats example

## Non-rule files not carried into the fork

- `AGENTS.md` (generated compile of all 70 rules, 108 KB; it would re-introduce the removed rules and duplicate every remaining rule)
- `README.md`, `metadata.json` (upstream build tooling docs; `src/` scripts are not part of the skill)
- `rules/_template.md` (authoring template)
- `rules/_sections.md` was kept.
