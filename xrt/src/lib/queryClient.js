import { QueryClient } from "@tanstack/react-query";

/**
 * React Query client with defaults suitable for the custom server.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const status = error?.response?.status;
          if (status === 404 || status === 401 || status === 403) return false;
          if (failureCount > 2) return false;
          return true;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}
