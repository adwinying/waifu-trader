import { PointHistory, Prisma, User } from "@prisma/client";

export type SeedDataInput = {
  user?: Prisma.UserCreateInput[];
  pointHistory?: Prisma.PointHistoryCreateInput[];
};

export type SeedDataOutput = {
  user?: User[];
  pointHistory?: PointHistory[];
};
