import { User, PointHistory } from "@prisma/client";
import { Matcher } from "jest-mock-extended";

import { prismaMock } from "~/../tests/database";
import registerUser, { RegisterUser } from "~/libs/registerUser";
import updateUserPoints, { UpdateUserPoints } from "~/libs/updateUserPoints";

jest.mock("~/libs/updateUserPoints");
const updateUserPointsMock = jest.mocked(updateUserPoints);

describe("registerUser", () => {
  let input: RegisterUser;
  let expected: User;
  let newUser: User;
  let pointHistoryInput: UpdateUserPoints;
  let newPointHistory: PointHistory;

  beforeEach(() => {
    input = {
      username: "john",
      email: "john@doe.com",
      password: "123456",
    };

    expected = {
      id: "asdf-qwer-1234-5678",
      username: input.username,
      email: input.email,
      password: "hashed_123456",
      points: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastClaimedAt: new Date(),
    };

    newUser = {
      ...expected,
      points: 0,
    };

    pointHistoryInput = {
      user: newUser,
      pointChange: 500,
      reason: "Thanks for signing up!",
    };

    newPointHistory = {
      id: "asdf-qwer-1234-5678",
      userId: newUser.id,
      points: pointHistoryInput.pointChange,
      reason: pointHistoryInput.reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(newUser);

    updateUserPointsMock.mockResolvedValue({
      user: expected,
      pointHistory: newPointHistory,
    });
  });

  test("should return a user", async () => {
    await expect(registerUser(input)).resolves.toEqual(expected);
  });

  test("should hash password before saving to db", async () => {
    await registerUser(input);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        username: input.username,
        email: input.email,
        password: new Matcher(
          (actual: string) => /^\$2a\$10\$.+$/.test(actual),
          "hashed_password",
        ),
      },
    });
  });

  test("should award user 500 points", async () => {
    await registerUser(input);

    expect(updateUserPointsMock).toHaveBeenCalledWith(pointHistoryInput);
  });
});
