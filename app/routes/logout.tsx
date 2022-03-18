import { ActionFunction, LoaderFunction, redirect } from "remix";

import { destroyUserSession } from "~/utils/auth.server";

export const loader: LoaderFunction = async () => {
  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("cookie");

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroyUserSession(cookieHeader),
    },
  });
};
