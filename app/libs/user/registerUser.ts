import bcrypt from "bcryptjs";
import db from "~/utils/db.server";
import updateUserPoints from "~/libs/user/updateUserPoints";

const SALT_ROUNDS = 10;

export type RegisterUser = {
  email: string;
  password: string;
  name: string;
};

export default async function registerUser({
  email,
  password,
  name,
}: RegisterUser) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const initialPoints = 500;

  const userData = {
    email,
    password: hashedPassword,
    name,
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
