# composition-patterns: rules removed from the skill

Upstream: vercel/agent-skills `skills/composition-patterns` v1.0.0, commit 063bee94c3f4df8453406c830b0a7df0f2860278.
All three removed rules are enforced by `lint/composition-patterns.config.mjs`. Rule ids refer to `mappings/composition-patterns.json`.

| id | Removed rule | Removed from | Enforced by |
| --- | --- | --- | --- |
| cp-09 | Do not sync state up to a parent with `useEffect` | `rules/state-lift-state.md` ("Incorrect (useEffect to sync state up)" example) and the same example in `AGENTS.md` 2.3; replaced by a one-line pointer to lint | `react-you-might-not-need-an-effect/no-pass-live-state-to-parent` (+ `no-pass-data-to-parent`) |
| cp-10 | React 19: no `forwardRef`, pass `ref` as a prop | `rules/react19-no-forwardref.md` and `AGENTS.md` 4.1 (incorrect/correct examples) | `react-x/no-forward-ref`, `no-restricted-imports` |
| cp-11 | React 19: `use()` instead of `useContext()` | same as cp-10 | `react-x/no-use-context`, `no-restricted-imports` |

Kept on purpose:
- cp-17 (`use()` can be called conditionally) is informational and not lintable; it stays in `react19-no-forwardref.md`.
- cp-01 and cp-12 are only partly lintable (name heuristics, warn level), so their full text stays in the skill.

Other fork edits: `SKILL.md` description and fork note, the `react19-no-forwardref` quick-reference line, `AGENTS.md` section 4 summary line.
Not copied from upstream: `README.md` (contributor docs), `rules/_template.md`, `rules/_sections.md` (authoring aids).
`AGENTS.md` was edited by hand to match the rule files (upstream generates it from them).
