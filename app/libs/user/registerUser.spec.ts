import { User, PointHistory } from "@prisma/client";
import { Matcher } from "jest-mock-extended";
import { prismaMock } from "~/../tests/database";
import registerUser, { RegisterUser } from "~/libs/user/registerUser";
import updateUserPoints, {
  UpdateUserPoints,
} from "~/libs/user/updateUserPoints";

jest.mock("~/libs/user/updateUserPoints");
const updateUserPointsMock = updateUserPoints as jest.MockedFn<
  typeof updateUserPoints
>;

describe("registerUser", () => {
  let input: RegisterUser;
  let expected: User;
  let newUser: User;
  let pointHistoryInput: UpdateUserPoints;
  let newPointHistory: PointHistory;

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
        name: input.name,
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
