'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import style from './SideBarNews.module.scss';
import { Form } from 'antd';
import dataStore, { Titles } from '@/shared/stores/data-store';
import Image from 'next/image';
import SideBarNewsContent from './SideBarNewsContent';

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
  const { loading, setCurrentNewsState, fetchNews, currentNewsState } = dataStore(state => state);
  const { searchedNews } = dataStore(state => state.data);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
          });
          form.resetFields();
        },
      },
      saved: {
        title: 'Сохраненные',
        method: () => {
          setCurrentNewsState({
            default: false,
            saved: true,
            selectedNews: undefined,
            searched: false,
          });
          setOpen(prev => !prev);
          form.resetFields();
        },
      },
    }),
    [setOpen, setCurrentNewsState, form],
  );

  const onFinish = async (values: FormValues): Promise<void> => {
    await fetchNews({ type: 'searchNews', searchQuery: values.search_query });
    setCurrentNewsState({
      default: false,
      saved: false,
      selectedNews: undefined,
      searched: true,
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

  return (
    <div className={windowWidth && windowWidth < 960 && open ? style.modalOverlay : ''}>
      <div ref={sidebarRef} className={getSidebarClass()}>
        <SideBarNewsContent loading={loading} form={form} onFinish={onFinish} />
        {currentNewsState.searched && !searchedNews && (
          <div className={style.noSearchResult}>По запросу ничего не найдено</div>
        )}
        <div className={style.sidebarItemsContainer}>
          {Object.keys(mainSections).map((section, index) => {
            return section === 'news' ? (
              <div key={index} className={style.sidebarItem} onClick={mainSections[section].method}>
                <span>{mainSections[section].title}</span>
                <div className={style.sidebarItemNewsContainer}>
                  {newsTitles.map((item, index) => {
                    return item.title !== '' ? (
                      <div
                        key={item.post_id}
                        className={style.sidebarItemNews}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          setCurrentNewsState({
                            default: false,
                            saved: false,
                            selectedNews: item.post_id,
                            searched: false,
                          });
                          setOpen(prev => !prev);
                          form.resetFields();
                        }}
                      >
                        <span>{item.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <div
                key={index}
                className={style.sidebarItemSaved}
                onClick={mainSections[section].method}
              >
                <Image src="/Icon_Favorites.png" alt="saved" width={24} height={26} />
                <span>{mainSections[section].title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SideBarNews);
