import { User } from "@prisma/client";
import { destroySession, getSession } from "~/utils/session.server";
import db from "./db.server";

export const createUserSession = async (user: User) => {
  const session = await getSession();

  session.set("userId", user.id);

  return session;
};

export const destroyUserSession = async (
  cookieHeader?: string | null | undefined,
) => {
  const session = await getSession(cookieHeader);

  return destroySession(session);
};

export const getAuthUser = async (request: Request) => {
  const cookieHeader = request.headers.get("cookie");

  const session = await getSession(cookieHeader);

  const userId: string = session.get("userId");

  if (!userId) return null;

  return db.user.findUnique({ where: { id: userId } });
};
