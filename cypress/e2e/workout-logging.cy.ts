describe('Workout Logging UX', () => {
    beforeEach(() => {
        // Mock authentication
        cy.intercept('POST', '**/auth/v1/token*', {
            statusCode: 200,
            body: { access_token: 'fake-token' }
        });

        // Mock initial data load
        cy.intercept('GET', '**/api/progression', { fixture: 'progression.json' }); // Assuming we might need this

        // Visit main page (assuming auth bypass or mock works, heavily depends on app auth implementation)
        // For now, we assume we can just visit the page if we mock the server-side checks or session.
        // Since we can't easily mock RSC, we might hit login redirect if not authenticated.
        // We will assume the testing environment handles this or we need a login command.
        cy.visit('/');
    });

    it('runs the full logging flow', () => {
        // 1. Navigate to "New Quest" (War Room)
        cy.contains('New Quest').click();

        // 2. Select a Routine (Mock data or real if available)
        // We expect "RoutineSelector" to show routines.
        // Assuming there's at least one routine or we can create one? 
        // The DashboardClient mock data load in production fetch might fail in test.
        // We should probably verify if we can select a routine.

        // For resilience, let's look for "Start" button of a routine
        cy.get('button').contains('Start').first().click();

        // 3. Verify SessionRunner / ActionView is loaded
        // Look for new elements
        cy.contains('ActionView').should('exist'); // We don't verify component name but content

        // 4. Test "Quick Adjust"
        // Find a set row.
        cy.get('[placeholder="10"]').first().as('repsInput'); // Assuming default reps 10
        cy.get('@repsInput').should('have.value', '10');

        // Click '+' button next to reps
        cy.get('button:contains("+")').first().click();
        cy.get('@repsInput').should('have.value', '11');

        // 5. Test "RPE" Input
        // Click to focus the set (ActionView logic: focus on click)
        cy.get('[placeholder="10"]').first().click();
        cy.get('[placeholder="-"]').should('be.visible'); // RPE input

        // 6. Test "Add Exercise"
        cy.contains('Add Exercise').click();
        cy.contains('Exercise Library').should('be.visible');

        // Search and Select
        cy.get('input[placeholder="Search exercises..."]').type('Bench');
        cy.contains('Bench Press').click();

        // Verify new exercise added
        cy.contains('New Exercise').should('exist'); // We mocked it to name 'New Exercise' in ActionView

        // 7. Complete Session
        cy.contains('Complete Quest').click();

        // Verify Completion Screen
        cy.contains('Quest Completed!').should('be.visible');
    });
});
