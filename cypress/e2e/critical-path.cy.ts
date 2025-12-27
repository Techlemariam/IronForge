describe('Critical Path: Login -> Workout -> Combat', () => {
    beforeEach(() => {
        // Log in programmatically
        cy.login();
        cy.visit('/');
    });

    it('should navigate from Citadel to Iron Mines and Combat', () => {
        // 1. Verify Citadel (Dashboard) loads
        cy.contains('IronForge', { timeout: 10000 }).should('be.visible');

        // 2. Navigate to Iron Mines (Quick Action)
        // Note: Assuming "Iron Mines" text is present in CitadelHub buttons
        // If not, we might need to find the specific button selector.
        // Based on ux-audit, buttons were grouped?
        // Let's look for "Train" or "Iron Mines".
        cy.get('body').then(($body) => {
            if ($body.text().includes('Iron Mines')) {
                cy.contains('Iron Mines').click();
            } else {
                // Fallback for "Train" category if grouped
                cy.contains('Train').click();
                cy.contains('Iron Mines').click();
            }
        });

        // 3. Verify Iron Mines / Session Runner loaded
        // Look for typical workout UI elements
        cy.contains(/Select Routine|Quick Start|Session/i).should('exist');

        // 4. Return to Citadel
        cy.contains(/Close|Back|Return/i).click();

        // 5. Navigate to World Map / Combat
        cy.contains(/Combat|Explore|Map/i).click();

        // 6. Verify World Map or Combat presence
        // If World Map, click "Enter Combat"
        cy.get('body').then(($body) => {
            if ($body.text().includes('Enter Combat')) {
                cy.contains('Enter Combat').first().click();
            }
        });

        // 7. Check for Boss or Combat UI
        cy.contains(/Boss|Attack|Defend/i).should('exist');
    });
});
