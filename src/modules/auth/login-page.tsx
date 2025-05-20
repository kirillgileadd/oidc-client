import clsx from "clsx";
import type { FC } from "react";
import { client } from "../../app/router.tsx";

type LoginPageProps = {
  className?: string;
};

export const LoginPage: FC<LoginPageProps> = ({ className }) => {
  console.log(client, "client");
  return (
    <div className={clsx("m-auto ", className)}>
      <div>
        <p>OIDC</p>
        <button
          onClick={() => client.login()}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Login by bouncer
        </button>
      </div>
    </div>
  );
};
