'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from './SideBarArticles.module.scss';
import articlesStore, { ArticleCategory, OneArticle } from '@/shared/stores/articles-store';
import type { CollapseProps, MenuProps } from 'antd';
import { Collapse, Dropdown, Input, Button, Space } from 'antd';
import { generateKey } from '@/shared/api/utils';
import { MenuUnfoldOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';

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
  const {
    loading,
    article,
    setCurrentArticle,
    getOneArticle,
    renameArticleCategory,
    deleteArticleCategory,
    deleteArticle,
    renameArticle,
  } = articlesStore(state => state);
  const {
    userData: { userrights },
  } = userStore.getState().store;
  const [items, setItems] = useState<
    {
      key: string;
      label: string | React.JSX.Element;
      children: React.JSX.Element;
      extra: React.JSX.Element;
    }[]
  >([]);
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [editingEntity, setEditingEntity] = useState<{
    type: 'category' | 'article';
    key: string;
    value?: string;
  } | null>(null);

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

  const handleRenameSubmit = (
    articleId: string | null,
    categoryId: string,
    type: 'category' | 'article',
    newValue: string,
  ) => {
    // console.log(`Submitted ${type} rename:`, { key, newValue });
    if (type === 'category') {
      renameArticleCategory(categoryId, newValue);
    } else {
      renameArticle(categoryId, (articleId = '0'), newValue);
    }
    setEditingEntity(null);
  };

  const getMenuOnClick =
    (articleId: string, categoryId: string, type: 'category' | 'article'): MenuProps['onClick'] =>
    e => {
      e.domEvent.stopPropagation();
      // console.log(
      //   'Menu item clicked, menu key:',
      //   e.key,
      //   'Type:',
      //   type,
      //   'Article ID:',
      //   articleId,
      //   'Category ID:',
      //   categoryId,
      // );
      if (e.key === 'renameMenuItem' || e.key === 'renameArticle') {
        const initialValue =
          type === 'category'
            ? articlesCategories.find(cat => cat.category === categoryId)?.category_name
            : normalizedArticles?.[categoryId]?.find(art => art.post_id === articleId)?.title;
        setEditingEntity({ type, key: articleId, value: initialValue || '' });
      } else if (e.key === 'editArticle') {
        handleArticleClick(articleId, categoryId);
        articlesStore.setState({ isEditArticle: true });
        router.push(`/md-editor`);
        // console.log(`Edit article: Article ID: ${articleId}, Category ID: ${categoryId}`);
      } else if (e.key === 'delete') {
        console.log(`Delete ${type}: Article ID: ${articleId}, Category ID: ${categoryId}`);
        if (type === 'article') {
          deleteArticle(categoryId, articleId);
        } else {
          deleteArticleCategory(categoryId);
        }
      }
    };

  const menuItems: MenuProps['items'] = [
    { key: 'renameMenuItem', label: 'Переименовать' },
    { key: 'delete', label: 'Удалить' },
  ];

  const articleItems: MenuProps['items'] = [
    { key: 'renameArticle', label: 'Переименовать' },
    { key: 'editArticle', label: 'Редактировать' },
    { key: 'delete', label: 'Удалить' },
  ];

  const genExtra = (
    articleId: string,
    categoryId: string,
    items: MenuProps['items'],
    type: 'category' | 'article',
  ) => {
    return (
      <Dropdown
        menu={{ items, onClick: getMenuOnClick(articleId, categoryId, type) }}
        trigger={['click']}
      >
        <a
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={style.extraIcon}
        >
          <MenuUnfoldOutlined />
        </a>
      </Dropdown>
    );
  };

  useEffect(() => {
    if (!articlesCategories?.length || !normalizedArticles) {
      return;
    }
    const preparedItems: CollapseProps['items'] = articlesCategories?.reduce(
      (
        acc: {
          key: string;
          label: string | React.JSX.Element;
          children: React.JSX.Element;
          extra: React.JSX.Element;
        }[],
        value,
      ) => {
        const isEditingCategory =
          editingEntity?.type === 'category' && editingEntity?.key === value.category;
        const item = {
          key: value.category,
          label: (
            <>
              <span>{value.category_name}</span>
              {isEditingCategory && (
                <Space.Compact
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={e => e.stopPropagation()}
                >
                  <Input
                    defaultValue={editingEntity?.value || value.category_name}
                    onChange={e => setEditingEntity({ ...editingEntity!, value: e.target.value })}
                  />
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#fb4724' }}
                    onClick={() =>
                      handleRenameSubmit(
                        null,
                        value.category,
                        'category',
                        editingEntity?.value || '',
                      )
                    }
                  >
                    <SaveOutlined />
                  </Button>
                </Space.Compact>
              )}
            </>
          ),
          children: (
            <div>
              {normalizedArticles?.[value.category]?.map((articleItem: OneArticle) => {
                const articleTitle = articleItem.title ? articleItem.title : 'Статья без названия';
                const isEditingArticle =
                  editingEntity?.type === 'article' && editingEntity?.key === articleItem.post_id;
                return (
                  <div
                    className={style.articleItemContainer}
                    key={generateKey()}
                    onClick={() => handleArticleClick(articleItem.post_id, value.category)}
                  >
                    <div className={style.articleItem}>
                      <p
                        className={
                          articleItem.post_id === article?.post_id
                            ? style.articleTitleSelected
                            : style.articleTitle
                        }
                      >
                        {articleTitle}
                      </p>
                      {userrights === 'admin' &&
                        genExtra(articleItem.post_id, value.category, articleItems, 'article')}
                    </div>
                    {isEditingArticle && (
                      <Space.Compact
                        style={{ width: '100%', marginTop: '8px' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Input
                          defaultValue={editingEntity?.value || articleTitle}
                          onChange={e =>
                            setEditingEntity({ ...editingEntity!, value: e.target.value })
                          }
                        />
                        <Button
                          type="primary"
                          style={{ backgroundColor: '#fb4724' }}
                          onClick={() =>
                            handleRenameSubmit(
                              value.category,
                              articleItem.post_id,
                              'article',
                              editingEntity?.value || '',
                            )
                          }
                        >
                          <SaveOutlined />
                        </Button>
                      </Space.Compact>
                    )}
                  </div>
                );
              }) || <p>Нет доступных статей</p>}
            </div>
          ),
          extra:
            userrights === 'admin' ? (
              genExtra(value.category, value.category, menuItems, 'category')
            ) : (
              <></>
            ),
        };
        acc.push(item);
        return acc;
      },
      [],
    );
    setItems(
      preparedItems as {
        key: string;
        label: string | React.JSX.Element;
        children: React.JSX.Element;
        extra: React.JSX.Element;
      }[],
    );
  }, [articlesCategories, normalizedArticles, article?.post_id, editingEntity]);

  const onChange = (key: string | string[]) => {
    // console.log(key);
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
