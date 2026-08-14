# Batch 2 integration plan

Parent tracker: #451  
Active slices: #479 and #480

## Merge order

1. Recommendation builder
2. Minimum-capacity policy
3. Recommendation tests
4. Capacity-mode tests
5. Reason-code tests
6. Session-identity tests
7. Progression reason adapter
8. Revision-aware local session store
9. Session outcome adapter

## Guardrails

- Each PR is independently reviewable.
- No database migration or provider call is included.
- Runtime integration must preserve no-debt and user-stop precedence.
- A later batch must connect these modules to real persistence and the Live Forge UI.
