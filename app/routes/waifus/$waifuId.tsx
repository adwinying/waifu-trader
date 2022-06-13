import { RefreshIcon, TrashIcon, XIcon } from "@heroicons/react/solid";
import { Waifu } from "@prisma/client";
import { useEffect } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useLoaderData,
  useTransition,
} from "remix";

import findWaifuByIdOrFail from "~/libs/findWaifuByIdOrFail";
import unclaimWaifu from "~/libs/unclaimWaifu";
import { getAuthUser, requireUserSession } from "~/utils/auth.server";
import { flashNotificationAndRedirect } from "~/utils/notification.server";
import { getSession } from "~/utils/session.server";

type LoaderData = {
  waifu: Waifu;
  isOwner: boolean;
  page: number;
  position: number;
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const position = Number(url.searchParams.get("pos"));

  let waifu;
  const { waifuId } = params;
  const user = await getAuthUser(request);

  if (!waifuId) throw new Response("Not Found", { status: 404 });

  try {
    waifu = await findWaifuByIdOrFail({ waifuId });
  } catch (e) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    waifu,
    isOwner: waifu.ownerId && waifu.ownerId === user?.id,
    position,
  };
};

export const action: ActionFunction = async ({ params, request }) => {
  const { waifuId } = params;
  const user = await requireUserSession(request);
  const session = await getSession(request.headers.get("cookie"));
  let waifu: Waifu;

  if (!waifuId) throw new Response("Not Found", { status: 404 });

  // Check waifu exists
  try {
    waifu = await findWaifuByIdOrFail({ waifuId });
  } catch (err) {
    return flashNotificationAndRedirect({
      session,
      type: "error",
      message:
        err instanceof Error && err.message === "Waifu not found!"
          ? "Waifu not found!"
          : "Failed to recycle waifu",
      redirectTo: "/waifus",
    });
  }

  // Check user is waifu owner
  const isUserWaifuOwner = waifu.ownerId === user.id;
  if (!isUserWaifuOwner) {
    return flashNotificationAndRedirect({
      session,
      type: "error",
      message: "This is not your waifu!",
      redirectTo: "/waifus",
    });
  }

  // Unclaim waifu
  try {
    await unclaimWaifu({ waifu });
  } catch (err) {
    return flashNotificationAndRedirect({
      session,
      type: "error",
      message: "Failed to recycle waifu",
      redirectTo: "/waifus",
    });
  }

  return flashNotificationAndRedirect({
    session,
    type: "success",
    message: "Successfully recycled waifu.",
    redirectTo: "/waifus",
  });
};

export default function WaifuDetail() {
  const { waifu, isOwner, position } = useLoaderData<LoaderData>();

  const transition = useTransition();
  const isRecycling = transition.state === "submitting";

  // restore scroll location
  useEffect(() => {
    if (typeof position === "number") window.scrollTo(0, position);
  }, [position]);

  return (
    <div className="modal-open modal">
      <div className="modal-box md:min-h-[500px] md:min-w-[80vw] md:p-10">
        <div className="flex justify-end">
          <button type="button" onClick={() => window.history.back()}>
            <XIcon className="w-8 text-gray-500" />
          </button>
        </div>

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
                <button
                  className="btn btn-error btn-block btn-sm"
                  type="submit"
                  disabled={isRecycling}
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
      </div>
    </div>
  );
}
