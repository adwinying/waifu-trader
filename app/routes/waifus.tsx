import { RefreshIcon } from "@heroicons/react/solid";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import GemIcon from "~/components/icons/GemIcon";
import PageTitle from "~/components/PageTitle";
import claimUnclaimedWaifu from "~/libs/claimUnclaimedWaifu";
import getUserWaifuClaimCost from "~/libs/getUserWaifuClaimCost";
import getUserWaifuCount from "~/libs/getUserWaifuCount";
import updateUserPoints from "~/libs/updateUserPoints";
import { requireUserSession } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Waifus - Waifu Trader",
});

type LoaderData = {
  waifuClaimCost: number;
  waifuCount: number;
  canClaimWaifu: boolean;
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);

  const waifuClaimCost = await getUserWaifuClaimCost({ user });
  const waifuCount = await getUserWaifuCount({ user });
  const pointBalance = user.points;
  const canClaimWaifu = waifuClaimCost <= pointBalance;

  return {
    waifuClaimCost,
    waifuCount,
    canClaimWaifu,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const session = await getSession(request.headers.get("cookie"));
  const waifuCost = await getUserWaifuClaimCost({ user });
  const reason = "Claimed waifu";

  try {
    await updateUserPoints({ user, pointChange: -waifuCost, reason });
    await claimUnclaimedWaifu({ user });
  } catch (err) {
    const approvedErrors = [
      "Insufficient points",
      "No unclaimed waifus available",
    ];

    session.flash("notification", {
      type: "error",
      message:
        err instanceof Error && approvedErrors.includes(err.message)
          ? err.message
          : "Failed to claim waifu",
    });

    return redirect(request.url, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.flash("notification", {
    type: "success",
    message: "Successfully claimed waifu.",
  });

  return redirect(request.url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Waifus() {
  const { waifuCount, waifuClaimCost, canClaimWaifu } =
    useLoaderData<LoaderData>();

  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  return (
    <div>
      <PageTitle>Waifus</PageTitle>

      <div className="flex items-center space-x-3">
        <h2 className="text-3xl font-bold">
          My Waifus <span cy-data="userWaifuCount">({waifuCount})</span>
        </h2>

        <Form method="post" className="text-center">
          <button
            cy-data="claimWaifuBtn"
            className="btn btn-primary btn-sm"
            disabled={!canClaimWaifu}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <RefreshIcon className="mr-2 h-5 w-5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                Claim New Waifu for
                <GemIcon className="ml-1 mr-0.5 h-3.5 w-3.5" />
                <span cy-data="waifuCost">
                  {waifuClaimCost.toLocaleString()}
                </span>
              </>
            )}
          </button>
        </Form>
      </div>
    </div>
  );
}
