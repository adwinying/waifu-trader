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
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import { User } from "@prisma/client";
import { ReactNode } from "react";
import tailwind from "~/tailwind.css";
import Header from "~/components/Header";
import Notification, { NotificationData } from "~/components/Notification";
import { commitSession, getSession } from "./utils/session.server";
import { getAuthUser } from "./utils/auth.server";
import PageTitle from "./components/PageTitle";

type LoaderData = {
  notification?: NotificationData;
  user?: Omit<User, "password" | "createdAt" | "updatedAt">;
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

  return json<LoaderData>(
    {
      notification,
      user:
        user === undefined
          ? undefined
          : {
              id: user.id,
              name: user.name,
              email: user.email,
              points: user.points,
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
      <body>
        <Header userName={user?.name} points={user?.points} />
        <div className="container mx-auto px-4">
          {notification && <Notification notification={notification} />}
          {children}
        </div>
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
