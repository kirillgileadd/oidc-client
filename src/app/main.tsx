import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import { GrpcClientsProvider } from "../shared/grpc/grpc-client-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <GrpcClientsProvider>
        <RouterProvider router={router} />
      </GrpcClientsProvider>
    </QueryClientProvider>
  </StrictMode>,
);
