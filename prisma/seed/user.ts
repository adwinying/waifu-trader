import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const users = [
  {
    name: "Admin",
    email: "admin@example.org",
    password: "$2y$10$fQ/fazS6NSwUfY7/lauARuiuE/7cZEjrdpuvF4PK6J18Hx14UbLMK", // secret
    points: 10000000,
  },
];

(async () => {
  await Promise.all(users.map((user) => db.user.create({ data: user })));
})();
