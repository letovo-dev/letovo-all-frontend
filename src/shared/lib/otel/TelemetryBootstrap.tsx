'use client';

import { useEffect } from 'react';
import { initBrowserTelemetry } from './browser';

export const TelemetryBootstrap = () => {
  useEffect(() => {
    initBrowserTelemetry();
  }, []);

  return null;
};
