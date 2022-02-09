import { ActionFunction, json, LoaderFunction } from "remix";
import { SeedDataInput, SeedDataOutput } from "~/types/SeedData";
import db from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request }) => {
  const reqData: SeedDataInput = await request.json();
  const result: SeedDataOutput = {};

  result.user = reqData.user
    ? await Promise.all(reqData.user.map((data) => db.user.create({ data })))
    : undefined;

  result.pointHistory = reqData.pointHistory
    ? await Promise.all(
        reqData.pointHistory.map((data) => db.pointHistory.create({ data })),
      )
    : undefined;

  return json(result);
};
