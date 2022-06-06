import db from "~/utils/db.server";

export type GetUserByUsername = {
  username: string;
};

export default async function getUserByUsername({
  username,
}: GetUserByUsername) {
  return db.user.findUnique({ where: { username } });
}
