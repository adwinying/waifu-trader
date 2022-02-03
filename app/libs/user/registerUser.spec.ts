import { User } from "@prisma/client";
import { Matcher } from "jest-mock-extended";
import { prismaMock } from "~/../tests/database";
import registerUser, { RegisterUser } from "./registerUser";

describe("registerUser", () => {
  let input: RegisterUser;
  let expected: User;

  beforeEach(() => {
    input = {
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    };

    expected = {
      id: "asdf-qwer-1234-5678",
      name: input.name,
      email: input.email,
      password: "hashed_123456",
      points: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(expected);
  });

  test("should return a user", async () => {
    await expect(registerUser(input)).resolves.toEqual(expected);
  });

  test("should hash password before saving to db", async () => {
    await registerUser(input);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        email: input.email,
        password: new Matcher(
          (actual: string) => /^\$2a\$10\$.+$/.test(actual),
          "hashed_password",
        ),
        points: 500,
        pointHistories: {
          create: [
            {
              points: 500,
              reason: "Thanks for signing up!",
            },
          ],
        },
      },
    });
  });
});
