import {
  ActionFunction,
  Form,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import PageTitle from "~/components/PageTitle";
import GemIcon from "~/components/icons/GemIcon";
import { requireUserSession } from "~/utils/auth.server";
import db from "~/utils/db.server";
import useCountdown, { splitTime } from "~/hooks/useCountdown";
import claimUserPoints, {
  HOURS_UNTIL_NEXT_CLAIM,
} from "~/libs/user/claimUserPoints";
import { commitSession, getSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Gems - Waifu Trader",
});

type LoaderData = {
  points: number;
  pointHistories: {
    id: string;
    points: number;
    reason: string;
    createdAt: Date;
  }[];
  nextClaimAt: Date;
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const pointHistories = await db.pointHistory.findMany({
    select: { id: true, points: true, reason: true, createdAt: true },
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const nextClaimAt = new Date(user.lastClaimedAt.getTime());
  nextClaimAt.setHours(nextClaimAt.getHours() + HOURS_UNTIL_NEXT_CLAIM);

  return {
    points: user.points,
    nextClaimAt,
    pointHistories,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const session = await getSession(request.headers.get("cookie"));

  try {
    await claimUserPoints({ user });
  } catch (err) {
    session.flash("notification", {
      type: "error",
      message:
        err instanceof Error && err.message === "Next claim is not ready"
          ? err.message
          : "Failed to claim gems",
    });

    return redirect(request.url, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.flash("notification", {
    type: "success",
    message: "Successfully claimed gems.",
  });

  return redirect(request.url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Points() {
  const { points, pointHistories, nextClaimAt } = useLoaderData<LoaderData>();
  const msRemaining = useCountdown(new Date(nextClaimAt));
  const timeRemaining = splitTime(msRemaining);

  return (
    <div>
      <PageTitle>Gems</PageTitle>

      <div className="mb-5">
        <div className="text-center text-xl">You currently have</div>
        <div
          className="mb-1 flex items-center justify-center
          text-center text-5xl font-bold"
        >
          <GemIcon className="mr-2 inline w-9" />
          <span cy-data="pointBalance">{points.toLocaleString()}</span>
        </div>
        {msRemaining > 0 ? (
          <div className="text-center text-sm">
            Next claim in{" "}
            <span cy-data="remainingDays">
              {timeRemaining.days ? `${timeRemaining.days}d ` : ""}
            </span>
            <span cy-data="remainingHours">
              {timeRemaining.hours ? `${timeRemaining.hours}h ` : ""}
            </span>
            <span cy-data="remainingMinutes">
              {timeRemaining.minutes ? `${timeRemaining.minutes}m ` : ""}
            </span>
            <span cy-data="remainingSeconds">{timeRemaining.seconds}s</span>
          </div>
        ) : (
          <Form method="post" className="mt-2 text-center">
            <button
              cy-data="claimGemBtn"
              className="btn btn-primary btn-sm"
              type="submit"
            >
              Claim Gems
            </button>
          </Form>
        )}
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
              textClass = isPositive
                ? "text-success-content"
                : "text-error-content";
              symbol = isPositive ? "+" : "-";
            }

            return (
              <div className="card-bordered card shadow" cy-data="pointHistory">
                <div className="flex flex-col-reverse justify-between p-5 md:flex-row md:items-center">
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
                    className={`align-center stat-value mb-2 flex md:mb-0 ${textClass}`}
                    cy-data="pointChange"
                  >
                    {symbol}
                    {Math.abs(history.points).toLocaleString()}
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
