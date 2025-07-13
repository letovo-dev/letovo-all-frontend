'use client';

import { useVideoCacheStore } from '@/shared/stores/media-cash';
import React, { useEffect, useRef, useState, forwardRef, memo, useCallback } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({ src, ...rest }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isLoaded = useVideoCacheStore(state => state.loadedVideos.includes(src));
  const markAsLoaded = useVideoCacheStore(state => state.markAsLoaded);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);

      if (!entry.isIntersecting && videoRef.current && !isLoaded) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.3,
    });

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [handleObserver]);

  useEffect(() => {
    if (ref && videoRef.current) {
      if (typeof ref === 'function') ref(videoRef.current);
      else (ref as React.MutableRefObject<HTMLVideoElement | null>).current = videoRef.current;
    }
  }, [ref]);

  const handleLoadedData = () => {
    markAsLoaded(src);
  };

  const shouldLoad = isLoaded || isVisible;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        controls
        preload="none"
        onLoadedData={handleLoadedData}
        style={{ width: '100%', height: '100%' }}
        {...rest}
      />
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';
export default memo(LazyVideo);
