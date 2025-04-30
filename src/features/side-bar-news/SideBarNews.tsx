'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
}: {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  newsTitles: Titles[];
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({ search_query: '' });
  const { loading, setCurrentNewsState } = dataStore(state => state);

  const mainSections: MainSections = useMemo(
    () => ({
      news: {
        title: 'Новости',
        method: () => {
          setOpen(prev => !prev);
          setCurrentNewsState({ default: true, saved: false, selectedNews: undefined });
        },
      },
      saved: {
        title: 'Сохраненные',
        method: () => {
          setCurrentNewsState({ default: false, saved: true, selectedNews: undefined }),
            setOpen(prev => !prev);
        },
      },
    }),
    [setOpen, setCurrentNewsState],
  );

  const onFinish = (values: FormValues): void => {
    console.log('Received values of form: ', values);
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => {
      return { ...prev, search_query: e.target.value || '' };
    });
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

  return (
    <div className={windowWidth && windowWidth < 960 && open ? style.modalOverlay : ''}>
      <div className={getSidebarClass()}>
        <SideBarNewsContent
          loading={loading}
          formData={formData}
          form={form}
          handleNameInput={handleNameInput}
          onFinish={onFinish}
        />
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
                        });
                        setOpen(prev => !prev);
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
  );
};

export default React.memo(SideBarNews);
