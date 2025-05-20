import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAccessClient } from "../../shared/grpc/clients/use-access-client";
import type { GetUsersResponse } from "../../shared/proto/photometa_backend_access/v1/photometa_backend_access";

const QUERY_KEYS = {
  USERS: "users",
};

export const useGetUsers = () => {
  const { getUsers } = useAccessClient();

  return useQuery<GetUsersResponse>({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: async ({ signal }) => {
      const response = await getUsers({
        signal,
      });

      return response;
    },
    placeholderData: keepPreviousData,
  });
};
