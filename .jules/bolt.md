
## 2024-05-17 - O(N*M) Map Iterations in Array Operations
**Learning:** `muscleMap.entries()` in `src/data/muscleMap.ts` contained a nested `data.exercises.some` block to check strings. When calculating weekly volume for a user, this function (`getMuscleGroupForExercise`) was being executed in a loop for *every* exercise in *every* recent workout. This caused significant, compounding O(N*M) iteration latency.
**Action:** When finding specific string subsets or values from a complex, nested map structure, pre-compute an inverted flat Map for O(1) string matching instead of calculating it on the fly, particularly in nested helper functions.
