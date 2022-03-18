import bcrypt from "bcryptjs";

import updateUserPoints from "~/libs/updateUserPoints";
import db from "~/utils/db.server";

export const SALT_ROUNDS = 10;

export type RegisterUser = {
  email: string;
  password: string;
  username: string;
};

export default async function registerUser({
  email,
  password,
  username,
}: RegisterUser) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const initialPoints = 500;

  const userData = {
    email,
    password: hashedPassword,
    username,
  };

  const newUser = await db.user.create({ data: userData });

  const pointsData = {
    user: newUser,
    pointChange: initialPoints,
    reason: "Thanks for signing up!",
  };

  const { user } = await updateUserPoints(pointsData);

  return user;
}
