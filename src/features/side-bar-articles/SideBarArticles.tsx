'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import bcrypt from 'bcryptjs';
import style from './SideBarArticles.module.scss';
import articlesStore, { ArticleCategory, OneArticle } from '@/shared/stores/articles-store';
import type { MenuProps } from 'antd';
import { Form, Collapse, Dropdown, Input, Button, Space, QRCode } from 'antd';
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
import Image from 'next/image';
import SideBarNewsContent from '@/features/side-bar-news/SideBarNewsContent';

const BASE_URL = 'https://letovo.ru';
const SECRET_KEY = 'очень-секретный-key';
const saltRounds = 4;

const generateToken = async (key: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(key, saltRounds);
  return hashedPassword;
};

interface FormValues {
  search_query: string;
}

interface CollapseItem {
  key: string;
  label: string | React.JSX.Element;
  children: React.JSX.Element;
  extra: React.JSX.Element;
}

const SideBarArticles = ({
  normalizedArticles,
  articlesCategories,
  burgerRef,
}: // desktop,
{
  normalizedArticles: Record<string, OneArticle[]> | null;
  articlesCategories: ArticleCategory[];
  burgerRef?: React.RefObject<HTMLDivElement>;
  // desktop?: boolean;
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
  const {
    store: { userData },
  } = userStore(state => state);
  const router = useRouter();

  const [form] = Form.useForm();
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scrollbar, setScrollbar] = useState<{
    top: number;
    height: number;
    thumbY: number;
    active: boolean;
  }>({ top: 0, height: 0, thumbY: 0, active: false });
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<{
    key: string;
    value?: string;
  } | null>(null);
  const [editingArticle, setEditingArticle] = useState<{
    key: string;
    categoryId: string;
  } | null>(null);

  const [items, setItems] = useState<CollapseItem[]>([]);

  const filteredNormalizedArticles = useMemo(() => {
    if (!normalizedArticles) return null;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedArticles;
    const result: Record<string, OneArticle[]> = {};
    for (const [cat, list] of Object.entries(normalizedArticles)) {
      const matched = list.filter(a => (a.title || '').toLowerCase().includes(q));
      if (matched.length) result[cat] = matched;
    }
    return result;
  }, [searchQuery, normalizedArticles]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return articlesCategories;
    if (!filteredNormalizedArticles) return [];
    return articlesCategories.filter(
      c => (filteredNormalizedArticles[c.category] ?? []).length > 0,
    );
  }, [searchQuery, articlesCategories, filteredNormalizedArticles]);

  const onFinish = async (values: FormValues): Promise<void> => {
    setSearchQuery((values.search_query || '').trim());
  };

  // useEffect(() => {
  //   setWindowWidth(window.innerWidth);
  //   const handleResize = () => setWindowWidth(window.innerWidth);
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        (!burgerRef?.current || !burgerRef.current.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, burgerRef]);

  const getSidebarClass = () => {
    // if (desktop) return style.sidebarContainerDesktop;
    // if (windowWidth && windowWidth < 960 && open) return style.sidebarContainer;
    // if (windowWidth && windowWidth < 960 && !open)
    //   return `${style.sidebarContainer} ${style.hidden}`;
    // if (windowWidth && windowWidth < 1427) return style.sidebarContainerTablet;
    // return style.sidebarContainerDesktop;
    return open ? style.sidebarContainer : `${style.sidebarContainer} ${style.hidden}`;
  };

  const THUMB_SIZE = 22;

  useEffect(() => {
    const list = listRef.current;
    const sidebar = sidebarRef.current;
    if (!list || !sidebar) return;

    const update = () => {
      const listRect = list.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const top = listRect.top - sidebarRect.top - 20;
      const computedMaxHeight = parseFloat(window.getComputedStyle(list).maxHeight);
      const fullHeight = Number.isFinite(computedMaxHeight)
        ? computedMaxHeight
        : window.innerHeight * 0.6;
      const height = fullHeight;
      const maxScroll = list.scrollHeight - list.clientHeight;
      const isActive = maxScroll > 1 && listRect.height > THUMB_SIZE;
      const maxThumbY = Math.max(0, height - THUMB_SIZE);
      const ratio = maxScroll > 0 ? list.scrollTop / maxScroll : 0;
      const thumbY = ratio * maxThumbY;
      setScrollbar({ top, height, thumbY, active: isActive });
    };

    update();
    list.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(list);
    ro.observe(sidebar);
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [items, open]);

  const startThumbDrag = (clientY: number) => {
    const list = listRef.current;
    const thumb = thumbRef.current;
    if (!list || !thumb) return;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const maxThumbY = Math.max(0, scrollbar.height - THUMB_SIZE);
    if (maxScroll <= 0 || maxThumbY <= 0) return;

    const startY = clientY;
    const startThumbY = scrollbar.thumbY;
    const onMove = (y: number) => {
      const nextThumbY = Math.max(0, Math.min(maxThumbY, startThumbY + (y - startY)));
      list.scrollTop = (nextThumbY / maxThumbY) * maxScroll;
    };
    const onMouseMove = (ev: MouseEvent) => onMove(ev.clientY);
    const onTouchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientY);
    const cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', cleanup);
  };

  const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName !== 'INPUT' &&
      target.tagName !== 'SELECT' &&
      target.tagName !== 'BUTTON' &&
      target.tagName !== 'A'
    ) {
      setOpen(prev => !prev);
    }
  };

  const handleArticleClick = (articleId: string, categoryId: string) => {
    const a = getOneArticle(articleId, categoryId);
    setCurrentArticle(a);
    setOpen(false);
  };

  const qrOpen = async () => {
    const token = await generateToken(SECRET_KEY + article?.post_id);
    const qr_url = `${process.env.NEXT_PUBLIC_BASE_URL_CLEAR}/open-article/${article?.post_id}?token=${token}`;
    setQrUrl(qr_url);
    setTimeout(() => setQrUrl(null), 10000);
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
        if (!normalizedArticles) return;
        const selected = normalizedArticles[categoryId].find(a => a.post_id === articleId);
        if (type === 'article') {
          const articleEdited = { ...selected, is_secret: isSecret ? 'f' : 't' };
          createOrUpdateArticle(articleEdited as OneArticle, false);
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

  const getItems = (input: MenuProps['items'] = [], isSecret: boolean) => {
    return input
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
    menuList: MenuProps['items'],
    type: 'category' | 'article',
    isSecret: boolean,
  ) => (
    <Dropdown
      menu={{
        items: menuList,
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

  const preparedItems = useMemo<CollapseItem[]>(() => {
    const cats = filteredCategories;
    const articles = filteredNormalizedArticles;
    if (!cats?.length || !articles) return [];
    return cats.reduce<CollapseItem[]>((acc, value) => {
      const isEditingCategory = editingCategory?.key === value.category;
      const item: CollapseItem = {
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
            {articles[value.category]?.map((articleItem: OneArticle) => {
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
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    handleArticleClick(articleItem.post_id, value.category);
                  }}
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
    }, []);
  }, [
    filteredCategories,
    filteredNormalizedArticles,
    article?.post_id,
    editingCategory,
    editingArticle?.key,
    userData.userrights,
    userrights,
  ]);

  useEffect(() => {
    setItems(preparedItems);
  }, [preparedItems]);

  return (
    <>
      <div ref={sidebarRef} className={getSidebarClass()} onClick={handleSidebarClick}>
        <div className={style.openStatusContainer}>
          <div className={style.orangeLine} />
          <div className={style.statusActionText}>
            <p className={style.statusText}>{open ? 'закрыть раздел' : 'открыть раздел'}</p>
            <Image
              src={open ? '/26_orange_arrow_r.svg' : '/26_orange_arrow_l.svg'}
              alt="→"
              width={10}
              height={10}
            />
          </div>
        </div>
        <div
          className={`${style.scrollContainer} ${
            !scrollbar.active ? style.scrollContainerInactive : ''
          }`}
          style={{
            top: scrollbar.top,
            height: scrollbar.height,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className={style.scrollTrack} />
          <div
            ref={thumbRef}
            className={style.scrollThumb}
            style={{ transform: `translateY(${scrollbar.thumbY}px)` }}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              startThumbDrag(e.clientY);
            }}
            onTouchStart={e => {
              e.stopPropagation();
              startThumbDrag(e.touches[0].clientY);
            }}
          >
            <div className={style.scrollThumbDot} />
          </div>
        </div>
        <div className={style.content}>
          <div className={style.searchInput}>
            <SideBarNewsContent loading={loading} form={form} onFinish={onFinish} />
          </div>
          {searchQuery && filteredCategories.length === 0 && (
            <div className={style.noSearchResult}>По запросу ничего не найдено</div>
          )}
          <a className={style.welcomeLink} href="/articles/welcome">
            Welcome page
          </a>
          <div className={style.sidebarItemsContainer} onClick={e => e.stopPropagation()}>
            <div
              className={`${style.newsListMaskWrapper} ${
                scrollbar.active ? style.newsListMaskWrapperFaded : ''
              }`}
            >
              <div ref={listRef} className={style.sidebarItemNewsContainer}>
                <Collapse items={items} defaultActiveKey={article && [article?.category]} ghost />
              </div>
            </div>
          </div>
        </div>
      </div>
      {qrUrl && <QRCode type="svg" value={qrUrl ?? BASE_URL} className={style.qrCode} />}
    </>
  );
};

export default React.memo(SideBarArticles);
