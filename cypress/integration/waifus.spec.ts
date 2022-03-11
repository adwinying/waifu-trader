describe("waifus", () => {
  beforeEach(() => {
    cy.setupDb();
  });

  it("should redirect to login when unauthenticated", () => {
    const redirectUrl = `${Cypress.config().baseUrl}/waifus`;

    cy.visit("/waifus");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/login?redirect=${encodeURIComponent(
        redirectUrl,
      )}`,
    );
  });

  it("should show error if no waifus can be claimed ", () => {
    const email = "foo@bar.com";
    const points = 50;

    cy.login({ email, points });
    cy.visit("/waifus");

    cy.get('[cy-data="headerPoints"]').should(
      "contain.text",
      points.toLocaleString(),
    );
    cy.get('[cy-data="claimWaifuBtn"]').should("not.have.attr", "disabled");
    cy.get('[cy-data="waifuCost"]').should("contain.text", "50");
    cy.get('[cy-data="claimWaifuBtn"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/waifus`);
    cy.get('.alert.alert-error [cy-data="notificationTitle"]').should(
      "contain.text",
      "No unclaimed waifus available",
    );
  });

  it("should show error if insufficient points to claim waifu", () => {
    const email = "foo@bar.com";
    const points = 0;

    cy.login({ email, points });
    cy.visit("/waifus", { method: "POST" });

    cy.url().should("eq", `${Cypress.config().baseUrl}/waifus`);
    cy.get('.alert.alert-error [cy-data="notificationTitle"]').should(
      "contain.text",
      "Insufficient points",
    );
  });

  it("should disable claim waifu button if insufficient points", () => {
    const email = "foo@bar.com";
    const points = 0;

    cy.login({ email, points });
    cy.visit("/waifus");

    cy.get('[cy-data="headerPoints"]').should(
      "contain.text",
      points.toLocaleString(),
    );
    cy.get('[cy-data="claimWaifuBtn"]').should("have.attr", "disabled");
  });

  it("should be able to claim waifus", () => {
    const email = "foo@bar.com";
    const points = 50 * 9 + 100;
    const waifu = new Array(10).fill(null).map((_, i) => ({
      name: `Waifu${i}`,
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
    }));

    cy.seedDb({ waifu });
    cy.login({ email, points });
    cy.visit("/waifus");

    cy.get('[cy-data="headerPoints"]').should(
      "contain.text",
      points.toLocaleString(),
    );
    cy.get('[cy-data="claimWaifuBtn"]').should("not.have.attr", "disabled");
    cy.get('[cy-data="waifuCost"]').should("contain.text", "50");
    cy.get('[cy-data="userWaifuCount"]').should("contain.text", "0");
    cy.get('[cy-data="claimWaifuBtn"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/waifus`);
    cy.get('.alert.alert-success [cy-data="notificationTitle"]').should(
      "contain.text",
      "Successfully claimed waifu.",
    );
    cy.get('[cy-data="headerPoints"]').should("contain.text", 500);
    cy.get('[cy-data="userWaifuCount"]').should("contain.text", "1");
  });

  it("should show correct amount of points to claim waifu", () => {
    const email = "foo@bar.com";
    const waifus = new Array(50).fill(null).map((_, i) => ({
      name: `Waifu${i}`,
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
    }));

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { createMany: { data: waifus } },
        },
      ],
    });
    cy.login({ email });
    cy.visit("/waifus");

    cy.get('[cy-data="waifuCost"]').should("contain.text", "51,200");
  });

  it("should show user's waifus", () => {
    const email = "foo@bar.com";
    const waifus = new Array(20).fill(null).map((_, i) => ({
      name: `Waifu${i}`,
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      createdAt: new Date(),
    }));

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { createMany: { data: waifus } },
        },
      ],
    });
    cy.login({ email });
    cy.visit("/waifus");

    cy.get('[cy-data="waifuCard"]')
      .should("have.length", waifus.length)

      .get('[cy-data="waifuImg"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.attr", "src");
        cy.wrap($el).should("have.attr", "alt", waifus[i].name);
      })

      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[i].name);
      });
  });
});
