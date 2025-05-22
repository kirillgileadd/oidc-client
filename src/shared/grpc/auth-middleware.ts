import {
  type CallOptions,
  ClientError,
  type ClientMiddlewareCall,
  Metadata,
  // Status,
} from "nice-grpc-web";
import { oidcSessionStore } from "../oidc-client/oidc-session-store.ts";
import { client } from "../../app/router.tsx";

let refreshPromise: Promise<string | null> | null = null;

const getRefreshToken = async () => {
  if (!refreshPromise) {
    refreshPromise = client.refreshTokens();
  }
  return refreshPromise;
};

export async function* authMiddleware<Request, Response>(
  call: ClientMiddlewareCall<Request, Response>,
  options: CallOptions,
) {
  let token = oidcSessionStore.getSessionToken();
  if (!token || oidcSessionStore.isSessionExpired()) {
    token = await getRefreshToken();
  }

  const metadata = Metadata(options.metadata).set(
    "Authorization",
    `Bearer ${token}`,
  );

  try {
    const response = yield* call.next(call.request, {
      ...options,
      metadata,
    });
    return response;
  } catch (error) {
    // && error.code === Status.UNAUTHENTICATED
    // if (error instanceof ClientError) {
    //   const newToken = await getRefreshToken();
    //   if (newToken) {
    //     const newMetadata = Metadata(options.metadata).set(
    //       "Authorization",
    //       `Bearer ${newToken}`,
    //     );
    //     const response = yield* call.next(call.request, {
    //       ...options,
    //       metadata: newMetadata,
    //     });
    //     return response;
    //   }
    //   oidcSessionStore.removeSession();
    // }

    if (error instanceof ClientError) {
      throw error;
    } else {
      throw error;
    }
  }
}
