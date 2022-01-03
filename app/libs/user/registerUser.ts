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

  const data = {
    email,
    password: hashedPassword,
    name,
  };

  return db.user.create({ data });
}
