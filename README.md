# waifu-trader

## Tech Stack

- Prisma
- Sqlite
- Remix
- React
- TailwindCSS

## Setup

```bash
$ npx prisma migrate dev
$ npm run dev
```

## Testing

### Unit Test (Jest)

```bash
$ npm test
```

### E2E (Cypress)

```bash
$ npm cypress:run
```

## Waifu data

0. Install deno

1. Get waifu data from [Kaggle](https://www.kaggle.com/corollari/waifus) and extract to `data/`

2. Transform JSON data

```bash
$ cd data
$ deno run --allow-read --allow-write transform.ts
```

3. Upload images to imgur

```bash
$ deno run --allow-read --allow-write --allow-net upload.ts
```
