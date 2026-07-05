'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import axiosInstance from '@/shared/lib/ApiSPA/axios/axios';
import { withFrontendSpan } from '@/shared/lib/otel/browser';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const HEARTBEAT_MS = 60_000;
const MIN_EVENT_INTERVAL_MS = 30_000;

type ActivityEvent = 'page_view' | 'focus' | 'heartbeat';

const normalizeRoute = (route: string): string => {
  const withoutQuery = route.split('?')[0].split('#')[0];
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
};

export const sendActivityPing = async (event: ActivityEvent, route: string): Promise<void> => {
  if (!baseUrl || typeof document === 'undefined' || document.hidden) {
    return;
  }

  await withFrontendSpan(
    'analytics.activity_ping',
    {
      'app.activity.event': event,
      'app.route': normalizeRoute(route),
    },
    async () =>
      axiosInstance({
        method: 'POST',
        url: `${baseUrl}/analytics/activity/ping`,
        data: {
          event,
          route: normalizeRoute(route),
        },
        transitional: {
          silentJSONParsing: true,
          forcedJSONParsing: true,
          clarifyTimeoutError: false,
        },
      }),
  ).catch(error => {
    console.error('Activity ping failed:', error);
  });
};

export const useActivityAnalytics = (enabled: boolean): void => {
  const pathname = usePathname();
  const lastSentAtRef = useRef<Record<string, number>>({});

  const sendThrottled = useCallback(
    (event: ActivityEvent): void => {
      if (!enabled || typeof document === 'undefined' || document.hidden) {
        return;
      }

      const key = `${event}:${pathname}`;
      const now = Date.now();
      if (now - (lastSentAtRef.current[key] ?? 0) < MIN_EVENT_INTERVAL_MS) {
        return;
      }
      lastSentAtRef.current[key] = now;
      void sendActivityPing(event, pathname);
    },
    [enabled, pathname],
  );

  useEffect(() => {
    sendThrottled('page_view');
  }, [sendThrottled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const handleFocus = () => sendThrottled('focus');
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendThrottled('focus');
      }
    };
    const heartbeat = window.setInterval(() => {
      sendThrottled('heartbeat');
    }, HEARTBEAT_MS);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, sendThrottled]);
};
