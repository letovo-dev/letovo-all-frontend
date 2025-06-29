'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import bcrypt from 'bcryptjs';
import style from './SideBarArticles.module.scss';
import articlesStore, { ArticleCategory, OneArticle } from '@/shared/stores/articles-store';
import type { MenuProps } from 'antd';
import { Collapse, Dropdown, Input, Button, Space, QRCode } from 'antd';
import { generateKey } from '@/shared/api/utils';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MenuUnfoldOutlined,
  QrcodeOutlined,
  SaveOutlined,
  SignatureOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import ArticleEditInput from './ArticleEditInput';

const BASE_URL = 'https://letovo.ru';
const SECRET_KEY = 'очень-секретный-key';
const saltRounds = 4;

const generateToken = async (key: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(key, saltRounds);
  return hashedPassword;
};

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
    createOrUpdateArticle,
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
  const {
    store: { userData },
  } = userStore(state => state);
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<{
    key: string;
    value?: string;
  } | null>(null);
  const [editingArticle, setEditingArticle] = useState<{
    key: string;
    categoryId: string;
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

  const qrOpen = async () => {
    const token = await generateToken(SECRET_KEY + article?.post_id);
    const qr_url = `${process.env.NEXT_PUBLIC_BASE_URL_CLEAR}/open-article/${article?.post_id}?token=${token}`;
    setQrUrl(qr_url);
    setTimeout(() => {
      setQrUrl(null);
    }, 10000);
  };

  const handleRenameSubmit = (
    articleId: string | null,
    categoryId: string,
    type: 'category' | 'article',
    newValue: string,
    oldName: string = '',
  ) => {
    if (type === 'category') {
      renameArticleCategory(categoryId, newValue, oldName);
      setEditingCategory(null);
    } else {
      renameArticle(categoryId, articleId ?? '0', newValue);
      setEditingArticle(null);
    }
  };

  const getMenuOnClick =
    (
      articleId: string,
      categoryId: string,
      type: 'category' | 'article',
      isSecret: boolean,
    ): MenuProps['onClick'] =>
    e => {
      e.domEvent.stopPropagation();
      if (e.key === 'renameMenuItem' || e.key === 'renameArticle') {
        if (type === 'category') {
          const initialValue = articlesCategories.find(
            cat => cat.category === categoryId,
          )?.category_name;
          setEditingCategory({ key: articleId, value: initialValue || '' });
        } else {
          setEditingArticle({ key: articleId, categoryId });
        }
      } else if (e.key === 'editArticle') {
        handleArticleClick(articleId, categoryId);
        articlesStore.setState({ isEditArticle: true });
        router.push(`/md-editor`);
      } else if (e.key === 'delete') {
        if (type === 'article') {
          deleteArticle(categoryId, articleId);
        } else {
          deleteArticleCategory(categoryId);
        }
      } else if (e.key === 'visibility') {
        if (!normalizedArticles) {
          return;
        }
        const selectedArticle = normalizedArticles[categoryId].find(
          article => article.post_id === articleId,
        );
        if (type === 'article') {
          const articleEdited = { ...selectedArticle, is_secret: isSecret ? 'f' : 't' };
          createOrUpdateArticle(articleEdited, false);
        } else {
          return;
        }
      }
    };

  const menuItems: MenuProps['items'] = [
    {
      key: 'renameMenuItem',
      label: (
        <div className={style.menuItem}>
          <span className={style.menuTitle}>Переименовать</span>
          <SignatureOutlined />
        </div>
      ),
    },
    // { key: 'delete', label: 'Удалить' },
  ];

  const articleItems: MenuProps['items'] = [
    {
      key: 'renameArticle',
      label: (
        <div className={style.menuItem}>
          <span className={style.menuTitle}>Переименовать</span>
          <SignatureOutlined />
        </div>
      ),
    },
    {
      key: 'editArticle',
      label: (
        <div className={style.menuItem}>
          <span className={style.menuTitle}>Редактировать</span>
          <EditOutlined />
        </div>
      ),
    },
    {
      key: 'delete',
      label: (
        <div className={style.menuItem}>
          <span className={style.menuTitle}>Удалить</span>
          <DeleteOutlined />
        </div>
      ),
    },
    {
      key: 'visibility',
      label: 'Статус',
    },
  ];

  const getItems = (menuItems: MenuProps['items'] = [], isSecret: boolean) => {
    return menuItems
      .map(item =>
        item && item.key !== 'visibility'
          ? item
          : item
            ? {
                ...item,
                label: (
                  <div className={style.menuItem}>
                    {isSecret ? <span>Открыть</span> : <span>Скрыть</span>}
                    {isSecret ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </div>
                ),
              }
            : null,
      )
      .filter(Boolean) as MenuProps['items'];
  };

  const genExtra = (
    articleId: string,
    categoryId: string,
    items: MenuProps['items'],
    type: 'category' | 'article',
    isSecret: boolean,
  ) => {
    return (
      <Dropdown
        menu={{
          items,
          onClick: getMenuOnClick(articleId, categoryId, type, isSecret),
        }}
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

  const preparedItems = useMemo(() => {
    if (!articlesCategories?.length || !normalizedArticles) {
      return [];
    }
    return articlesCategories.reduce(
      (
        acc: {
          key: string;
          label: string | React.JSX.Element;
          children: React.JSX.Element;
          extra: React.JSX.Element;
        }[],
        value,
      ) => {
        const isEditingCategory = editingCategory?.key === value.category;
        const item = {
          key: value.category,
          label: (
            <>
              <span>{value.category_name}</span>
              {isEditingCategory && (
                <Space.Compact
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={e => e.stopPropagation()}
                  key={`category-${value.category}`}
                >
                  <Input
                    value={editingCategory?.value || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEditingCategory(prev => ({ ...prev!, value: e.target.value }));
                    }}
                  />
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#fb4724' }}
                    onClick={() =>
                      handleRenameSubmit(
                        null,
                        value.category,
                        'category',
                        editingCategory?.value || '',
                        value.category_name,
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
                const isEditingArticle = editingArticle?.key === articleItem.post_id;
                return (
                  <div
                    className={
                      userData.userrights === 'admin'
                        ? `${style.articleItemContainer}`
                        : `${style.articleItemContainer} ${style.articleItemContainerHide}`
                    }
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

                      <div className={style.menuIcons}>
                        {userrights === 'admin' &&
                          genExtra(
                            articleItem.post_id,
                            value.category,
                            getItems(articleItems, Boolean(articleItem?.is_secret === 't')),
                            'article',
                            Boolean(articleItem?.is_secret === 't'),
                          )}
                        {userrights === 'admin' && (
                          <QrcodeOutlined onClick={qrOpen} className={style.qrIcon} />
                        )}
                      </div>
                    </div>
                    {isEditingArticle && (
                      <ArticleEditInput
                        articleId={articleItem.post_id}
                        categoryId={value.category}
                        initialValue={articleTitle}
                        onSubmit={handleRenameSubmit}
                      />
                    )}
                  </div>
                );
              }) || <p>Нет доступных статей</p>}
            </div>
          ),
          extra:
            userrights === 'admin' ? (
              genExtra(value.category, value.category, menuItems, 'category', false)
            ) : (
              <></>
            ),
        };
        acc.push(item);
        return acc;
      },
      [],
    );
  }, [
    articlesCategories,
    normalizedArticles,
    article?.post_id,
    editingCategory,
    editingArticle?.key,
  ]);

  useEffect(() => {
    setItems(
      preparedItems as {
        key: string;
        label: string | React.JSX.Element;
        children: React.JSX.Element;
        extra: React.JSX.Element;
      }[],
    );
  }, [preparedItems]);

  return (
    <div className={windowWidth && windowWidth < 960 && open ? style.modalOverlay : ''}>
      <div ref={sidebarRef} className={getSidebarClass()}>
        <div className={style.sidebarItemsContainer}>
          <Collapse
            items={items}
            defaultActiveKey={article && [article?.category]}
            ghost
            // onChange={key => console.log('Collapse onChange:', key)}
          />
        </div>
      </div>
      {qrUrl && <QRCode type="svg" value={qrUrl ?? BASE_URL} className={style.qrCode} />}
    </div>
  );
};

export default React.memo(SideBarArticles);
