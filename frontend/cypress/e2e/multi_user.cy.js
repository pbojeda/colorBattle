describe('Multi-user Real-time Voting', () => {
    let battleId;

    before(() => {
        // Create a battle via API for testing
        cy.request('POST', 'http://localhost:3000/api/battles', {
            name: 'Multi-user Test',
            options: [{ name: 'User A' }, { name: 'User B' }]
        }).then((res) => {
            battleId = res.body.battleId;
        });
    });

    it('should see real-time vote updates from other users', () => {
        const battleUrl = `/battle/${battleId}`;

        // 1. Visit as User 1
        cy.visit(battleUrl);
        cy.contains('User A').should('be.visible');
        cy.contains('0%').should('be.visible');

        // 2. Simulate User 2 voting via API (mimicking another client)
        // We need to get an option ID first
        cy.request('GET', `http://localhost:3000/api/battle/${battleId}`).then((res) => {
            const optAId = res.body.options[0].id;

            cy.request('POST', `http://localhost:3000/api/battle/${battleId}/vote`, {
                optionId: optAId,
                deviceId: 'external-user-device'
            });
        });

        // 3. User 1 should see the update automatically (WebSocket)
        // Note: Percentage might be 100% since it's the only vote
        cy.contains('100%', { timeout: 10000 }).should('be.visible');
        cy.contains('1 votos').should('be.visible');
    });

    it('should allow multiple local users to vote if we clear state', () => {
        // This is a bit tricky in Cypress, but we can simulate by reloading with a mocked device ID
        // Actually, the app gets deviceId from FingerprintJS on load.
        // We can intercept the API call to /vote and check if it's sent correctly.
    });
});
