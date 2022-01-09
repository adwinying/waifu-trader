import { SeedDataInput, SeedDataOutput } from "../../app/types/SeedData";
import { TestAuthData } from "../../app/types/TestAuthData";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

function setupDb() {
  cy.exec(
    "node -r dotenv/config node_modules/.bin/prisma migrate reset --force dotenv_config_path=.env.test",
  );
}

function seedDb(data: SeedDataInput) {
  return cy
    .request("POST", "__test/seed", data)
    .then((res) => res.body as SeedDataOutput);
}

function login(data: TestAuthData) {
  cy.request("POST", "__test/login", data);
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Setup and seed the database with the given data.
       * @returns {typeof setupDb}
       * @memberof Chainable
       * @example cy.setupDb()
       */
      setupDb: typeof setupDb;

      /**
       * Seed the database with the given data.
       * @returns {typeof seedDb}
       * @memberof Chainable
       * @example cy.seedDb({ user: [{ name: "John Doe", email: "john@gmail.com", password: "hashed_pass" }] })
       */
      seedDb: typeof seedDb;

      /**
       * Login as the given user.
       * @returns {typeof login}
       * @memberof Chainable
       * @example cy.login({ email: "test@example.org", name: "John Doe" })
       */
      login: typeof login;
    }
  }
}

Cypress.Commands.add("setupDb", setupDb);
Cypress.Commands.add("seedDb", seedDb);
Cypress.Commands.add("login", login);

export {};

/* eslint @typescript-eslint/no-namespace: "off" */
