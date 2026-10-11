# Runtime and review checks (not covered by ESLint)

## composition-patterns
Lint cannot verify these skill rules (see `mappings/composition-patterns.json`, status not-lintable). Check them in code review or by running the app:
- cp-02, cp-03, cp-04: complex components are compound components whose parts read shared state from context, with state/actions/meta injected by a parent provider.
- cp-05, cp-06: UI components consume only the context interface; only providers call state-implementation hooks. Swap a provider in a test or story and confirm the same UI still works.
- cp-08, cp-16: state needed outside a component lives in a provider; no `stateRef` passed down and read on submit.
- cp-14, cp-15: variants are separate components (ThreadComposer, EditMessageComposer), not boolean modes.
- cp-01, cp-12: the lint warnings are heuristics; a human decides whether a flagged `isX` or `renderX` prop is a real mode switch (legitimate: `renderItem` that passes data back, cp-13).
- React 19 rules (cp-10, cp-11) only apply on React 19+; set `settings["react-x"].version` accordingly or drop those rules on React 18.
