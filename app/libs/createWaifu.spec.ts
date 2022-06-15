import { User, Waifu } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import createWaifu, { CreateWaifu } from "~/libs/createWaifu";

describe("createWaifu", () => {
  let input: CreateWaifu;
  let expected: Waifu;
  let user: User;

  beforeEach(() => {
    input = {
      name: "foo",
      series: "bar",
      description: "foobar",
      img: "https://example.org/foo.jpg",
    };

    user = {
      id: "asdf-qwer-1234-5678",
      username: "john",
      email: "john@doe.com",
      password: "hashed_123456",
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastClaimedAt: new Date(),
    };

    expected = {
      id: "asdf-qwer-1234-5678",
      name: input.name,
      series: input.series,
      description: input.description,
      img: input.img,
      ownerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.waifu.create.mockResolvedValue(expected);
  });

  test("should return a waifu", async () => {
    await expect(createWaifu(input)).resolves.toEqual(expected);
  });

  test("check input params", async () => {
    await createWaifu(input);

    expect(prismaMock.waifu.create).toHaveBeenCalledWith({
      data: input,
    });
  });

  test("should set ownerId if owner is provided", async () => {
    await createWaifu({ ...input, owner: user });

    expect(prismaMock.waifu.create).toHaveBeenCalledWith({
      data: { ...input, ownerId: user.id },
    });
  });
});
