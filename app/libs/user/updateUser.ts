import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import db from "~/utils/db.server";
import { SALT_ROUNDS } from "~/libs/user/registerUser";

export type UpdateUser = {
  user: User;
  email?: string;
  password?: string;
  username?: string;
};

export default async function updateUser({
  user,
  email,
  password,
  username,
}: UpdateUser) {
  const newPassword = password
    ? await bcrypt.hash(password, SALT_ROUNDS)
    : undefined;

  return db.user.update({
    where: { id: user.id },
    data: {
      email,
      password: newPassword,
      username,
    },
  });
}
