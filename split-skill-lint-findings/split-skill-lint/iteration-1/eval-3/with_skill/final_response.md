# composition-patterns split (second skill in repo)

Repo: OUT/repo (seed copied, git init, commits: seed, then "Add composition-patterns split"). demo-skill untouched; only lint/eslint.config.mjs (import + spread), lint/package.json (added typescript, typescript-eslint), README.md (list entry) were changed.
Upstream: vercel-labs/agent-skills @ 063bee94c3f4df8453406c830b0a7df0f2860278 (2026-08-28), skill v1.0.0. No upstream scripts were run.

## Checkpoint 1 (auto-approved): extraction
9 rules (8 rule files; react19-no-forwardref.md holds two rules: forwardRef and use-over-useContext, split into react19-no-forwardref and react19-use-over-usecontext). Categories: architecture 2, state 3, patterns 2, react19 2. AGENTS.md duplicates the rule files (one rule each, sourced to rules/).

## Checkpoint 2 (auto-approved): mapping
covered 2, partial 0, custom-possible 2 (architecture-avoid-boolean-props, patterns-children-over-render-props), not-lintable 5, unverified 0.
Covered:
- react19-no-forwardref -> ESLint core no-restricted-imports (importNames forwardRef) + no-restricted-syntax (React.forwardRef call). Evidence: fires on named, aliased and React.forwardRef bad fixtures, clean on the good fixture (eslint 9.0.0, typescript-eslint 8.46.0 parser).
- react19-use-over-usecontext -> same two core rules for useContext. Same evidence.
Checked and rejected: @types/react 19.3 does not mark forwardRef/useContext @deprecated, so @typescript-eslint/no-deprecated does not apply; react/boolean-prop-naming checks naming only (not a cover for avoid-boolean-props).

## Fork
Removed rules file react19-no-forwardref.md, whole category 4 (React 19 APIs) from SKILL.md (table, quick ref, description phrase "Includes React 19 API changes"), AGENTS.md (TOC + section) and rules/_sections.md. Fork note added to the SKILL.md description. Nothing else edited.
Size: SKILL.md 89 -> 86 lines, 384 -> 364 words; AGENTS.md 946 -> 898 lines; whole skill 2029 -> 1931 lines, 5713 -> 5384 words (tokens not measured; roughly -6%).

## Lint
lint/composition-patterns.config.mjs, registered in lint/eslint.config.mjs. Validated by installing lint/package.json in scratch, `eslint --print-config` and linting fixtures. No conflict with demo-skill (eqeqeq). No tsconfig flags or runtime checks needed (no tsconfig.base.json / runtime-checks.md created). Added .gitignore (node_modules).

## Uncertain / not verified
- Small win: only 2 of 9 rules covered; the skill is mostly design guidance.
- Config is React 19+ only (as upstream's rule); it will break React 18 projects. require('react') and non-`React` namespace aliases are not caught.
- Used core rules with selectors, not a dedicated plugin; a project that wraps forwardRef in its own helper is not covered.
- Seed pinned eslint 9.0.0, kept; typescript-eslint 8.46.0 / typescript 5.9.3 were validated by install and fixture run, not tested against newer eslint 9.x.
- The two custom-possible rules are kept in the skill unchanged.
