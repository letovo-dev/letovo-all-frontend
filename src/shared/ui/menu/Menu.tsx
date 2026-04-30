'use client';
import React, { useState, useEffect, useMemo } from 'react';
import style from './Menu.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import articlesStore from '@/shared/stores/articles-store';
import Image from 'next/image';

interface MenuItem {
  label: string;
  key: string;
  disabled: boolean;
  icon: string;
  width?: number;
  height?: number;
}

const items: MenuItem[] = [
  {
    label: 'База знаний',
    key: 'articles',
    disabled: false,
    icon: '/26_article_icon.png',
    width: 30,
    height: 20,
  },
  {
    label: 'Новости',
    key: 'news',
    disabled: false,
    icon: '/26_news_icon.png',
    width: 17,
    height: 30,
  },
  {
    label: 'Редактор статей',
    key: 'md-editor',
    disabled: false,
    icon: '/26_article_icon.png',
    width: 30,
    height: 20,
  },
  { label: 'Чат', key: 'chat', disabled: false, icon: '/26_chat_icon.png', width: 27, height: 26 },
  {
    label: 'Личный кабинет',
    key: 'user',
    disabled: false,
    icon: '/26_user_icon.png',
    width: 30,
    height: 23,
  },
];

const ALLOWED_ROLES = ['admin'];

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

  const handleItemClick = (key: string) => {
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
      {isReady ? (
        <nav className={style.menu}>
          {permittedItems.map(item => (
            <button
              key={item.key}
              className={`${style.menuItem} ${activeKey === item.key ? style.active : ''}`}
              onClick={() => handleItemClick(item.key)}
              disabled={item.disabled}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={item.width}
                height={item.height}
                className={style.icon}
              />
            </button>
          ))}
        </nav>
      ) : (
        <div className={style.placeholder} />
      )}
    </div>
  );
};

export default Menu;
