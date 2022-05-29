# waifu-trader

## Tech Stack

- Typescript
- Prisma
- SQLite
- Remix
- React
- TailwindCSS
- DaisyUI
- Jest
- Cypress
- Prettier
- ESLint

## Setup

```bash
$ npm ci
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
$ npm run test:e2e
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
