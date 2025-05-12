'use client';
import React, { useState, useEffect } from 'react';
import { ConfigProvider, Tabs } from 'antd';
import style from './Menu.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
const Menu: React.FC = () => {
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
      disabled: false,
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
    <div className={style.footerContainer}>
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
        <Tabs
          className={style.menu}
          activeKey={activeKey}
          centered
          items={items}
          onTabClick={handleTabClick}
        />
      </ConfigProvider>
    </div>
  );
};

export default Menu;
