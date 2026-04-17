import {
  QueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'

import { toast } from "sonner";
import { ApiError } from './api-client';


function handleGlobalError(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401) { window.location.href = "/login"; return; }
  if (error.status === 403) { toast.error("Permission refusée"); return; }
  if (error.status >= 500) { toast.error("Erreur serveur"); }
}


export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleGlobalError(error);
    }
  }),

  defaultOptions: {
    queries: {
      retry: (count, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return count < 2;
      },
      staleTime: 60 * 1000,
    }
  }

})
