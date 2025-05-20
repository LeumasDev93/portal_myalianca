// useSyncAuth.ts
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const PUBLIC_ROUTES = ['/login', '/signUp', '/recuperar-senha'];

export function useSyncAuth() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAuthenticated && isPublic) {
      router.replace('/backoffice');
    }

    if (!isAuthenticated && !isPublic && pathname !== '/') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);
}
