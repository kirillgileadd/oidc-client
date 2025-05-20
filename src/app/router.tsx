import { createBrowserRouter } from "react-router";
import { App } from "./app";
import { UsersPage } from "../modules/users/users-page.tsx";
import { LoginPage } from "../modules/auth/login-page.tsx";
import { OidcClient } from "../shared/oidc-client/oidc-client.ts";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <UsersPage />,
      },
      // {
      //   loader: () => {
      //     return null;
      //   },
      //   // private pages
      //   children: [
      //     {
      //       path: "/users",
      //       element: <UsersPage />,
      //     },
      //   ],
      // },
      {
        loader: () => {
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
  issuerUrl:
    import.meta.env.VITE_ISSUER_URL ?? "https://idp.bouncer.deeplay.io",
  clientId: import.meta.env.VITE_CLIENT_ID ?? "photo-meta-dev",
  scopes: [],
});

await client.init();
