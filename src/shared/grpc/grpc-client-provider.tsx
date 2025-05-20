import { retryMiddleware } from "nice-grpc-client-middleware-retry";
import { type Client, createChannel, createClientFactory } from "nice-grpc-web";
import { type PropsWithChildren, useMemo } from "react";

import { type GrpcClientsContextValue, grpcClientsContext } from "./context";
import { errorMiddleware } from "./error-middleware.ts";
import { authMiddleware } from "./auth-middleware.ts";

const channel = createChannel("https://photo-meta.dev.api.deeplay.io");

export const GrpcClientsProvider = ({ children }: PropsWithChildren) => {
  const value = useMemo((): GrpcClientsContextValue => {
    let clientFactory = createClientFactory().use(retryMiddleware);

    clientFactory = clientFactory.use(authMiddleware).use(errorMiddleware);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clients = new Map<object, Client<any>>();

    return {
      getClient(definition) {
        let client = clients.get(definition);

        if (client == null) {
          client = clientFactory.create(definition, channel);
          clients.set(definition, client);
        }

        return client;
      },
    };
    // eslint-disable-next-line
  }, []);

  return (
    <grpcClientsContext.Provider value={value}>
      {children}
    </grpcClientsContext.Provider>
  );
};
