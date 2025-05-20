import { TokenResponse } from "@deeplay/appauth";
import { useSyncExternalStore } from "react";

export type OidcClientState =
  | { type: "logged-out" }
  | { type: "logged-in"; token: TokenResponse }
  | { type: "interrupted" };

export const STATE_KEY = "oidc-client";

class OidcSessionStore {
  private storageKey = STATE_KEY;
  private state: OidcClientState | null = null;
  private listeners = new Set<(state: OidcClientState | null) => void>();

  constructor() {
    this.loadState();
  }

  private loadState() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.state = {
          type: parsed.type,
          ...(parsed.token ? { token: new TokenResponse(parsed.token) } : {}),
        };
      } catch {
        this.state = null;
      }
    }
  }

  private saveState() {
    if (!this.state) {
      localStorage.removeItem(this.storageKey);
      return;
    }
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        type: this.state.type,
        token:
          this.state.type === "logged-in"
            ? this.state.token.toJson()
            : undefined,
      }),
    );
  }

  getState = (): OidcClientState | null => {
    return this.state;
  };

  getSessionToken = (): string | null => {
    if (this.state?.type === "logged-in") {
      return this.state.token.idToken ?? null;
    }

    return null;
  };

  setState = (state: OidcClientState | null) => {
    this.state = state;
    this.saveState();
    this.emit(state);
  };

  removeSession = () => {
    this.setState({ type: "logged-out" });
    localStorage.removeItem(this.storageKey);
  };

  isSessionExpired() {
    console.log(123);
    const state = this.getState();
    console.log(state);
    return (
      !state ||
      state.type === "logged-out" ||
      (state.type === "logged-in" && !state.token.isValid(0))
    );
  }

  subscribe = (listener: (state: OidcClientState | null) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  useSession = () => {
    const state = useSyncExternalStore(this.subscribe, this.getState, () => ({
      type: "logged-out",
    }));

    return state;
  };

  private emit(state: OidcClientState | null) {
    this.listeners.forEach((l) => l(state));
  }
}

export const oidcSessionStore = new OidcSessionStore();
