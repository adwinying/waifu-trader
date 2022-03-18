import { User, Waifu } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import getUserWaifus from "~/libs/getUserWaifus";

describe("getUserWaifus", () => {
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

  const waifus: Waifu[] = [
    {
      id: "asdf-qwer-1234-5676",
      name: "Foo",
      series: "Bar",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      ownerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "asdf-qwer-1234-5677",
      name: "Baz",
      series: "Far",
      description: "Some description",
      img: "http://example.org/baz.jpg",
      ownerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should return user's waifu", async () => {
    prismaMock.waifu.findMany.mockResolvedValue(waifus);

    const results = await getUserWaifus({ user });

    expect(results).toEqual(waifus);
    expect(prismaMock.waifu.findMany).toHaveBeenCalledWith({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      skip: 0,
      take: 20,
    });
  });

  it("should able to offset results", async () => {
    const offset = 69;

    prismaMock.waifu.findMany.mockResolvedValue(waifus);

    const results = await getUserWaifus({ user, offset });

    expect(results).toEqual(waifus);
    expect(prismaMock.waifu.findMany).toHaveBeenCalledWith({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: 20,
    });
  });

  it("should able to customize result size", async () => {
    const count = 69;

    prismaMock.waifu.findMany.mockResolvedValue(waifus);

    const results = await getUserWaifus({ user, count });

    expect(results).toEqual(waifus);
    expect(prismaMock.waifu.findMany).toHaveBeenCalledWith({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      skip: 0,
      take: count,
    });
  });
});
