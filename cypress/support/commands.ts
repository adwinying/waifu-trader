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
    }
  }
}

Cypress.Commands.add("setupDb", setupDb);

export {};

/* eslint @typescript-eslint/no-namespace: "off" */
