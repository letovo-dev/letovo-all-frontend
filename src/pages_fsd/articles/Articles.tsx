'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import { extractImageUrls } from '@/shared/utils/utils';
import debounce from 'lodash/debounce';
import style from './Articles.module.scss';
import Burger from '@/shared/ui/burger-menu/Burger';
import { SideBarArticles } from '@/features/side-bar-articles';
import MarkdownContent from './ReactMd';
import authStore from '@/shared/stores/auth-store';

const Articles: React.FC = () => {
  const { article, normalizedArticles, loading, articlesCategories, getArticlesCategories } =
    articlesStore();
  const router = useRouter();
  const { setFooterHidden } = useFooterContext();
  const [processedText, setProcessedText] = useState('');
  const [lsToken, setLsToken] = useState<string | undefined>(undefined);
  const [mediaCache, setMediaCache] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const mediaCacheRef = useRef<Record<string, string>>({});
  const lastScrollTopRef = useRef(0);
  const [open, setOpen] = useState(false);
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

  const handleScroll = useCallback(
    debounce(() => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        setFooterHidden(currentScrollTop > 50);
        lastScrollTopRef.current = currentScrollTop;
      }
    }, 50),
    [setFooterHidden],
  );

  useEffect(() => {
    const element = wrapRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    let isMounted = true;
    const cancelTokenSource = axios.CancelToken.source();

    const fetchMedia = async () => {
      if (!isMounted || !article?.text || !lsToken) {
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
            headers: { Bearer: `${lsToken}` },
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
  }, [article?.text, lsToken]);

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
      <div
        className={`${style.burgerArticlesContainer} ${open ? style.sidebarOpenBurgerContainer : ''}`}
        ref={burgerRef}
      >
        <Burger setOpen={setOpen} />
      </div>
      <SideBarArticles
        open={open}
        setOpen={setOpen}
        normalizedArticles={normalizedArticles}
        articlesCategories={articlesCategories}
        burgerRef={burgerRef}
      />
      <div ref={wrapRef} className={`${style.newsContainer} ${open ? style.sidebarOpen : ''}`}>
        <div className={style.wrap}>
          <MarkdownContent content={memoizedProcessedText} />
        </div>
      </div>
    </>
  );
};

export default Articles;
