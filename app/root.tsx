import {
  json,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import { User } from "@prisma/client";
import tailwind from "~/tailwind.css";
import Header from "~/components/Header";
import Notification, { NotificationData } from "~/components/Notification";
import { commitSession, getSession } from "./utils/session.server";
import { getAuthUser } from "./utils/auth.server";

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
          : { id: user.id, name: user.name, email: user.email },
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

export default function App() {
  const { notification, user } = useLoaderData<LoaderData>();

  return (
    <html lang="en" data-theme="cupcake">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header userName={user?.name} />
        <div className="container mx-auto px-4">
          {notification && <Notification notification={notification} />}
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
