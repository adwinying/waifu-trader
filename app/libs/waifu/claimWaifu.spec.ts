import { OwnerHistory, User, Waifu } from "@prisma/client";
import { prismaMock } from "~/../tests/database";
import claimWaifu from "./claimWaifu";

describe("claimWaifu", () => {
  const user: User = {
    id: "asdf-qwer-1234-5678",
    name: "John Doe",
    email: "john@doe.com",
    password: "hashed_123456",
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  it("should be able to claim waifu", async () => {
    const updatedWaifu: Waifu = { ...waifu, ownerId: user.id };
    const ownerHistory: OwnerHistory = {
      id: "asdf-qwer-1234-5676",
      ownerId: user.id,
      waifuId: waifu.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.$transaction.mockResolvedValue([updatedWaifu, ownerHistory]);
    prismaMock.waifu.update.mockResolvedValue(updatedWaifu);
    prismaMock.ownerHistory.create.mockResolvedValue(ownerHistory);

    const result = await claimWaifu({ owner: user, waifu });

    expect(prismaMock.waifu.update).toHaveBeenCalledWith({
      data: { ownerId: user.id },
      where: { id: waifu.id },
    });
    expect(prismaMock.ownerHistory.create).toHaveBeenCalledWith({
      data: { ownerId: user.id, waifuId: waifu.id },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      new Promise((resolve) => {
        resolve(updatedWaifu);
      }),
      new Promise((resolve) => {
        resolve(ownerHistory);
      }),
    ]);

    expect(result).toEqual({ waifu: updatedWaifu, ownerHistory });
  });
});
