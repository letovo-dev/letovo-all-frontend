'use client';
import React, { useState, useEffect, useMemo } from 'react';
import style from './Menu.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import articlesStore from '@/shared/stores/articles-store';
import navigationStore from '@/shared/stores/navigation-store';
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

type MenuVariant = 'footer' | 'sidebar';

const getFilteredItems = (
  items: MenuItem[],
  variant: MenuVariant,
  userrights: string | undefined,
): MenuItem[] => {
  const isAdmin = ALLOWED_ROLES.includes(userrights || '');
  if (variant === 'footer' || !isAdmin) {
    return items.filter(item => item.key !== 'md-editor');
  }
  return items;
};

const Menu = ({ isFooter, variant }: { isFooter?: boolean; variant?: MenuVariant }) => {
  const resolvedVariant: MenuVariant = variant ?? (isFooter ? 'footer' : 'footer');
  const isSidebar = resolvedVariant === 'sidebar';
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
    () => getFilteredItems(items, resolvedVariant, userData.userrights),
    [resolvedVariant, userData.userrights],
  );

  const handleItemClick = (key: string) => {
    if (key !== 'md-editor') {
      articlesStore.setState({ isEditArticle: false });
    }
    const targetPath = key === 'user' ? `/user/${username}` : `/${key}`;
    if (pathname !== targetPath) {
      navigationStore.getState().setNavigating(true);
    }
    if (key === 'user') {
      userStore.getState().loading = true;
      router.push(targetPath);
    } else {
      router.push(targetPath);
    }
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <div
      className={`${style.footerContainer} ${isSidebar ? style.sidebarContainer : ''} ${isReady ? style.ready : ''}`}
    >
      {isReady ? (
        <nav className={`${style.menu} ${isSidebar ? style.menuSidebar : ''}`}>
          {permittedItems.map(item => (
            <button
              key={item.key}
              className={`${style.menuItem} ${activeKey === item.key ? style.active : ''}`}
              onClick={() => handleItemClick(item.key)}
              disabled={item.disabled}
              title={item.label}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={item.width}
                height={item.height}
                className={style.icon}
              />
              {isSidebar && <span className={style.label}>{item.label}</span>}
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
