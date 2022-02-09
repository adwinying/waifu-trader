describe("preferences", () => {
  beforeEach(() => {
    cy.setupDb();
  });

  it("should redirect to login when unauthenticated", () => {
    const redirectUrl = `${Cypress.config().baseUrl}/points`;

    cy.visit("/points");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/login?redirect=${encodeURIComponent(
        redirectUrl,
      )}`,
    );
  });

  it("should show user's point balance", () => {
    const name = "foo";
    const email = "foo@bar.com";
    const password = "password";
    const points = 1000;

    cy.seedDb({
      user: [{ name, email, password, points }],
    });

    cy.login({ email });
    cy.visit("/points");
    cy.get('[cy-data="pointBalance"]').should(
      "contain.text",
      points.toLocaleString(),
    );
  });

  it("should show user's point histories", () => {
    const pointHistories = [
      { reason: "reason1", points: 500, createdAt: new Date() },
      { reason: "reason2", points: 0, createdAt: new Date() },
      { reason: "reason3", points: -500, createdAt: new Date() },
    ];

    const user = {
      name: "foo",
      email: "foo@bar.com",
      password: "password",
      points: 1000,
      pointHistories: { create: pointHistories },
    };

    cy.seedDb({ user: [user] });

    cy.login({ email: user.email });
    cy.visit("/points");

    cy.get('[cy-data="pointHistory"]')
      .should("have.length", pointHistories.length)

      .get('[cy-data="reason"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", pointHistories[i].reason);
      })

      .get('[cy-data="timestamp"]')
      .each(($el, i) => {
        cy.wrap($el).should(
          "have.text",
          new Intl.DateTimeFormat("default", {
            dateStyle: "long",
            timeStyle: "medium",
          }).format(pointHistories[i].createdAt),
        );
      })

      .get('[cy-data="pointChange"]')
      .each(($el, i) => {
        const { points } = pointHistories[i];
        const isZero = points === 0;
        const isPositive = points >= 0;

        if (isZero) {
          cy.wrap($el)
            .should("not.have.class", "text-success")
            .should("not.have.class", "text-error")
            .should("have.text", "0");

          return;
        }

        cy.wrap($el)
          .should("have.class", isPositive ? "text-success" : "text-error")
          .should("have.text", isPositive ? `+${points}` : points);
      });
  });
});
