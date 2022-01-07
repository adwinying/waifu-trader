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
import tailwind from "~/tailwind.css";
import Header from "~/components/Header";
import Notification, { NotificationData } from "~/components/Notification";
import { commitSession, getSession } from "./utils/session.server";

type LoaderData = {
  notification?: NotificationData;
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

  return json<LoaderData>(
    {
      notification,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

export default function App() {
  const { notification } = useLoaderData<LoaderData>();

  return (
    <html lang="en" data-theme="cupcake">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
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
