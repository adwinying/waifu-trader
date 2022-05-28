import { RefreshIcon, TrashIcon, XIcon } from "@heroicons/react/solid";
import { User, Waifu } from "@prisma/client";
import { ReactEventHandler, useEffect, useRef, useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  MetaFunction,
  redirect,
  Session,
  useLoaderData,
  useTransition,
} from "remix";

import PageTitle from "~/components/PageTitle";
import Pagination from "~/components/Pagination";
import GemIcon from "~/components/icons/GemIcon";
import claimUnclaimedWaifu from "~/libs/claimUnclaimedWaifu";
import findWaifuByIdOrFail from "~/libs/findWaifuByIdOrFail";
import getUserWaifuClaimCost from "~/libs/getUserWaifuClaimCost";
import getUserWaifuCount from "~/libs/getUserWaifuCount";
import getUserWaifus from "~/libs/getUserWaifus";
import unclaimWaifu from "~/libs/unclaimWaifu";
import updateUserPoints from "~/libs/updateUserPoints";
import { requireUserSession } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Waifus - Waifu Trader",
});

type LoaderData = {
  waifus: Waifu[];
  waifuClaimCost: number;
  waifuCount: number;
  canClaimWaifu: boolean;
  isClaimed: boolean;
  pagination: {
    baseUrl: string;
    perPage: number;
    currentPage: number;
    total: number;
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const count = 20;
  const page = Number(url.searchParams.get("page") ?? 1);
  const isClaimed = Number(url.searchParams.get("isClaimed")) === 1;
  const offset = (page - 1) * count;
  url.searchParams.delete("isClaimed");

  const waifus = await getUserWaifus({ user, offset, count });
  const waifuClaimCost = await getUserWaifuClaimCost({ user });
  const waifuCount = await getUserWaifuCount({ user });
  const pointBalance = user.points;
  const canClaimWaifu = waifuClaimCost <= pointBalance;

  return {
    waifus,
    waifuClaimCost,
    waifuCount,
    canClaimWaifu,
    isClaimed,
    pagination: {
      baseUrl: url.toString(),
      perPage: count,
      currentPage: page,
      total: waifuCount,
    },
  };
};

const claimWaifu = async (user: User, session: Session) => {
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

    return redirect("/waifus", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.flash("notification", {
    type: "success",
    message: "Successfully claimed waifu.",
  });

  return redirect("/waifus?isClaimed=1", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
const recycleWaifu = async (user: User, waifuId: string, session: Session) => {
  let waifu: Waifu;

  // Check waifu exists
  try {
    waifu = await findWaifuByIdOrFail({ waifuId });
  } catch (err) {
    session.flash("notification", {
      type: "error",
      message:
        err instanceof Error && err.message === "Waifu not found!"
          ? "Waifu not found!"
          : "Failed to recycle waifu",
    });

    return redirect("/waifus", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Check user is waifu owner
  const isUserWaifuOwner = waifu.ownerId === user.id;
  if (!isUserWaifuOwner) {
    session.flash("notification", {
      type: "error",
      message: "This is not your waifu!",
    });

    return redirect("/waifus", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Unclaim waifu
  try {
    await unclaimWaifu({ waifu });
  } catch (err) {
    session.flash("notification", {
      type: "error",
      message: "Failed to recycle waifu",
    });

    return redirect("/waifus", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.flash("notification", {
    type: "success",
    message: "Successfully recycled waifu.",
  });

  return redirect("/waifus", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const session = await getSession(request.headers.get("cookie"));
  const formData = await request.formData();
  const { _action, waifuId } = Object.fromEntries(formData) as {
    _action: string;
    waifuId: string;
  };

  if (_action === "claim") return claimWaifu(user, session);
  if (_action === "recycle") return recycleWaifu(user, waifuId, session);

  return null;
};

function WaifuDetail({
  waifu,
  isOwner = false,
}: {
  waifu: Waifu;
  isOwner: boolean;
}) {
  const transition = useTransition();
  const isRecycling =
    transition.submission?.formData.get("_action") === "recycle" &&
    transition.state === "submitting";

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-6">
      <div className="space-y-3">
        <div className="mask mask-squircle h-36 w-36 md:h-48 md:w-48">
          <img
            cy-data="waifuImg"
            className="h-full w-full object-cover"
            src={waifu.img}
            alt={waifu.name}
          />
        </div>
        {isOwner && (
          <Form method="post">
            <input type="hidden" name="waifuId" value={waifu.id} />
            <button
              className="btn btn-error btn-block btn-sm"
              type="submit"
              disabled={isRecycling}
              name="_action"
              value="recycle"
            >
              {isRecycling ? (
                <RefreshIcon className="mr-1 h-5 w-5 animate-spin" />
              ) : (
                <TrashIcon className="mr-1 h-5 w-5" />
              )}
              Recycle Waifu
            </button>
          </Form>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold">{waifu.name}</h1>

        <h3 className="mb-3 text-gray-400">{waifu.series}</h3>

        <p className="break-words text-gray-600">{waifu.description}</p>
      </div>
    </div>
  );
}

export default function Waifus() {
  const {
    waifus,
    waifuCount,
    waifuClaimCost,
    canClaimWaifu,
    isClaimed,
    pagination,
  } = useLoaderData<LoaderData>();

  const transition = useTransition();
  const isClaiming =
    transition.submission?.formData.get("_action") === "claim" &&
    transition.state === "submitting";
  const firstWaifuRef = useRef<HTMLImageElement>(null);

  const animateImage: ReactEventHandler<HTMLImageElement> = () => {
    if (!isClaimed) return;

    const firstWaifuImg = firstWaifuRef.current;
    if (firstWaifuImg === null) return;

    firstWaifuImg.style.transform = "Scale(1.1)";

    setTimeout(() => {
      firstWaifuImg.style.transform = "Scale(1.0)";
    }, 150);
  };

  const [selectedWaifu, setSelectedWaifu] = useState<Waifu | null>(null);

  useEffect(() => {
    setSelectedWaifu(null);
  }, [waifus]);

  return (
    <div>
      <PageTitle>Waifus</PageTitle>

      <div className="mb-8 items-center sm:flex sm:space-x-3">
        <h2 className="mb-3 text-3xl font-bold sm:mb-0">
          My Waifus <span cy-data="userWaifuCount">({waifuCount})</span>
        </h2>

        <Form method="post">
          <button
            cy-data="claimWaifuBtn"
            className="btn btn-primary btn-sm"
            disabled={!canClaimWaifu}
            name="_action"
            value="claim"
            type="submit"
          >
            {isClaiming ? (
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

      <div className="mb-3 flex flex-wrap gap-6 md:gap-8">
        {waifus.map((waifu, i) => (
          <button
            key={waifu.id}
            type="button"
            cy-data="waifuCard"
            className="flex flex-col items-center space-y-3"
            onClick={() => setSelectedWaifu(waifu)}
          >
            <div
              className="mask mask-squircle h-36 w-36
                transition-all duration-150 ease-in-out
                md:h-48 md:w-48"
              ref={i === 0 ? firstWaifuRef : undefined}
            >
              <img
                cy-data="waifuImg"
                className="h-full w-full object-cover"
                src={waifu.img}
                alt={waifu.name}
                onLoad={i === 0 ? animateImage : undefined}
              />
            </div>
            <span cy-data="waifuName" className="w-36 md:w-48">
              {waifu.name}
            </span>
          </button>
        ))}
      </div>

      <div className={`modal ${selectedWaifu && "modal-open"}`}>
        <div className="modal-box md:min-h-[500px] md:min-w-[80vw] md:p-10">
          <div className="flex justify-end">
            <button type="button" onClick={() => setSelectedWaifu(null)}>
              <XIcon className="w-8 text-gray-500" />
            </button>
          </div>

          {selectedWaifu && <WaifuDetail waifu={selectedWaifu} isOwner />}
        </div>
      </div>

      <Pagination
        baseUrl={pagination.baseUrl}
        total={pagination.total}
        perPage={pagination.perPage}
        currentPage={pagination.currentPage}
      />
    </div>
  );
}
