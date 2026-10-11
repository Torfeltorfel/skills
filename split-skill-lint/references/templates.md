# Output templates

## mappings/<skill-name>.json

An array of rule objects. Every key is present; use `null` when there is no value.

```json
[
  {
    "id": "rerender-no-inline-components",
    "source": "rules/rerender-no-inline-components.md#Incorrect",
    "rule": "Do not define components inside other components.",
    "status": "covered",
    "tool": "eslint-plugin-react",
    "toolRuleId": "react/no-unstable-nested-components",
    "gap": null,
    "notes": "Fires on bad example, clean on good example (eslint-plugin-react 7.x.y)."
  },
  {
    "id": "async-parallel",
    "source": "rules/async-parallel.md",
    "rule": "Run independent awaits in parallel with Promise.all.",
    "status": "custom-possible",
    "tool": null,
    "toolRuleId": null,
    "gap": "No rule detects sequential independent awaits.",
    "notes": "Sketch: ast-grep for consecutive `await` statements where the second does not reference the first's binding."
  }
]
```

`tool` and `toolRuleId` for `partial` rules name the tool that catches the subset; `gap` says what it misses. `toolRuleId` uses the full ESLint ID (`plugin/rule`) or `tsconfig:<flag>` or `lighthouse:<audit-id>` / `axe:<rule-id>`.

## mappings/<skill-name>.removed.md

```markdown
# Removed from <skill-name> (covered by lint)

Based on upstream <repo> @ <sha/date>, lint versions pinned in lint/package.json.

| Removed rule | Source | Replaced by | Notes |
|---|---|---|---|
| Do not define components inside components | rules/rerender-no-inline-components.md | `react/no-unstable-nested-components` (eslint-plugin-react) | |
```

## lint/<skill-name>.config.mjs

```js
// ESLint flat config for the forked skill "<skill-name>".
// Each rule replaces a rule removed from the skill; see mappings/<skill-name>.removed.md.
import react from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{ts,tsx,jsx}"],
    plugins: { react },
    rules: {
      // replaces <skill-name>:rerender-no-inline-components
      "react/no-unstable-nested-components": "error",
      // replaces <skill-name>:foo (partial: does not catch X)
      // "plugin/rule": ["error", { option: true }],
    },
  },
];
```

## lint/eslint.config.mjs (combined)

```js
import skillA from "./skill-a.config.mjs";
import skillB from "./skill-b.config.mjs";

export default [...skillA, ...skillB];
```

When adding a skill, add one import and one spread. Do not reorder or reformat the rest.

## lint/package.json

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "eslint": "x.y.z",
    "eslint-plugin-react": "x.y.z"
  }
}
```

Exact versions you verified against, no ranges. Merge with existing entries; if two skills need different versions of the same plugin, keep the newer one and re-check the older skill's mappings.

## lint/runtime-checks.md

```markdown
## <skill-name>

| Skill rule | Tool | Check | Threshold |
|---|---|---|---|
| async-suspense-boundaries (partial) | Lighthouse | `largest-contentful-paint` | <= 2.5 s |
```

## README.md

Must contain: what the repo is; the list of forked skills (name, upstream, upstream version/date, rules removed / remaining); the instruction that **each forked skill must be used together with its lint config**; how to wire the combined config into a project; how to re-run split-skill-lint when upstream changes (point it at the new upstream version, reuse unchanged verified mappings from `mappings/<skill-name>.json`).
