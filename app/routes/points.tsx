import { LoaderFunction, useLoaderData } from "remix";
import PageTitle from "~/components/PageTitle";
import gemIcon from "~/assets/img/gem.svg";
import { requireUserSession } from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  points: number;
  pointHistories: {
    id: string;
    points: number;
    reason: string;
    createdAt: Date;
  }[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const pointHistories = await db.pointHistory.findMany({
    select: { id: true, points: true, reason: true, createdAt: true },
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    points: user.points,
    pointHistories,
  };
};

export default function Points() {
  const { points, pointHistories } = useLoaderData<LoaderData>();

  return (
    <div>
      <PageTitle>Gems</PageTitle>

      <div className="mb-5">
        <div className="text-center text-xl">You currently have</div>
        <div
          className="flex items-center justify-center
          text-center text-5xl font-bold"
        >
          <img src={gemIcon} alt="Gem Icon" className="inline w-9 mr-2" />
          <span cy-data="pointBalance">{points.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-2xl font-bold">History</h3>

        <div className="flex flex-col gap-3">
          {pointHistories.map((history) => {
            const isZero = history.points === 0;
            const isPositive = history.points > 0;
            let textClass = "";
            let symbol = "";

            if (!isZero) {
              textClass = isPositive ? "text-success" : "text-error";
              symbol = isPositive ? "+" : "-";
            }

            return (
              <div className="card card-bordered shadow" cy-data="pointHistory">
                <div className="flex flex-col-reverse justify-between md:flex-row md:items-center p-5">
                  <div>
                    <div className="text-lg" cy-data="reason">
                      {history.reason}
                    </div>
                    <div className="text-xs text-gray-400" cy-data="timestamp">
                      {new Intl.DateTimeFormat("default", {
                        dateStyle: "long",
                        timeStyle: "medium",
                      }).format(new Date(history.createdAt))}
                    </div>
                  </div>
                  <div
                    className={`flex align-center stat-value mb-2 md:mb-0 ${textClass}`}
                    cy-data="pointChange"
                  >
                    {symbol}
                    {Math.abs(history.points)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}