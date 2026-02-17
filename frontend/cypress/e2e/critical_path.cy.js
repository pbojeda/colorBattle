describe('Critical User Path', () => {
    it('checks backend health', () => {
        cy.request('http://localhost:3000/health').should((response) => {
            expect(response.status).to.eq(200);
        });
    });

    it('creates a battle via API', () => {
        cy.request('POST', 'http://localhost:3000/api/battles', {
            name: 'API Battle',
            options: [{ name: 'Red' }, { name: 'Blue' }]
        }).then((resp) => {
            expect(resp.status).to.eq(201);
            expect(resp.body).to.have.property('battleId');
        });
    });

    it('creates a battle, votes, and chats', () => {
        cy.visit('/');

        const alertStub = cy.stub().as('alertStub');
        cy.on('window:alert', alertStub);

        // Check home
        cy.contains('COLOR BATTLE').should('be.visible');

        // Create
        // Ensure input is visible before typing
        cy.get('input[placeholder="ej. Gatos vs Perros"]').should('be.visible').type('Cypress Battle');
        cy.get('input[placeholder="Gatos"]').type('Cypress');
        cy.get('input[placeholder="Perros"]').type('Selenium');

        // Verify values
        cy.get('input[placeholder="ej. Gatos vs Perros"]').should('have.value', 'Cypress Battle');
        cy.get('input[placeholder="Gatos"]').should('have.value', 'Cypress');
        cy.get('input[placeholder="Perros"]').should('have.value', 'Selenium');

        cy.get('button[type="submit"]').click({ force: true });

        // Wait a bit for async operation
        cy.wait(1000);

        // Check for alerts
        cy.get('@alertStub').should('not.have.been.called');

        // Redirect
        cy.url({ timeout: 60000 }).should('include', '/battle/');
        cy.contains('h1', 'Cypress Battle', { timeout: 10000 }).should('be.visible');

        // Vote
        cy.contains('h2', 'Cypress').click();

        // Open Chat
        cy.get('button').contains('💬').click();

        // Type nickname
        cy.get('input[placeholder="Tu Apodo..."]').type('Tester');

        // Type message
        cy.get('input[placeholder="Escribí algo..."]').type('Hello World');

        // Send
        cy.get('button[type="submit"]').click();

        // Verify
        cy.contains('Hello World').should('be.visible');
        cy.contains('Tester').should('be.visible');
    });
});
