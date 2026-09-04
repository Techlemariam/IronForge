# Merge Gate runtime smoke — 2026-09-04

This file exists only to exercise the hosted IronForge PR Gate after its trusted-default-branch bootstrap.

Expected contract for this probe:

- changed-file enumeration succeeds;
- protected-control-plane change is `false`;
- runtime-impact classification is `false`;
- Hosted L1 Verify is explicitly skipped;
- Trusted Gate Policy succeeds;
- final `IronForge PR Gate / Merge Gate` succeeds;
- no self-hosted, secret-bearing, publish, deploy, rollback, database, or production operation is required by the gate.

This probe PR is evidence-only and is not intended to be merged.
