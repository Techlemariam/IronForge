describe('Feature Navigation', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('hevy_api_key', 'test-key');
            win.localStorage.setItem('hevy_proxy_url', '/api');
        });

        // Mock minimal data
        cy.intercept('GET', '**/exercise-templates', { body: { exercise_templates: [] } });
        cy.intercept('GET', '**/exercise_templates', { body: { exercise_templates: [] } });
        cy.intercept('GET', '**/wellness*', { body: { id: 'today', ctl: 10, bodyBattery: 100 } });
        cy.intercept('GET', '**/events*', { body: [] });
        cy.intercept('GET', '**/activities*', { body: [] });

        cy.visit('/');
        cy.contains('Initializing Codex', { timeout: 15000 }).should('not.exist');
    });

    it('opens and closes the Bestiary', () => {
        cy.contains('Bestiary').click();
        cy.contains('The Bestiary', { timeout: 10000 }).should('be.visible');

        // Close using specific text
        cy.contains('Back to Citadel').click({ force: true });

        // Should be back to Citadel
        cy.contains('New Quest').should('be.visible');
    });

    it('opens and closes the World Map', () => {
        cy.contains('World Map').click();
        cy.contains('World Map', { timeout: 10000 }).should('be.visible');

        // Close
        cy.contains('Return to Citadel').click({ force: true });
        cy.contains('New Quest').should('be.visible');
    });

    it('opens and closes the Arena', () => {
        cy.contains('Arena').click();
        cy.contains('The Arena', { timeout: 10000 }).should('be.visible');

        // Close
        cy.contains('EXIT').click({ force: true });
        cy.contains('New Quest').should('be.visible');
    });
});
