describe("preferences", () => {
  beforeEach(() => {
    cy.setupDb();
  });

  it("should redirect to login when unauthenticated", () => {
    const redirectUrl = `${Cypress.config().baseUrl}/preferences`;

    cy.visit("/preferences");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/login?redirect=${encodeURIComponent(
        redirectUrl,
      )}`,
    );
  });

  it("should populate username and email text fields", () => {
    const username = "foo";
    const email = "foo@bar.com";

    cy.login({ username, email });
    cy.visit("/preferences");
    cy.get("h1").should("contain.text", "Preferences");
    cy.get('input[name="username"]').should("have.attr", "value", username);
    cy.get('input[name="email"]').should("have.attr", "value", email);
  });

  it("should be able to submit form successfully without input", () => {
    const username = "foo";
    const email = "foo@bar.com";

    cy.login({ username, email });
    cy.visit("/preferences");
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "Preferences updated.",
    );
  });

  it("should reject another existing user's username", () => {
    const user1 = {
      username: "foo",
      email: "foo@example.org",
      password: "smth",
    };
    const user2 = {
      username: "bar",
      email: "bar@example.org",
      password: "password",
    };

    cy.seedDb({ user: [user1] });
    cy.login(user2);
    cy.visit("/preferences");
    cy.get('input[name="username"]').clear().type(user1.username);
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="username-error"').should(
      "contain.text",
      "Username already in use",
    );
  });

  it("should reject another existing user's email", () => {
    const user1 = {
      username: "foo",
      email: "foo@example.org",
      password: "smth",
    };
    const user2 = {
      username: "bar",
      email: "bar@example.org",
      password: "password",
    };

    cy.seedDb({ user: [user1] });
    cy.login(user2);
    cy.visit("/preferences");
    cy.get('input[name="email"]').clear().type(user1.email);
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="email-error"').should(
      "contain.text",
      "Email already in use",
    );
  });

  it("should prompt for current password if new password is input", () => {
    const username = "foo";
    const email = "foo@bar.com";
    const newPassword = "foobarbaz";

    cy.login({ username, email });
    cy.visit("/preferences");
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="passwordConfirmation"]').type(newPassword);
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="currentPassword-error"').should(
      "contain.text",
      "Current Password is required",
    );
  });

  it("should reject if current password incorrect", () => {
    const username = "foo";
    const email = "foo@bar.com";
    const wrongPassword = "foobar";

    cy.login({ username, email });
    cy.visit("/preferences");
    cy.get('input[name="currentPassword"]').type(wrongPassword);
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="currentPassword-error"').should(
      "contain.text",
      "Current Password is incorrect",
    );
  });

  it("should be able to update user info", () => {
    const oldUsername = "foo";
    const oldEmail = "foo@bar.com";
    const oldPassword = "foofoofoo";
    const newUsername = "bar";
    const newEmail = "bar@baz.com";
    const newPassword = "foobarbaz";

    cy.login({ username: oldUsername, email: oldEmail, password: oldPassword });
    cy.visit("/preferences");
    cy.get('input[name="username"]').clear().type(newUsername);
    cy.get('input[name="email"]').clear().type(newEmail);
    cy.get('input[name="currentPassword"]').type(oldPassword);
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="passwordConfirmation"]').type(newPassword);
    cy.get('button[cy-data="formSubmitButton"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "Preferences updated.",
    );

    cy.get('input[name="username"]').should("have.attr", "value", newUsername);
    cy.get('input[name="email"]').should("have.attr", "value", newEmail);
  });
});
