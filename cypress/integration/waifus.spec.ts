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
    cy.visit("/waifus", { method: "POST", body: { _action: "claim" } });

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
    cy.get('[cy-data="headerWaifuCount"]').should("contain.text", "0");
    cy.get('[cy-data="claimWaifuBtn"]').click();

    cy.url().should("eq", `${Cypress.config().baseUrl}/waifus?isClaimed=1`);
    cy.get('.alert.alert-success [cy-data="notificationTitle"]').should(
      "contain.text",
      "Successfully claimed waifu.",
    );
    cy.get('[cy-data="headerPoints"]').should("contain.text", "500");
    cy.get('[cy-data="userWaifuCount"]').should("contain.text", "1");
    cy.get('[cy-data="headerWaifuCount"]').should("contain.text", "1");
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
          waifus: { create: waifus },
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
      createdAt: new Date(i),
      updatedAt: new Date(i),
    }));

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { create: waifus },
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
        cy.wrap($el).should(
          "have.attr",
          "alt",
          waifus[waifus.length - 1 - i].name,
        );
      })

      .get('[cy-data="waifuName"]')
      .each(($el, i) => {
        cy.wrap($el).should("have.text", waifus[waifus.length - 1 - i].name);
      });
  });

  it("should paginate user's waifus", () => {
    const email = "foo@bar.com";
    const waifus = new Array(42).fill(null).map((_, i) => ({
      name: `Waifu${i}`,
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      createdAt: new Date(i),
      updatedAt: new Date(i),
    }));

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { create: waifus },
        },
      ],
    });
    cy.login({ email });
    cy.visit("/waifus");

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

  it("should show waifu's info when clicked", () => {
    const email = "foo@bar.com";
    const waifus = new Array(12).fill(null).map((_, i) => ({
      name: `Waifu${i}`,
      series: "Series",
      description: `Some description${i}`,
      img: "http://example.org/baz.jpg",
      createdAt: new Date(i),
      updatedAt: new Date(i),
    }));

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { create: waifus },
        },
      ],
    });
    cy.login({ email });
    cy.visit("/waifus");

    const randomIdx = Math.floor(Math.random() * 12);
    const waifu = waifus[randomIdx];

    cy.contains("a", waifu.name).click();

    cy.get(".modal")
      .should("contain.text", waifu.name)
      .should("contain.text", waifu.series)
      .should("contain.text", waifu.description);
  });

  it("should be able to recycle waifu", () => {
    const email = "foo@bar.com";
    const waifu = {
      name: "Waifu1",
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    cy.seedDb({
      user: [
        {
          username: "foo",
          email,
          password: "password",
          waifus: { create: waifu },
        },
      ],
    });
    cy.login({ email });
    cy.visit("/waifus");

    cy.contains("a", waifu.name).click();

    cy.get(".modal").contains("button", "Recycle Waifu").click();

    cy.get('.alert.alert-success [cy-data="notificationTitle"]').should(
      "contain.text",
      "Successfully recycled waifu.",
    );
  });

  it("should prevent users from recycling other user's waifus", () => {
    const user1 = {
      username: "user1",
      email: "foo@example.org",
      password: "password",
      points: 1000,
    };
    const user2 = {
      username: "user2",
      email: "bar@example.org",
      password: "password",
      points: 1000,
    };

    const waifu = {
      id: "1235",
      name: "Waifu1",
      series: "Series",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    cy.seedDb({ user: [user1, { ...user2, waifus: { create: [waifu] } }] });
    cy.login({ email: user1.email });
    cy.visit(`/waifus/${waifu.id}`, { method: "POST" });

    cy.url().should("eq", `${Cypress.config().baseUrl}/waifus`);
    cy.get('.alert.alert-error [cy-data="notificationTitle"]').should(
      "contain.text",
      "This is not your waifu!",
    );
  });
});
