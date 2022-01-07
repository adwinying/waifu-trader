import { UserCircleIcon } from "@heroicons/react/solid";
import { Link } from "remix";
import logo from "~/assets/img/logo.jpg";

type Props = {
  userName: string | undefined;
};

export default function Header({ userName }: Props) {
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
            <Link to="/settings" className="hover:opacity-80">
              <UserCircleIcon className="inline w-8 mr-1" />
              {userName}
            </Link>
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
