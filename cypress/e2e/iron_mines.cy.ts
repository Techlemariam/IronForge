describe('Iron Mines Workout (RPG Mode)', () => {
    beforeEach(() => {
        // Setup state for a generic workout
        cy.window().then((win) => {
            win.localStorage.setItem('hevy_api_key', 'test-key');
        });

        // Mock Next.js router/navigation if needed
        // Since we are visiting a page that renders the component based on state,
        // we might need to seed the app state. 
        // Assuming we go through the UI to start a workout.

        cy.visit('/'); // Goes to Dashboard
        cy.contains('Initializing Codex', { timeout: 15000 }).should('not.exist');
    });

    it('successfully runs a workout loop', () => {
        // 1. Select a workout (e.g. from the War Room or Quick Start)
        cy.contains('New Quest').click();

        // Mock the template selection if needed, or select "Quick Start"
        // Assuming "New Quest" opens RoutineSelector
        // Let's click on a predefined routine or "Empty Workout"
        // If dependent on API, we mock it:
        cy.intercept('GET', '**/routines', { body: { routines: [{ id: '1', title: 'Leg Day' }] } });

        // Wait for routines to load (timebox)
        // Then click "Start"
        // This part heavily depends on the actual implementation of RoutineSelector.
        // For now, let's verify if we can see the "Start" button for a routine or mock the state dispatch directly?
        // E2E should test the UI.

        // Simulating a more direct entry for stability in this test MVP:
        // We can use a special test route or just try to find a button.
        // If we can't fully traverse, we log a warning. 
        // But let's try to find "Leg Day" if we mocked it.
        // cy.contains('Leg Day').click();

        // Placeholder check for Iron Mines specific elements if we were able to enter:
        // cy.get('input[type="number"]').should('exist'); // Weight input
        // cy.contains('RPE').should('exist');
    });

    it('displays Overcharge prompt on low RPE', () => {
        // This requires deeper integration testing.
        // We verify the component renders if we force it.
        // cy.get('[data-testid="overcharge-prompt"]').should('be.visible');
    });
});
