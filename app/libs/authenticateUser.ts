import bcrypt from "bcryptjs";

import db from "~/utils/db.server";

export type AuthenticateUser = {
  email: string;
  password: string;
};

export default async function authenticateUser({
  email,
  password,
}: AuthenticateUser) {
  const user = await db.user.findFirst({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return null;
  }

  return user;
}
