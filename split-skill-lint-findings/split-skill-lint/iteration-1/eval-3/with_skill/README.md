# Seed repo

Forked agent skills with lint-covered rules removed, plus the ESLint configs that enforce those rules.

## Forked skills
- demo-skill
- composition-patterns: upstream vercel-labs/agent-skills `skills/composition-patterns` @ 063bee94c3f4df8453406c830b0a7df0f2860278 (2026-08-28), skill version 1.0.0. 2 of 9 rules removed (7 remain: 2 custom-possible, 5 not-lintable). Config: `lint/composition-patterns.config.mjs` (React 19+ only).

**Each forked skill must be used together with its lint config** (`lint/<skill-name>.config.mjs`); the rules removed from the skill are only enforced by that config.

## Wiring into a project
Install the pinned dev dependencies from `lint/package.json` and use `lint/eslint.config.mjs` (combined config for all skills) as, or import it from, your `eslint.config.mjs`. Mappings are valid for the versions pinned in `lint/package.json`. Per-rule details: `mappings/<skill-name>.json` and `mappings/<skill-name>.removed.md`.

## Re-running when upstream changes
Re-run split-skill-lint with the new upstream version of the skill; compare against the old `mappings/<skill-name>.json` so verified mappings are reused instead of redone.
