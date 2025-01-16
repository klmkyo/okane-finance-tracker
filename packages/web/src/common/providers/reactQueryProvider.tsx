"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { notification } from "antd";
import { useTranslations } from "next-intl";
import { ApiError } from "next/dist/server/api-utils";
import { useCallback, useRef } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useIsClient } from "usehooks-ts";

type NotNullableRef<T> = {
  readonly current: T;
};

interface MakeQueryClientProps {
  toastErrorRef: NotNullableRef<ReturnType<typeof useErrorToast>>;
}

const makeQueryClient = ({
  toastErrorRef,
}: MakeQueryClientProps): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            toastErrorRef.current();
            return;
          }
          toastErrorRef.current({ message: error.message });
        },
      },
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = ({
  toastErrorRef,
}: MakeQueryClientProps): QueryClient => {
  if (isServer) {
    return makeQueryClient({
      toastErrorRef,
    });
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient({
      toastErrorRef,
    });
  }

  return browserQueryClient;
};

const useErrorToast = () => {
  const t = useTranslations("Common");
  return useCallback(
    ({ message }: { message?: string } = {}) => {
      notification.error({
        message: t("errorOccurred"),
        description: message || t("retry"),
      });
    },
    [t]
  );
};

export const ReactQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toastError = useErrorToast();

  const toastErrorRef = useRef(toastError);

  toastErrorRef.current = toastError;

  const queryClient = getQueryClient({
    toastErrorRef,
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
};
