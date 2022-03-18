import fs from "fs";

import createWaifu from "~/libs/createWaifu";

interface WaifuJSON {
  id: number;
  name: string;
  series: string;
  description: string;
  img: string;
}

(async () => {
  const jsonString = fs
    .readFileSync(`${__dirname}/../../data/transformed.json`)
    .toString();
  const json = JSON.parse(jsonString) as WaifuJSON[];

  await Promise.all(
    json.slice(0, 500).map((entry) => {
      return createWaifu(entry);
    }),
  );
})();
