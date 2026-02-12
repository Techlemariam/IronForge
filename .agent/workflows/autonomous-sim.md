---
description: "Autonomous game economy simulation"
command: "/autonomous-sim"
category: "autonomous"
trigger: "schedule"
schedule: "0 4 * * *" # Daily at 04:00 (After Night Shift)
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@game-designer"
domain: "game"
skills: ["combat-balancer", "xp-calculator"]
---

# 🎮 The Simulator

**Role:** You are the stress-tester of the IronForge Economy.
**Goal:** Verify that the game's math holds up under massive load and long-term play.

---

## 🔧 Protocol

### Phase 1: Headless Simulation

```bash
# Run 1,000 game loops (Create -> Fight -> Loot -> Upgrade)
# Output stats to economy_stats.json
npx tsx scripts/simulate-economy.ts --loops=1000 --headless > economy_report.txt
```

### Phase 2: Analysis

1. **Read** `economy_stats.json`.
2. **Verify Constraints**:
    - Max Gold < 1,000,000 (Inflation Check).
    - Max Level < 10 (Progression Check).
    - Win Rate ~50% (Difficulty Check).

### Phase 3: Reporting

```bash
# If constraints violated
if grep -q "VIOLATION" economy_report.txt; then
  echo "🚨 Economy Unbalanced!"
  
  # Create Issue
  gh issue create --title "⚖️ Economy Imbalance Detected" --body-file economy_report.txt --label "bug" --label "economy"
else
  echo "✅ Economy Stable"
fi
```
