"use client";

import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createContext, useContext, useState } from "react";

const AccesContext = createContext<string>("");

/** Mot de passe d'accès, transmis à chaque fonction Convex. */
export function useAcces() {
  return useContext(AccesContext);
}

export function Providers({ token, children }: { token: string; children: React.ReactNode }) {
  const [{ convex, queryClient }] = useState(() => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexQueryClient = new ConvexQueryClient(convex);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });
    convexQueryClient.connect(queryClient);
    return { convex, queryClient };
  });

  return (
    <AccesContext.Provider value={token}>
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ConvexProvider>
    </AccesContext.Provider>
  );
}
