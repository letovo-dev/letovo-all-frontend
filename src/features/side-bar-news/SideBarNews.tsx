import React, { useState } from 'react';
import style from './SideBarNews.module.scss';
import { Button, ConfigProvider, Form, Spin } from 'antd';
import dataStore, { News } from '@/shared/stores/data-store';
import { SearchOutlined } from '@ant-design/icons';
import Image from 'next/image';
import SideBarNewsContent from './SideBarNewsContent';

const SideBarNews = ({
  open,
  setOpen,
  subjects,
  saved,
}: {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  subjects: string[];
  saved: News[];
}) => {
  interface Section {
    title: string;
    method: () => void;
  }

  interface MainSections {
    [key: string]: Section;
  }

  const mainSections: MainSections = {
    news: { title: 'Новости', method: () => setOpen((prev: boolean) => !prev) },
    saved: { title: 'Сохраненные', method: () => {} },
  };

  const [form] = Form.useForm();
  const [formData, setFormData] = useState({ search_query: '' });
  const { loading, error } = dataStore(state => state);
  interface FormValues {
    search_query: string;
  }

  const onFinish = (values: FormValues): void => {
    console.log('Received values of form: ', values);
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => {
      return { ...prev, search_query: e.target.value || '' };
    });
  };

  if (!open) {
    return null;
  }

  return (
    open && (
      <div className={style.modalOverlay}>
        <div className={style.sidebarContainer}>
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
                {subjects.map((subject, index) => {
                  return (
                    <div key={index} className={style.sidebarItemNews}>
                      <span>{subject}</span>
                    </div>
                  );
                })}
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
    )
  );
};

export default SideBarNews;
