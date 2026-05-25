'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AutoAuthModal() {
  const { showAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (showAuthModal && pathname !== '/login') {
      router.replace('/login');
    }
  }, [showAuthModal, pathname, router]);

  return null;
}
