describe('The Iron Colosseum (Arena)', () => {
    beforeEach(() => {
        // @ts-ignore
        cy.login();
    });

    it('loads the Colosseum page', () => {
        cy.visit('/colosseum');
        cy.contains('The Iron Colosseum').should('be.visible');
        cy.contains('Gladiators').should('be.visible');
    });

    it('displays the leaderboard', () => {
        cy.visit('/colosseum');
        // Check for table headers or player rows
        cy.contains('Rank').should('exist');
        // cy.contains('Hero').should('exist');
    });

    it('shows the "Find Match" card', () => {
        cy.visit('/colosseum');
        cy.contains('Find Match').should('be.visible');
        cy.contains('Enter Arena').should('exist');
    });
});
