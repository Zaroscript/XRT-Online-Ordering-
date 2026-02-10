import type { AppProps } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';
import 'quill/dist/quill.snow.css';
import '@/assets/css/main.css';
import { UIProvider } from '@/contexts/ui.context';
import { SettingsProvider } from '@/contexts/settings.context';
import ErrorMessage from '@/components/ui/error-message';
import PageLoader from '@/components/ui/page-loader/page-loader';
import AppLoader from '@/components/ui/app-loader/app-loader';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';
import { useSettingsQuery } from '@/data/settings';
import dynamic from 'next/dynamic';

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools')
      .then((d) => ({
        default: d.ReactQueryDevtools,
      }))
      .catch(() => ({
        // If devtools fail to load, render nothing
        default: () => null,
      })),
  { ssr: false, loading: () => null },
);
import { appWithTranslation } from 'next-i18next';
import { ModalProvider } from '@/components/ui/modal/modal.context';
import DefaultSeo from '@/components/ui/default-seo';
import ManagedModal from '@/components/ui/modal/managed-modal';
import { CartProvider } from '@/contexts/quick-cart/cart.context';
import { AppLoadingProvider } from '@/contexts/app-loading.context';
import { useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import { useRouter } from 'next/router';
import PrivateRoute from '@/utils/private-route';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { getAuthCredentials } from '@/utils/auth-utils';

const Noop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

/**
 * Defers auth/settings-dependent UI until after mount so server and client
 * initial render match (avoids hydration error from token/cookies differing).
 */
const AppSettings: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { pathname, locale } = useRouter();
  const [mounted, setMounted] = useState(false);
  const { token } = getAuthCredentials();
  const { settings, loading, error } = useSettingsQuery({
    language: locale!,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage =
    pathname === Routes.login ||
    pathname === Routes.register ||
    pathname === Routes.forgotPassword ||
    pathname === Routes.resetPassword ||
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/reset-password');

  // Before mount: render same as server (no token-dependent branching) to avoid hydration mismatch
  if (!mounted) {
    // @ts-ignore
    return <SettingsProvider initialValue={null} {...props} />;
  }

  if (isAuthPage) {
    // @ts-ignore
    return <SettingsProvider initialValue={null} {...props} />;
  }

  if (!token) {
    // @ts-ignore
    return <SettingsProvider initialValue={null} {...props} />;
  }

  if (loading) return <PageLoader />;
  if (error) {
    const errorStatus = (error as any)?.response?.status;
    if (errorStatus !== 400 && errorStatus !== 401) {
      return <ErrorMessage message={error.message} />;
    }
  }

  // @ts-ignore
  return <SettingsProvider initialValue={settings?.options ?? null} {...props} />;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
const CustomApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const Layout = (Component as any).Layout || Noop;
  const authProps = (Component as any).authenticate;
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (
                error?.response?.status === 404 ||
                error?.response?.status === 401 ||
                error?.response?.status === 403
              ) {
                return false;
              }
              if (failureCount > 2) return false;
              return true;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const getLayout = Component.getLayout ?? ((page) => page);

  const router = useRouter();
  const { locale } = router;
  const dir = Config.getDirection(locale);
  return (
    <div dir={dir}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps?.dehydratedState}>
          <AppSettings>
            <UIProvider>
              <ModalProvider>
                <AppLoadingProvider>
                  <>
                    <AppLoader />
                    <CartProvider>
                      <DefaultSeo />
                      {authProps ? (
                        <PrivateRoute authProps={authProps}>
                          <Layout {...pageProps}>
                            <Component {...pageProps} key={router.asPath} />
                          </Layout>
                        </PrivateRoute>
                      ) : (
                        <Layout {...pageProps}>
                          <Component {...pageProps} key={router.asPath} />
                        </Layout>
                      )}
                      <ToastContainer autoClose={2000} theme="colored" />
                      <ManagedModal />
                    </CartProvider>
                  </>
                </AppLoadingProvider>
              </ModalProvider>
            </UIProvider>
          </AppSettings>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </HydrationBoundary>
      </QueryClientProvider>
    </div>
  );
};

export default appWithTranslation(CustomApp);
