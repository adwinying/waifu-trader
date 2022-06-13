import { User, Waifu } from "@prisma/client";
import { useEffect, useState } from "react";
import { Link, LoaderFunction, Outlet, useLoaderData } from "remix";

import PageTitle from "~/components/PageTitle";
import Pagination from "~/components/Pagination";
import WaifuCard from "~/components/WaifuCard";
import getUserByUsername from "~/libs/getUserByUsername";
import getUserWaifuCount from "~/libs/getUserWaifuCount";
import getUserWaifus from "~/libs/getUserWaifus";
import { getAuthUser } from "~/utils/auth.server";

type LoaderData = {
  user: User;
  isOwner: boolean;
  waifuCount: number;
  waifus: Waifu[];
  pagination: {
    baseUrl: string;
    perPage: number;
    currentPage: number;
    total: number;
  };
};
export const loader: LoaderFunction = async ({ params, request }) => {
  const { username } = params;

  if (!username) throw new Response("Not Found", { status: 404 });

  const user = await getUserByUsername({ username });

  if (user === null) throw new Response("Not Found", { status: 404 });

  const authUser = await getAuthUser(request);
  const waifuCount = await getUserWaifuCount({ user });

  const url = new URL(request.url);
  const count = 20;
  const page = Number(url.searchParams.get("page") ?? 1);
  const offset = (page - 1) * count;
  const waifus = await getUserWaifus({ user, offset, count });

  return {
    user,
    isOwner: user.id === authUser?.id,
    waifuCount,
    waifus,
    pagination: {
      baseUrl: url.toString(),
      perPage: count,
      currentPage: page,
      total: waifuCount,
    },
  };
};

export default function UserProfile() {
  const { user, waifuCount, waifus, pagination } = useLoaderData<LoaderData>();

  const [positionY, updatePositionY] = useState(0);
  useEffect(() => {
    const onScroll = () => updatePositionY(window.scrollY);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <PageTitle>{user.username}&apos;s Profile</PageTitle>

      <h2 className="mb-3 text-3xl font-bold">
        Waifus <span cy-data="userWaifuCount">({waifuCount})</span>
      </h2>

      <div className="mb-3 flex flex-wrap gap-6 md:gap-8">
        {waifus.map((waifu) => (
          <Link
            key={waifu.id}
            to={`/profile/${user.username}/waifu/${waifu.id}?page=${pagination.currentPage}&pos=${positionY}`}
          >
            <WaifuCard key={waifu.id} waifu={waifu} />
          </Link>
        ))}
      </div>

      <Pagination
        baseUrl={pagination.baseUrl}
        total={pagination.total}
        perPage={pagination.perPage}
        currentPage={pagination.currentPage}
      />

      <Outlet />
    </div>
  );
}
