import { createCookieSessionStorage } from "remix";

const { SESSION_SECRET } = process.env;

if (!SESSION_SECRET) {
  throw new Error("No client secret. Set SESSION_SECRET environment variable.");
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secure: process.env.NODE_ENV === "production",
      secrets: [SESSION_SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export { getSession, commitSession, destroySession };
