import { User } from "@prisma/client";
import db from "~/utils/db.server";

export type CreateWaifu = {
  name: string;
  series: string;
  description: string;
  img: string;
  owner?: User;
};

export default async function createWaifu({
  name,
  series,
  description,
  img,
  owner,
}: CreateWaifu) {
  return db.waifu.create({
    data: {
      name,
      series,
      description,
      img,
      ownerId: owner?.id,
    },
  });
}
