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

const Articles: React.FC = () => {
  const { article, normalizedArticles, loading, articlesCategories } = articlesStore(
    state => state,
  );

  const router = useRouter();
  const [processedText, setProcessedText] = useState('');
  const [lsToken, setLsToken] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const { setFooterHidden } = useFooterContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setLsToken(token);

      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1;

        if (currentScrollTop > lastScrollTop.current) {
          if (currentScrollTop > 50) {
            setFooterHidden(true);
          }
        } else if (currentScrollTop < lastScrollTop.current && !isAtBottom) {
          setFooterHidden(false);
        }

        lastScrollTop.current = currentScrollTop;
      }
    };
    const wrapElement = wrapRef.current;
    if (wrapElement) {
      wrapElement.addEventListener('scroll', handleScroll);
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
        console.log('Skipping fetchImages: missing article.text or lsToken');
        return;
      }

      const markdownText = article.text;
      const imageUrls = extractImageUrls(markdownText);

      console.log('Image URLs:', imageUrls);
      console.log('Current imageCache:', imageCache);

      const newImageCache = { ...imageCache };

      for (const url of imageUrls) {
        if (newImageCache[url]) {
          console.log(`Using cached URL for ${url}: ${newImageCache[url]}`);
          continue;
        }

        try {
          console.log(`Fetching image: ${url}`);
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${lsToken}`,
            },
            responseType: 'blob',
          });

          const objectUrl = URL.createObjectURL(response.data);
          newImageCache[url] = objectUrl;
          console.log(`Cached new URL for ${url}: ${objectUrl}`);
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
      console.log('Component unmounted, cleaning up imageCache');
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
      <SideBarArticles
        open={open}
        setOpen={setOpen}
        normalizedArticles={normalizedArticles}
        articlesCategories={articlesCategories}
      />
      <div ref={wrapRef} className={`${style.newsContainer}`}>
        <div className={style.containerWrapper}>
          <Burger setOpen={setOpen} />
        </div>
        <div className={style.wrap}>
          <ReactMarkdown
            className={style.mdContent}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />
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
