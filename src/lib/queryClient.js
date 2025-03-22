import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 3600 * 1000,
      cacheTime: 48 * 3600 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
}); 