import { User } from "@prisma/client";
import db from "~/utils/db.server";

export type GetUserWaifuCount = {
  user: User;
};

export default async function getUserWaifuCount({ user }: GetUserWaifuCount) {
  const count = await db.waifu.count({
    where: { ownerId: user.id },
  });

  return count;
}
