import { PointHistory, User } from "@prisma/client";
import { prismaMock } from "~/../tests/database";
import claimUserPoints from "~/libs/claimUserPoints";
import updateUserPoints from "~/libs/updateUserPoints";

jest.mock("~/libs/updateUserPoints");
const updateUserPointsMock = updateUserPoints as jest.MockedFn<
  typeof updateUserPoints
>;

describe("claimUserPoints", () => {
  let timestamp: Date;
  let user: User;
  let updatedUser: User;
  let pointHistory: PointHistory;

  beforeEach(() => {
    timestamp = new Date();
    user = {
      id: "asdf-qwer-1234-5678",
      username: "foo",
      email: "foo@bar.com",
      password: "hashed_123456",
      points: 500,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastClaimedAt: timestamp,
    };
    updatedUser = {
      ...user,
      points: 1000,
    };
    pointHistory = {
      id: "asdf-qwer-1234-5678",
      userId: user.id,
      reason: "Gem claimed",
      points: 500,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    jest.useFakeTimers("modern").setSystemTime(timestamp);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should throw error if next claim is not available", async () => {
    const newTimestamp = new Date(timestamp.getTime());
    newTimestamp.setHours(newTimestamp.getHours() + 3);
    newTimestamp.setSeconds(newTimestamp.getSeconds() - 1);
    jest.setSystemTime(newTimestamp);

    const err = new Error("Next claim is not ready");

    expect(claimUserPoints({ user })).rejects.toThrowError(err);
  });

  it("should update last claimed timestamp", async () => {
    const newTimestamp = new Date(timestamp.getTime());
    newTimestamp.setHours(newTimestamp.getHours() + 3);
    jest.setSystemTime(newTimestamp);

    prismaMock.user.update.mockResolvedValue(user);
    updateUserPointsMock.mockResolvedValue({ user: updatedUser, pointHistory });

    const result = await claimUserPoints({ user });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { lastClaimedAt: newTimestamp },
    });

    expect(result).toEqual({ user: updatedUser, pointHistory });
  });

  it("should update user points", async () => {
    const pointChange = 500;
    const reason = "Gems claimed";

    const newTimestamp = new Date(timestamp.getTime());
    newTimestamp.setHours(newTimestamp.getHours() + 3);
    jest.setSystemTime(newTimestamp);

    prismaMock.user.update.mockResolvedValue(user);
    updateUserPointsMock.mockResolvedValue({ user: updatedUser, pointHistory });

    const result = await claimUserPoints({ user });

    expect(updateUserPointsMock).toHaveBeenCalledWith({
      user,
      pointChange,
      reason,
    });

    expect(result).toEqual({ user: updatedUser, pointHistory });
  });
});
