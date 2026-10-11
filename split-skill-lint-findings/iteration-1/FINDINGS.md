# split-skill-lint: iteration 1 findings

Test of the draft skill (`split-skill-lint/SKILL.md`) against a baseline: the same task given as plain text (`baseline-task-spec.md`), no skill. Upstream under test: `vercel-labs/agent-skills` @ `063bee9` (`react-best-practices`, `composition-patterns`). All runs were non-interactive: the agents printed each STOP checkpoint and continued.

Nothing here was graded with the skill-creator viewer or benchmark scripts (Python was unavailable). The checks below are my own scripts and manual reading, and are limited as stated.

## Runs

| Eval | Task | Config | Tokens | Time |
|---|---|---|---|---|
| 1 | Extract + map only (react-best-practices) | with skill | 108,671 | 306 s |
| 1 | same | baseline | 114,891 | 309 s |
| 2 | Full split (react-best-practices) | with skill | 116,197 | 325 s |
| 2 | same | baseline | 164,489 | 572 s |
| 3 | Second skill (composition-patterns) into seeded repo | with skill | 66,852 | 195 s |
| 3 | same | baseline | 78,758 | 202 s |

## Status counts

| Eval | Config | Rules | covered | partial | custom-possible | not-lintable | unverified |
|---|---|---|---|---|---|---|---|
| 1 | with skill | 74 | 7 | 6 | 23 | 37 | 1 |
| 1 | baseline | 70 | 9 | 5 | 20 | 36 | 0 |
| 2 | with skill | 70 | 6 | 2 | 21 | 41 | 0 |
| 2 | baseline | 70 | 8 | 7 | 6 | 49 | 0 |
| 3 | with skill | 9 | 2 | 0 | 2 | 5 | 0 |
| 3 | baseline | 17 | 3 | 2 | 0 | 12 | 0 |

Fork size (eval 2): with skill 64 rules left, about 8% fewer words; baseline 62 rules left (it also dropped `AGENTS.md`, `metadata.json` and the upstream README).

## Checked by script (`check.mjs`, plus install and config load)

- Every mapping JSON has all 8 required fields on every rule.
- No rule marked `covered` is still present in its fork.
- Evals 2 and 3, both configs: `npm install` in `lint/` works and the combined `eslint.config.mjs` loads (`eslint --print-config`). It needed `--legacy-peer-deps`, which hides peer-dependency conflicts.
- Eval 3, both configs: `demo-skill` files are unchanged except for the registration in the combined config, `package.json` and the README.

## Not checked

- That each covered rule fires on real code. The agents' own fixture runs are the only evidence, and I have not re-run them.
- Which rule granularity is right in eval 3 (9 vs 17) and eval 1 (74 vs 70).
- Whether the plugin versions the runs pinned work together without `--legacy-peer-deps`.

## Differences between with-skill and baseline

- **Covered threshold.** In eval 2 the baseline also removed `js-set-map-lookups` and `rerender-memo-with-default-value`, checked only on its own fixtures. The with-skill run kept them (partial), in line with "keep when unsure". Either may be right; unreviewed.
- **Copy fidelity.** The with-skill fork kept `AGENTS.md`, `metadata.json` and the upstream README. The baseline dropped them without being asked.
- **Stale counts.** The with-skill run left the upstream "40+ rules" abstract in `AGENTS.md` and `metadata.json`.
- **Leaked-render rule.** `react/jsx-no-leaked-render` is untyped and also flags `bool &&`, which the skill rule does not. The with-skill run marked it covered anyway. The baseline used a type-aware alternative in eval 2 and the untyped rule in eval 1.
- **Heuristic rules.** In eval 3 the baseline counted two name-heuristic checks (`boolean` props, `renderX` props) as partial; the with-skill run called them custom-possible. The heuristics would produce false positives such as `renderItem`.
- **Empty files.** The with-skill run skipped `tsconfig.base.json` and `runtime-checks.md` when it had nothing to put in them; the baseline created them.

## Planned changes to SKILL.md (iteration 2)

1. Say what to do with compiled/duplicated files (`AGENTS.md`, `metadata.json`): keep them consistent and fix every rule count, including abstracts.
2. Define when a rule that over-reports (flags more than the skill rule) is `covered` vs `partial`.
3. Require checking peer-dependency compatibility without `--legacy-peer-deps`, and record the result.
4. Make the extraction step stricter about one checkable statement per rule.
5. Rerun the same three evals as iteration 2, with the same baseline.
