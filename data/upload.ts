interface TransformedInput {
  id: number;
  name: string;
  series: string;
  description: string;
  img: string;
}

interface Results {
  rateLimit: {
    client: number;
    user: number;
    post: number;
    tooManyRequests: boolean;
  };
  processed: number;
  success: number;
  failedIds: number[];
}

interface ImgurResponse {
  status: string;
  success: boolean;
  data: {
    link: string;
    datetime: string;
  };
}

const jsonFilePath = "./transformed.json";
const baseDir = "./waifus";
const apiURL = "https://api.imgur.com/3/upload";

const jsonString = await Deno.readTextFile(jsonFilePath);
const json = JSON.parse(jsonString) as TransformedInput[];

const isRemotePath = (path: string) => /^https?:\/\/.+/.test(path);

const logOutput = (contents: unknown) =>
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}]`, contents);

const results: Results = {
  rateLimit: {
    client: Infinity,
    user: Infinity,
    post: Infinity,
    tooManyRequests: false,
  },
  processed: 0,
  success: 0,
  failedIds: [],
};

const uploadImage = async (imgPath: string) => {
  const fileData = await Deno.readFile(imgPath);
  const blob = new Blob([fileData]);
  const formData = new FormData();

  formData.append("image", blob);

  const response = await fetch(apiURL, { method: "POST", body: formData });
  const responseJSON = (await response.json()) as ImgurResponse;

  results.rateLimit.user = Number(
    response.headers.get("x-ratelimit-userremaining"),
  );
  results.rateLimit.client = Number(
    response.headers.get("x-ratelimit-clientremaining"),
  );
  results.rateLimit.post = Number(
    response.headers.get("x-post-rate-limit-remaining"),
  );

  if (response.status === 429) {
    results.rateLimit.tooManyRequests = true;
  }

  if (!responseJSON.success) {
    throw new Error(`Upload failed: ${JSON.stringify(responseJSON, null, 2)}`);
  }

  return responseJSON.data.link;
};

const processJSON = async () => {
  for (let i = 0; i < json.length; i += 1) {
    const entry = json[i];

    const { client, user, post, tooManyRequests } = results.rateLimit;
    if (client === 0 || user === 0 || post === 0 || tooManyRequests) continue;

    if (isRemotePath(entry.img)) continue;

    logOutput(`Processing ID: ${entry.id}`);

    const imgPath = `${baseDir}/${entry.img}`;
    logOutput(`Uploading image: ${imgPath}`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const imgURL = await uploadImage(imgPath);
      json[i].img = imgURL;

      logOutput(`Image successfully uploaded: ${imgURL}`);
      results.success += 1;
    } catch (e) {
      logOutput(`Error uploading image: ${imgPath}`);
      logOutput(e);
      results.failedIds.push(entry.id);
    }

    logOutput("Rate Limits:");
    logOutput(results.rateLimit);

    results.processed += 1;
  }
};

logOutput("Processing JSON...");

await processJSON();

logOutput("");
logOutput("");
logOutput("");

logOutput(`Summary:`);
logOutput(`  Processed: ${results.processed}`);
logOutput(`  Success  : ${results.success}`);
logOutput(`  Failed   : ${results.failedIds.length}`);

if (results.failedIds.length) {
  logOutput("");
  logOutput("");
  logOutput("");
  logOutput(`Failed IDs:\n${JSON.stringify(results.failedIds, null, 2)}`);
}

logOutput("");
logOutput("");
logOutput("");

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(json));
Deno.writeFileSync(jsonFilePath, data);

logOutput("Saving data...");
logOutput(`JSON data updated: ${jsonFilePath}`);
logOutput("Done.");
