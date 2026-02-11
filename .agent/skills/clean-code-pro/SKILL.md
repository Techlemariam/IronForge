---
name: Clean Code Pro
description: Enforce strict software craftsmanship principles (SOLID, DRY, KISS, Composition over Inheritance).
---

# 🧼 Clean Code Pro (Enterprise Edition)

> **Philosophy:** "Code is liability. Less code = less liability."

## 1. 🏗️ Core Principles

1. **SOLID:**
    * **S**ingle Responsibility: One reason to change.
    * **O**pen/Closed: Extend via interfaces, don't modify internals.
    * **L**iskov Substitution: Subtypes must be usable as base types.
    * **I**nterface Segregation: Specific interfaces > General ones.
    * **D**ependency Inversion: Depend on abstractions, not concretions.

2. **DRY (Don't Repeat Yourself):**
    * Extract duplication *after* the Rule of Three.
    * Beware of "accidental duplication" (similar structure, different reason).

3. **KISS (Keep It Simple, Stupid):**
    * No over-engineering. No "YAGNI" (You Aren't Gonna Need It).

## 2. 🧬 Code Structure

* **Functions:** Small (< 20 lines), pure where possible, single purpose.
* **Variables:** Descriptive, pronounceable names (`daysSinceModification` vs `dsm`).
* **Comments:** Only 'Why', never 'What'. Code should explain itself.
* **Conditionals:** Avoid nesting (Guard Clauses), encapsulate complex logic.

## 3. 🧪 Testing (F.I.R.S.T.)

* **F**ast: Tests run in milliseconds.
* **I**ndependent: No shared state between tests.
* **R**epeatable: Run in any environment.
* **S**elf-validating: Pass/Fail boolean output.
* **T**imely: Written *before* or *with* the code.

## 4. 🚫 Antipatterns

* God Classes / God Functions.
* Magic Numbers / Strings (Use Constants/Enums).
* Flag Arguments (Bool params -> Separate functions).
* Side Effects in "Getters".
