'use client';

import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { extractImageUrls } from '@/shared/utils/utils';
import { useRouter } from 'next/navigation';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import style from './Articles.module.scss';
import Burger from '@/shared/ui/burger-menu/Burger';
import { SideBarArticles } from '@/features/side-bar-articles';
import debounce from 'lodash/debounce';
import MarkdownContent from './ReactMd';

const Articles: React.FC = () => {
  const { article, normalizedArticles, loading, articlesCategories, getArticlesCategories } =
    articlesStore(state => state);

  const router = useRouter();
  const [processedText, setProcessedText] = useState('');
  const [lsToken, setLsToken] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const { setFooterHidden } = useFooterContext();
  const [open, setOpen] = useState(false);
  const imageCacheRef = useRef<Record<string, string>>({});
  const lastScrollTopRef = useRef(0);

  const isVideoUrl = (url: string): boolean => {
    const result = /\.(mp4|webm|ogg|mkv|avi)(\?.*)?$/i.test(url);
    return result;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setLsToken(token);

      if (!token) {
        router.push('/login');
      } else {
        getArticlesCategories();
      }
    }
  }, [router, getArticlesCategories]);
  //вариант футер скрывается - ререндер страницы
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (wrapRef.current) {
  //       const currentScrollTop = wrapRef.current.scrollTop;
  //       const lastScrollTop = lastScrollTopRef.current;
  //       //Показывать футер при скролле вверх
  //       // if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
  //       //   // Scrolling down and past threshold
  //       //   setFooterHidden(true);
  //       // } else if (currentScrollTop < lastScrollTop) {
  //       //   // Scrolling up
  //       //   setFooterHidden(false);
  //       // }

  //       if (currentScrollTop > 50) {
  //         setFooterHidden(true);
  //       } else {
  //         setFooterHidden(false);
  //       }

  //       lastScrollTopRef.current = currentScrollTop;
  //     }
  //   };

  //   let cleanup = () => {};
  //   const attachListener = () => {
  //     const element = wrapRef.current;
  //     if (element) {
  //       element.addEventListener('scroll', handleScroll, { passive: true });
  //       return () => {
  //         element.removeEventListener('scroll', handleScroll);
  //       };
  //     }
  //     return () => {};
  //   };

  //   cleanup = attachListener();
  //   const interval = setInterval(() => {
  //     if (wrapRef.current && !wrapRef.current.onscroll) {
  //       cleanup();
  //       cleanup = attachListener();
  //     }
  //   }, 1000);

  //   return () => {
  //     cleanup();
  //     clearInterval(interval);
  //   };
  // }, [setFooterHidden]);
  const handleScroll = useCallback(
    debounce(() => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        if (currentScrollTop > 50) {
          setFooterHidden(true);
        } else {
          setFooterHidden(false);
        }
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

    const fetchImages = async () => {
      if (!isMounted || !article?.text || !lsToken) {
        return;
      }

      const markdownText = article.text;
      const imageUrls = extractImageUrls(markdownText).filter(url => !isVideoUrl(url));
      const newImageCache = { ...imageCacheRef.current };

      for (const url of imageUrls) {
        if (newImageCache[url]) {
          continue;
        }

        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${lsToken}` },
            responseType: 'blob',
          });
          const objectUrl = URL.createObjectURL(response.data);
          newImageCache[url] = objectUrl;
        } catch (error) {
          console.error(`Ошибка загрузки изображения ${url}:`, error);
        }
      }

      imageCacheRef.current = newImageCache;

      const updatedText = markdownText.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
        if (isVideoUrl(url)) {
          return match;
        }
        const localUrl = newImageCache[url];
        return localUrl ? match.replace(url, localUrl) : match;
      });

      if (isMounted) {
        setImageCache(newImageCache);
        setProcessedText(updatedText);
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [article?.text, lsToken]);

  useEffect(() => {
    const checkVideo = async () => {
      if (!article?.text || !lsToken) return;

      const videoUrls = extractImageUrls(article.text).filter(isVideoUrl);
      for (const url of videoUrls) {
        try {
          const response = await axios.head(
            `${url}${url.includes('?') ? '&' : '?'}token=${lsToken}`,
            {
              headers: { Authorization: `Bearer ${lsToken}` },
            },
          );
        } catch (error) {
          console.error('Video check failed:', { url, error });
        }
      }
    };

    checkVideo();
  }, [article?.text, lsToken]);

  useEffect(() => {
    return () => {
      Object.values(imageCache).forEach(url => URL.revokeObjectURL(url));
      imageCacheRef.current = {};
      setImageCache({});
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
