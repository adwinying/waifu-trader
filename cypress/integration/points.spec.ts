describe("points", () => {
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
    const username = "foo";
    const email = "foo@bar.com";
    const password = "password";
    const points = 1000;

    cy.seedDb({
      user: [{ username, email, password, points }],
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
      username: "foo",
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

  it("should show time remaining until next claim not ready", () => {
    cy.clock(new Date());

    const user = {
      username: "foo",
      email: "foo@bar.com",
      password: "secret",
      lastClaimedAt: new Date(),
    };
    cy.seedDb({ user: [user] });
    cy.login({ email: user.email });
    cy.visit("/points");

    cy.get('[cy-data="remainingHours"]').should("contain.text", "3h");

    cy.tick(1000);
    cy.get('[cy-data="remainingDays"]').should("be.empty");
    cy.get('[cy-data="remainingHours"]').should("contain.text", "2h");
    cy.get('[cy-data="remainingMinutes"]').should("contain.text", "59m");
    cy.get('[cy-data="remainingSeconds"]').should("contain.text", "59s");
  });

  it("should show claim gem button if next claim ready", () => {
    cy.clock(new Date());

    const user = {
      username: "foo",
      email: "foo@bar.com",
      password: "secret",
      lastClaimedAt: new Date(),
    };
    cy.seedDb({ user: [user] });
    cy.login({ email: user.email });
    cy.visit("/points");

    cy.get('[cy-data="remainingHours"]').should("contain.text", "3h");

    cy.tick(1000 * 60 * 60 * 3 - 1000);
    cy.get('[cy-data="remainingDays"]').should("be.empty");
    cy.get('[cy-data="remainingHours"]').should("be.empty");
    cy.get('[cy-data="remainingMinutes"]').should("be.empty");
    cy.get('[cy-data="remainingSeconds"]').should("contain.text", "1s");

    cy.tick(1000);
    cy.get('[cy-data="claimGemBtn"]').should("exist");
  });

  it("should get extra points when claiming", () => {
    const lastClaimedAt = new Date();
    lastClaimedAt.setHours(lastClaimedAt.getHours() - 3);

    const user = {
      username: "foo",
      email: "foo@bar.com",
      password: "secret",
      lastClaimedAt,
    };
    cy.seedDb({ user: [user] });
    cy.login({ email: user.email });
    cy.visit("/points");

    cy.get('[cy-data="remainingDays"]').should("not.exist");
    cy.get('[cy-data="remainingHours"]').should("not.exist");
    cy.get('[cy-data="remainingMinutes"]').should("not.exist");
    cy.get('[cy-data="remainingSeconds"]').should("not.exist");
    cy.get('[cy-data="pointBalance"]').should("have.text", 0);

    cy.get('[cy-data="claimGemBtn"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/points`);
    cy.get('.alert.alert-success [cy-data="notificationTitle"').should(
      "contain.text",
      "Successfully claimed gems.",
    );
    cy.get('[cy-data="pointBalance"]').should("have.text", 500);
  });

  it("should prevent gem claims if not ready", () => {
    const user = {
      username: "foo",
      email: "foo@bar.com",
      password: "secret",
      lastClaimedAt: new Date(),
    };
    cy.seedDb({ user: [user] });

    cy.login({ email: user.email });
    cy.visit("/points", { method: "POST" });

    cy.url().should("eq", `${Cypress.config().baseUrl}/points`);
    cy.get('.alert.alert-error [cy-data="notificationTitle"').should(
      "contain.text",
      "Next claim is not ready",
    );
  });
});
