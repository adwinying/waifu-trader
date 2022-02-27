import { PointHistory, User } from "@prisma/client";
import { prismaMock } from "~/../tests/database";
import updateUserPoints from "./updateUserPoints";

describe("updateUserPoints", () => {
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

  it("returns error if insufficient", () => {
    const pointChange = -1;
    const reason = "";

    const err = new Error("Insufficient points");

    expect(
      updateUserPoints({ user, pointChange, reason }),
    ).rejects.toThrowError(err);
  });

  it("should update user points", async () => {
    const pointChange = 1;
    const reason = "some reason";

    const updatedUser: User = { ...user, points: user.points + pointChange };
    const pointHistory: PointHistory = {
      id: "asdf-qwer-1234-5678",
      userId: user.id,
      reason,
      points: pointChange,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.$transaction.mockResolvedValue([updatedUser, pointHistory]);
    prismaMock.user.update.mockResolvedValue(updatedUser);
    prismaMock.pointHistory.create.mockResolvedValue(pointHistory);

    const result = await updateUserPoints({ user, pointChange, reason });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: { points: pointChange },
      where: { id: user.id },
    });
    expect(prismaMock.pointHistory.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        points: pointChange,
        reason,
      },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      new Promise((resolve) => {
        resolve(updatedUser);
      }),
      new Promise((resolve) => {
        resolve(pointHistory);
      }),
    ]);

    expect(result).toEqual({ user: updatedUser, pointHistory });
  });
});
