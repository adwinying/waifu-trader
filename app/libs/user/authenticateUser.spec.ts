import bcrypt from "bcryptjs";
import { prismaMock } from "~/../tests/database";
import authenticateUser from "./authenticateUser";

describe("authenticateUser", () => {
  const input = {
    email: "john@doe.com",
    password: "123456",
  };

  test("should return false if user not found", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    await expect(authenticateUser(input)).resolves.toBe(false);
  });

  test("should return false if password does not match", async () => {
    const expected = {
      id: "asdf-qwer-1234-5678",
      name: "John Doe",
      email: input.email,
      password: "some_hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(expected);

    await expect(authenticateUser(input)).resolves.toBe(false);
  });

  test("should return true if password match", async () => {
    const expected = {
      id: "asdf-qwer-1234-5678",
      name: "John Doe",
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(expected);

    await expect(authenticateUser(input)).resolves.toBe(true);
  });
});
