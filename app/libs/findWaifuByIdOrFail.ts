import db from "~/utils/db.server";

export type FindWaifuByIdOrFail = {
  waifuId: string;
};

export default async function findWaifuByIdOrFail({
  waifuId,
}: FindWaifuByIdOrFail) {
  const waifu = await db.waifu.findFirst({
    where: { id: waifuId },
  });

  if (!waifu) throw new Error("Waifu not found!");

  return waifu;
}
