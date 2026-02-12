# 🏥 Spec: Pilot Factory Dashboard

**Feature Name:** `pilot-factory-dashboard`
**Domain:** `meta`
**Status:** `Factory Ready`
**Drafted by:** Council of Level 10 Roles

## 📖 User Stories (@analyst)

- **AS A** Project Lead
- **I WANT** to see a visual status of the 5 Factory Stations
- **SO THAT** I can verify the system is operational and identify bottlenecks.

**Acceptance Criteria:**

- Show 5 status cards (Design, Fabrication, QC, Scrap Yard, Shipping).
- Each card must show a "Health" indicator (Current Job, Error Rate).
- Data must be fetched from a mock API (`/api/factory/status`).

## 🏗️ System Design (@architect)

**Architecture:** Vertical Slice (DB -> Action -> Component).

### Data Model (Prisma)

```prisma
model FactoryStatus {
  id        String   @id @default(cuid())
  station   String   // design, fabrication, qc, scrap, ship
  health    Int      // 0-100
  current   String?  // Active job name
  updatedAt DateTime @updatedAt
}
```

### API (Server Action)

- `src/actions/factory.ts`: `getFactoryStatus()`
- Returns `FactoryStatus[]`.

## 🎨 Visual Design (@ui-ux)

**Design System:** IronForge Standard (Dark Mode).

- **Component:** `src/components/factory/StatusGrid.tsx`
- **Tokens:**
  - Background: `bg-slate-900/50` (Glassmorphism).
  - Borders: `border-slate-800`.
  - Indicators: Green (Healthy), Amber (Busy), Red (Error).

## 🧪 Test Plan (@qa)

**Gherkin:**

```gherkin
Feature: Factory Status Visualization
  Scenario: Load Dashboard
    Given the database seed has factory status data
    When I navigate to "/factory"
    Then I should see 5 "StatusCard" components
    And the "Fabrication" card should show "BUSY" if a job is active
```

**Verification:**

- `pnpm run test:unit`: Verify `getFactoryStatus` returns valid data.
- E2E: Capture video of dashboard loading correctly.

## 🛡️ Security (@security)

**Validation:**

- Zod schema for `FactoryStatus` input validation.
- Auth: Must be authenticated with `ROLE_ADMIN` to view factory status.

**Audit:**

- Check for dependency leaks in new components.
