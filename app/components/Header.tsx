import { CogIcon, LogoutIcon, UserCircleIcon } from "@heroicons/react/solid";
import { Link } from "remix";
import logo from "~/assets/img/logo.jpg";
import gemIcon from "~/assets/img/gem.svg";

type Props = {
  userName: string | undefined;
  points: number | undefined;
};

export default function Header({ userName, points }: Props) {
  const isLoggedIn = userName !== undefined;

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        <Link to="/" className="flex space-x-2 text-3xl font-bold">
          <img src={logo} alt="logo" className="rounded-full w-9 shadow" />
          <span>Waifu Trader</span>
        </Link>

        <div className="flex space-x-4 items-center">
          {isLoggedIn ? (
            <>
              <Link to="/points" className="hover:opacity-80">
                <img src={gemIcon} alt="Gem Icon" className="inline h-6 mr-1" />
                <span cy-data="header-points">{points?.toLocaleString()}</span>
              </Link>
              <div className="dropdown dropdown-end">
                <div
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                >
                  <UserCircleIcon className="inline w-8 mr-1" />
                  <span cy-data="header-user-name">{userName}</span>
                </div>
                <ul
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                  className="mt-2 p-2 shadow-lg menu dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <Link to="/preferences">
                      <CogIcon className="inline w-5 h-5 mr-1" />
                      <span>Preferences</span>
                    </Link>
                  </li>
                  <form action="/logout" method="POST">
                    <li>
                      <button
                        type="submit"
                        className="px-5 btn btn-outline btn-error justify-start border-0
                          font-normal normal-case text-base"
                      >
                        <LogoutIcon className="inline w-5 h-5 mr-1" />
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
