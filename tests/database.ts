import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";

import prisma from "~/utils/db.server";

export const prismaMock = jest.mocked(prisma, true);

jest.mock("~/utils/db.server", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export default null;
