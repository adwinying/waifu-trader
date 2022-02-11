export interface DataInput {
  id: number;
  name: string;
  series: {
    name: string;
  };
  description: string;
  display_picture: string;
}

const jsonFilePath = "./waifus.json";

const jsonString = await Deno.readTextFile(jsonFilePath);

const json = JSON.parse(jsonString) as DataInput[];

const data = json.map((entry) => ({
  id: entry.id,
  name: entry.name,
  series: entry.series?.name,
  description: entry.description,
  img: entry.display_picture,
}));

await Deno.writeTextFile("./transformed.json", JSON.stringify(data));
