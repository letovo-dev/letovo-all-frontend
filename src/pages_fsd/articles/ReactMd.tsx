'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import style from './Articles.module.scss';

const MarkdownContent: React.FC<{ content: string }> = React.memo(
  ({ content }) => {
    const isVideoUrl = (url: string): boolean => {
      return /\.(mp4|webm|ogg|mkv|avi)(\?.*)?$/i.test(url);
    };

    const isDownloadableFile = (url: string): boolean => {
      return /\.(pdf|docx?|xlsx?|zip|rar|txt|md)(\?.*)?$/i.test(url);
    };

    return (
      <ReactMarkdown
        className={style.mdContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => {
            if (src && isVideoUrl(src)) {
              const extension = src.split('.').pop()?.toLowerCase();
              return (
                <video
                  controls
                  playsInline
                  width="100%"
                  style={{ maxWidth: '800px', height: 'auto', zIndex: 1 }}
                  src={src}
                  aria-label={alt || 'Video'}
                  onError={e => console.error('Video error:', { src, error: e })}
                >
                  <source src={src} type={`video/${extension}`} />
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
            const extension = src?.split('.').pop()?.toLowerCase();
            return (
              <video
                controls
                playsInline
                width="100%"
                style={{ maxWidth: '800px', height: 'auto', zIndex: 1 }}
                src={src || ''}
                aria-label={props['aria-label'] || 'Video'}
                onError={e => console.error('Video error:', { src, error: e })}
              >
                <source src={src || ''} type={`video/${extension}`} />
                Your browser does not support the video tag.
              </video>
            );
          },
          a: ({ href, children, ...props }) => {
            const isSecretLink =
              typeof children === 'string' && children.toLowerCase().includes('secret link');
            const isDownloadLink = href ? isDownloadableFile(href) : false;

            return (
              <a
                href={href}
                className={
                  isSecretLink ? style.secretLink : isDownloadLink ? style.downloadLink : undefined
                }
                download={isDownloadLink ? true : undefined}
                {...props}
              >
                {children}
              </a>
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
