'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import Image from 'next/image';
import style from './Articles.module.scss';

const SAFE_PROTOCOLS = /^(https?|mailto|tel):/i;
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'download', 'className'],
    video: ['src', 'controls', 'playsInline', 'width', 'style', 'aria-label'],
    source: ['src', 'type'],
    img: ['src', 'alt', 'width', 'height', 'style', 'loading', 'decoding'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

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
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
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
                src={src || '/images/logo_mini_blur.webp'}
                alt={alt || 'Image'}
                width={800}
                height={450}
                sizes="(max-width: 960px) 100vw, (max-width: 1427px) 80vw, 800px"
                style={{ width: 'auto', height: 'auto' }}
                priority={false}
                placeholder="blur"
                blurDataURL="/images/logo_mini_blur.webp"
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
            const safeHref = href && SAFE_PROTOCOLS.test(href) ? href : '#';

            return (
              <a
                href={safeHref}
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
