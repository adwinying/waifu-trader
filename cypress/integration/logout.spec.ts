describe("logout", () => {
  it("should redirect to login if unauthenticated", () => {
    cy.visit({ url: "/logout", method: "POST" });
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`);
  });

  it("should logout user if authenticated", () => {
    const name = "foobar";
    const email = "test@example.org";

    cy.setupDb();
    cy.login({ name, email });

    cy.visit("/");
    cy.get('[cy-data="header-user-name"]').should("contain.text", name);

    cy.visit({ url: "/logout", method: "POST" });
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`);
    cy.get("h1").should("contain.text", "Login");
  });
});
