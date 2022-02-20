import { User } from "@prisma/client";
import db from "~/utils/db.server";
import updateUserPoints from "./updateUserPoints";

export type ClaimUserPoints = {
  user: User;
};

export default async function claimUserPoints({ user }: ClaimUserPoints) {
  const hoursUntilNextClaim = 3;
  const pointsAwardedEachClaim = 500;

  const { lastClaimedAt } = user;

  const newClaimAvailableAt = new Date(lastClaimedAt.getTime());
  newClaimAvailableAt.setHours(
    newClaimAvailableAt.getHours() + hoursUntilNextClaim,
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
    pointChange: pointsAwardedEachClaim,
    reason: "Gem claimed",
  });
}
