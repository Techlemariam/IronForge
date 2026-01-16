#!/usr/bin/env pwsh
# Recovery and Robust Reformat of GitHub issues #73-88

$Repo = "Techlemariam/IronForge"
$BaseUrl = "https://github.com/$Repo/blob/main"

$IssueDetails = @{
    73 = @{ Title = "[CRITICAL] DB Drift: active_sessions table"; Type = "INFRA"; Overview = "active_sessions table exists in DB but not in migration history. Requires reset."; Acceptance = "- [ ] Resolve migration history drift`n- [ ] Ensure schema matches Prisma"; Context = "Priority: critical, ROI: 5.0, Effort: S, Source: debt-audit" }
    74 = @{ Title = "[CRITICAL] Fix CI/CD Failures"; Type = "INFRA"; Overview = "Vercel deployments failing due to postinstall drift and type errors in edge functions."; Acceptance = "- [ ] Build passes on Vercel`n- [ ] Clean postinstall logs"; Context = "Priority: critical, ROI: 5.0, Effort: S, Source: monitor-ci" }
    75 = @{ Title = "[FEATURE] Guild Territories"; Type = "FEATURE"; Overview = "Implement territory claiming and weekly contest cycle."; Acceptance = "- [ ] See spec for details"; Context = "Priority: high, ROI: 4.6, Effort: L, Source: brainstorm"; Spec = "[$($path = "specs/guild-territories.md"; $path)]($BaseUrl/$path)" }
    76 = @{ Title = "[FEATURE] Oracle 3.0 (Phase 2) - Advanced Audio Coaching"; Type = "FEATURE"; Overview = "Voice-to-voice coaching loops for real-time form correction."; Acceptance = "- [ ] See spec for details"; Context = "Priority: high, ROI: 4.8, Effort: M, Source: enhancement"; Spec = "[$($path = "specs/oracle-v3-audio.md"; $path)]($BaseUrl/$path)" }
    77 = @{ Title = "[FEATURE] Arena PvP Seasons"; Type = "FEATURE"; Overview = "Ranked seasons with decay logic and seasonal rewards."; Acceptance = "- [ ] See spec for details"; Context = "Priority: high, ROI: 4.0, Effort: M, Source: enhancement"; Spec = "[$($path = "specs/arena-seasons.md"; $path)]($BaseUrl/$path)" }
    78 = @{ Title = "[FEATURE] World Events Enhancement"; Type = "FEATURE"; Overview = "Dynamic world event triggers based on global activity thresholds."; Acceptance = "- [ ] See spec for details"; Context = "Priority: high, ROI: 4.5, Effort: S, Source: gap-analysis"; Spec = "[$($path = "specs/world-events-enhancement.md"; $path)]($BaseUrl/$path)" }
    79 = @{ Title = "[FEATURE] Campaign Mode Enhancement"; Type = "FEATURE"; Overview = "Procedural storyline generation based on player progression data."; Acceptance = "- [ ] See spec for details"; Context = "Priority: high, ROI: 4.3, Effort: L, Source: gap-analysis"; Spec = "[$($path = "specs/campaign-mode-enhancement.md"; $path)]($BaseUrl/$path)" }
    80 = @{ Title = "[FEATURE] Cardio PvP Duels"; Type = "FEATURE"; Overview = "Real-time cardio racing/duels with heart rate integration."; Acceptance = "- [ ] See spec for details"; Context = "Priority: medium, ROI: 4.0, Effort: M, Source: user/idea"; Spec = "[$($path = "specs/cardio-duels.md"; $path)]($BaseUrl/$path)" }
    81 = @{ Title = "[FEATURE] Territory Conquest"; Type = "FEATURE"; Overview = "Large scale guild wars for resource-rich nodes."; Acceptance = "- [ ] See spec for details"; Context = "Priority: medium, ROI: 4.2, Effort: M, Source: user/idea"; Spec = "[$($path = "specs/territory-conquest.md"; $path)]($BaseUrl/$path)" }
    82 = @{ Title = "[FEATURE] Housing/Citadel Customization"; Type = "FEATURE"; Overview = "Personal space for Titians with stat-boosting trophies."; Acceptance = "- [ ] See spec for details"; Context = "Priority: medium, ROI: 4.2, Effort: M, Source: brainstorm"; Spec = "[$($path = "specs/housing-citadel.md"; $path)]($BaseUrl/$path)" }
    83 = @{ Title = "[FEATURE] Premium Cosmetics Store"; Type = "FEATURE"; Overview = "In-game store for cosmetic skins and effects."; Acceptance = "- [ ] See spec for details"; Context = "Priority: medium, ROI: 4.0, Effort: M, Source: brainstorm"; Spec = "[$($path = "specs/premium-cosmetics.md"; $path)]($BaseUrl/$path)" }
    84 = @{ Title = "[INFRA] Upstash Redis for Edge Caching"; Type = "INFRA"; Overview = "Integrate @upstash/redis for low-latency caching of leaderboards and sessions."; Acceptance = "- [ ] Upstash Redis integrated`n- [ ] Caching implemented for key data"; Context = "Priority: high, ROI: 4.5, Effort: S, Source: tech-stack-analysis" }
    85 = @{ Title = "[INFRA] Partykit for Real-Time Multiplayer"; Type = "INFRA"; Overview = "Migrate co-op and PvP socket logic to Partykit for better edge performance."; Acceptance = "- [ ] Partykit integrated`n- [ ] Co-op sessions migrated"; Context = "Priority: high, ROI: 4.8, Effort: M, Source: tech-stack-analysis" }
    86 = @{ Title = "[INFRA] Vercel Edge Functions Optimization"; Type = "INFRA"; Overview = "Move critical API routes to Next.js Edge Runtime."; Acceptance = "- [ ] Key APIs migrated to edge runtime"; Context = "Priority: medium, ROI: 4.0, Effort: S, Source: tech-stack-analysis" }
    87 = @{ Title = "[INFRA] Cloudflare R2 for Asset Storage"; Type = "INFRA"; Overview = "Store game assets and avatars in Cloudflare R2 for lower costs."; Acceptance = "- [ ] R2 bucket configured`n- [ ] Asset upload/download working"; Context = "Priority: medium, ROI: 3.5, Effort: S, Source: tech-stack-analysis" }
    88 = @{ Title = "[BUG] Fix Iron Mines E2E Flakiness"; Type = "BUG"; Overview = "iron-mines.spec.ts failing on session list visibility check."; Acceptance = "- [ ] E2E test passes consistently`n- [ ] Flakiness root cause fixed"; Context = "Priority: high, ROI: 4.5, Effort: S, Source: monitor-ci" }
}

foreach ($num in 73..88) {
    Write-Host "  Repairing #$num..." -NoNewline
    $d = $IssueDetails[$num]
    
    $body = ""
    if ($d.Type -eq "FEATURE") {
        $body = @"
## Feature Request
$($d.Overview)

## 📋 Context
**Roadmap:** [roadmap.md]($BaseUrl/roadmap.md)
$($d.Context)

## 📄 Specification
$($d.Spec)

## ✅ Acceptance Criteria
$($d.Acceptance)

## 🔧 Technical Notes
TBD by architect.

## 📁 Files Affected
TBD.

## 🔗 Dependencies
None listed.
"@
    }
    elseif ($d.Type -eq "BUG") {
        $suspectedPath = "tests/e2e/iron-mines.spec.ts"
        $body = @"
## Bug Report
$($d.Overview)

## 🐛 Bug Description
$($d.Overview)

## 📝 Steps to Reproduce
1. Run ``npx playwright test $suspectedPath``
2. Observe flakiness in session list visibility checks.

## ✅ Expected Behavior
Session list should be visible immediately after navigation.

## ❌ Actual Behavior
Timeout while waiting for locator.

## 📋 Error Logs
Check GitHub Actions CI logs for latest failure.

## 🔍 Debug Context
Playwright / E2E Environment.

## 📁 Suspected Files
[$suspectedPath]($BaseUrl/$suspectedPath)
"@
    }
    else {
        # INFRA
        $body = @"
## Infrastructure Task
$($d.Overview)

## 📋 Context
$($d.Context)

## 🎯 Scope
$($d.Overview)

## ✅ Acceptance Criteria
$($d.Acceptance)

## 📁 Files Affected
TBD.

## ⚠️ Risks & Rollback
Standard deployment risks. Review changes carefully.
"@
    }
    
    gh issue edit $num --repo $Repo --body "$body" | Out-Null
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host "`n✅ Repair complete!" -ForegroundColor Green
