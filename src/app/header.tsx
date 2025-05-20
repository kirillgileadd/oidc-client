import clsx from "clsx";
import type { FC } from "react";
import { oidcSessionStore } from "../shared/oidc-client/oidc-session-store.ts";

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
      My app
      <div>
        {session?.type === "logged-in" ? (
          <div>
            <div>{session.token.accessToken}</div>
            <button>Logout</button>
          </div>
        ) : (
          <button>Login</button>
        )}
      </div>
    </header>
  );
};
