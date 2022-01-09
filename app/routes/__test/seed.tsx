import { ActionFunction, json, LoaderFunction } from "remix";
import { SeedDataInput, SeedDataOutput } from "~/types/SeedData";
import db from "~/utils/db.server";

type ValueOf<T> = T[keyof T];

export const loader: LoaderFunction = async () => {
  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request }) => {
  const reqData: SeedDataInput = await request.json();
  const jobs: Promise<unknown>[] = [];

  Object.entries(reqData).forEach(([key, value]) => {
    const keyName = key as keyof SeedDataInput;

    value.forEach((data) => {
      jobs.push(db[keyName].create({ data }));
    });
  });

  const data = await Promise.all(jobs);

  let offset = 0;
  const result: SeedDataOutput = {};
  Object.keys(reqData).forEach((key) => {
    const keyName = key as keyof SeedDataOutput;
    const oriData = reqData[keyName] as ValueOf<SeedDataInput>;

    if (oriData === undefined) return;

    result[keyName] = data.slice(
      offset,
      offset + oriData.length,
    ) as ValueOf<SeedDataOutput>;
    offset += oriData.length;
  });

  return json(result);
};
