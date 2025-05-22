import {
  AppAuthError,
  AuthorizationNotifier,
  AuthorizationRequest,
  type AuthorizationRequestResponse,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  EndSessionRequest,
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
  private redirectHandler = new RedirectRequestHandler();
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

  async fetchConfig(): Promise<AuthorizationServiceConfiguration | null> {
    try {
      return await AuthorizationServiceConfiguration.fetchFromIssuer(
        this.params.issuerUrl,
        new FetchRequestor(),
      );
    } catch (error) {
      console.error(error);
      if (error instanceof AppAuthError) {
        throw error;
      }
    }
    return null;
  }

  login() {
    if (!this.config) throw new Error("OIDC config not initialized");

    try {
      const request = new AuthorizationRequest({
        client_id: this.params.clientId,
        redirect_uri: window.location.origin,
        scope: ["openid", ...this.params.scopes].join(" "),
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        state: btoa(JSON.stringify({ url: location.href })),
        extras: { response_mode: "fragment" },
      });
      this.redirectHandler.performAuthorizationRequest(this.config, request);
    } catch (error) {
      console.error(error);
      if (error instanceof AppAuthError) {
        throw error;
      }
    }
  }

  async completeLogin() {
    if (!this.config) throw new Error("OIDC config not initialized");

    let authResult: AuthorizationRequestResponse | undefined;

    this.notifier.setAuthorizationListener((req, res, err) => {
      if (res) {
        authResult = { request: req, response: res, error: err };
      }
    });

    this.redirectHandler.setAuthorizationNotifier(this.notifier);
    await this.redirectHandler.completeAuthorizationRequestIfPossible();

    if (authResult?.error != null) {
      throw authResult.error;
    }

    if (!authResult || !authResult.response) return;

    if (!authResult.response.state) return;

    window.history.replaceState(null, document.title, window.location.origin);

    const request = authResult.request as AuthorizationRequest;
    const response = authResult.response as AuthorizationResponse;

    try {
      const tokenResponse = await this.tokenHandler.performTokenRequest(
        this.config,
        new TokenRequest({
          client_id: this.params.clientId,
          redirect_uri: window.location.origin,
          grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
          code: response.code,
          extras: request.internal,
        }),
      );
      oidcSessionStore.setState({ type: "logged-in", token: tokenResponse });
      console.log("Login complete");
    } catch (error) {
      console.log("Couldn't get tokens");
      if (error instanceof AppAuthError) {
        throw error;
      }
    }
  }

  async refreshTokens() {
    const state = oidcSessionStore.getState();

    if (!this.config || state?.type !== "logged-in") return null;

    try {
      const refreshed = await this.tokenHandler.performTokenRequest(
        this.config,
        new TokenRequest({
          client_id: this.params.clientId,
          redirect_uri: window.location.origin,
          grant_type: GRANT_TYPE_REFRESH_TOKEN,
          refresh_token: state.token.refreshToken,
          extras:
            state.token.scope != null
              ? { scope: state.token.scope }
              : undefined,
        }),
      );

      oidcSessionStore.setState({ type: "logged-in", token: refreshed });

      console.log("Refreshed token");

      return refreshed.idToken ?? null;
    } catch (error) {
      if (error instanceof AppAuthError) {
        console.error(error);
        console.log("Failed to refresh token");
        throw error;
      }
      oidcSessionStore.removeSession();
    }

    return null;
  }

  logout() {
    const oidcState = oidcSessionStore.getState();

    if (!this.config) {
      console.log("OidcClient config is not loaded");
      return;
    }

    if (oidcState?.type === "logged-in") {
      const requestEnd = new EndSessionRequest({
        id_token_hint: oidcState?.token.idToken as string,
        post_logout_redirect_uri: window.location.origin + "/login",
        state: undefined,
      });
      this.redirectHandler.performEndSessionRequest(this.config, requestEnd);
      oidcSessionStore.removeSession();
    }
  }
}
