import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  FetchRequestor,
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  RedirectRequestHandler,
  TokenRequest,
} from "@deeplay/appauth";

import { oidcSessionStore } from "./oidc-session-store.ts";
import type { OidcClientParams } from "./types.ts";

export class OidcClient {
  private notifier = new AuthorizationNotifier();
  private handler = new RedirectRequestHandler();
  private tokenHandler = new BaseTokenRequestHandler(new FetchRequestor());
  private config: AuthorizationServiceConfiguration | null = null;
  private params: OidcClientParams;

  constructor(params: OidcClientParams) {
    this.params = params;
  }

  async init() {
    this.config = await this.fetchConfig();
    await this.completeLogin();
  }

  async fetchConfig(): Promise<AuthorizationServiceConfiguration> {
    return await AuthorizationServiceConfiguration.fetchFromIssuer(
      this.params.issuerUrl,
      new FetchRequestor(),
    );
  }

  login() {
    if (!this.config) throw new Error("OIDC config not initialized");

    const request = new AuthorizationRequest({
      client_id: this.params.clientId,
      redirect_uri: window.location.origin,
      scope: ["openid", ...this.params.scopes].join(" "),
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: btoa(JSON.stringify({ url: location.href })),
      extras: { response_mode: "fragment" },
    });

    this.handler.performAuthorizationRequest(this.config, request);
  }

  async completeLogin() {
    if (!this.config) throw new Error("OIDC config not initialized");

    let authResult;
    this.notifier.setAuthorizationListener((req, res, err) => {
      if (res) {
        authResult = { request: req, response: res, error: err };
      }
    });

    this.handler.setAuthorizationNotifier(this.notifier);
    await this.handler.completeAuthorizationRequestIfPossible();

    // @ts-ignore
    if (!authResult || !authResult.response?.code) return;

    const tokenResponse = await this.tokenHandler.performTokenRequest(
      this.config,
      new TokenRequest({
        client_id: this.params.clientId,
        redirect_uri: window.location.origin,
        grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
        // @ts-ignore
        code: authResult.response.code,
        // @ts-ignore
        extras: authResult.request.internal,
      }),
    );

    oidcSessionStore.setState({ type: "logged-in", token: tokenResponse });
  }

  async refreshTokens() {
    const state = oidcSessionStore.getState();
    if (!this.config || state?.type !== "logged-in") return null;
    console.log(this.config, "refreshTokens");
    const refreshed = await this.tokenHandler.performTokenRequest(
      this.config,
      new TokenRequest({
        client_id: this.params.clientId,
        redirect_uri: window.location.origin,
        grant_type: GRANT_TYPE_REFRESH_TOKEN,
        refresh_token: state.token.refreshToken,
        extras:
          state.token.scope != null ? { scope: state.token.scope } : undefined,
      }),
    );

    oidcSessionStore.setState({ type: "logged-in", token: refreshed });
    return refreshed.idToken ?? null;
  }

  logout() {
    // oidcSessionStore.clear();
  }
}
