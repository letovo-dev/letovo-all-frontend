'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import style from './SideBarNews.module.scss';
import { Form } from 'antd';
import dataStore, { Titles } from '@/shared/stores/data-store';
import Image from 'next/image';
import SideBarNewsContent from './SideBarNewsContent';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import userStore, { IUserData, IUserStore } from '@/shared/stores/user-store';
import PostModal from '../post-modal/ui';

interface FormValues {
  search_query: string;
}

interface Section {
  title: string;
  method: () => void;
}

interface MainSections {
  [key: string]: Section;
}

const SideBarNews = ({
  newsTitles,
  burgerRef,
}: // desktop,
{
  open?: boolean;
  setOpen?: (value: boolean | ((prev: boolean) => boolean)) => void;
  newsTitles: Titles[];
  burgerRef: React.RefObject<HTMLDivElement>;
  // desktop: boolean;
}) => {
  const [form] = Form.useForm();
  const { loading, setCurrentNewsState, fetchNews, createNews, currentNewsState } = dataStore(
    state => state,
  );
  const { searchedNews, savedNews, normalizedNews } = dataStore(state => state.data);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const newsListRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const { userrights } = userStore((state: IUserStore) => state.store.userData);
  const [visible, setVisible] = useState(false);
  const [post, setPost] = useState<any | null>(null);
  const { allPostsAuthors } = userStore((state: IUserStore) => state.store);
  const [newsDataStructure, setNewsDataStructure] = useState<
    { author: IUserData; data: [string, any][] }[]
  >([]);
  const [open, setOpen] = useState<boolean>(false);
  const [scrollbar, setScrollbar] = useState<{
    top: number;
    height: number;
    thumbY: number;
    active: boolean;
  }>({ top: 0, height: 0, thumbY: 0, active: false });

  useEffect(() => {
    if (!normalizedNews) {
      setNewsDataStructure([]);
      return;
    }

    const buckets = new Map<string, [string, any][]>();
    for (const entry of Object.entries(normalizedNews)) {
      const name = (entry[1]?.news?.author ?? '').trim();
      if (!name) continue;
      if (!buckets.has(name)) buckets.set(name, []);
      buckets.get(name)!.push(entry);
    }

    const norm = (s: unknown) => (typeof s === 'string' ? s.trim().toLowerCase() : '');
    const next = Array.from(buckets.entries()).map(([name, data]) => {
      const known = allPostsAuthors?.find(a => norm(a.username) === norm(name));
      return {
        author: known ?? ({ username: name, avatar_pic: '' } as IUserData),
        data,
      };
    });

    setNewsDataStructure(next);
  }, [allPostsAuthors, normalizedNews]);

  const savedNewsLength = useMemo(() => {
    return Object.keys(savedNews).length;
  }, [savedNews]);

  const [messageApi, contextHolder] = message.useMessage();

  const info = () => {
    messageApi.open({
      type: 'warning',
      content: 'У вас нет сохраненных новостей',
    });
  };

  const mainSections: MainSections = useMemo(
    () => ({
      news: {
        title: 'Новости',
        method: () => {
          setOpen(prev => !prev);
          setCurrentNewsState({
            default: true,
            saved: false,
            selectedNews: undefined,
            searched: false,
            selectedAuthor: false,
          });
          form.resetFields();
        },
      },
      saved: {
        title: 'Сохраненные',
        method: () => {
          if (savedNewsLength === 0) {
            info();
          } else {
            setCurrentNewsState({
              default: false,
              saved: true,
              selectedNews: undefined,
              searched: false,
              selectedAuthor: false,
            });
            setOpen(prev => !prev);
            form.resetFields();
          }
        },
      },
    }),
    [setOpen, setCurrentNewsState, form, savedNewsLength],
  );

  const onFinish = async (values: FormValues): Promise<void> => {
    await fetchNews({ type: 'searchNews', searchQuery: values.search_query });
    setCurrentNewsState({
      default: false,
      saved: false,
      selectedNews: undefined,
      searched: true,
      selectedAuthor: false,
    });
    if (searchedNews && Object.keys(searchedNews).length > 0) {
      setOpen(prev => !prev);
      form.resetFields();
    }
  };

  // const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
  // useEffect(() => {
  //   setWindowWidth(window.innerWidth);
  //   const handleResize = () => setWindowWidth(window.innerWidth);
  //   window.addEventListener('resize', handleResize);
  //
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  const getSidebarClass = () => {
    // if (desktop) return style.sidebarContainerDesktop;
    // if (windowWidth && windowWidth < 960 && open) return style.sidebarContainer;
    // if (windowWidth && windowWidth < 960 && !open)
    //   return `${style.sidebarContainer} ${style.hidden}`;
    // if (windowWidth && windowWidth < 1427) return style.sidebarContainerTablet;
    // return style.sidebarContainerDesktop;
    return open ? style.sidebarContainer : `${style.sidebarContainer} ${style.hidden}`;
  };

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

  const THUMB_SIZE = 22;

  useEffect(() => {
    const list = newsListRef.current;
    const sidebar = sidebarRef.current;
    if (!list || !sidebar) return;

    const update = () => {
      const listRect = list.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const top = listRect.top - sidebarRect.top - 20;
      const computedMaxHeight = parseFloat(window.getComputedStyle(list).maxHeight) - 70;
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
  }, [newsDataStructure, open, currentNewsState]);

  const startThumbDrag = (clientY: number) => {
    const list = newsListRef.current;
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

  const authors = useMemo(() => {
    return allPostsAuthors?.map((author: IUserData) => {
      return { id: author.username, name: author.username };
    });
  }, [allPostsAuthors]);

  const handleOpen = (editPost?: any) => {
    setPost(editPost || null);
    setVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      createNews(values);
      setVisible(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setPost(null);
  };

  const permittedUsers = ['admin', 'moder'];

  const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'BUTTON') {
      setOpen(prev => !prev);
    }
  };

  return (
    <>
      {contextHolder}
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

          {currentNewsState.searched && !searchedNews && (
            <div className={style.noSearchResult}>По запросу ничего не найдено</div>
          )}

          <div className={style.decorLineContainer}></div>
          <div className={style.sidebarItemsContainer}>
            {Object.keys(mainSections).map((section, index) => {
              const sectionKey = `${section}-${index}`;
              return section === 'news' ? (
                <div
                  key={sectionKey}
                  className={`${style.sidebarItemSaved} ${
                    currentNewsState.saved ? style.active : ''
                  }`}
                  onClick={() => {
                    mainSections.saved.method();
                    setOpen(prev => !prev);
                  }}
                >
                  <Image src="/26_saved.svg" alt="saved" width={30} height={18} />
                  <span>Сохраненное</span>
                </div>
              ) : (
                <div
                  key={sectionKey}
                  className={style.sidebarItem}
                  onClick={mainSections[section].method}
                >
                  <div className={style.sidebarItemSavedContainer}>
                    <div
                      className={`${style.newsTitle} ${
                        currentNewsState.default ? style.active : ''
                      }`}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        setCurrentNewsState({
                          default: true,
                          saved: false,
                          selectedNews: undefined,
                          searched: false,
                          selectedAuthor: false,
                        });
                        form.resetFields();
                      }}
                    >
                      <Image src="/26_news_icon.svg" alt="i" width={30} height={18} />
                      <span>Новости</span>
                    </div>
                    {permittedUsers.includes(userrights) && (
                      <PlusOutlined className={style.addArticleIcon} onClick={() => handleOpen()} />
                    )}
                  </div>

                  <div
                    className={`${style.newsListMaskWrapper} ${
                      scrollbar.active ? style.newsListMaskWrapperFaded : ''
                    }`}
                  >
                    <div ref={newsListRef} className={style.sidebarItemNewsContainer}>
                      {newsDataStructure.map((news, idx) => (
                        <React.Fragment key={news.author.username + idx}>
                          {news.data.map(item =>
                            item[1].news.title !== '' ? (
                              <div
                                key={item[0]}
                                className={`${style.sidebarItemNews} ${
                                  currentNewsState.selectedNews === item[1].news.post_id
                                    ? style.active
                                    : ''
                                }`}
                                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                  e.stopPropagation();
                                  setCurrentNewsState({
                                    default: false,
                                    saved: false,
                                    selectedNews: item[1].news.post_id,
                                    searched: false,
                                    selectedAuthor: false,
                                  });
                                  setOpen(prev => !prev);
                                  form.resetFields();
                                }}
                              >
                                <span>{item[1].news.title}</span>
                              </div>
                            ) : null,
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {(userrights === 'admin' || userrights === 'moder') && (
        <PostModal
          visible={visible}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          post={post}
          authors={authors}
        />
      )}
    </>
  );
};

export default React.memo(SideBarNews);
