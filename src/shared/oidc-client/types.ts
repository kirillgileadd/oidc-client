import { TokenResponse } from "@deeplay/appauth";

export type OidcClientParams = {
  issuerUrl: string;
  clientId: string;
  scopes: string[];
};

export type OidcClientState =
  | { type: "logged-out" }
  | { type: "logged-in"; token: TokenResponse }
  | { type: "interrupted" };

export type HistoryState = {
  url: string;
  title: string;
  state: unknown;
};
