import { User } from "@prisma/client";
import getUserWaifuCount from "~/libs/getUserWaifuCount";

export type GetUserWaifuClaimCost = {
  user: User;
};

export const BASE_COST = 50;

export default async function getUserWaifuClaimCost({
  user,
}: GetUserWaifuClaimCost) {
  const waifuCount = await getUserWaifuCount({ user });

  const exponent = Math.floor(waifuCount / 10);
  const multiplier = 2 ** exponent;

  return BASE_COST * multiplier;
}
