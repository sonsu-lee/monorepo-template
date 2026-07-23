'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getQueryClient } from '@/lib/query/query-client';

// oxlint-disable-next-line eslint/func-style -- React components are function declarations.
export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
