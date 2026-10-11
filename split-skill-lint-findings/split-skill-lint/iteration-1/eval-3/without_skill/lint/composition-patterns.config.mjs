// Lint config for the forked skill skills/composition-patterns.
// Rule ids (cp-NN) refer to mappings/composition-patterns.json.
import tseslint from "typescript-eslint";
import reactX from "eslint-plugin-react-x";
import noEffect from "eslint-plugin-react-you-might-not-need-an-effect";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-x": reactX, "react-effect": noEffect },
    // react-x only reports its React 19 rules when it believes the project is on 19+.
    settings: { "react-x": { version: "19.0.0" } },
    rules: {
      // cp-09 (state-lift-state.md, "Lift State into Provider Components"):
      // do not sync state up to a parent with useEffect(() => onX(state)).
      "react-effect/no-pass-live-state-to-parent": "error",
      "react-effect/no-pass-data-to-parent": "error",

      // cp-10 (react19-no-forwardref.md, "React 19 API Changes"):
      // no forwardRef; accept `ref` as a regular prop. (React 19+ only.)
      "react-x/no-forward-ref": "error",

      // cp-11 (react19-no-forwardref.md): use() instead of useContext().
      "react-x/no-use-context": "error",

      // Same two rules, also catching named imports (not React.forwardRef).
      // Complements the react-x checks above; cp-10, cp-11.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", importNames: ["forwardRef"], message: "React 19: pass ref as a prop (skill rule cp-10)." },
            { name: "react", importNames: ["useContext"], message: "React 19: use use(Context) (skill rule cp-11)." },
          ],
        },
      ],

      // Heuristics (warn only, partial coverage; the skill text stays authoritative):
      "no-restricted-syntax": [
        "warn",
        {
          // cp-01 (architecture-avoid-boolean-props.md, "Avoid Boolean Prop Proliferation"):
          // boolean mode props named isX/hasX/showX/shouldX in a props type.
          selector:
            "TSPropertySignature[key.name=/^(is|has|show|should)[A-Z]/] > TSTypeAnnotation > TSBooleanKeyword",
          message: "Boolean mode prop: prefer composition or explicit variant components (skill rule cp-01).",
        },
        {
          // cp-12 (patterns-children-over-render-props.md, "Prefer Children Over Render Props"):
          // renderX props. Fine when the parent passes data back (e.g. renderItem); then disable inline.
          selector: "TSPropertySignature[key.name=/^render[A-Z]/]",
          message: "renderX prop: use children unless you pass data to the child (skill rule cp-12).",
        },
      ],
    },
  },
];
