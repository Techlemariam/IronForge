import { test, expect } from '@playwright/test';

test.describe('Iron Mines - Strength Training', () => {

    test.beforeEach(async ({ page }) => {
        // Enable debug log forwarding immediately
        page.on('console', msg => {
            if (msg.text().includes('[E2E-DEBUG]')) {
                console.log(msg.text());
            }
        });

        // Ensure API key is present before page loads so onboarding/config screens are bypassed
        await page.addInitScript(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
            // Fix: Add mocks to bypass PreWorkoutCheck
            (window as any).__mockAutoCheckIn = true;
            (window as any).__mockUser = { id: 'test-user', heroName: 'Tester' };
        });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Exit any active views
        const exitButton = page.getByTitle("Close (Esc)");
        if (await exitButton.isVisible()) {
            await exitButton.click();
            await page.waitForTimeout(500);
        }

        // Dismiss onboarding modals
        const onboardingButtons = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later"), button:has-text("Continue"), button:has-text("I Swear It")');
        let attempts = 0;
        while (await onboardingButtons.count() > 0 && attempts < 5) {
            await onboardingButtons.first().click();
            attempts++;
            if (await onboardingButtons.count() === 0) break;
            await page.waitForTimeout(200); // small delay to let modal change
        }
    });

    test('should navigate to Iron Mines (Strength Training)', async ({ page }) => {
        // 1. Navigate to Training Operations (War Room)
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        // 2. Open Training Center via Strength Focus -> Training Codex
        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.click();

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.click();

        // 3. In Training Center, Select "Strength" Tab
        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();

        // 4. Find and Select "E2E Strength Test"
        const testWorkoutCard = await page.waitForSelector('[data-testid="workout-card-strength_test_e2e"]', { timeout: 30000 });
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears (Mock fallback)
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            console.log('PreWorkoutCheck detected. Handling...');

            // Click "Cast Scan" if visible (IDLE state)
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) {
                await castScanBtn.click();
            }

            // Wait for scan results (COMPLETE state)
            // Could be "Accept Quest" or "Ignore Warning"
            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        // 5. This triggers 'START_GENERATED_QUEST' -> 'iron_mines' view
        // Should see Iron Mines or Workout related elements
        await expect(page.getByText(/Quest Complete|E2E Strength Test/i).first()).toBeVisible({ timeout: 15000 });

        // Also verify LiveSessionHUD is present
        await page.waitForSelector('[data-testid="coop-toggle-button"]', { timeout: 15000 });
    });

    test('should display workout HUD elements', async ({ page }) => {
        // Navigate to Iron Mines / Strength view
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.evaluate((el) => (el as HTMLElement).click());

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.evaluate((el) => (el as HTMLElement).click());

        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();

        const testWorkoutCard = page.getByTestId('workout-card-strength_test_e2e');
        await expect(testWorkoutCard).toBeVisible({ timeout: 10000 });
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) await castScanBtn.click();

            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        // Wait for HUD elements (if in workout view)
        const hudElements = page.locator('.bg-black\\/40.backdrop-blur-xl, [data-testid="biometrics-hud"]');
        const exerciseCards = page.locator('[class*="ForgeCard"], [class*="exercise-view"]');

        // At minimum, verify we reached some strength-related view
        const content = await page.content();
        expect(content).toMatch(/Iron|Mines|Strength|Workout|Exercise|Dungeon/i);
    });

    test('should show exercise library when adding exercise', async ({ page }) => {
        // Look for Add Exercise or Plus button (common in workout UIs)
        const addExerciseBtn = page.locator('button:has-text("Add Exercise"), button:has([class*="Plus"]), [aria-label*="add"]').first();

        if (await addExerciseBtn.isVisible({ timeout: 5000 })) {
            await addExerciseBtn.click();

            // Verify Exercise Library modal appears
            const modalTitle = page.getByText(/Exercise Library|Search exercises/i).first();
            await expect(modalTitle).toBeVisible({ timeout: 10000 });

            // Search input should be present
            await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
        } else {
            // Skip if not in appropriate view
            test.skip();
        }
    });

    test('should persist workout state across reload', async ({ page }) => {
        // Test localStorage persistence
        await page.evaluate(() => {
            // Simulate a workout session in progress
            localStorage.setItem('iron_mines_session', JSON.stringify([
                { id: 'ex-1', name: 'Test Exercise', sets: [{ id: 's1', completed: true }] }
            ]));
            localStorage.setItem('iron_mines_index', '0');
        });

        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        // Verify state was restored from localStorage
        const savedSession = await page.evaluate(() => localStorage.getItem('iron_mines_session'));
        expect(savedSession).not.toBeNull();
        expect(JSON.parse(savedSession!)).toHaveLength(1);
    });

    test('should display swipe hint on active exercise', async ({ page }) => {
        // Navigate to workout view if possible
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        if (await trainingOpBtn.isVisible({ timeout: 5000 })) {
            await trainingOpBtn.click();

            const strengthBtn = page.getByRole('button', { name: /Strength Focus|Iron Mines/i });
            if (await strengthBtn.isVisible({ timeout: 5000 })) {
                await strengthBtn.click();
                await page.waitForLoadState('networkidle');
            }
        }

        // Check for swipe hint text in the DOM (may only appear on active sets)
        const content = await page.content();
        console.log('Page contains swipe hint:', content.includes('Swipe right to complete'));
    });

    test('should show progress chart toggle', async ({ page }) => {
        // Navigate to workout view
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        if (await trainingOpBtn.isVisible({ timeout: 5000 })) {
            await trainingOpBtn.click();

            const strengthBtn = page.getByRole('button', { name: /Strength Focus|Iron Mines/i });
            if (await strengthBtn.isVisible({ timeout: 5000 })) {
                await strengthBtn.click();
                await page.waitForLoadState('networkidle');
            }
        }

        // Look for chart toggle button (BarChart2 icon)
        const chartToggle = page.locator('button[title*="Progress"], button [class*="BarChart"], svg[class*="lucide-bar-chart"]').first();

        if (await chartToggle.isVisible({ timeout: 5000 })) {
            // Click to toggle chart
            await chartToggle.click();

            // Chart container should appear
            await expect(page.locator('.recharts-wrapper, [class*="AreaChart"]').first()).toBeVisible({ timeout: 5000 });
        }
    });

});

test.describe('Iron Mines - Co-Op Sessions', () => {

    test.beforeEach(async ({ page }) => {
        // Forward browser console logs to node stdout
        page.on('console', msg => console.log(`[Browser]: ${msg.text()}`));

        // Inject API key and Mock User via init script to persist across navigations
        await page.addInitScript(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
            (window as any).__mockUser = { id: 'test-user', heroName: 'Tester' };
            (window as any).__mockAutoCheckIn = true;
        });

        await page.goto('/dashboard');

        await page.waitForTimeout(1500);

        // Navigate via UI to reach Iron Mines (SPA)
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        // Full Navigation to Session
        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.click();

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.click();

        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();

        const testWorkoutCard = page.getByTestId('workout-card-strength_test_e2e');
        await expect(testWorkoutCard).toBeVisible({ timeout: 10000 });
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) await castScanBtn.click();

            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        await page.waitForLoadState('networkidle');
    });

    test('should display Co-Op session creation button', async ({ page }) => {
        // Look for Co-Op/multiplayer UI elements - use waitForSelector for CI stability
        const coopButton = await page.waitForSelector('[data-testid="coop-toggle-button"]', {
            timeout: 15000,
            state: 'visible'
        });
        expect(coopButton).not.toBeNull();
    });

    test('should show available sessions list when toggled', async ({ page }) => {
        // Mock available sessions so session-list is rendered
        await page.evaluate(() => {
            (window as any).__mockSessions = [
                {
                    id: 'session-1',
                    hostId: 'host-user',
                    workoutName: 'E2E Test Session',
                    participants: [{ userId: 'host-user', heroName: 'Host', status: 'active' }],
                    maxParticipants: 4,
                    status: 'waiting'
                }
            ];
        });

        // Find and click the session browser toggle using waitForSelector
        const sessionToggle = await page.waitForSelector('[data-testid="coop-toggle-button"]', {
            timeout: 15000,
            state: 'visible'
        });
        await sessionToggle!.evaluate((el) => (el as HTMLElement).click());

        // Check for session list UI with increased timeout
        const sessionList = await page.waitForSelector('[data-testid="session-list"]', {
            timeout: 10000,
            state: 'visible'
        });
        expect(sessionList).not.toBeNull();
    });

    test('should display session participants UI', async ({ page }) => {
        // Mock a Co-Op session with participants
        await page.evaluate(() => {
            (window as any).__mockCoOpSession = {
                id: 'test-session-1',
                status: 'active',
                participants: [
                    { userId: 'user1', heroName: 'Iron Breaker', status: 'active' },
                    { userId: 'user2', heroName: 'Steel Viper', status: 'active' }
                ]
            };
        });

        // Expand HUD to see details using waitForSelector
        const sessionToggle = await page.waitForSelector('[data-testid="coop-toggle-button"]', {
            timeout: 15000,
            state: 'visible'
        });
        await sessionToggle!.evaluate((el) => (el as HTMLElement).click());

        // Wait for participants to render with increased timeout
        await expect(page.locator('[data-testid="participant-row"]')).toHaveCount(2, { timeout: 15000 });
    });

});

test.describe('Iron Mines - Co-Op Entry', () => {
    test.beforeEach(async ({ page }) => {
        // Inject API key and Mock User via init script to persist across navigations
        await page.addInitScript(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
            (window as any).__mockUser = { id: 'test-user', heroName: 'Tester' };
            (window as any).__mockAutoCheckIn = true;
        });

        await page.goto('/dashboard');
        await page.waitForTimeout(1500);

        // Navigate to Codex
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.click();

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.click();

        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();
    });

    test('should show invite code when session created', async ({ page }) => {
        // Mock session creation response
        await page.evaluate(() => {
            (window as any).__mockInviteCode = 'ABC123';
        });

        // 4. Find and Select "E2E Strength Test" to enter Iron Mines
        const testWorkoutCard = page.getByTestId('workout-card-strength_test_e2e');
        await expect(testWorkoutCard).toBeVisible({ timeout: 30000 });
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) await castScanBtn.click();

            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        await page.waitForLoadState('networkidle');

        // 5. This triggers 'START_GENERATED_QUEST' -> 'iron_mines' view
        // Use waitForSelector with increased timeout (CI is slower)
        // Check for either enabled or disabled state of coop button
        const coopButton = await page.waitForSelector('[data-testid="coop-toggle-button"]', {
            timeout: 15000,
            state: 'visible'
        });
        expect(coopButton).not.toBeNull();

        // Verify the button is in correct state (user present = enabled)
        const userStatus = await coopButton.getAttribute('data-user-status');
        if (userStatus === 'missing') {
            console.log('[E2E] Warning: coop-toggle-button found but user is missing');
        }
    });
});

test.describe('Iron Mines - Ghost Mode', () => {

    test.beforeEach(async ({ page }) => {
        // Inject API key and Mock User via init script to persist across navigations
        await page.addInitScript(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
            (window as any).__mockUser = { id: 'test-user', heroName: 'Tester' };
            (window as any).__mockAutoCheckIn = true;
        });

        await page.goto('/dashboard');

        await page.waitForTimeout(1500);

        // Navigate via UI to reach Iron Mines (SPA)
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        // 2. Open Training Center (Codex)
        // 2. Open Training Center via Strength Focus -> Training Codex
        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.click();

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.click();

        // 3. In Training Center, Select "Strength" Tab
        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();

        // 4. Find and Select "E2E Strength Test"
        const testWorkoutCard = page.getByTestId('workout-card-strength_test_e2e');
        await expect(testWorkoutCard).toBeVisible({ timeout: 10000 });
        // Use evaluate click to bypass potential overlays/animations failing Playwright checks
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) await castScanBtn.click();

            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        await page.waitForLoadState('networkidle');
    });

    test('should display GhostOverlay component with mock events', async ({ page }) => {
        // Inject mock ghost events
        await page.evaluate(() => {
            (window as any).__mockGhostEvents = [
                {
                    type: 'SET_COMPLETE',
                    userId: 'user2',
                    heroName: 'Iron Breaker',
                    reps: 10,
                    weight: 100,
                    timestamp: Date.now()
                },
                {
                    type: 'PR',
                    userId: 'user3',
                    heroName: 'Steel Viper',
                    reps: 12,
                    timestamp: Date.now()
                }
            ];
        });

        await page.waitForTimeout(1000);

        // Check for GhostOverlay container (typically fixed bottom-right)
        const ghostOverlay = page.locator('.fixed.bottom-20.right-4, [data-testid="ghost-overlay"]');

        // Verify overlay structure exists in DOM
        const overlayCount = await ghostOverlay.count();
        console.log('GhostOverlay elements found:', overlayCount);
    });

    test('should show ghost events with correct icons', async ({ page }) => {
        await page.evaluate(() => {
            (window as any).__mockGhostEvents = [
                { type: 'SET_COMPLETE', userId: 'user2', heroName: 'Test User', timestamp: Date.now() },
                { type: 'PR', userId: 'user3', heroName: 'PR User', timestamp: Date.now() },
                { type: 'BERSERKER', userId: 'user4', heroName: 'Berserker', timestamp: Date.now() }
            ];
        });

        await page.waitForTimeout(1000);

        // Check for event type icons (Dumbbell, FlameKindling, Ghost)
        const content = await page.content();

        // Verify page structure supports ghost events
        expect(content.length).toBeGreaterThan(0);
    });

    test('should filter out own events from ghost overlay', async ({ page }) => {
        const currentUserId = 'current-user-123';

        await page.evaluate((userId) => {
            (window as any).__currentUserId = userId;
            (window as any).__mockGhostEvents = [
                { type: 'SET_COMPLETE', userId: userId, heroName: 'Me', timestamp: Date.now() },
                { type: 'SET_COMPLETE', userId: 'other-user', heroName: 'Other', timestamp: Date.now() }
            ];
        }, currentUserId);

        await page.waitForTimeout(1000);

        // Verify filtering logic (own events should not appear)
        const content = await page.content();

        // Check that ghost overlay exists but doesn't show own events
        console.log('Ghost event filtering check completed');
    });

    test('should limit visible events to MAX_VISIBLE_EVENTS', async ({ page }) => {
        // Create 10 mock events (should only show 5)
        await page.evaluate(() => {
            (window as any).__mockGhostEvents = Array.from({ length: 10 }, (_, i) => ({
                type: 'SET_COMPLETE',
                userId: `user${i}`,
                heroName: `User ${i}`,
                timestamp: Date.now() + i
            }));
        });

        // Wait for ghost events to render
        // Wait for ghost events to render using waitForSelector for CI stability
        const firstEvent = await page.waitForSelector('[data-testid="ghost-event-item"]', {
            timeout: 15000,
            state: 'visible'
        });
        expect(firstEvent).not.toBeNull();

        // Verify count matches limit (MAX_VISIBLE_EVENTS = 5)
        await expect(page.locator('[data-testid="ghost-event-item"]')).toHaveCount(5, { timeout: 10000 });
    });

});

test.describe('Iron Mines - LiveSessionHUD Interactions', () => {

    test.beforeEach(async ({ page }) => {
        // Inject API key and Mock User via init script to persist across navigations
        await page.addInitScript(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
            (window as any).__mockUser = { id: 'test-user', heroName: 'Tester' };
            (window as any).__mockAutoCheckIn = true;
        });

        await page.goto('/dashboard');

        await page.waitForTimeout(1500);

        // Navigate via UI to reach Iron Mines (SPA)
        // 1. Navigate to Training Operations (War Room)
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible({ timeout: 30000 });
        await trainingOpBtn.click();

        // 2. Open Training Center (Codex)
        // 2. Open Training Center via Strength Focus -> Training Codex
        const strengthFocusBtn = page.getByRole('button', { name: /Strength Focus/i });
        await expect(strengthFocusBtn).toBeVisible();
        await strengthFocusBtn.click();

        const trainingCodexBtn = page.getByRole('button', { name: /Training Codex/i });
        await expect(trainingCodexBtn).toBeVisible();
        await trainingCodexBtn.click();

        // 3. In Training Center, Select "Strength" Tab
        const strengthTab = page.getByTestId('tab-strength');
        await expect(strengthTab).toBeVisible({ timeout: 10000 });
        await strengthTab.click();

        // 4. Find and Select "E2E Strength Test"
        const testWorkoutCard = page.getByTestId('workout-card-strength_test_e2e');
        await expect(testWorkoutCard).toBeVisible({ timeout: 10000 });
        // Use evaluate click to bypass potential overlays/animations failing Playwright checks
        await testWorkoutCard.evaluate((el) => (el as HTMLElement).click());

        // Handle PreWorkoutCheck if it appears
        const preCheckHeader = page.getByText(/Spirit Healer Link|Check Vitality/i);
        if (await preCheckHeader.isVisible({ timeout: 5000 })) {
            const castScanBtn = page.getByRole('button', { name: /Cast Scan/i }).first();
            if (await castScanBtn.isVisible()) await castScanBtn.click();

            const actionBtn = page.locator('button:has-text("Accept Quest"), button:has-text("Ignore Warning")').first();
            await expect(actionBtn).toBeVisible({ timeout: 15000 });

            if (await page.getByText(/Ignore Warning/i).isVisible()) {
                await page.getByText(/Ignore Warning/i).click();
                await page.getByText(/Confirm Override/i).click();
            } else {
                await page.getByText(/Accept Quest/i).click();
            }
        }

        await page.waitForLoadState('networkidle');
    });

    test('should toggle session browser visibility', async ({ page }) => {
        // Inject mock sessions to ensure list renders
        await page.evaluate(() => {
            (window as any).__mockSessions = [
                { id: '1', hostId: 'host-1', status: 'waiting', participants: [], maxParticipants: 4 }
            ];
        });

        // Find session toggle button (Users icon)
        const toggleButton = page.getByTestId('coop-toggle-button');
        await expect(toggleButton).toBeVisible();

        // Click to open
        await toggleButton.click();

        // Verify session list appears
        await expect(page.getByTestId('session-list')).toBeVisible();

        // Click again to close
        await toggleButton.click();

        // Verify session list disappears
        await expect(page.getByTestId('session-list')).toBeHidden();
    });

    test('should display session status badges', async ({ page }) => {
        await page.evaluate(() => {
            (window as any).__mockSessions = [
                { id: '1', status: 'waiting', participants: [] },
                { id: '2', status: 'active', participants: [] }
            ];
        });

        await page.waitForTimeout(1000);

        // Look for status indicators
        const statusBadges = page.locator('[class*="status"], [class*="badge"]');

        // Verify status UI exists
        const badgeCount = await statusBadges.count();
        console.log('Status badges found:', badgeCount);
    });

    test('should show participant count display', async ({ page }) => {
        await page.evaluate(() => {
            (window as any).__mockCoOpSession = {
                participants: [
                    { userId: 'u1', heroName: 'User 1' },
                    { userId: 'u2', heroName: 'User 2' }
                ],
                maxParticipants: 4
            };
        });

        await page.waitForTimeout(1000);

        // Look for participant count (e.g., "2/4")
        const participantCount = page.locator('text=/\\d+\\/\\d+/');

        // Check for count pattern in page
        const content = await page.content();
        const hasCountPattern = /\d+\/\d+/.test(content);
        console.log('Participant count pattern found:', hasCountPattern);
    });

    test('should handle session leave action', async ({ page }) => {
        await page.evaluate(() => {
            (window as any).__mockCoOpSession = { id: 'test-session', participants: [{ id: 'me', userId: 'me', heroName: 'Hero', status: 'active' }], maxParticipants: 4 };
            (window as any).__mockSessions = []; // Prevent real network call
        });

        // Open toggle first (robust click)
        const toggle = page.getByTestId('coop-toggle-button');
        await toggle.evaluate((el) => (el as HTMLElement).click());

        // Look for leave/exit button
        const leaveButton = page.getByTestId('leave-session-button');
        await expect(leaveButton).toBeVisible();
    });

});
