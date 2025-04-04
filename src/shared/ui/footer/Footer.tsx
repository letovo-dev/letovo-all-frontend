'use client';
import React, { useState, useEffect } from 'react';
import { ConfigProvider, Tabs } from 'antd';
import style from './Footer.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    userData: { username },
  } = userStore.getState().store;

  const [activeKey, setActiveKey] = useState('user');

  useEffect(() => {
    const currentKey = pathname?.split('/')[1] || 'user';
    if (currentKey === 'user') {
      setActiveKey('user');
    }
    setActiveKey(currentKey);
  }, [pathname, username]);

  const items = [
    {
      label: 'База знаний',
      key: 'articles',
      disabled: true,
    },
    {
      label: 'Новости',
      key: 'news',
      disabled: false,
    },
    {
      label: 'Личный кабинет',
      key: 'user',
      disabled: false,
    },
  ];

  const handleTabClick = (key: string) => {
    if (key === 'user') {
      router.push(`/user/${username}`);
    } else {
      router.push('/' + key);
    }
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            itemSelectedColor: '#2d2d2d',
            inkBarColor: '#fb4724',
            itemHoverColor: '#494949',
            itemActiveColor: '#2d2d2d',
          },
        },
      }}
    >
      <div className={style.footerContainer}>
        <Tabs
          className={style.footer}
          activeKey={activeKey}
          centered
          items={items}
          onTabClick={handleTabClick}
        />
      </div>
    </ConfigProvider>
  );
};

export default Footer;
