import { User } from "@prisma/client";
import db from "~/utils/db.server";
import updateUserPoints from "./updateUserPoints";

export type ClaimUserPoints = {
  user: User;
};

export const HOURS_UNTIL_NEXT_CLAIM = 3;
export const POINTS_AWARDED_EACH_CLAIM = 500;

export default async function claimUserPoints({ user }: ClaimUserPoints) {
  const { lastClaimedAt } = user;

  const newClaimAvailableAt = new Date(lastClaimedAt.getTime());
  newClaimAvailableAt.setHours(
    newClaimAvailableAt.getHours() + HOURS_UNTIL_NEXT_CLAIM,
  );

  if (newClaimAvailableAt > new Date()) {
    throw new Error("Next claim is not ready");
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastClaimedAt: new Date() },
  });

  return updateUserPoints({
    user,
    pointChange: POINTS_AWARDED_EACH_CLAIM,
    reason: "Gem claimed",
  });
}
