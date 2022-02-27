import { User } from "@prisma/client";
import db from "~/utils/db.server";
import claimWaifu from "./claimWaifu";

export type ClaimUnclaimedWaifu = {
  user: User;
};

export default async function claimUnclaimedWaifu({
  user,
}: ClaimUnclaimedWaifu) {
  const waifu = await db.waifu.findFirst({
    where: { ownerId: null },
    orderBy: { id: "asc" },
  });

  if (!waifu) throw new Error("No unclaimed waifus available");

  return claimWaifu({ owner: user, waifu });
}
