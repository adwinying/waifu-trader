import { Prisma, User } from "@prisma/client";

export type SeedDataInput = {
  user?: Prisma.UserCreateInput[];
};

export type SeedDataOutput = {
  user?: User[];
};
