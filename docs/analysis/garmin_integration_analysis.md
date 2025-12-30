# Garmin Integration Analysis

## 🎯 Objective
Determine the optimal strategy for integrating Garmin Fenix 7X biometrics (Biometrics, Activities) into IronForge.

## 📊 Options Analysis

### Option 1: Direct Garmin Health API
*Connecting directly to Garmin's servers via OAuth.*

| Pros | Cons |
| :--- | :--- |
| **Real-time Data**: Webhooks for instant sync. | **Restricted Access**: Requires "Garmin Health API" enterprise approval (difficult for indie devs). |
| **Granularity**: Access to raw beat-to-beat interval data (RR intervals). | **Complexity**: Heavy OAuth implementation and strict rate limits. |
| **Brand**: "Official" integration. | **Maintenance**: Handling API versioning and downtime directly. |

### Option 2: ConnectIQ (Data Field) [DISCARDED]
*Running custom code on the watch.*
**DECISION**: We are **skipping** this entire ecosystem. It fragments the codebase (MonkeyC vs TypeScript) and provides poor ROI compared to a unified web dashboard.

### Option 3: Iron Command Center (Web Bluetooth) [RECOMMENDED]
*Direct browser connection to sensors.*

We will integrate directly with your hardware via `navigator.bluetooth` in the `CardioStudio` component.

#### A. Architecture: "Dual Stream" (The Key to Wellness)
To satisfy your requirement that **Garmin Wellness** stays updated, the **Garmin Fenix 7X MUST record the activity**. IronForge cannot "inject" wellness data into Garmin easily.

**The Solution: Parallel Broadcasting**
Your **Polar H10** and **Wahoo Kickr** support multiple concurrent connections (ANT+ and Bluetooth).

1.  **Channel A (Recording)**: Sensors → **Garmin Fenix 7X** (via ANT+ or BLE 1).
    *   *Result*: Garmin Connect gets the file. Body Battery, Training Status, and Recovery update correctly.
2.  **Channel B (Gameplay)**: Sensors → **Iron Command Center** (via Web Bluetooth).
    *   *Result*: IronForge gets real-time data to drive the UI/Game (Boss Damage, XP).

This "Passive Listener" approach is perfect. We don't need to upload anything to Garmin. We just listen while Garmin does the heavy lifting of recording.

#### B. Strategy per Modality
*   **Cycling**: Kickr broadcasts Power/Cadence to both Watch and Browser. Polar H10 broadcasts HR to both.
*   **Running**: Polar H10 broadcasts HR to both. Treadmill (if smart) broadcasts to both.

#### C. Integration
This lives entirely inside `src/features/training/CardioStudio.tsx`.
*   **Action**: We strictly *read* data. We do not need to save a duplicate FIT file (unless for backup). We rely on the Intervals.icu sync (from Garmin) for the persistent history.

### Workflow: Executing a Structured Workout (e.g. "20 min Zone 2")
Since we have a direct connection to the Kickr via FTMS, IronForge acts as the **Controller**.

1.  **Setup**:
    *   **IronForge**: You select "Titan Protocol: Zone 2" in `CardioStudio`.
    *   **Kickr**: Connected to IronForge (Channel 1) and Watch (Channel 2).
2.  **Execution**:
    *   **IronForge acts as TrainerRoad/Zwift**: It sends **ERG Mode** commands to the Kickr. *"Set resistance to 200W"*.
    *   **Garmin Watch**: You simply press "Start Indoor Bike". It records the power/HR that IronForge is dictating.
3.  **The Experience**:
    *   You feel the resistance change automatically based on the IronForge workout profile.
### Workflow: Treadmill (Titan Athlete T73)
**Control Status: READ-ONLY**
Research confirms the Titan Athlete T73 does **NOT** support Bluetooth control (Speed/Incline). It only broadcasts data.

1.  **Setup**:
    *   **IronForge**: Scans for "Running Speed & Cadence" service.
    *   **Treadmill**: Bluetooth enabled.
2.  **Execution (Human-in-the-loop)**:
    *   **Incline/Speed**: You MUST adjust these manually on the treadmill console.
    *   **IronForge acts as Dashboard**: It reads the new Speed/Incline instantly.
    **The "Hill Climb" Mechanic (GAP)**:
IronForge will calculate **Grade Adjusted Pace**.
*   Running 10km/h at 0% = 10 Damage/sec.
*   Running 10km/h at 10% = 15 Damage/sec.
*   *Benefit*: You are rewarded for "climbing" battles, not just flat speed.

### Decision: Titan T73 vs Fenix 7X (Speed Source)

| Feature | **Titan T73 (Direct)** | **Fenix 7X (Virtual Run)** |
| :--- | :--- | :--- |
| **Speed Accuracy** | 💎 **Perfect** (Reads belt speed) | ⚠️ **Variable** (Accelerometer guess) |
| **Incline Data** | ✅ **Yes** (Vital for GAP) | ❌ **No** (Cannot see incline) |
| **Cadence** | ❌ No (Usually) | ✅ Yes (Wrist based) |
| **Reliability** | ⚠️ Protocol dependent | 💎 Rock Solid (Garmin standard) |
| **Ergonomics** | 💎 Zero friction (Always there) | ⚠️ Friction (Must start "Virtual Run") |

**Recommendation: Use Titan T73 (Direct)**
*   **Why?** **INCLINE**. Without reading the incline directly from the T73, you lose the entire "Hill Climb" mechanic. Running uphill with the Fenix 7X would just punish you (HR goes up, detected Speed stays low).
*   *Missing Cadence?* We can simulate cadence or you can use a cheap Bluetooth Footpod later if that metric matters for gameplay.

**Fallback (Virtual Run)**:
If the T73 Bluetooth is finicky (some use proprietary "Fitshow" protocol), you can use the **Garmin Virtual Run** profile on your Fenix 7X. The watch broadcasts your pace (from internal accelerometer) to IronForge.

### Option 4: Aggregator (Intervals.icu) [BACKEND ONLY]
*Leveraging the existing sync pipeline: Garmin Connect → Intervals.icu → IronForge.*

This remains our **System of Record**. We use Bluetooth for *Real-time Gameplay*, but we still rely on the Garmin sync for the *Permanent Log*.

| Strategy | Strength | Running (Treadmill) | Cycling (Kickr) |
| :--- | :--- | :--- | :--- |
| **Web Bluetooth** | **N/A** (Manual Log) | **Dual Stream**: Watch Records + Browser Listens. | **Dual Stream**: Watch Records + Browser Listens. |
| **ConnectIQ** | DISCARDED | DISCARDED | DISCARDED |

| Pros | Cons |
| :--- | :--- |
| **Zero-Friction**: User already has this set up. | **Latency**: Sync delay (typically 15-60 mins after activity). |
| **Unified API**: Normalized data structure for all devices (Coros, Suunto, etc.). | **Dependency**: Relies on 3rd party uptime. |
| **Rich Wellness**: Includes HRV, Resting HR, Sleep Score, Stress. | **No HUD**: Cannot display game stats the watch during activity. |
| **Dev Velocity**: Integration is already built (`src/actions/intervals.ts`). | |

## 💡 Recommendation: "Aggregator First"
**Verdict: UNNECESSARY to build direct integration.**

Since you already synchronize Garmin data to Intervals.icu, IronForge can consume this data immediately via our existing `src/actions/intervals.ts` adapter. This provides 90% of the value (Health + Activities) with 0% additional overhead.

**Why?**
1.  **Unified Experience**: Running and Cycling both live in the `CardioStudio` web UI.
2.  **Dev Velocity**: We stay in TypeScript/Next.js. No MonkeyC.
3.  **Hardware**: Your Wahoo Kickr is perfect for this.

## 🔗 Implementation Details
### The "Iron Command Center" (Web Bluetooth)
*Architecture: `src/features/training/CardioStudio.tsx`*

We will enhance the existing `CardioStudio` component to support **Web Bluetooth** for both modes.

**Implementation Plan:**
1.  **Transport**: Browser's `navigator.bluetooth` API.
2.  **Hooks**: Create `useBluetoothHeartRate` (Run/Bike) and `useBluetoothPower` (Bike).
3.  **UX**: Toggle between "Simulation" and "Live Device" in the UI.

### Current Adapter (Intervals.icu)

### Current Adapter (Intervals.icu)
The "Garmin Fenix 7x Adapter" listed in the roadmap is currently our transformation layer in `src/actions/intervals.ts`:

```typescript
// Mapping Intervals (Garmin source) to IronForge
return {
    hrv: data.hrv,
    restingHR: data.restingHR,
    sleepScore: data.sleepScore,
    bodyBattery: data.readiness, // <-- This is the key Garmin metric
    // ...
}
```

## 📝 Action Items
- [x] Utilize existing Intervals.icu pipeline for Health/Activities.
- [ ] **Add to Roadmap**: "Iron Command Center" (Web Bluetooth) for Run/Bike live data in `CardioStudio`.
