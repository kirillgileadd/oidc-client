import { TokenResponse } from "@deeplay/appauth";
import { useSyncExternalStore } from "react";
import { Atom } from "../lib/atom.ts";
import { decodeJWT } from "../lib/jwt.ts";

export type OidcClientState =
  | { type: "logged-out" }
  | { type: "logged-in"; token: TokenResponse };

type Session = {
  name?: string;
  upn?: string;
  type: "logged-out" | "logged-in";
};

export const STATE_KEY = "oidc-client";

class OidcSessionStore {
  private storageKey = STATE_KEY;
  oidcState: Atom<OidcClientState> = new Atom<OidcClientState>({
    type: "logged-out",
  });

  constructor() {
    this.loadState();
  }

  private loadState() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.oidcState.set({
          type: parsed.type,
          ...(parsed.token ? { token: new TokenResponse(parsed.token) } : {}),
        });
      } catch {
        this.oidcState.set({
          type: "logged-out",
        });
      }
    }
  }

  getState = (): OidcClientState => {
    return this.oidcState.get();
  };

  getSessionToken = (): string | null => {
    const oidcState = this.getState();

    if (oidcState?.type === "logged-in") {
      return oidcState.token.idToken ?? null;
    }

    return null;
  };

  setState = (state: OidcClientState) => {
    this.oidcState.set(state);
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        type: state.type,
        token: state.type === "logged-in" ? state.token.toJson() : undefined,
      }),
    );
  };

  removeSession = () => {
    this.setState({ type: "logged-out" });
    localStorage.removeItem(this.storageKey);
  };

  isSessionExpired() {
    const state = this.getState();
    return (
      !state ||
      state.type === "logged-out" ||
      (state.type === "logged-in" && !state.token.isValid(0))
    );
  }

  useSession = (): Session => {
    const state = useSyncExternalStore<OidcClientState>(
      this.oidcState.listen,
      this.getState,
      () => ({
        type: "logged-out",
      }),
    );

    return {
      type: state.type,
      ...(state.type === "logged-in" && state.token.idToken
        ? decodeJWT(state.token.idToken)
        : {}),
    };
  };
}

export const oidcSessionStore = new OidcSessionStore();
