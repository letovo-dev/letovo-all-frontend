'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import ImageLightbox from '@/shared/ui/image-lightbox';
import style from './ArticleContent.module.scss';

const SAFE_PROTOCOLS = /^(https?|mailto|tel):/i;

export const articleSanitizeSchema = {
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

export const isVideoUrl = (url: string): boolean => /\.(mp4|webm|ogg|mkv|avi)(\?.*)?$/i.test(url);

export const isDownloadableFile = (url: string): boolean =>
  /\.(pdf|docx?|xlsx?|zip|rar|txt|md)(\?.*)?$/i.test(url);

interface ArticleContentProps {
  content: string;
  /**
   * Интерактивные обёртки (лайтбокс по клику на картинку). Отключается там, где
   * содержимое статьи редактируется: в WYSIWYG-режиме клик должен ставить курсор,
   * а не открывать просмотрщик.
   */
  interactive?: boolean;
  className?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = React.memo(
  ({ content, interactive = true, className }) => {
    return (
      <ReactMarkdown
        className={className ? `${style.mdContent} ${className}` : style.mdContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, articleSanitizeSchema]]}
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
            if (!src) return null;
            // Article uploads can be dynamic blob URLs, which Next Image cannot size correctly.
            // eslint-disable-next-line @next/next/no-img-element
            const image = <img src={src} alt={alt || 'Изображение статьи'} />;
            return interactive ? (
              <ImageLightbox src={src} alt={alt || 'Изображение статьи'}>
                {image}
              </ImageLightbox>
            ) : (
              image
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
            const isLinkedImage = Boolean(
              props.node?.children?.some(
                child => child.type === 'element' && child.tagName === 'img',
              ),
            );
            if (isLinkedImage) return <>{children}</>;
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
          table: ({ children }) => (
            <div className={style.tableWrapper} tabIndex={0} aria-label="Scrollable table">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) =>
    prevProps.content === nextProps.content &&
    prevProps.interactive === nextProps.interactive &&
    prevProps.className === nextProps.className,
);

ArticleContent.displayName = 'ArticleContent';

export default ArticleContent;
