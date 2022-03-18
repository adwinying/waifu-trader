import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prismaMock } from "~/../tests/database";
import { SALT_ROUNDS } from "~/libs/registerUser";
import updateUser, { UpdateUser } from "~/libs/updateUser";

jest.mock("bcryptjs");
const bcryptMock = bcrypt as jest.MockedObjectDeep<typeof bcrypt>;

describe("updateUser", () => {
  let input: UpdateUser;
  let expected: User;

  beforeEach(() => {
    input = {
      user: {
        id: "asdf-qwer-1234-5678",
        username: "john",
        email: "john@doe.com",
        password: "hashed_123456",
        points: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastClaimedAt: new Date(),
      },
      username: "jane",
      email: "jane@doe.com",
      password: "234567",
    };

    expected = {
      id: input.user.id,
      username: input.username as string,
      email: input.email as string,
      password: "hashed_234567",
      points: input.user.points,
      createdAt: input.user.createdAt,
      updatedAt: new Date(),
      lastClaimedAt: new Date(),
    };

    prismaMock.user.update.mockResolvedValue(expected);
  });

  test("should return updated user", async () => {
    await expect(updateUser(input)).resolves.toEqual(expected);
  });

  test("should hash password before saving to db", async () => {
    bcryptMock.hash.mockImplementation(() => {
      return Promise.resolve(expected.password);
    });

    await updateUser(input);

    expect(bcryptMock.hash).toHaveBeenCalledWith(input.password, SALT_ROUNDS);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: expected.id },
      data: {
        username: expected.username,
        email: expected.email,
        password: expected.password,
      },
    });
  });
});
