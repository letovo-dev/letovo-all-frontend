'use client';

import React, { useEffect, useRef, useState, forwardRef, memo, useCallback } from 'react';
import { useVideoSessionCache } from '@/shared/stores/media-cash';
import { ConfigProvider, Spin } from 'antd';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({ src, ...rest }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCachedVideo = useVideoSessionCache(state => state.getCachedVideo);
  const setCachedVideo = useVideoSessionCache(state => state.setCachedVideo);

  useEffect(() => {
    if (!ref || !videoRef.current) return;
    if (typeof ref === 'function') ref(videoRef.current);
    else (ref as React.MutableRefObject<HTMLVideoElement | null>).current = videoRef.current;
  }, [ref, objectUrl]);

  const loadVideo = useCallback(async () => {
    if (objectUrlRef.current) return;

    const cachedBlob = getCachedVideo(src);
    if (cachedBlob) {
      const url = URL.createObjectURL(cachedBlob);
      objectUrlRef.current = url;
      setObjectUrl(url);
      return;
    }

    setIsLoading(true);
    abortRef.current = new AbortController();
    try {
      const response = await fetch(src, {
        signal: abortRef.current.signal,
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      setCachedVideo(src, blob);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setObjectUrl(url);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('LazyVideo: failed to load', src, err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [src, getCachedVideo, setCachedVideo]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const notLoaded = !objectUrl && !isLoading;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: objectUrl ? undefined : '4 / 3',
        background: objectUrl ? 'transparent' : 'rgba(0,0,0,0.06)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {notLoaded && (
        <div
          onClick={loadVideo}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              <path d="M2 2L20 13L2 24V2Z" fill="white" />
            </svg>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 1,
          }}
        >
          <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
            <Spin size="large" />
          </ConfigProvider>
        </div>
      )}

      {objectUrl && (
        <video
          ref={videoRef}
          src={objectUrl}
          controls
          autoPlay
          preload="none"
          style={{ width: '100%', height: '100%' }}
          {...rest}
        />
      )}
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';
export default memo(LazyVideo);
