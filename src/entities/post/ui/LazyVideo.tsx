'use client';

import React, { forwardRef, memo, useState } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  ({ src, poster, preload = 'metadata', ...rest }, ref) => {
    const [metadataLoaded, setMetadataLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#1f1f1f',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {!metadataLoaded && !poster && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(31,31,31,0.96), rgba(58,58,58,0.82))',
              zIndex: 1,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
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

        {hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1f1f1f',
              color: '#fff',
              fontSize: 14,
              zIndex: 1,
            }}
          >
            Видео недоступно
          </div>
        )}

        <video
          ref={ref}
          src={src}
          poster={poster}
          controls
          preload={preload}
          playsInline
          onLoadedData={() => setMetadataLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            background: 'transparent',
            zIndex: 0,
          }}
          {...rest}
        />
      </div>
    );
  },
);

LazyVideo.displayName = 'LazyVideo';
export default memo(LazyVideo);
