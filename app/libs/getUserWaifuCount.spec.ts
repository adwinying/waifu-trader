import { User } from "@prisma/client";

import { prismaMock } from "~/../tests/database";
import getUserWaifuCount from "~/libs/getUserWaifuCount";

describe("getUserWaifuCount", () => {
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

  it("should return user's waifu count", async () => {
    const count = 69;

    prismaMock.waifu.count.mockResolvedValue(count);

    const result = await getUserWaifuCount({ user });

    expect(result).toEqual(count);
    expect(prismaMock.waifu.count).toHaveBeenCalledWith({
      where: { ownerId: user.id },
    });
  });
});
