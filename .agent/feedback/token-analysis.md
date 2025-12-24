# 🪙 Token Optimization Analysis
**Generated**: 2025-12-25 00:33

## 📊 Summary
- **Scanned Files**: 5 high-traffic workflows
- **Total Initial**: ~6.0kb
- **Target Reduction**: 20%

## ✂️ Optimization Candidates

### 1. `/coder` (`coder.md`)
**Current**: 1509 bytes
**Analysis**:
- "Role: Senior Software Engineer..." repetition.
- "Minimize chatter; prioritize code generation" can be "No chatter."
- "Before coding, identify..." section is verbose.
- Redundant "Mode: Implement (Default)" headers.

**Proposed Change**:
```markdown
# Coder (Implement | Boost | Wire)
Role: Senior Engineer & Optimizer.

## Modes
### Implement
- Follow SOLID, clean Code (TS/React).
- Refactor on touch. 
- No chatter.

### Boost
- DRY, Token-Efficient, Strict Types.
- Auto-Workflow generation.

### Wire
- Inter-agent JSON mapping.

## Protocol
- Scope & Constraints (ARCHITECTURE.md).
- Verify via CVP.
- Log DEBT.md.
- DB Change -> `npm run agent:types`.
```
**Est. Savings**: ~40% (1500 -> 900 bytes)

### 2. `/qa` (`qa.md`)
**Current**: 891 bytes
**Analysis**:
- "Role: You are the QA Engineer" -> "Role: QA Engineer".
- "When this command is invoked..." -> Trigger implied.
- "This automatically generates a video" -> Implied by tool.

**Proposed Change**:
```markdown
# QA Engineer
Role: Verify requirements, Automated Tests, Bug Hunting.

## Instructions
- Review Coder changes.
- **UI**: MUST use `browser_subagent` (creates video).
- Update `walkthrough.md` with embed.
- Run `npm run agent:verify`.
- Log DEBT.md.
```
**Est. Savings**: ~30% (890 -> 600 bytes)

### 3. `/architect` (`architect.md`)
**Current**: 1424 bytes
**Analysis**:
- Mixed language (Swedish/English). Unify to English for token consistency (or Swedish if preferred, but switching costs tokens contextually).
- "Responsibilities" list is verbose.

**Proposed Change**:
```markdown
# System Architect
Role: Technical Design & Planning.

## Responsibilities
1. Design: Scalable, secure systems.
2. Plan: Own `implementation_plan.md`.
3. Feasibility: Validate constraints.

## Protocol
1. Read `task.md` & `ARCHITECTURE.md`.
2. Validate Scope & Constraints.
3. Update `implementation_plan.md`.

## CVP
- Context Verification Protocol required.
- Log DEBT.md.
```
**Est. Savings**: ~35% (1400 -> 900 bytes)

## 📉 Aggregate Impact
- **Total Saved**: ~1.5kb (~500 tokens) per context window load.
- **Cost**: Negligible loss of "personality", higher precision.

---

**Recommendation**: Apply these changes?
