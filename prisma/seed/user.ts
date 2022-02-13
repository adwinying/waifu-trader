import { Prisma } from "@prisma/client";
import registerUser from "~/libs/user/registerUser";
import db from "~/utils/db.server";

const users: Prisma.UserCreateInput[] = [
  {
    name: "Admin",
    email: "admin@example.org",
    password: "secret",
  },
  {
    name: "test",
    email: "test@example.org",
    password: "secret",
  },
];

(async () => {
  await Promise.all(users.map((user) => registerUser(user)));
  await db.user.update({
    data: { points: 1000000 },
    where: { email: users[0].email },
  });
})();
