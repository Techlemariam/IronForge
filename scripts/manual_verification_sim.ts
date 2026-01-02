
/**
 * Manual Verification Simulation Script
 * 
 * Simulates user interactions to verify:
 * 1. Path Switching (and DB update)
 * 2. Oracle Recommendations (based on Path)
 * 3. Combat Modifiers (based on Path)
 */

import { TrainingMemoryManager } from '../src/services/trainingMemoryManager';
import { OracleService } from '../src/services/oracle';
import { PATH_MODIFIERS } from '../src/data/builds';
import { TrainingPath } from '../src/types/training';

// Mock DB/State
let currentUserPath: TrainingPath = 'WARDEN';

async function runSimulation() {
    console.log("🚀 Starting Manual Verification Simulation...\n");

    // --- CASE 1: PATH SWITCHING ---
    console.log("--- 1. Testing Path Switching ---");
    console.log(`Current Path: ${currentUserPath}`);

    // Switch to PATHFINDER
    console.log("User action: Switch to 'PATHFINDER'");
    currentUserPath = 'PATHFINDER';

    // Verify Modifiers
    const modifiers = TrainingMemoryManager.getCombatModifiers(currentUserPath);
    console.log(`Active Modifiers for ${currentUserPath}:`, modifiers);

    if (modifiers.attackPower === 0.90 && modifiers.stamina === 1.30) {
        console.log("✅ Combat Modifiers Verified: Low Attack, High Stamina");
    } else {
        console.error("❌ Combat Modifiers Mismatch!");
    }
    console.log("\n");

    // --- CASE 2: ORACLE RECOMMENDATIONS ---
    console.log("--- 2. Testing Oracle Recommendations ---");

    // Mock Wellness Data
    const mockWellness = {
        ctl: 50, atl: 50, tsb: 5, // Positive TSB = Performance Mode
        sleepScore: 85, hrv: 60, bodyBattery: 80,
        vo2max: 55, spO2: 98, rhr: 50, weight: 80,
        id: '1', date: '2025-12-22', updated: '2025-12-22'
    };

    console.log(`Consulting Oracle for ${currentUserPath} with TSB +5...`);
    // NOTE: passing lowest: 'none' (cast as any) to bypass Priority 2 (Interventions)
    // so we can verify Priority 3 (Library Selection)
    const recommendation = await OracleService.consult(
        mockWellness,
        { strength: 1, endurance: 1, wellness: 1, lowest: 'none' as any },
        [], // No events
        null, // No Audit
        null, // No Titan Analysis
        null, // No Recovery Analysis
        currentUserPath
    );

    console.log("Oracle Recommended:", recommendation.title);
    console.log("Rationale:", recommendation.rationale);
    if (recommendation.generatedSession) {
        console.log("Generated Session:", recommendation.generatedSession.name);
    } else {
        console.warn("⚠️ No Generated Session found.");
    }

    // Verify Path Alignment
    if (recommendation.rationale.includes('Pathfinder Path') || recommendation.generatedSession?.name?.toLowerCase().includes('run') || recommendation.title.includes('PATHFINDER')) {
        console.log("✅ Oracle acknowledged Active Path Context");
    } else {
        console.error("❌ Oracle ignored Active Path (or fallback triggered)!");
    }

    // --- CASE 3: SURVIVAL MODE OVERRIDE ---
    console.log("\n--- 3. Testing Survival Mode Override ---");

    // Mock SICK Wellness
    // TSB -45 (< -40 threshold)
    // Sleep 20 (< 60 threshold) AND HRV 20 (< 40 threshold) -> 2 Debuffs
    const sickWellness = { ...mockWellness, tsb: -45, sleepScore: 20, hrv: 20 };
    console.log(`User enters with TSB -45, Sleep 20, HRV 20...`);

    const isSurvival = TrainingMemoryManager.shouldEnterSurvivalMode(sickWellness as any); // Type cast for sim
    console.log(`Survival Mode Active? ${isSurvival}`);

    if (isSurvival) {
        console.log("✅ Survival Mode Triggered correctly");

        // Check Oracle Output in Survival
        console.log("Consulting Oracle in Survival Mode...");
        const sickRec = await OracleService.consult(
            sickWellness,
            { strength: 1, endurance: 1, wellness: 1, lowest: 'none' as any },
            [], null, null, null,
            currentUserPath
        );
        console.log("Oracle Survival Rec:", sickRec.title);
        // We expect it to prioritize LOW intensity or Recovery
        console.log("Rationale:", sickRec.rationale);

        if (sickRec.title.includes("SURVIVAL")) {
            console.log("✅ Oracle correctly entered Survival Mode Output");
        } else {
            console.error("❌ Oracle failed to return Survival Mode output");
        }

    } else {
        console.error("❌ Survival Mode FAILED to trigger");
    }

    console.log("\n🚀 Simulation Complete.");
}

runSimulation().catch(console.error);
