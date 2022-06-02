import { redirect, Session } from "remix";

import { commitSession } from "./session.server";

export const flashNotificationAndRedirect = async ({
  session,
  type,
  message,
  redirectTo,
}: {
  session: Session;
  type: "success" | "error" | "warning" | "info";
  message: string;
  redirectTo: string;
}) => {
  session.flash("notification", { type, message });

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default null;
