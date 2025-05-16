'use client';

import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import { extractImageUrls } from '@/shared/utils/utils';
import { useRouter } from 'next/navigation';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import style from './Articles.module.scss';
import Burger from '@/shared/ui/burger-menu/Burger';
import { SideBarArticles } from '@/features/side-bar-articles';
import Image from 'next/image';

const Articles: React.FC = () => {
  const { article, normalizedArticles, loading, articlesCategories, getArticlesCategories } =
    articlesStore(state => state);

  const router = useRouter();
  const [processedText, setProcessedText] = useState('');
  const [lsToken, setLsToken] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const { setFooterHidden } = useFooterContext();
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1;

        if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
          setFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop.current || isAtBottom) {
          setFooterHidden(false);
        }

        lastScrollTop.current = currentScrollTop;
      }
    };

    const wrapElement = wrapRef.current;
    if (wrapElement) {
      wrapElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (wrapElement) {
        wrapElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden]);

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      if (!isMounted || !article?.text || !lsToken) {
        return;
      }

      const markdownText = article.text;
      const imageUrls = extractImageUrls(markdownText);

      const newImageCache = { ...imageCache };

      for (const url of imageUrls) {
        if (newImageCache[url]) {
          continue;
        }

        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${lsToken}`,
            },
            responseType: 'blob',
          });
          console.log(`Изображение загружено: ${url}`);
          const objectUrl = URL.createObjectURL(response.data);
          newImageCache[url] = objectUrl;
        } catch (error) {
          console.error(`Ошибка загрузки изображения ${url}:`, error);
        }
      }

      const updatedText = markdownText.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
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
    return () => {
      Object.values(imageCache).forEach(url => URL.revokeObjectURL(url));
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
          <ReactMarkdown
            className={style.mdContent}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <Image
                  src={src || '/Logo_Mini.png'}
                  alt={alt || 'Image'}
                  width={800}
                  height={450}
                  sizes="(max-width: 960px) 100vw, (max-width: 1427px) 80vw, 800px"
                  style={{ width: '100%', height: 'auto' }}
                  priority={false}
                  placeholder="blur"
                  blurDataURL="/Logo_Mini.png"
                  layout="responsive"
                />
              ),
            }}
          >
            {memoizedProcessedText}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
};

export default Articles;
