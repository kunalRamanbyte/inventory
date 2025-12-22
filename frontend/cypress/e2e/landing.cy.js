describe('Landing Page', () => {
    it('should load the landing page and show the login button', () => {
        cy.visit('/');
        cy.contains('Inventory Management').should('be.visible');
        cy.contains('Login').should('be.visible');
    });

    it('should navigate to login page when login button is clicked', () => {
        cy.visit('/');
        cy.contains('Login').click();
        cy.url().should('include', '/login');
    });
});
