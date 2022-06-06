import { User } from "@prisma/client";

import getUserByUsername from "./getUserByUsername";

import { prismaMock } from "~/../tests/database";

describe("getUserByUsername", () => {
  const user: User = {
    id: "asdf-qwer-1234-5678",
    username: "john",
    email: "john@doe.com",
    password: "hashed_123456",
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastClaimedAt: new Date(),
  };

  it("should return a user that matches its username", async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await getUserByUsername({ username: user.username });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: user.username },
    });
    expect(result).toEqual(user);
  });

  it("should return null when user with given username not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getUserByUsername({ username: user.username });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: user.username },
    });
    expect(result).toEqual(null);
  });
});
