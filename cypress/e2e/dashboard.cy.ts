describe('Dashboard', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('hevy_api_key', 'test-key');
            win.localStorage.setItem('hevy_proxy_url', '/api');
        });

        // Mock API calls to prevent network flakes
        cy.intercept('GET', '**/exercise_templates', {
            statusCode: 200,
            body: { exercise_templates: [] }
        }).as('getTemplates');

        cy.intercept('GET', '**/exercise-templates', {
            statusCode: 200,
            body: { exercise_templates: [] }
        }).as('getTemplatesAlternative');

        cy.intercept('GET', '**/wellness*', {
            statusCode: 200,
            body: { ctl: 42, ramp_rate: 1, bodyBattery: 85, sleepScore: 90, id: '2023-01-01' }
        }).as('getWellness');

        cy.intercept('GET', '**/events*', {
            statusCode: 200,
            body: []
        }).as('getEvents');

        cy.intercept('GET', '**/activities*', {
            statusCode: 200,
            body: []
        }).as('getActivities');

        cy.visit('/');
    });

    it('displays the Citadel view by default', () => {
        // Wait for loading to finish
        cy.contains('Initializing Codex', { timeout: 15000 }).should('not.exist');

        // Check for main interaction elements
        cy.contains('New Quest').should('be.visible');
        cy.contains('Armory').should('be.visible');
    });

    it('renders campaign tracker', () => {
        cy.contains('Initializing Codex', { timeout: 15000 }).should('not.exist');
        cy.get('section#campaign-tracker').scrollIntoView().should('be.visible');
        // Check if level is displayed
        cy.contains(/Level \d+/).should('exist');
    });
});
