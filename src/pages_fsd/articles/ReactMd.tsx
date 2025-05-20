import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import style from './Articles.module.scss';

const MarkdownContent: React.FC<{ content: string }> = React.memo(
  ({ content }) => {
    const isVideoUrl = (url: string): boolean => {
      const result = /\.(mp4|webm|ogg|mkv|avi)(\?.*)?$/i.test(url);
      return result;
    };

    return (
      <ReactMarkdown
        className={style.mdContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => {
            if (src && isVideoUrl(src)) {
              const videoSrc = !src.startsWith('blob:')
                ? `${src}${src.includes('?') ? '&' : '?'}token=${localStorage.getItem('token') || ''}`
                : src;
              return (
                <video
                  controls
                  playsInline
                  muted
                  width="100%"
                  style={{ maxWidth: '800px', height: 'auto' }}
                  src={videoSrc}
                  aria-label={alt || 'Video'}
                  onError={e => console.error('Video error:', { src: videoSrc, error: e })}
                >
                  <source src={videoSrc} type={`video/${src.split('.').pop()?.toLowerCase()}`} />
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              );
            }
            return (
              <Image
                src={src || '/logo_mini_blur.png'}
                alt={alt || 'Image'}
                width={800}
                height={450}
                sizes="(max-width: 960px) 100vw, (max-width: 1427px) 80vw, 800px"
                style={{ width: '100%', height: 'auto' }}
                priority={false}
                placeholder="blur"
                blurDataURL="/logo_mini_blur.png"
                layout="responsive"
              />
            );
          },
          video: ({ src, ...props }) => {
            const videoSrc = !src?.startsWith('blob:')
              ? `${src}${src?.includes('?') ? '&' : '?'}token=${localStorage.getItem('token') || ''}`
              : src;
            return (
              <video
                controls
                playsInline
                muted
                width="100%"
                style={{ maxWidth: '800px', height: 'auto' }}
                src={videoSrc || ''}
                aria-label={props['aria-label'] || 'Video'}
                onError={e => console.error('Video error:', { src: videoSrc, error: e })}
                {...props}
              >
                <source src={videoSrc} type={`video/${src?.split('.').pop()?.toLowerCase()}`} />
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent;
