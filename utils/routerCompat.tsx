'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, ...props }, ref) => {
  return <NextLink ref={ref} href={to || '/'} {...props} />;
});
Link.displayName = 'Link';

export const NavLink = React.forwardRef<HTMLAnchorElement, any>(({ to, activeClassName, ...props }, ref) => {
  return <NextLink ref={ref} href={to || '/'} {...props} />;
});
NavLink.displayName = 'NavLink';

export function useNavigate() {
  const router = useRouter();
  return React.useCallback((to: string | number, options?: any) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
    } else {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return {
    pathname: pathname || '/',
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null as any,
  };
}

export function useParams<T extends Record<string, string | string[]> = any>(): T {
  return (useNextParams() || {}) as T;
}

export const Routes = ({ children }: any) => <>{children}</>;
export const Route = () => null;

export const Navigate = ({ to }: any) => {
  const router = useRouter();
  React.useEffect(() => {
    router.replace(to);
  }, [to, router]);
  return null;
};
export const OutletContext = React.createContext<React.ReactNode>(null);

export function Outlet() {
  return React.useContext(OutletContext);
}

export function matchPath(pattern: any, pathname: string) {
  const path = typeof pattern === 'string' ? pattern : pattern.path;
  if (path === pathname) return { params: {} };
  return null;
}
