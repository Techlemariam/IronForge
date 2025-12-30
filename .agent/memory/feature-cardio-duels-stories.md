# Cardio PvP Duels - User Stories

**Feature:** Cardio PvP Duels  
**Status:** Phase 1 Complete

---

## Epic: Enable competitive cardio duels between users

### US-1: Distance Race Duel (Cycling)
**As a** Titan with a Wahoo Kickr  
**I want to** challenge another Titan to a distance race at a specific W/kg tier  
**So that** we compete fairly regardless of body weight  

**Acceptance Criteria:**
- [ ] Can select duel type "Distance Race" when creating challenge
- [ ] Can select duration (5/10/15/30 min)
- [ ] Can select W/kg tier (2.0/2.5/3.0/3.5)
- [ ] ERG mode target = W/kg × body weight
- [ ] Distance calculated from power data

---

### US-2: Distance Race Duel (Running)
**As a** Titan with a treadmill  
**I want to** challenge another Titan to run the longest distance in X minutes  
**So that** we compete based on pure running ability  

**Acceptance Criteria:**
- [ ] Distance read from treadmill via Web Bluetooth
- [ ] Duration options: 5/10/15/30 min
- [ ] No weight normalization (pure distance)
- [ ] Minimum speed: 4 km/h

---

### US-3: Speed Demon Duel
**As a** competitive athlete  
**I want to** race to complete a fixed distance fastest  
**So that** the winner is clearly the faster athlete  

**Acceptance Criteria:**
- [ ] Running: 1/3/5/10 km options
- [ ] Cycling: 5/10/20/40 km options
- [ ] Timer counts up until distance reached
- [ ] W/kg tier applies for cycling

---

### US-4: Elevation Grind Duel (Cycling)
**As a** cyclist  
**I want to** compete on total elevation gained  
**So that** climbing specialists can shine  

**Acceptance Criteria:**
- [ ] Duration: 10/20/30 min
- [ ] Elevation from Kickr virtual gradient
- [ ] W/kg tier for fairness

---

### US-5: Duel Creation UI
**As a** user in Iron Arena  
**I want to** create a cardio duel with type/duration/tier selection  
**So that** I can customize the competition format  

**Acceptance Criteria:**
- [ ] Modal shows duel type selector
- [ ] Duration dropdown based on type
- [ ] W/kg tier selector (cycling only)
- [ ] My weight shown for reference

---

### US-6: Duel Progress Tracking
**As a** participant in an active cardio duel  
**I want to** see real-time progress (distance/time)  
**So that** I know how I'm performing vs opponent  

**Acceptance Criteria:**
- [ ] DuelCard shows current distance/time
- [ ] Progress bar for duration-based duels
- [ ] Live sync from CardioStudio session

---

## Platform Matrix

| Feature | Desktop | Mobile | TV Mode | Companion |
|:--------|:-------:|:------:|:-------:|:---------:|
| Create Duel | ✅ Full | ✅ Full | ❌ | ❌ |
| Accept Duel | ✅ | ✅ | ❌ | ✅ Notify |
| Execute Duel | ✅ CardioStudio | ⚠️ Limited | ✅ Primary | ❌ |
| View Progress | ✅ | ✅ | ✅ | ✅ |
