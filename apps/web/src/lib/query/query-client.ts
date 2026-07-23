import { QueryClient, environmentManager } from '@tanstack/react-query';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
    },
  });

let browserQueryClient: QueryClient | null = null;

export const getQueryClient = () => {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  return (browserQueryClient ??= makeQueryClient());
};
