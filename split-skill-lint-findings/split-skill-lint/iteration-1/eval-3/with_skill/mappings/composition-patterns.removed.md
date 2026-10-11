# Removed from composition-patterns (covered by lint)

Based on upstream vercel-labs/agent-skills @ 063bee94c3f4df8453406c830b0a7df0f2860278 (2026-08-28), skill version 1.0.0. Lint versions pinned in lint/package.json.

| Removed rule | Source | Replaced by | Notes |
|---|---|---|---|
| Do not use `forwardRef`; pass `ref` as a regular prop (React 19) | rules/react19-no-forwardref.md | `no-restricted-imports` (`importNames: ["forwardRef"]`) and `no-restricted-syntax` (`React.forwardRef(...)`), ESLint core | Verified on bad/good fixtures. Does not catch `require("react")` or a namespace import not named `React`. |
| Use `use(Context)` instead of `useContext(Context)` (React 19) | rules/react19-no-forwardref.md | `no-restricted-imports` (`importNames: ["useContext"]`) and `no-restricted-syntax` (`React.useContext(...)`), ESLint core | Same caveats. The informational note "use() can also be called conditionally" went away with the rule file. |

Both removed rules were the entire content of category 4 (React 19 APIs), so the category, its section in AGENTS.md and rules/_sections.md, and its table/quick-reference entries were removed as well. The lint config is React 19+ only.
