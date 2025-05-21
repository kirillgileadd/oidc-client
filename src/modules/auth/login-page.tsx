import clsx from "clsx";
import type { FC } from "react";
import { client } from "../../app/router.tsx";

type LoginPageProps = {
  className?: string;
};

export const LoginPage: FC<LoginPageProps> = ({ className }) => {
  console.log(client, "client");
  return (
    <div
      className={clsx(
        "m-auto w-screen h-64 flex justify-center items-center",
        className,
      )}
    >
      <div className="p-4 shadow rounded w-fit">
        <h3 className="text-xl font-bold text-center mb-2">OIDC</h3>
        <button
          onClick={() => client.login()}
          className="p-2 bg-blue-500 text-white rounded cursor-pointer"
        >
          Login by bouncer
        </button>
      </div>
    </div>
  );
};
