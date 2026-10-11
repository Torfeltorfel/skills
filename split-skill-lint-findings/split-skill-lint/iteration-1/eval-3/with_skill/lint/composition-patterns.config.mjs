// ESLint flat config for the forked skill "composition-patterns".
// Each rule replaces a rule removed from the skill; see mappings/composition-patterns.removed.md.
// NOTE: React 19+ only. The upstream rule applies only to React 19 projects; do not use in React 18 projects.
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{ts,tsx,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // replaces composition-patterns:react19-no-forwardref (forwardRef; ref is a regular prop in React 19)
      // replaces composition-patterns:react19-use-over-usecontext (use(Context) instead of useContext)
      // Named/aliased/namespace imports from "react".
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["forwardRef"],
              message: "React 19: ref is a regular prop; do not use forwardRef.",
            },
            {
              name: "react",
              importNames: ["useContext"],
              message: "React 19: use use(Context) instead of useContext(Context).",
            },
          ],
        },
      ],
      // Same two rules, for `React.forwardRef(...)` / `React.useContext(...)` call syntax.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='React'][callee.property.name='forwardRef']",
          message: "React 19: ref is a regular prop; do not use forwardRef.",
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='React'][callee.property.name='useContext']",
          message: "React 19: use use(Context) instead of useContext(Context).",
        },
      ],
    },
  },
];
