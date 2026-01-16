'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackingService } from '@/services';

// Only track main navigation pages
const TRACKED_PAGES = [
  '/dashboard',
  '/dashboard/upload',
  '/dashboard/content',
  '/dashboard/wallet',
  '/dashboard/leaderboard',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/subscription',
  '/dashboard/referral',
  '/dashboard/badges',
  '/dashboard/admin',
];

export function usePageTracking() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track main navigation pages
    if (pathname && pathname !== lastTrackedPath.current && TRACKED_PAGES.includes(pathname)) {
      lastTrackedPath.current = pathname;
      trackingService.recordPageView(pathname);
    }
  }, [pathname]);
}
