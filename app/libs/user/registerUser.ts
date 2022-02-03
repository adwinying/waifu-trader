import bcrypt from "bcryptjs";
import db from "~/utils/db.server";

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

  const pointHistoryData = {
    points: initialPoints,
    reason: "Thanks for signing up!",
  };

  const userData = {
    email,
    password: hashedPassword,
    name,
    points: initialPoints,
    pointHistories: { create: [pointHistoryData] },
  };

  return db.user.create({ data: userData });
}
