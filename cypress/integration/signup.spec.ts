describe("signup", () => {
  it("should show title", () => {
    cy.visit("/signup");
    cy.get("h1").should("contain.text", "Sign Up");
  });

  it("should show required fields", () => {
    cy.visit("/signup");
    cy.get('button[type="submit"]').click();
    cy.get('label[for="username-error"]').should(
      "contain.text",
      "Should be at least 1 characters",
    );
    cy.get('label[for="email-error"]').should("contain.text", "Invalid email");
    cy.get('label[for="password-error"]').should(
      "contain.text",
      "Should be at least 8 characters",
    );
    cy.get('label[for="passwordConfirmation-error"]').should(
      "contain.text",
      "Should be at least 8 characters",
    );
  });

  it("should show error when username exceeds 50 chars", () => {
    const username = "f".repeat(51);

    cy.visit("/signup");
    cy.get('input[name="username"]').type(username);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="username-error"]').should(
      "contain.text",
      "Should be at most 50 characters long",
    );
  });

  it("should show error when username already exists", () => {
    const username = "foo";
    const email = "foo@example.org";
    const password = "hashed_password";

    cy.setupDb();
    cy.seedDb({ user: [{ username, email, password }] });

    cy.visit("/signup");
    cy.get('input[name="username"]').type(username);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="username-error"]').should(
      "contain.text",
      "Username already in use",
    );
  });

  it("should show error when username contains invalid characters", () => {
    const username = "foo@bar";

    cy.visit("/signup");
    cy.get('input[name="username"]').type(username);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="username-error"]').should(
      "contain.text",
      "Only alphanumeric characters, _, - are allowed",
    );
  });

  it("should show error when email already exists", () => {
    const username = "foo";
    const email = "foo@example.org";
    const password = "hashed_password";

    cy.setupDb();
    cy.seedDb({ user: [{ username, email, password }] });

    cy.visit("/signup");
    cy.get('input[name="email"]').type(email);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="email-error"]').should(
      "contain.text",
      "Email already in use",
    );
  });

  it("should show error when password confirmation does not match", () => {
    const password = "password";

    cy.visit("/signup");
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="passwordConfirmation"]').type(`${password}1`);
    cy.get('button[type="submit"]').click();
    cy.get('label[for="passwordConfirmation-error"]').should(
      "contain.text",
      "Passwords don't match",
    );
  });

  it("should be able to sign up and redirect to top", () => {
    const username = "foo";
    const email = "foo@example.org";
    const password = "password";
    const initialPoints = 500;

    cy.setupDb();
    cy.visit("/signup");
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="passwordConfirmation"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    cy.get('[cy-data="notificationTitle"').should(
      "contain.text",
      "You have successfully signed up!",
    );
    cy.get('[cy-data="headerUserName"]').should("contain.text", username);
    cy.get('[cy-data="headerPoints"]').should("contain.text", initialPoints);
  });

  it("should redirect to home page if authenticated", () => {
    cy.setupDb();
    cy.login({ email: "test@example.org" });
    cy.visit("/signup");

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
