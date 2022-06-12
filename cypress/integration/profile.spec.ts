describe("profile", () => {
  beforeEach(() => {
    cy.setupDb();
  });

  const user = {
    username: "foo",
    email: "foo@test.com",
    password: "password",
  };
  const waifus = Array.from({ length: 42 }).map((_, i) => ({
    name: `Waifu${i}`,
    series: "Series",
    description: "Some description",
    img: "http://example.org/baz.jpg",
    createdAt: new Date(i),
    updatedAt: new Date(i),
  }));

  it("should be accessible without logging in", () => {
    cy.seedDb({ user: [{ ...user, waifus: { create: waifus } }] });

    cy.visit(`/profile/${user.username}`);
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/profile/${user.username}`,
    );
  });

  it("should show and paginate user's waifus", () => {
    cy.seedDb({ user: [{ ...user, waifus: { create: waifus } }] });
    cy.visit(`/profile/${user.username}`);

    cy.get('[cy-data="waifuCard"]')
      .should("have.length", 20)
      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[waifus.length - 1 - i].name);
      });
    cy.get('[cy-data="paginationDescription"]').should(
      "have.text",
      `Showing 1 - 20 of ${waifus.length}`,
    );
    cy.get('[cy-data="paginationEntry"]').should(
      "have.length",
      Math.ceil(waifus.length / 20),
    );

    cy.get('[cy-data="paginationEntry"][data-page="2"]').click();
    cy.get('[cy-data="waifuCard"]')
      .should("have.length", 20)
      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[waifus.length - 21 - i].name);
      });
    cy.get('[cy-data="paginationDescription"]').should(
      "have.text",
      `Showing 21 - 40 of ${waifus.length}`,
    );

    cy.get('[cy-data="paginationEntry"][data-page="3"]').click();
    cy.get('[cy-data="waifuCard"]')
      .should("have.length", 2)
      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[waifus.length - 41 - i].name);
      });
    cy.get('[cy-data="paginationDescription"]').should(
      "have.text",
      `Showing 41 - 42 of ${waifus.length}`,
    );

    cy.get('[cy-data="paginationEntry"][data-page="1"]').click();
    cy.get('[cy-data="waifuCard"]')
      .should("have.length", 20)
      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[waifus.length - 1 - i].name);
      });
    cy.get('[cy-data="paginationDescription"]').should(
      "have.text",
      `Showing 1 - 20 of ${waifus.length}`,
    );
  });
});
