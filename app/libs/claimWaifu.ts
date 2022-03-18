import { User, Waifu } from "@prisma/client";

import db from "~/utils/db.server";

export type ClaimWaifu = {
  owner: User;
  waifu: Waifu;
};

export default async function claimWaifu({ owner, waifu }: ClaimWaifu) {
  const [updatedWaifu, ownerHistory] = await db.$transaction([
    db.waifu.update({
      data: { ownerId: owner.id },
      where: { id: waifu.id },
    }),

    db.ownerHistory.create({
      data: {
        ownerId: owner.id,
        waifuId: waifu.id,
      },
    }),
  ]);

  return { waifu: updatedWaifu, ownerHistory };
}
