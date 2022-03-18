import bcrypt from "bcryptjs";

import { prismaMock } from "~/../tests/database";
import authenticateUser from "~/libs/authenticateUser";

describe("authenticateUser", () => {
  const input = {
    email: "john@doe.com",
    password: "123456",
  };

  test("should return null if user not found", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    await expect(authenticateUser(input)).resolves.toBe(null);
  });

  test("should return null if password does not match", async () => {
    const expected = {
      id: "asdf-qwer-1234-5678",
      username: "john",
      email: input.email,
      password: "some_hashed_password",
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastClaimedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(expected);

    await expect(authenticateUser(input)).resolves.toBe(null);
  });

  test("should return true if password match", async () => {
    const expected = {
      id: "asdf-qwer-1234-5678",
      username: "john",
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastClaimedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(expected);

    await expect(authenticateUser(input)).resolves.toBe(expected);
  });
});
