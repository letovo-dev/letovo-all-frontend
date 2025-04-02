import React, { useState } from 'react';
import style from './SideBarNews.module.scss';
import { Button, ConfigProvider, Form, Spin } from 'antd';
import dataStore, { News } from '@/shared/stores/data-store';
import { SearchOutlined } from '@ant-design/icons';
import Image from 'next/image';

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
          <Form name="form" onFinish={onFinish} form={form}>
            {loading && (
              <div className={style.spinWrapper}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#FB4724',
                    },
                  }}
                >
                  <Spin size={'large'} />
                </ConfigProvider>
              </div>
            )}
            <div className={style.inputForm}>
              <Form.Item name="search_query" initialValue={formData.search_query}>
                <input
                  type="text"
                  className={style.customInput}
                  placeholder="Введите текст для поиска"
                  autoComplete="text"
                  onChange={handleNameInput}
                  value={formData.search_query || ''}
                />
              </Form.Item>
              <Form.Item className={style.searchButtonItem}>
                <Button htmlType="submit" disabled={false} type="link">
                  <SearchOutlined style={{ fontSize: 18, color: ' rgba(0, 0, 0, 0.5)' }} />
                </Button>
              </Form.Item>
            </div>
          </Form>
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
