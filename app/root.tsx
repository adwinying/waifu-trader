import { ReactNode } from "react";
import {
  json,
  Link,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  MetaFunction,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import LoadingIndicator from "~/components/LoadingIndicator";
import Notification, { NotificationData } from "~/components/Notification";
import PageTitle from "~/components/PageTitle";
import getUserWaifuCount from "~/libs/getUserWaifuCount";
import tailwind from "~/tailwind.css";
import { getAuthUser } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

type LoaderData = {
  notification?: NotificationData;
  user?: {
    id: string;
    username: string;
    email: string;
    points: number;
    waifuCount: number;
  };
};

export const meta: MetaFunction = () => {
  return { title: "Waifu Trader" };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwind }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("cookie"));

  const notification: NotificationData | undefined =
    session.get("notification");

  const user = (await getAuthUser(request)) ?? undefined;

  // automatically redirect to https
  const url = new URL(request.url);
  const { hostname } = url;
  const proto = request.headers.get("X-Forwarded-Proto") ?? url.protocol;

  url.host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    url.host;
  url.protocol = "https:";

  if (proto === "http" && hostname !== "localhost")
    return redirect(url.toString(), {
      headers: { "X-Forwarded-Proto": "https" },
    });

  return json<LoaderData>(
    {
      notification,
      user:
        user === undefined
          ? undefined
          : {
              id: user.id,
              username: user.username,
              email: user.email,
              points: user.points,
              waifuCount: await getUserWaifuCount({ user }),
            },
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

type LayoutProps = {
  children: ReactNode;
};
function Layout({ children }: LayoutProps) {
  const { notification, user } = useLoaderData<LoaderData>() ?? {};

  return (
    <html lang="en" data-theme="cupcake">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header
          userName={user?.username}
          points={user?.points}
          waifuCount={user?.waifuCount}
        />
        <div className="container mx-auto mb-4 flex-1 px-4">
          {notification && <Notification notification={notification} />}
          {children}
        </div>
        <Footer />
        <LoadingIndicator />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

type ErrorBoundaryProps = {
  error: Error;
};
export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <Layout>
      <PageTitle>Oops, something went wrong!</PageTitle>
      <p>
        Try again later, or go back to the{" "}
        <Link to="/" className="link">
          home page
        </Link>
        .
      </p>
    </Layout>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status !== 404)
    return <ErrorBoundary error={new Error(JSON.stringify(caught))} />;

  return (
    <Layout>
      <PageTitle>404: Not Found</PageTitle>
      <p>
        The page you are looking for does not exist. Perhaps you would like to
        go to the{" "}
        <Link to="/" className="link">
          home page
        </Link>
        ?
      </p>
    </Layout>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
