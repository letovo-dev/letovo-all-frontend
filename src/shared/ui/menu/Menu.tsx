'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Tabs } from 'antd';
import style from './Menu.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import articlesStore from '@/shared/stores/articles-store';

interface MenuItem {
  label: string;
  key: string;
  disabled: boolean;
  destroyOnHidden?: boolean;
}

const items: MenuItem[] = [
  { label: 'База знаний', key: 'articles', disabled: false },
  { label: 'Новости', key: 'news', disabled: false },
  { label: 'Редактор статей', key: 'md-editor', disabled: false, destroyOnHidden: true },
  { label: 'Личный кабинет', key: 'user', disabled: false },
];

const ALLOWED_ROLES = ['admin', 'moder'];

const getFilteredItems = (
  items: MenuItem[],
  isFooter: boolean | undefined,
  userrights: string | undefined,
): MenuItem[] => {
  if (isFooter || !ALLOWED_ROLES.includes(userrights || '')) {
    return items.filter(item => item.key !== 'md-editor');
  }
  return items;
};

const Menu = ({ isFooter }: { isFooter?: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    userData: { username },
  } = userStore.getState().store;
  const { userData } = userStore.getState().store;

  const [activeKey, setActiveKey] = useState('user');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const currentKey = pathname?.split('/')[1] || 'user';
    if (currentKey === 'user') {
      setActiveKey('user');
    }
    setActiveKey(currentKey);
  }, [pathname, username]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const permittedItems = useMemo(
    () => getFilteredItems(items, isFooter, userData.userrights),
    [isFooter, userData.userrights],
  );

  const handleTabClick = (key: string) => {
    if (key !== 'md-editor') {
      articlesStore.setState({ isEditArticle: false });
    }
    if (key === 'user') {
      userStore.getState().loading = true;
      router.push(`/user/${username}`);
    } else {
      router.push('/' + key);
    }
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <div className={`${style.footerContainer} ${isReady ? style.ready : ''}`}>
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
        {isReady ? (
          <Tabs
            className={style.menu}
            activeKey={activeKey}
            centered
            items={permittedItems}
            onTabClick={handleTabClick}
          />
        ) : (
          <div className={style.placeholder} />
        )}
      </ConfigProvider>
    </div>
  );
};

export default Menu;
