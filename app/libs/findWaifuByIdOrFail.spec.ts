import { Waifu } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import findWaifuByIdOrFail from "~/libs/findWaifuByIdOrFail";

describe("findWaifuByIdOrFail", () => {
  const waifu: Waifu = {
    id: "asdf-qwer-1234-5677",
    name: "Foo",
    series: "Bar",
    description: "Some description",
    img: "http://example.org/baz.jpg",
    ownerId: "some-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should be able to find waifu by its id", async () => {
    prismaMock.waifu.findFirst.mockResolvedValue(waifu);

    const result = await findWaifuByIdOrFail({ waifuId: waifu.id });

    expect(prismaMock.waifu.findFirst).toHaveBeenCalledWith({
      where: { id: waifu.id },
    });

    expect(result).toEqual(waifu);
  });

  it("should throw error if waifu not found", async () => {
    prismaMock.waifu.findFirst.mockResolvedValue(null);

    expect(findWaifuByIdOrFail({ waifuId: waifu.id })).rejects.toThrowError(
      "Waifu not found!",
    );
  });
});
