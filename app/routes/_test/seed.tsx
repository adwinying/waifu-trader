import { ActionFunction, json, LoaderFunction } from "remix";

import { SeedDataInput, SeedDataOutput } from "~/types/SeedData";
import db from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request }) => {
  const reqData: SeedDataInput = await request.json();
  const result: SeedDataOutput = {};

  const user = reqData.user
    ? Promise.all(reqData.user.map((data) => db.user.create({ data })))
    : undefined;

  const pointHistory = reqData.pointHistory
    ? Promise.all(
        reqData.pointHistory.map((data) => db.pointHistory.create({ data })),
      )
    : undefined;

  const waifu = reqData.waifu
    ? Promise.all(reqData.waifu.map((data) => db.waifu.create({ data })))
    : undefined;

  result.user = await user;
  result.pointHistory = await pointHistory;
  result.waifu = await waifu;

  return json(result);
};
