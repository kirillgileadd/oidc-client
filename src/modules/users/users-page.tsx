import clsx from "clsx";
import type { FC } from "react";
import { useGetUsers } from "./use-get-users.ts";

type UsersPageProps = {
  className?: string;
};

export const UsersPage: FC<UsersPageProps> = ({ className }) => {
  const usersQuery = useGetUsers();

  return (
    <div className={clsx("", className)}>
      <h1>User Page</h1>
      {usersQuery.isLoading && <div>Loading...</div>}
      {usersQuery.data?.users.map((user) => (
        <div>
          <p>{user.email}</p>
          <p>{user.createdAt ? new Date(user.createdAt).toString() : ""}</p>
        </div>
      ))}
    </div>
  );
};
