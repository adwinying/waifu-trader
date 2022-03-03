import { User } from "@prisma/client";
import getUserWaifuClaimCost from "./getUserWaifuClaimCost";
import getUserWaifuCount from "./getUserWaifuCount";

jest.mock("~/libs/getUserWaifuCount");
const getUserWaifuCountMock = getUserWaifuCount as jest.MockedFn<
  typeof getUserWaifuCount
>;

describe("getWaifuClaimCost", () => {
  test.each([
    { waifuCount: 0, expected: 50 },
    { waifuCount: 1, expected: 50 },
    { waifuCount: 2, expected: 50 },
    { waifuCount: 5, expected: 50 },
    { waifuCount: 8, expected: 50 },
    { waifuCount: 9, expected: 50 },
    { waifuCount: 10, expected: 100 },
    { waifuCount: 11, expected: 100 },
    { waifuCount: 15, expected: 100 },
    { waifuCount: 18, expected: 100 },
    { waifuCount: 19, expected: 100 },
    { waifuCount: 20, expected: 200 },
    { waifuCount: 29, expected: 200 },
    { waifuCount: 30, expected: 400 },
    { waifuCount: 39, expected: 400 },
    { waifuCount: 40, expected: 800 },
    { waifuCount: 49, expected: 800 },
    { waifuCount: 50, expected: 1600 },
    { waifuCount: 59, expected: 1600 },
    { waifuCount: 60, expected: 3200 },
    { waifuCount: 69, expected: 3200 },
    { waifuCount: 70, expected: 6400 },
    { waifuCount: 79, expected: 6400 },
    { waifuCount: 80, expected: 12800 },
    { waifuCount: 89, expected: 12800 },
    { waifuCount: 90, expected: 25600 },
    { waifuCount: 99, expected: 25600 },
    { waifuCount: 100, expected: 51200 },
  ])(
    "should return $expected if user owns $waifuCount",
    async ({ waifuCount, expected }) => {
      const user: User = {
        id: "asdf-qwer-1234-5678",
        username: "foo",
        email: "foo@bar.com",
        password: "hashed_123456",
        points: 500,
        lastClaimedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getUserWaifuCountMock.mockResolvedValue(waifuCount);

      const result = await getUserWaifuClaimCost({ user });

      expect(result).toEqual(expected);
      expect(getUserWaifuCount).toHaveBeenCalledWith({ user });
    },
  );
});
