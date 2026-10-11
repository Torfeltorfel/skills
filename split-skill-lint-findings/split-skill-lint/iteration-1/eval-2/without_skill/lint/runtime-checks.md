# Runtime and build-time checks (not expressible as ESLint/TypeScript rules)

Companion to `vercel-react-best-practices`. These are the checks that would catch what lint cannot; they are suggestions and have NOT been executed or verified as part of this split.

## vercel-react-best-practices

| Skill rule(s) | Check | How |
|---|---|---|
| bundle-barrel-imports, bundle-dynamic-imports, bundle-defer-third-party, bundle-conditional, bundle-preload | Bundle size / first-load JS budget | `@next/bundle-analyzer` or `next build` route-size table in CI; fail on budget regression |
| bundle-analyzable-paths | Over-broad bundles and file tracing | Look for `Critical dependency` / dynamic-import warnings in `next build`; inspect `.next/**/*.nft.json` trace sizes |
| rendering-svg-precision | SVG precision | `svgo --precision=1` (or a SVGO step in the asset pipeline) in CI |
| rendering-hydration-no-flicker, rendering-hydration-suppress-warning | Hydration mismatches and flash of wrong content | Browser test (Playwright) that fails on `Hydration failed` / `did not match` console errors; visual check of theme flash |
| async-*, server-parallel-*, server-cache-*, server-after-nonblocking, server-hoist-static-io | Waterfalls and repeated I/O | Request traces (OpenTelemetry / Vercel Observability) and server timing; assert span overlap for parallel fetches |
| server-auth-actions | Unauthenticated Server Action access | Integration test that calls each action without a session and expects rejection |
| server-no-shared-module-state | Cross-request contamination | Concurrent-request test (two users in parallel) asserting no data bleed |
| server-serialization, server-dedup-props | RSC payload size | Compare RSC payload bytes per route in CI |
| rerender-*, rendering-hoist-jsx, rendering-activity, rendering-usetransition-loading | Re-render cost | React DevTools Profiler / `why-did-you-render` in dev; consider the React Compiler (`babel-plugin-react-compiler`), which makes several rerender rules unnecessary |
| client-passive-event-listeners, js-*, rendering-content-visibility, rendering-animate-svg-wrapper | Main-thread cost and scroll jank | Lighthouse (passive listeners audit, TBT/INP), Chrome Performance panel, micro-benchmarks for hot paths |
| client-swr-dedup, client-event-listeners | Duplicate requests/listeners | Network panel or test asserting a single request/listener for N mounted instances |
