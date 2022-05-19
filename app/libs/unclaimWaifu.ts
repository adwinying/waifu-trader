import { Waifu } from "@prisma/client";

import db from "~/utils/db.server";

export type UnclaimWaifu = {
  waifu: Waifu;
};

export default async function unclaimWaifu({ waifu }: UnclaimWaifu) {
  const updatedWaifu = await db.waifu.update({
    data: { ownerId: null },
    where: { id: waifu.id },
  });

  return { waifu: updatedWaifu };
}
