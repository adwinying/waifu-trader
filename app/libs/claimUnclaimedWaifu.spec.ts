import { OwnerHistory, User, Waifu } from "@prisma/client";

import claimUnclaimedWaifu from "~/libs/claimUnclaimedWaifu";
import claimWaifu from "~/libs/claimWaifu";
import prisma from "~/utils/db.server";

vi.mock("~/libs/claimWaifu");
vi.mock("~/utils/db.server");
const claimWaifuMock = vi.mocked(claimWaifu);
const prismaMock = vi.mocked(prisma, true);

describe("claimUnclaimedWaifu", () => {
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

  const waifu: Waifu = {
    id: "asdf-qwer-1234-5677",
    name: "Foo",
    series: "Bar",
    description: "Some description",
    img: "http://example.org/baz.jpg",
    ownerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ownerHistory: OwnerHistory = {
    id: "asdf-qwer-1234-5676",
    ownerId: user.id,
    waifuId: waifu.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should throw error if unclaimed waifus unavailable", async () => {
    prismaMock.waifu.findFirst.mockResolvedValue(null);

    const err = new Error("No unclaimed waifus available");

    expect(claimUnclaimedWaifu({ user })).rejects.toThrowError(err);
  });

  it("should claim an unclaimed waifu", async () => {
    const expected = { waifu, ownerHistory };

    prismaMock.waifu.findFirst.mockResolvedValue(waifu);
    claimWaifuMock.mockResolvedValue(expected);

    const result = await claimUnclaimedWaifu({ user });

    expect(result).toEqual(expected);
    expect(prismaMock.waifu.findFirst).toHaveBeenCalledWith({
      where: { ownerId: null },
      orderBy: { id: "asc" },
    });
    expect(claimWaifuMock).toHaveBeenCalledWith({ owner: user, waifu });
  });
});
