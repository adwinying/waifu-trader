import { SeedDataInput, SeedDataOutput } from "../../app/types/SeedData";

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
    }
  }
}

Cypress.Commands.add("setupDb", setupDb);
Cypress.Commands.add("seedDb", seedDb);

export {};

/* eslint @typescript-eslint/no-namespace: "off" */
