describe("logout", () => {
  it("should redirect to login if unauthenticated", () => {
    cy.visit({ url: "/logout", method: "POST" });
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`);
  });

  it("should logout user if authenticated", () => {
    const username = "foobar";
    const email = "foo@example.org";

    cy.setupDb();
    cy.login({ username, email });

    cy.visit("/");
    cy.get('[cy-data="header-user-name"]').should("contain.text", username);

    cy.visit({ url: "/logout", method: "POST" });
    cy.url().should("eq", `${Cypress.config().baseUrl}/login`);
    cy.get("h1").should("contain.text", "Login");
  });
});
