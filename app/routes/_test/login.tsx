import bcrypt from "bcryptjs";
import { ActionFunction } from "remix";
import { SALT_ROUNDS } from "~/libs/user/registerUser";
import { TestAuthData } from "~/types/TestAuthData";
import { createUserSession } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { commitSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const { email, username, password }: TestAuthData = await request.json();

  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    const newUserData = {
      email,
      username: username ?? "test",
      password: password
        ? bcrypt.hashSync(password, SALT_ROUNDS)
        : "$2a$10$.Ctzx/C5QYgs6I4ns6PDp.2Y.4kbwwUB0L6LPPy49t2moNGvT1mJG", // default: password
    };

    user = await db.user.create({ data: newUserData });
  }

  const session = await createUserSession(user);

  return new Response("Success", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default null;
