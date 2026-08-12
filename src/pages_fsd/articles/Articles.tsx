'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import style from './Articles.module.scss';
import { SideBarArticles } from '@/features/side-bar-articles';
import { ArticleContent } from '@/shared/ui/article-content';
import authStore from '@/shared/stores/auth-store';
import UserBlock26 from '@/pages/user-page/ui/UserBlock26';

const Articles: React.FC = () => {
  const {
    article,
    articleLoading,
    normalizedArticles,
    loading,
    articlesCategories,
    getArticlesCategories,
  } = articlesStore();
  const router = useRouter();
  const { scrollContainerRef } = useFooterContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const isDesktop = windowWidth >= 961;
  const userStatus = authStore(state => state.userStatus);

  useEffect(() => {
    if (!userStatus.logged || !userStatus.authed) {
      router.push('/login');
    } else {
      getArticlesCategories();
    }
  }, [router, getArticlesCategories, userStatus.logged, userStatus.authed]);

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

  if (loading && articlesCategories.length === 0) {
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
          {articleLoading && article && (
            <div className={style.articleLoading} role="status" aria-live="polite">
              <h1>{article.title || 'Статья без названия'}</h1>
              <span>Загружаем статью…</span>
            </div>
          )}
          <ArticleContent content={article?.text ?? ''} />
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
