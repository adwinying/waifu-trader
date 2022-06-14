import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";

import prisma from "~/utils/db.server";

export const prismaMock = vi.mocked(prisma, true);

vi.mock("~/utils/db.server", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export default null;
