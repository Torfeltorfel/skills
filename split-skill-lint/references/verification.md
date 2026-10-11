# Verifying a rule mapping

Do this for every rule you mark `covered` or `partial`. Work in a scratch directory outside the output repo.

## 1. Install and list rules

```bash
mkdir -p "$SCRATCH/verify" && cd "$SCRATCH/verify"
npm init -y >/dev/null
npm i -D eslint typescript typescript-eslint eslint-plugin-react-hooks @next/eslint-plugin-next eslint-plugin-jsx-a11y   # plus whatever you are checking
```

Confirm a rule exists by loading the plugin, not by recalling its name:

```bash
node -e "const p=require('eslint-plugin-react-hooks'); console.log(Object.keys(p.rules))"
node --input-type=module -e "import n from '@next/eslint-plugin-next'; console.log(Object.keys(n.rules))"
node -e "const t=require('typescript-eslint'); console.log(Object.keys(t.plugin.rules))"
```

Note the installed version (`npm ls --depth=0`). It goes into `lint/package.json`.

## 2. Read what the rule really checks

Open `node_modules/<plugin>/docs/rules/<rule>.md` (or the plugin's repository docs). Check:

- What exactly triggers it, and what does it ignore?
- Does it need type information (`parserOptions.projectService`)? Then the config must enable that, and lint gets slower; mention it in `notes`.
- Options and defaults. If the skill rule needs a non-default option, record it.
- Is it deprecated, renamed, or only in a `recommended` preset you would not otherwise use?

Compare against the skill rule's wording, including its "incorrect" example. If the rule does not flag the skill's own incorrect example, it is not `covered`.

## 3. Prove it fires

Write the skill's incorrect example and correct example to two small files and lint them with only that rule enabled:

```bash
cat > eslint.config.mjs <<'EOF'
import tsParser from "@typescript-eslint/parser";
import plugin from "<plugin>";
export default [{
  files: ["**/*.{ts,tsx}"],
  languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { x: plugin },
  rules: { "x/<rule>": "error" },
}];
EOF
npx eslint bad.tsx good.tsx
```

Expected: `bad.tsx` reports, `good.tsx` is clean. Anything else downgrades the status: bad not flagged means not covered; only some bad variants flagged means `partial` with a `gap`; good flagged means the config needs options or the rule is too noisy to count.

Record in `notes` what you ran ("fires on bad example, clean on good example, v X.Y.Z").

## 4. TypeScript compiler flags

Check the flag exists with `npx tsc --showConfig` or the TSConfig reference, and prove it with a tiny file under `tsc --noEmit --<flag>`. Remember that flags like `strict` imply others.

## 5. Runtime checks

Lighthouse audits and axe rules are not ESLint rules. Verify the audit or rule ID in the tool's docs or output (`npx lighthouse --list-all-audits`, axe's rule list), and note the threshold. They go in `lint/runtime-checks.md`, and a rule that depends only on a runtime check is `partial` at best, since it cannot fail at lint time.

## When you cannot verify

Network down, plugin unmaintained, rule needs a framework setup you cannot reproduce: mark `unverified`, say what you tried in `notes`, and keep the rule in the fork.
