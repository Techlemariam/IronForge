# IronForge GitHub Hierarchy and Label Audit

This audit evaluates the structure, metadata, and taxonomy of GitHub issues, epics, trackers, and labels for IronForge to support integration with Panopticon.

**Provisional Assessment Date:** 2026-07-11
**Status:** Audit Complete

---

## 1. Existing Epics and Trackers
We have identified the following primary trackers and epics active in the workspace:
* **#370 Epic: IronForge Panopticon Readiness** (Parent: #369)
* **#369 Tracker: Panopticon Readiness Program for IronForge**
* **#355 Epic/Tracker:** Garmin Fenix 7x Adapter (via Intervals.icu)
* **#365 Tracker:** Zone-Based Buffs (Cardio Titan)
* **#366 Tracker:** Leaderboard Consolidation
* **#367 Tracker:** Combat Retreat
* **#368 Tracker:** Citadel Redesign
* **#390 Tracker:** Hyper Pro first-class training station integration
* **#391 Epic:** Hyper Pro Exercise Resolver integration
* **#384 Epic:** Combat Resolution Engine for PvE and PvP
* **#383 Epic:** Doctrine Engine for athlete philosophy and risk profile
* **#382 Epic:** Activity Arbiter verification layer

---

## 2. Issue Title Conventions
Active issues generally follow prefix-based nomenclature to group work by priority and domain:
* **Format:** `[Priority]: [Action Verb] [Feature/Component] [Target]` (e.g. `P0: Define IronForge project manifest for Panopticon`)
* **Epic/Tracker Format:** `Epic: [Title]` or `Tracker: [Title]`
* **Recommendations:**
  * Adopt a strict domain prefix for feature work: `[Domain] [Priority]: [Title]` (e.g. `[Game] P1: Define CombatInput contract`).
  * Ensure all sub-tasks reference their parent Epic number in the body text (e.g., `Parent Epic: #370`).

---

## 3. Label Taxonomy Gaps
The current repository has labels but lacks a structured schema for automated ingestion by Panopticon.
We propose the following **Minimal Label Taxonomy**:

### Priority Labels
* `priority:critical` (P0 - blocks release)
* `priority:high` (P1 - current sprint)
* `priority:medium` (P2 - next sprint)
* `priority:low` (P3/P4 - backlog/someday)

### Domain Labels
* `domain:game` (progression, balancing, prestige)
* `domain:bio` (Intervals, Hevy, Garmin integration)
* `domain:infra` (CI/CD, database migrations, runners)
* `domain:ui` (views, styling, components)
* `domain:meta` (documentation, governance, policies)

### Type Labels
* `type:epic` (large multi-issue trackers)
* `type:feature` (new functionality)
* `type:bug` (defects or regressions)
* `type:debt` (refactoring or cleanup work)

---

## 4. Issue Dependency & Linking Gaps
* **Current Gap:** Several issues are orphan/standalone tasks without defined parenting.
* **Remedy:** Ensure every issue is attached to a parent epic or has a checklist entry in `roadmap.md`.
* **Action Item:** Run `/sync-roadmap` regularly to detect unlinked planned items in `roadmap.md` and generate their associated GitHub issues automatically.

---
*Related Trackers: #369, #370.*
