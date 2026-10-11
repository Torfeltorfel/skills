# Skill / lint split

Coding agents forget many of the rules in the skills they load. Rules that existing tools (ESLint, TypeScript) can enforce do not need to occupy agent context. This repo holds forks of skills with the lint-enforceable rules removed, plus the lint config that enforces them.

**Each forked skill must be used together with its lint config. Using the fork without the config silently drops the removed rules.**

## Forked skills

| Skill | Upstream | Rules | Removed (lint) | Kept in skill | Lint config |
|---|---|---|---|---|---|
| [`vercel-react-best-practices`](skills/vercel-react-best-practices/SKILL.md) | [vercel-labs/agent-skills `skills/react-best-practices`](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices) v1.0.0 @ 063bee9 | 70 | 8 | 62 (7 partly lint-covered, 6 custom-possible, 49 not lintable) | [`lint/vercel-react-best-practices.config.mjs`](lint/vercel-react-best-practices.config.mjs) |

## Layout

- `skills/<name>/` - the fork (SKILL.md carries a fork note and the upstream version/commit in its description)
- `lint/<name>.config.mjs` - ESLint flat config; each rule has a comment pointing at the skill rule it replaces
- `lint/eslint.config.mjs` - registry that spreads every skill config
- `lint/tsconfig.base.json` - TypeScript settings the lint rules assume (strict, ES2023 lib; type-aware linting)
- `lint/package.json` - pinned plugin versions (mappings were verified against exactly these)
- `lint/runtime-checks.md` - checks lint cannot do (bundle size, traces, hydration, ...)
- `mappings/<name>.json` - every upstream rule: id, source, rule, status (`covered`, `partial`, `custom-possible`, `not-lintable`, `unverified`), tool, toolRuleId, gap, notes
- `mappings/<name>.removed.md` - what was removed and why
- `mappings/<name>.verification.md` - evidence for each lint rule used

## Using a fork

1. Copy `skills/<name>/` into your agent's skills directory.
2. In your project: `npm i -D` the plugins from `lint/package.json`, extend `lint/tsconfig.base.json`, and spread `lint/<name>.config.mjs` into your `eslint.config.mjs` (type-aware linting via `projectService` is required for `@eslint-react/no-leaked-conditional-rendering`).
3. Run the runtime checks in `lint/runtime-checks.md` where relevant.

## Re-running / verifying

```bash
cd lint && npm install
npm run verify:vercel-react-best-practices   # re-checks every mapped rule against its upstream examples
npx eslint .                                  # uses lint/eslint.config.mjs
```

To re-split after an upstream change: diff the new upstream rules against `mappings/<name>.json`; for new or changed rules, install the candidate plugins in a scratch folder, run them on the rule's incorrect/correct examples, record the status, and only then remove rules whose status is `covered`. Never mark `covered` from memory.

Statuses: `covered` = existing rule enforces the whole rule (verified, removed from skill); `partial` = enforces a subset (rule stays); `custom-possible` = no off-the-shelf rule, a custom selector/rule could (stays); `not-lintable` (stays); `unverified` = candidate rule could not be verified (stays).
