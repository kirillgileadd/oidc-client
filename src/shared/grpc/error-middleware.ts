import {
  type CallOptions,
  ClientError,
  type ClientMiddlewareCall,
  Status,
} from "nice-grpc-web";

export class ServerError extends Error {
  code: Status | null;
  originalError?: unknown;
  constructor(
    code: Status | null,
    description: string,
    originalError?: unknown,
  ) {
    super(description);
    this.code = code;
    this.originalError = originalError;
    this.name = "ServerError";
  }
}

export async function* errorMiddleware<Request, Response>(
  call: ClientMiddlewareCall<Request, Response>,
  options: CallOptions,
): AsyncGenerator<Response, void | Response, undefined> {
  try {
    const response = yield* call.next(call.request, options);

    return response;
  } catch (e) {
    if (e instanceof ClientError) {
      throw new ServerError(e.code, e.details || "gRPC client error", e);
    }

    if (e instanceof Error) {
      throw new ServerError(null, e.message, e);
    }

    throw new ServerError(null, "Unknown error", e);
  }
}
