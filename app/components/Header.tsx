import { UserCircleIcon } from "@heroicons/react/solid";
import { Link } from "remix";
import logo from "~/assets/img/logo.jpg";
import gem from "~/assets/img/gem.svg";

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
                <img src={gem} alt="Gem Icon" className="inline h-6 mr-1" />
                <span cy-data="header-points">{points?.toLocaleString()}</span>
              </Link>
              <Link to="/preferences" className="hover:opacity-80">
                <UserCircleIcon className="inline w-8 mr-1" />
                <span cy-data="header-user-name">{userName}</span>
              </Link>
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
