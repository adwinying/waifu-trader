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

  it("should populate name and email text fields", () => {
    const name = "foo";
    const email = "foo@bar.com";

    cy.login({ name, email });
    cy.visit("/preferences");
    cy.get("h1").should("contain.text", "Preferences");
    cy.get('input[name="name"]').should("have.attr", "value", name);
    cy.get('input[name="email"]').should("have.attr", "value", email);
  });

  it("should be able to submit form successfully without input", () => {
    const name = "foo";
    const email = "foo@bar.com";

    cy.login({ name, email });
    cy.visit("/preferences");
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "Preferences updated.",
    );
  });

  it("should reject another existing user's email", () => {
    const user1 = {
      name: "foo",
      email: "foo@example.org",
      password: "smth",
    };
    const user2 = {
      name: "bar",
      email: "bar@example.org",
      password: "password",
    };

    cy.seedDb({ user: [user1] });
    cy.login(user2);
    cy.visit("/preferences");
    cy.get('input[name="email"]').clear().type(user1.email);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="email-error"').should(
      "contain.text",
      "Email already in use",
    );
  });

  it("should prompt for current password if new password is input", () => {
    const name = "foo";
    const email = "foo@bar.com";
    const newPassword = "foobarbaz";

    cy.login({ name, email });
    cy.visit("/preferences");
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="passwordConfirmation"]').type(newPassword);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="currentPassword-error"').should(
      "contain.text",
      "Current Password is required",
    );
  });

  it("should reject if current password incorrect", () => {
    const name = "foo";
    const email = "foo@bar.com";
    const wrongPassword = "foobar";

    cy.login({ name, email });
    cy.visit("/preferences");
    cy.get('input[name="currentPassword"]').type(wrongPassword);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('label[for="currentPassword-error"').should(
      "contain.text",
      "Current Password is incorrect",
    );
  });

  it("should be able to update user info", () => {
    const oldName = "foo";
    const oldEmail = "foo@bar.com";
    const oldPassword = "foofoofoo";
    const newName = "bar";
    const newEmail = "bar@baz.com";
    const newPassword = "foobarbaz";

    cy.login({ name: oldName, email: oldEmail, password: oldPassword });
    cy.visit("/preferences");
    cy.get('input[name="name"]').clear().type(newName);
    cy.get('input[name="email"]').clear().type(newEmail);
    cy.get('input[name="currentPassword"]').type(oldPassword);
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="passwordConfirmation"]').type(newPassword);
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/preferences`);
    cy.get('[cy-data="notification-title"').should(
      "contain.text",
      "Preferences updated.",
    );

    cy.get('input[name="name"]').should("have.attr", "value", newName);
    cy.get('input[name="email"]').should("have.attr", "value", newEmail);
  });
});
