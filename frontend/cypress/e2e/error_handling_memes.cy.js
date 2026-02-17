describe('Error Handling and Edge Cases', () => {
    it('should show error for non-existent battle', () => {
        cy.visit('/battle/this-battle-does-not-exist', { failOnStatusCode: false });
        cy.contains('Failed to load battle.', { timeout: 10000 }).should('be.visible');
    });

    it('should handle meme generation flow', () => {
        // Intercept meme generation to avoid rate limits and latency
        // Note: BattlePage uses GET /api/battle/:id/meme
        cy.intercept('GET', '**/api/battle/*/meme', {
            statusCode: 200,
            body: new Blob(['mock-image-data'], { type: 'image/jpeg' }),
            headers: { 'content-type': 'image/jpeg' }
        }).as('generateMeme');

        // 1. Create a battle
        cy.visit('/');
        cy.get('input[placeholder="ej. Gatos vs Perros"]').type('Meme Test');
        cy.get('input[placeholder="Gatos"]').type('A');
        cy.get('input[placeholder="Perros"]').type('B');
        cy.get('button[type="submit"]').click();

        // 2. Wait for redirect
        cy.url({ timeout: 60000 }).should('include', '/battle/');

        // 3. Trigger Meme (Using the 😂 emoji button)
        cy.get('button').contains('😂').click();

        // 4. Verify Loading and then Image
        cy.contains('Cocinando un meme picante...', { timeout: 15000 }).should('be.visible');

        cy.wait('@generateMeme');

        // The image should eventually appear in the modal
        cy.get('img[alt="Meme Generado por IA"]', { timeout: 15000 }).should('be.visible');
    });
});
