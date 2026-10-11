# skill-lint

Forks of agent skills with every rule that ESLint (or another linter) already enforces removed, plus the lint config that takes over. Smaller skill context, deterministic enforcement for the removed rules.

## Forked skills

| Skill | Upstream | Upstream version | Rules removed / remaining |
|---|---|---|---|
| `vercel-react-best-practices` | https://github.com/vercel-labs/agent-skills (`skills/react-best-practices`) | commit 063bee9, 2026-08-28, skill v1.0.0 | 6 removed / 64 remaining |

Each forked skill lives in `skills/<name>/`, its lint config in `lint/<name>.config.mjs`, and its rule-by-rule mapping in `mappings/<name>.json` (all rules, with status) and `mappings/<name>.removed.md` (what was removed and what replaces it).

## Each forked skill must be used together with its lint config

A rule removed from the skill is only enforced if its lint rule runs. If you load the skill without the config, the agent no longer knows those rules and nothing catches violations.

## Wiring the combined config into a project

1. Install the pinned plugins from `lint/package.json` (versions are exact; the mappings are valid for these versions only. `eslint-plugin-unicorn` is pinned to 63 because later versions need ESLint >= 10.4 while eslint-plugin-react supports ESLint <= 9).
2. Import `lint/eslint.config.mjs` from your project's `eslint.config.mjs`:
   ```js
   import skillLint from "./path/to/lint/eslint.config.mjs";
   export default [...skillLint /* , your own config */];
   ```
3. Merge `lint/tsconfig.base.json` into your tsconfig (currently no flags required).
4. Run the checks in `lint/runtime-checks.md` where listed (currently none).

## Updating when upstream changes

Re-run the `split-skill-lint` skill with the new upstream version of the skill. Point it at this repo and the previous `mappings/<name>.json`: mappings whose rule text is unchanged are reused instead of re-verified, new or changed rules are mapped and verified, and the fork and config are regenerated.

## Caveats

- `partial` rules (see mappings) remain in the skill because lint only catches a subset.
- Rules not found in the plugins checked are marked `custom-possible` or `not-lintable`; this is not an exhaustive search of every ESLint plugin.
