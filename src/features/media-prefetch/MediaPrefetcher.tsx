'use client';

import { useEffect } from 'react';
import { SERVICES_DATA } from '@/shared/api/data';
import type { TopMediaDownload } from '@/shared/api/data/models/getTopMediaDownloads';

const MAX_PREFETCH_BYTES = 2 * 1024 * 1024;
const MAX_PREFETCH_FILE_BYTES = 300 * 1024;
const MAX_PREFETCH_ITEMS = 20;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function canPrefetch(): boolean {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (!navigator.onLine) {
    return false;
  }
  if (connection?.saveData) {
    return false;
  }
  if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
    return false;
  }
  return true;
}

async function prefetchTopMedia(): Promise<void> {
  if (!canPrefetch()) {
    return;
  }

  const response = await SERVICES_DATA.Data.getTopMediaDownloads(MAX_PREFETCH_ITEMS);
  if (!response.success || response.code !== 200) {
    return;
  }

  const items = ((response.data as { result: TopMediaDownload[] })?.result ?? []).filter(
    item =>
      item.url.startsWith('/media/get/') &&
      item.bytes > 0 &&
      item.bytes <= MAX_PREFETCH_FILE_BYTES &&
      item.content_type.startsWith('image/'),
  );

  let usedBytes = 0;
  for (const item of items) {
    if (usedBytes + item.bytes > MAX_PREFETCH_BYTES) {
      break;
    }
    usedBytes += item.bytes;
    fetch(item.url, {
      method: 'GET',
      cache: 'force-cache',
      priority: 'low',
    } as RequestInit).catch(() => undefined);
  }
}

export function MediaPrefetcher() {
  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    const timeoutHandle = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(
          () => {
            void prefetchTopMedia();
          },
          { timeout: 5000 },
        );
      } else {
        void prefetchTopMedia();
      }
    }, 1500);

    return () => {
      window.clearTimeout(timeoutHandle);
      if (idleHandle !== undefined && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
    };
  }, []);

  return null;
}
