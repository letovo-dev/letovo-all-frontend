'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import { extractImageUrls } from '@/shared/utils/utils';
import style from './Articles.module.scss';
import { SideBarArticles } from '@/features/side-bar-articles';
import MarkdownContent from './ReactMd';
import authStore from '@/shared/stores/auth-store';
import UserBlock26 from '@/pages/user-page/ui/UserBlock26';

const Articles: React.FC = () => {
  const { article, normalizedArticles, loading, articlesCategories, getArticlesCategories } =
    articlesStore();
  const router = useRouter();
  const { scrollContainerRef } = useFooterContext();
  const [processedText, setProcessedText] = useState('');
  const [mediaCache, setMediaCache] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);
  const mediaCacheRef = useRef<Record<string, string>>({});
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const isDesktop = windowWidth >= 961;
  const {
    userStatus: { token },
  } = authStore(state => state);

  const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mkv|avi)(\?.*)?$/i.test(url);
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      getArticlesCategories();
    }
  }, [router, getArticlesCategories, token]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollContainerRef.current = isDesktop ? innerWrapRef.current : wrapRef.current;
    return () => {
      scrollContainerRef.current = null;
    };
  }, [scrollContainerRef, isDesktop]);

  useEffect(() => {
    let isMounted = true;
    const cancelTokenSource = axios.CancelToken.source();

    const fetchMedia = async () => {
      if (!isMounted || !article?.text || !token) {
        return;
      }

      const markdownText = article.text;
      const mediaUrls = extractImageUrls(markdownText);
      const newMediaCache = { ...mediaCacheRef.current };

      const fetchPromises = mediaUrls.map(async url => {
        if (newMediaCache[url]) {
          return;
        }
        try {
          const response = await axios.get(url, {
            headers: { Bearer: `${token}` },
            responseType: 'blob',
            cancelToken: cancelTokenSource.token,
          });
          const mimeType =
            response.headers['content-type'] ||
            (isVideoUrl(url) ? `video/${url.split('.').pop()?.toLowerCase()}` : 'image/jpeg');
          const objectUrl = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
          newMediaCache[url] = objectUrl;
        } catch (error) {
          if (axios.isCancel(error)) {
            console.warn(`Запрос отменён для ${url}`);
          } else {
            console.error(`Ошибка загрузки медиа ${url}:`, error);
            setError(`Не удалось загрузить медиа: ${url}`);
          }
        }
      });

      await Promise.allSettled(fetchPromises);

      if (isMounted) {
        const updatedText = markdownText.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
          const localUrl = newMediaCache[url];
          if (!localUrl) {
            console.warn(`Локальный URL не найден для ${url}`);
            return match;
          }
          if (isVideoUrl(url)) {
            const extension = url.split('.').pop()?.toLowerCase();
            return `<video controls playsinline src="${localUrl}" type="video/${extension}" style="max-width: 100%; height: auto; z-index: 1;"></video>`;
          }
          return match.replace(url, localUrl);
        });

        mediaCacheRef.current = newMediaCache;
        setMediaCache(newMediaCache);
        setProcessedText(updatedText);
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
      cancelTokenSource.cancel('Компонент размонтирован или статья изменена');
    };
  }, [article?.text, token]);

  useEffect(() => {
    return () => {
      Object.values(mediaCacheRef.current).forEach(url => URL.revokeObjectURL(url));
      mediaCacheRef.current = {};
      setMediaCache({});
    };
  }, []);

  const memoizedProcessedText = useMemo(() => processedText, [processedText]);

  if (loading) {
    return <SpinModule />;
  }

  return (
    <>
      {!isDesktop && (
        <SideBarArticles
          normalizedArticles={normalizedArticles}
          articlesCategories={articlesCategories}
        />
      )}
      <div ref={wrapRef} className={style.newsContainer}>
        <div className={style.desktopLeftPanel}>
          <UserBlock26 />
          {isDesktop && (
            <SideBarArticles
              desktop
              normalizedArticles={normalizedArticles}
              articlesCategories={articlesCategories}
            />
          )}
        </div>
        <div ref={innerWrapRef} className={style.wrap}>
          <MarkdownContent content={memoizedProcessedText} />
        </div>
        <div className={style.desktopRightPanel}>
          <Image
            className={style.corpLogo}
            src="/26_corp_logo.svg"
            alt=""
            width={120}
            height={102}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );
};

export default Articles;
