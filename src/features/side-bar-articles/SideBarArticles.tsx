'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from './SideBarArticles.module.scss';
import articlesStore, { ArticleCategory, OneArticle } from '@/shared/stores/articles-store';
import type { CollapseProps } from 'antd';
import { Collapse } from 'antd';
import { generateKey } from '@/shared/api/utils';

const SideBarArticles = ({
  open,
  setOpen,
  normalizedArticles,
  articlesCategories,
  burgerRef,
}: {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  normalizedArticles: Record<string, OneArticle[]> | null;
  articlesCategories: ArticleCategory[];
  burgerRef: React.RefObject<HTMLDivElement>;
}) => {
  const { loading, article, setCurrentArticle, getOneArticle } = articlesStore(state => state);
  const [items, setItems] = useState<{ key: string; label: string; children: React.JSX.Element }[]>(
    [],
  );
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        (!burgerRef.current || !burgerRef.current.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen, burgerRef]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSidebarClass = () => {
    if (!open) return style.sidebarContainerDesktop;
    if (windowWidth && windowWidth < 960) return style.sidebarContainer;
    if (windowWidth && windowWidth < 1427) return style.sidebarContainerTablet;
    return style.sidebarContainerDesktop;
  };

  const handleArticleClick = (articleId: string, categoryId: string) => {
    const article = getOneArticle(articleId, categoryId);
    setCurrentArticle(article);
    setOpen(false);
  };

  useEffect(() => {
    if (!articlesCategories?.length || !normalizedArticles) {
      return;
    }
    const preparedItems: CollapseProps['items'] = articlesCategories?.reduce(
      (acc: { key: string; label: string; children: React.JSX.Element }[], value) => {
        const { title } =
          normalizedArticles?.[value.category]?.find(
            (articleItem: OneArticle) => articleItem.post_id === value.category,
          ) || {};

        const item = {
          key: value.category,
          label: value.category_name,
          children: (
            <div>
              {normalizedArticles?.[value.category]?.map((articleItem: OneArticle) => {
                const articleTitle = articleItem.title ? articleItem.title : 'Статья без названия';
                return (
                  <p
                    className={
                      articleItem.post_id === article?.post_id
                        ? style.articleTitleSelected
                        : style.articleTitle
                    }
                    key={generateKey()}
                    onClick={() => handleArticleClick(articleItem.post_id, value.category)}
                  >
                    {articleTitle}
                  </p>
                );
              }) || <p>No articles available</p>}
            </div>
          ),
        };
        acc.push(item);
        return acc;
      },
      [],
    );
    setItems(preparedItems as { key: string; label: string; children: React.JSX.Element }[]);
  }, [articlesCategories, normalizedArticles, article?.post_id]);

  const onChange = (key: string | string[]) => {
    console.log(key);
  };

  return (
    <div className={windowWidth && windowWidth < 960 && open ? style.modalOverlay : ''}>
      <div ref={sidebarRef} className={getSidebarClass()}>
        <div className={style.sidebarItemsContainer}>
          <Collapse
            items={items}
            defaultActiveKey={article && [article?.category]}
            ghost
            onChange={onChange}
            expandIconPosition={'end'}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(SideBarArticles);
