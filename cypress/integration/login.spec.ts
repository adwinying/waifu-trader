describe("login", () => {
  it("should show title", () => {
    cy.visit("/login");
    cy.get("h1").should("contain.text", "Login");
  });

  it("should show required fields", () => {
    cy.visit("/login");
    cy.get('button[type="submit"]').click();
    cy.get('label[for="email-error"]').should("contain.text", "Invalid email");
    cy.get('label[for="password-error"]').should(
      "contain.text",
      "Should be at least 1 characters",
    );
  });

  it("should show error when login failed", () => {
    const email = "test@example.org";
    const password = "hashed_password";

    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="email-error"]').should(
      "contain.text",
      "Invalid email or password",
    );
  });

  it("should be able to login and redirect to top", () => {
    const username = "foobar";
    const email = "foo@example.org";
    const password = "secret";
    const hashedPassword =
      "$2y$10$fQ/fazS6NSwUfY7/lauARuiuE/7cZEjrdpuvF4PK6J18Hx14UbLMK";

    cy.setupDb();
    cy.seedDb({ user: [{ username, email, password: hashedPassword }] });

    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "You have successfully logged in!",
    );
    cy.get('[cy-data="header-user-name"]').should("contain.text", username);
  });

  it("should redirect to destination after login if redirect query is specified", () => {
    const username = "foobar";
    const email = "foo@example.org";
    const password = "secret";
    const hashedPassword =
      "$2y$10$fQ/fazS6NSwUfY7/lauARuiuE/7cZEjrdpuvF4PK6J18Hx14UbLMK";

    const redirectUrl = encodeURIComponent(
      `${Cypress.config().baseUrl}/preferences`,
    );

    cy.setupDb();
    cy.seedDb({ user: [{ username, email, password: hashedPassword }] });

    cy.visit(`/login?redirect=${redirectUrl}`);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "You have successfully logged in!",
    );
    cy.get('[cy-data="header-user-name"]').should("contain.text", username);
  });

  it("should redirect to home page if authenticated", () => {
    cy.setupDb();
    cy.login({ email: "test@example.org" });
    cy.visit("/login");

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
