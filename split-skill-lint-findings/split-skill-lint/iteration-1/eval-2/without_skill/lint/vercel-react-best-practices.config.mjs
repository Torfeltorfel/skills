// ESLint flat config companion for skills/vercel-react-best-practices.
// Rules removed from the skill (status "covered") are enforced here; rules the
// skill still carries but lint partly enforces are marked PARTIAL.
// Mapping + gaps: ../mappings/vercel-react-best-practices.json
// Skill rule links are relative to the repo root: skills/vercel-react-best-practices/rules/<id>.md
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import eslintReact from '@eslint-react/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'
import unicorn from 'eslint-plugin-unicorn'
import barrelFiles from 'eslint-plugin-barrel-files'
import youMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect'
import tseslint from 'typescript-eslint'

export default [
  {
    name: 'vercel-react-best-practices',
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      parser: tseslint.parser,
      // Type-aware linting is required by @eslint-react/no-leaked-conditional-rendering.
      parserOptions: { projectService: true, ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      'react-hooks': reactHooks,
      react,
      '@eslint-react': eslintReact,
      '@next/next': nextPlugin,
      unicorn,
      'barrel-files': barrelFiles,
      'react-you-might-not-need-an-effect': youMightNotNeedAnEffect,
    },
    rules: {
      // ---- COVERED (rule removed from the skill) ----

      // skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
      // Flags useEffectEvent results in dependency arrays (needs react-hooks >= 6.1).
      'react-hooks/exhaustive-deps': 'error',

      // rules/js-tosorted-immutable.md
      'unicorn/no-array-sort': 'error',
      'unicorn/no-array-reverse': 'error',

      // rules/rendering-conditional-render.md  (type-aware: `count: number && <X/>`)
      '@eslint-react/no-leaked-conditional-rendering': 'error',

      // rules/rendering-script-defer-async.md
      '@next/next/no-sync-scripts': 'error',

      // rules/rerender-derived-state-no-effect.md
      'react-you-might-not-need-an-effect/no-derived-state': 'error',
      'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change': 'error',

      // rules/rerender-move-effect-to-event.md
      'react-you-might-not-need-an-effect/no-event-handler': 'error',

      // rules/rerender-no-inline-components.md
      'react/no-unstable-nested-components': 'error',
      'react-hooks/static-components': 'error',

      // rules/rerender-memo-with-default-value.md
      // (stricter: also flags non-memoized components)
      '@eslint-react/no-unstable-default-props': 'error',

      // ---- PARTIAL (rule stays in the skill; lint catches a subset) ----

      // rules/client-passive-event-listeners.md
      // PARTIAL: only inline listener functions are checked, not listeners passed by identifier.
      'unicorn/require-passive-events': 'error',

      // rules/js-min-max-loop.md
      // PARTIAL: only direct chains like toSorted(...)[0] / sort(...).at(-1).
      'unicorn/no-array-sort-for-min-max': 'error',

      // rules/js-set-map-lookups.md
      // PARTIAL: only local array bindings used solely for includes().
      'unicorn/prefer-set-has': 'error',

      // rules/rerender-lazy-state-init.md
      // PARTIAL: flags buildIndex(x) / new Map(...), not JSON.parse(...) or member calls.
      '@eslint-react/use-state': 'error',

      // rules/rerender-functional-setstate.md
      // PARTIAL: only the stale-closure variant (state missing from deps) is caught;
      // covered by 'react-hooks/exhaustive-deps' above.

      // rules/server-no-shared-module-state.md
      // PARTIAL: writes to module-level variables from components/hooks only.
      'react-hooks/globals': 'error',

      // rules/bundle-barrel-imports.md
      // PARTIAL and OFF by default: flags every barrel import, including the Next.js
      // `optimizePackageImports` pattern the skill recommends (use allowList for those
      // packages), and the native resolver can abort on barrels with unresolvable deps.
      // Enable per project: ['error', { allowList: ['lucide-react'] }]
      'barrel-files/avoid-importing-barrel-files': 'off',
    },
  },
]
