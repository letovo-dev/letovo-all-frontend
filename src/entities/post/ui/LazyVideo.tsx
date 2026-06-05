'use client';

import React, { useEffect, useRef, useState, forwardRef, memo, useCallback } from 'react';
import { useVideoSessionCache } from '@/shared/stores/media-cash';
import authStore from '@/shared/stores/auth-store';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({ src, ...rest }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getCachedVideo = useVideoSessionCache(state => state.getCachedVideo);
  const setCachedVideo = useVideoSessionCache(state => state.setCachedVideo);
  const token = authStore(state => state.userStatus.token);

  useEffect(() => {
    if (!ref || !videoRef.current) return;
    if (typeof ref === 'function') ref(videoRef.current);
    else (ref as React.MutableRefObject<HTMLVideoElement | null>).current = videoRef.current;
  }, [ref]);

  const loadVideo = useCallback(async () => {
    if (objectUrlRef.current) return;

    const cachedBlob = getCachedVideo(src);
    if (cachedBlob) {
      const url = URL.createObjectURL(cachedBlob);
      objectUrlRef.current = url;
      setObjectUrl(url);
      return;
    }

    abortRef.current = new AbortController();
    try {
      const response = await fetch(src, {
        signal: abortRef.current.signal,
        headers: token ? { Bearer: token } : {},
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
    }
  }, [src, token, getCachedVideo, setCachedVideo]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      loadVideo();
    } else if (videoRef.current && objectUrlRef.current) {
      videoRef.current.pause();
    }
  }, [isVisible, loadVideo]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={objectUrl ?? undefined}
        controls
        preload="none"
        style={{ width: '100%', height: '100%' }}
        {...rest}
      />
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';
export default memo(LazyVideo);
