// ESLint flat config for the forked skill "vercel-react-best-practices".
// Each rule replaces a rule removed from the skill (or a partial one still in the skill);
// see mappings/vercel-react-best-practices.removed.md.
// Mappings verified against the versions pinned in lint/package.json.
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";
import unicorn from "eslint-plugin-unicorn";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

export default [
  {
    files: ["**/*.{ts,tsx,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": next,
      unicorn,
      "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
    },
    rules: {
      // replaces vercel-react-best-practices:rerender-no-inline-components
      "react/no-unstable-nested-components": "error",

      // replaces vercel-react-best-practices:rendering-conditional-render
      // Default options (ternary + coerce strategies). Not type-aware: also flags `boolean && <X/>`
      // and accepts `!!count && <X/>` as a fix besides the ternary the skill showed.
      "react/jsx-no-leaked-render": "error",

      // replaces vercel-react-best-practices:rerender-derived-state-no-effect
      "react-you-might-not-need-an-effect/no-derived-state": "error",
      "react-you-might-not-need-an-effect/no-adjust-state-on-prop-change": "error",

      // replaces vercel-react-best-practices:rerender-move-effect-to-event
      "react-you-might-not-need-an-effect/no-event-handler": "error",

      // replaces vercel-react-best-practices:advanced-effect-event-deps
      // (v7 reports "Functions returned from `useEffectEvent` must not be included in the dependency array")
      "react-hooks/exhaustive-deps": "error",

      // replaces vercel-react-best-practices:rendering-script-defer-async
      "@next/next/no-sync-scripts": "error",

      // replaces vercel-react-best-practices:js-tosorted-immutable (partial: also flags the
      // `[...arr].sort()` fallback the skill allows for old browsers; does not cover toSpliced/with)
      "unicorn/no-array-sort": "error",

      // replaces vercel-react-best-practices:js-set-map-lookups (partial: only flags const arrays
      // that are used solely for `.includes()`; misses inline arrays, props, and Map lookups)
      "unicorn/prefer-set-has": "error",
    },
  },
];
