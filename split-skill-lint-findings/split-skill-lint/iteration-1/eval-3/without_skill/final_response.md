# composition-patterns split: summary

Repo: `outputs/repo` (two commits: seed, then the fork). demo-skill untouched; only `lint/eslint.config.mjs`, `lint/package.json` and `README.md` were edited in the seed (registration, dependency merge, list).

## Checkpoint 1 (auto-approved): 17 rules extracted
Sample (id, rule, source): cp-01 no boolean mode props (architecture-avoid-boolean-props.md); cp-02 compound components with shared context; cp-05 only the provider knows state management (state-decouple-implementation.md); cp-06 generic state/actions/meta context interface; cp-08 lift state into providers; cp-09 no useEffect state sync to parent (state-lift-state.md); cp-10 no forwardRef (React 19); cp-11 use() not useContext(); cp-12 children over renderX props; cp-14 explicit variant components. Full list: `mappings/composition-patterns.json`.

## Checkpoint 2 (auto-approved): mapping, all rule IDs verified by installing plugins in `scratch/` and running fixtures
Counts: covered 3, partial 2, custom-possible 0, not-lintable 12, unverified 0.
Covered: cp-09 `react-you-might-not-need-an-effect/no-pass-live-state-to-parent`; cp-10 `react-x/no-forward-ref`; cp-11 `react-x/no-use-context` (plus core `no-restricted-imports` for both).
Partial (warn heuristics via core `no-restricted-syntax`): cp-01 boolean props, cp-12 renderX props.
Verified: skill's incorrect examples trigger errors; correct code passes; the merged config also runs under the repo's pinned eslint 9.0.0.

## Result
- Removed from skill text: 3 rules (effect-sync example, forwardRef, useContext). SKILL.md/AGENTS.md/rules edited consistently; fork note + upstream version (v1.0.0, commit 063bee9) added to the description.
- Size: SKILL.md + AGENTS.md + rules went from 46,511 to 45,670 bytes (about 1.8% shorter; 1,905 to 1,830 lines). Small because 12 of 17 rules are design guidance that lint cannot check, and AGENTS.md duplicates the rules.
- Files: `lint/composition-patterns.config.mjs`, `lint/tsconfig.base.json` (new; seed had none), `lint/package.json` (merged, pinned), `lint/runtime-checks.md`, `mappings/composition-patterns.json`, `mappings/composition-patterns.removed.md`, README.

## Uncertainties
- react-x rules only fire when the react-x version setting is 19+; React 18 projects must drop cp-10/11.
- cp-09 misses callbacks reached via context or other indirection.
- cp-01/cp-12 heuristics are name-based and will produce false positives (renderItem is legitimate).
- AGENTS.md was hand-edited (upstream generates it); upstream README.md, _template.md, _sections.md were not copied.
- python3 was unusable (Xcode license), so edits were done with node. Upstream scripts were not run.
