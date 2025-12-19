describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
    });

    it('shows configuration required initially', () => {
        // The background text is covered by the modal, so we just check existence
        cy.contains('Configuration Required').should('exist');
        // The modal itself should be visible
        cy.contains('System Configuration').should('be.visible');
    });

    it('allows configuration', () => {
        // Open modal (if not already open, but it is auto-open)
        cy.get('body').then($body => {
            if ($body.find('h2:contains("System Configuration")').length === 0) {
                cy.get('button[title="System Configuration"]').click();
            }
        });

        // Fill input
        cy.contains('Hevy API Key').parent().find('input').type('test-key');

        // Save
        cy.contains('Save & Reload').click();

        // Verify dashboard loads
        cy.contains('New Quest', { timeout: 20000 }).should('be.visible');
    });
});
