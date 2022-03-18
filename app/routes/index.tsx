import { Link, LoaderFunction, useLoaderData } from "remix";

import { getAuthUser } from "~/utils/auth.server";

type LoaderData = {
  isLoggedIn: boolean;
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request);

  return {
    isLoggedIn: user !== null,
  };
};

export default function Index() {
  const { isLoggedIn } = useLoaderData<LoaderData>();

  return (
    <div className="my-8 flex flex-col items-center space-y-4 md:space-y-6">
      <h1 className="text-center text-4xl font-bold md:text-5xl">
        Collect your precious waifus
      </h1>

      {isLoggedIn ? (
        <Link to="/waifus" className="btn btn-primary">
          My Waifus
        </Link>
      ) : (
        <Link to="/signup" className="btn btn-primary">
          Sign Up
        </Link>
      )}
    </div>
  );
}
