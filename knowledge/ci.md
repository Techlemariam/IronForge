# 🔧 Domain: CI (Continuous Integration)

**Owner:** @infrastructure, @qa
**Focus:** Build stability, Testing, Deployment.

## 🔄 Protocols

### 1. E2E Safety (`/e2e-safety`)

**Mandatory** before pushing significant changes.

- Simulates CI limitations locally (1 worker, production build).
- Goal: Prevent "works on my machine" failures.

### 2. CI Doctor (`/ci-doctor`)

**Comprehensive** workflow for diagnosing and fixing CI failures.

- **Auto-Classification**: detailed analysis of failure logs.
- **Docker Simulation**: Runs tests in a container matching CI environment.
- **Mock Validation**: Ensures mocks align with Prisma schema.

## 📜 History

- **`ci-rescue` vs `ci-doctor`**:
  - `ci-rescue` was the initial debugging workflow (v1.0.0).
  - `ci-doctor` (v1.1.0) superseded it with more robust tools (Docker, Auto-Classifier).
  - **Decision**: `ci-rescue` was deprecated and removed in favor of `ci-doctor`.

## 🛠️ Tools

- `scripts/ci-classifier.ts`: Auto-detects failure category (Timeout, Race Condition, etc.).
- `scripts/validate-mocks.ts`: Verifies mock data integrity.
- `tests/flaky-tests.json`: Tracks known unstable tests.
