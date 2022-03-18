import { User } from "@prisma/client";

import db from "~/utils/db.server";

export type GetUserWaifus = {
  user: User;
  offset?: number;
  count?: number;
};

export default async function getUserWaifus({
  user,
  offset = 0,
  count = 20,
}: GetUserWaifus) {
  return db.waifu.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    skip: offset,
    take: count,
  });
}
