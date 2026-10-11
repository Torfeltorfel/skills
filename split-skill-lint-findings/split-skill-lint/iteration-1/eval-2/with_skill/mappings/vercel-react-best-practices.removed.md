# Removed from vercel-react-best-practices (covered by lint)

Based on upstream vercel-labs/agent-skills (skills/react-best-practices) @ 063bee9 (2026-08-28), skill version 1.0.0. Lint versions pinned in lint/package.json.

| Removed rule | Source | Replaced by | Notes |
|---|---|---|---|
| rerender-no-inline-components: do not define components inside components | rules/rerender-no-inline-components.md | `react/no-unstable-nested-components` (eslint-plugin-react 7.37.5) | Fires on bad example, clean on good. |
| rendering-conditional-render: use ternary, not `&&`, when the condition can be 0/NaN | rules/rendering-conditional-render.md | `react/jsx-no-leaked-render` (eslint-plugin-react 7.37.5), default options | Not type-aware: flags `boolean && <X/>` too, accepts `!!n &&`. |
| rerender-derived-state-no-effect: derive state during render, no setState in effects on prop change | rules/rerender-derived-state-no-effect.md | `react-you-might-not-need-an-effect/no-derived-state` and `.../no-adjust-state-on-prop-change` (1.0.2) | Both fire on their bad snippets. |
| rerender-move-effect-to-event: put interaction logic in event handlers | rules/rerender-move-effect-to-event.md | `react-you-might-not-need-an-effect/no-event-handler` (1.0.2) | Heuristic detection of state-as-event pattern; skill example caught. |
| rendering-script-defer-async: use defer or async on script tags | rules/rendering-script-defer-async.md | `@next/next/no-sync-scripts` (@next/eslint-plugin-next 16.4.0) | The next/script preference note was not enforced. |
| advanced-effect-event-deps: do not put useEffectEvent results in effect deps | rules/advanced-effect-event-deps.md | `react-hooks/exhaustive-deps` (eslint-plugin-react-hooks 7.1.1) | v7 message names useEffectEvent explicitly. |

All six were also removed from the compiled AGENTS.md (TOC entries and sections; remaining sections in categories 5, 6 and 8 were renumbered). Rule count in SKILL.md changed from 70 to 64. The stale "40+ rules" in AGENTS.md's abstract and metadata.json is upstream's and was left alone.
