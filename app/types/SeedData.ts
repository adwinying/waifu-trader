import { PointHistory, Prisma, User, Waifu } from "@prisma/client";

export type SeedDataInput = {
  user?: Prisma.UserCreateInput[];
  pointHistory?: Prisma.PointHistoryCreateInput[];
  waifu?: Prisma.WaifuCreateInput[];
};

export type SeedDataOutput = {
  user?: User[];
  pointHistory?: PointHistory[];
  waifu?: Waifu[];
};
