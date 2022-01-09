import { ActionFunction } from "remix";
import { TestAuthData } from "~/types/TestAuthData";
import { createUserSession } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { commitSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const { email, name }: TestAuthData = await request.json();

  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    const newUserData = {
      email,
      name: name ?? "Test User",
      password: "password",
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
