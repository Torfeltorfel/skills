# Seed repo

## Forked skills
- demo-skill
- composition-patterns (fork of vercel/agent-skills `skills/composition-patterns` v1.0.0; 3 lint-covered rules removed)

Each fork must be used together with its lint config in `lint/<name>.config.mjs`
(registered in `lint/eslint.config.mjs`). Rules removed from a fork's text are
only enforced if that config is active. Composition-patterns needs React 19+
for the removed React 19 rules.

## Layout
- `skills/<name>/`: the forked skill
- `lint/`: ESLint flat configs, `tsconfig.base.json`, `package.json`, `runtime-checks.md`
- `mappings/<name>.json`: every rule with status, tool and gap; `<name>.removed.md`: what was removed

## Re-running the lint
```
cd lint && npm install
npx eslint --config eslint.config.mjs "<path-to-your-code>/**/*.{ts,tsx}"
```

## Re-running the split for a skill
1. Extract rules from the upstream skill, one checkable statement each, with source file + section.
2. Map each rule to lint rules; install the plugins in a scratch folder and run a fixture to confirm every rule id exists and fires (never trust memory).
3. Remove only `covered` rules from `skills/<name>/`, keep text coherent, add a fork note and upstream version.
4. Update `lint/`, `mappings/` and this list.
