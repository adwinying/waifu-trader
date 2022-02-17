import {
  CogIcon,
  LoginIcon,
  LogoutIcon,
  MenuIcon,
  PencilIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";
import { Link } from "remix";
import GemIcon from "~/components/icons/GemIcon";
import logo from "~/assets/img/logo.jpg";

type Props = {
  userName: string | undefined;
  points: number | undefined;
};

export default function Header({ userName, points }: Props) {
  const isLoggedIn = userName !== undefined;

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex space-x-2 text-3xl font-bold">
          <img src={logo} alt="logo" className="w-9 rounded-full shadow" />
          <span>Waifu Trader</span>
        </Link>

        <div className="dropdown-end dropdown md:hidden">
          <div
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={-1}
          >
            <MenuIcon className="h-8 w-8" />
          </div>
          <ul
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="dropdown-content menu rounded-box mt-2 w-52
              bg-base-100 p-2 shadow-lg"
          >
            {isLoggedIn ? (
              <>
                <li className="menu-title">
                  <span>Point Balance</span>
                </li>
                <li>
                  <Link to="/points" className="hover:opacity-80">
                    <GemIcon className="mr-2 inline h-4 w-4" />
                    <span cy-data="header-points">
                      {points?.toLocaleString()}
                    </span>
                  </Link>
                </li>
                <li className="menu-title">
                  <span>Menu</span>
                </li>
                <li>
                  <Link to="/preferences">
                    <CogIcon className="mr-1 inline h-5 w-5" />
                    <span>Preferences</span>
                  </Link>
                </li>
                <form action="/logout" method="POST">
                  <li>
                    <button
                      type="submit"
                      className="btn-outline btn btn-error justify-start border-0 px-5
                          text-base font-normal normal-case"
                    >
                      <LogoutIcon className="mr-1 inline h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </li>
                </form>
              </>
            ) : (
              <>
                <li>
                  <Link to="/signup">
                    <PencilIcon className="mr-1 inline h-5 w-5 text-primary" />
                    <span className="text-primary">Sign Up</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login">
                    <LoginIcon className="mr-1 inline h-5 w-5" />
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          {isLoggedIn ? (
            <>
              <Link to="/points" className="hover:opacity-80">
                <GemIcon className="mr-1 inline h-6" />
                <span cy-data="header-points">{points?.toLocaleString()}</span>
              </Link>
              <div className="dropdown-end dropdown">
                <div
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                >
                  <UserCircleIcon className="mr-1 inline w-8" />
                  <span cy-data="header-user-name">{userName}</span>
                </div>
                <ul
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                  className="dropdown-content menu rounded-box mt-2 w-52 bg-base-100 p-2 shadow-lg"
                >
                  <li>
                    <Link to="/preferences">
                      <CogIcon className="mr-1 inline h-5 w-5" />
                      <span>Preferences</span>
                    </Link>
                  </li>
                  <form action="/logout" method="POST">
                    <li>
                      <button
                        type="submit"
                        className="btn-outline btn btn-error justify-start border-0 px-5
                          text-base font-normal normal-case"
                      >
                        <LogoutIcon className="mr-1 inline h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </form>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
