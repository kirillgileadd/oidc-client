import clsx from "clsx";
import type { FC } from "react";
import { useGetUsers } from "./use-get-users.ts";

type UsersPageProps = {
  className?: string;
};

export const UsersPage: FC<UsersPageProps> = ({ className }) => {
  const usersQuery = useGetUsers();

  return (
    <div className={clsx("p-2", className)}>
      <h1 className="text-xl mb-3 font-bold">User Page</h1>
      {usersQuery.isLoading && <div>Loading...</div>}
      {usersQuery.data?.users.map((user) => (
        <div key={user.id}>
          <p>{user.email}</p>
          <p>{user.createdAt ? new Date(user.createdAt).toString() : ""}</p>
        </div>
      ))}
    </div>
  );
};
