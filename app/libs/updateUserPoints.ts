import { User } from "@prisma/client";
import db from "~/utils/db.server";

export type UpdateUserPoints = {
  user: User;
  pointChange: number;
  reason: string;
};

export default async function updateUserPoints({
  user,
  pointChange,
  reason,
}: UpdateUserPoints) {
  const pointBalance = user.points + pointChange;

  if (pointBalance < 0) {
    throw new Error("Insufficient points");
  }

  const [updatedUser, pointHistory] = await db.$transaction([
    db.user.update({
      data: { points: pointBalance },
      where: { id: user.id },
    }),

    db.pointHistory.create({
      data: {
        userId: user.id,
        points: pointChange,
        reason,
      },
    }),
  ]);

  return { user: updatedUser, pointHistory };
}
