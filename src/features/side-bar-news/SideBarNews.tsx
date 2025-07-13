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
  open,
  setOpen,
  newsTitles,
  burgerRef,
}: {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  newsTitles: Titles[];
  burgerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [form] = Form.useForm();
  const { loading, setCurrentNewsState, fetchNews, createNews, currentNewsState } = dataStore(
    state => state,
  );
  const { searchedNews, savedNews, normalizedNews } = dataStore(state => state.data);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { userrights } = userStore((state: IUserStore) => state.store.userData);
  const [visible, setVisible] = useState(false);
  const [post, setPost] = useState<any | null>(null);
  const { allPostsAuthors } = userStore((state: IUserStore) => state.store);
  const [newsDataStructure, setNewsDataStructure] = useState<
    { author: IUserData; data: [string, any][] }[]
  >([]);

  useEffect(() => {
    setNewsDataStructure(
      allPostsAuthors?.reduce<{ author: IUserData; data: [string, any][] }[]>((acc, author) => {
        const authorNews =
          normalizedNews &&
          Object.entries(normalizedNews).filter(arr => arr[1].news.author === author.username);
        if (authorNews?.length) {
          acc.push({ author, data: authorNews });
        }
        return acc;
      }, []),
    );
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

  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
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

  return (
    <div className={windowWidth && windowWidth < 960 && open ? style.modalOverlay : ''}>
      {contextHolder}
      <div ref={sidebarRef} className={getSidebarClass()}>
        <SideBarNewsContent loading={loading} form={form} onFinish={onFinish} />
        {permittedUsers.includes(userrights) && (
          <div className={style.addArticle}>
            <span>Добавить пост</span>
            <PlusOutlined className={style.addArticleIcon} onClick={() => handleOpen()} />
          </div>
        )}
        {currentNewsState.searched && !searchedNews && (
          <div className={style.noSearchResult}>По запросу ничего не найдено</div>
        )}
        <div className={style.sidebarItemsContainer}>
          {Object.keys(mainSections).map((section, index) => {
            const sectionKey = `${section}-${index}`;
            return section === 'news' ? (
              <div
                key={sectionKey}
                className={style.sidebarItem}
                onClick={mainSections[section].method}
              >
                <span>{mainSections[section].title}</span>
                <div className={style.sidebarItemNewsContainer}>
                  {newsDataStructure.map((news, idx) => (
                    <React.Fragment key={news.author.username + idx}>
                      <div
                        key={news.author.username}
                        className={style.author}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          setCurrentNewsState({
                            default: false,
                            saved: false,
                            selectedNews: false,
                            searched: false,
                            selectedAuthor: {
                              state: true,
                              author: news.author.username,
                              news: news.data,
                            },
                          });
                          setOpen(prev => !prev);
                          form.resetFields();
                        }}
                      >
                        {news.author.username}
                      </div>
                      {news.data.map((item, itemIdx) =>
                        item[1].news.title !== '' ? (
                          <div
                            key={item[0]}
                            className={style.sidebarItemNews}
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
            ) : (
              <div
                key={sectionKey}
                className={style.sidebarItemSaved}
                onClick={mainSections[section].method}
              >
                <Image src="/images/Icon_Favorites.webp" alt="saved" width={24} height={26} />
                <span>{mainSections[section].title}</span>
              </div>
            );
          })}
        </div>
      </div>
      {userrights === 'admin' && (
        <PostModal
          visible={visible}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          post={post}
          authors={authors}
        />
      )}
    </div>
  );
};

export default React.memo(SideBarNews);
