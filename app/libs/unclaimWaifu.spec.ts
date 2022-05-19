import { Waifu } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import unclaimWaifu from "~/libs/unclaimWaifu";

describe("unclaimWaifu", () => {
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

  it("should be able to unclaim waifu", async () => {
    const updatedWaifu: Waifu = { ...waifu, ownerId: null };

    prismaMock.waifu.update.mockResolvedValue(updatedWaifu);

    const result = await unclaimWaifu({ waifu });

    expect(prismaMock.waifu.update).toHaveBeenCalledWith({
      data: { ownerId: null },
      where: { id: waifu.id },
    });

    expect(result).toEqual({ waifu: updatedWaifu });
  });
});
