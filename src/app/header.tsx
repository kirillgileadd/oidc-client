import clsx from "clsx";
import type { FC } from "react";
import { oidcSessionStore } from "../shared/oidc-client/oidc-session-store.ts";
import { client } from "./router.tsx";
import { Link } from "react-router";

type HeaderProps = {
  className?: string;
};

export const Header: FC<HeaderProps> = ({ className }) => {
  const session = oidcSessionStore.useSession();

  return (
    <header
      className={clsx(
        "flex justify-between h-14 bg-blue-700 text-white items-center px-2",
        className,
      )}
    >
      <nav>
        <ul className="flex gap-x-2">
          <li>
            <Link
              to={{
                pathname: "/",
              }}
            >
              My app
            </Link>
          </li>
          <li>
            <Link
              to={{
                pathname: "/users",
              }}
            >
              Users
            </Link>
          </li>
        </ul>
      </nav>
      <div>
        {session?.type === "logged-in" ? (
          <div className="flex gap-x-4">
            <div>{session?.upn}</div>
            <div>{session?.name}</div>
            <button onClick={() => client.logout()}>Logout</button>
          </div>
        ) : (
          <Link
            to={{
              pathname: "/login",
            }}
          >
            <button>Login</button>
          </Link>
        )}
      </div>
    </header>
  );
};
