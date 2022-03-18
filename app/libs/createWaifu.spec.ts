import { Waifu } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import createWaifu, { CreateWaifu } from "~/libs/createWaifu";

describe("createWaifu", () => {
  let input: CreateWaifu;
  let expected: Waifu;

  beforeEach(() => {
    input = {
      name: "foo",
      series: "bar",
      description: "foobar",
      img: "https://example.org/foo.jpg",
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
});
