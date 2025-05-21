import { createBrowserRouter, redirect } from "react-router";
import { App } from "./app";
import { UsersPage } from "../modules/users/users-page.tsx";
import { LoginPage } from "../modules/auth/login-page.tsx";
import { OidcClient } from "../shared/oidc-client/oidc-client.ts";
import { oidcSessionStore } from "../shared/oidc-client/oidc-session-store.ts";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <div>home</div>,
      },
      {
        loader: () => {
          if (oidcSessionStore.getState().type === "logged-out") {
            return redirect("/login");
          }

          return null;
        },
        // private pages
        children: [
          {
            path: "/users",
            element: <UsersPage />,
          },
        ],
      },
      {
        loader: () => {
          if (oidcSessionStore.getState().type === "logged-in") {
            return redirect("/users");
          }
          return null;
        },
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
]);

export const client = new OidcClient({
  issuerUrl: import.meta.env.VITE_ISSUER_URL,
  clientId: import.meta.env.VITE_CLIENT_ID,
  scopes: [],
});

await client.init();

oidcSessionStore.oidcState.listen((oidcState) => {
  if (!oidcState || oidcState?.type === "logged-out") {
    router.navigate("/login");
  }
});
