// 'use client';

// import React, { useEffect, useRef, useState } from 'react';

// interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
//   src: string;
// }

// const LazyVideo: React.FC<LazyVideoProps> = ({ src, ...rest }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       entries => {
//         const [entry] = entries;
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         } else {
//           if (videoRef.current) {
//             videoRef.current.pause();
//             videoRef.current.removeAttribute('src');
//             videoRef.current.load();
//             setIsVisible(false);
//           }
//         }
//       },
//       { threshold: 0.5 },
//     );

//     if (containerRef.current) observer.observe(containerRef.current);

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
//       {isVisible && (
//         <video
//           ref={videoRef}
//           src={src}
//           controls
//           preload="none"
//           style={{ width: '100%', height: '100%' }}
//           {...rest}
//         />
//       )}
//     </div>
//   );
// };

// export default LazyVideo;
'use client';

import React, { useEffect, useRef, useState, forwardRef } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({ src, ...rest }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            setIsVisible(false);
          }
        }
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (ref && typeof ref !== 'function' && videoRef.current) {
      ref.current = videoRef.current;
    }
  }, [ref]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {isVisible && (
        <video
          ref={el => {
            (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
            if (ref) {
              if (typeof ref === 'function') {
                ref(el);
              } else {
                try {
                  ref.current = el;
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }}
          src={src}
          controls
          preload="none"
          style={{ width: '100%', height: '100%' }}
          {...rest}
        />
      )}
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';
export default LazyVideo;
