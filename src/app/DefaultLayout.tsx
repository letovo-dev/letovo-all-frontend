'use client';
import style from './page.module.scss';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/shared/ui/footer';
import Image from 'next/image';
import Menu from '@/shared/ui/menu';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import { useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { checkAuthToken } from '@/shared/api/auth/models/checkAuthToken';
import { ConfigProvider, Spin } from 'antd';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const { isFooterHidden, setFooterHidden, toggleFooter } = useFooterContext();
  const lastScrollTop = useRef(0);
  const router = useRouter();
  const {
    userData: { username },
  } = userStore.getState().store;
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authStore.persist.rehydrate();
        const currentUserStatus = authStore.getState().userStatus;
        if (currentUserStatus.token) {
          const authData = await checkAuthToken(currentUserStatus.token);
          if (
            authData?.success &&
            authData.data &&
            typeof authData.data === 'object' &&
            'status' in authData.data &&
            (authData.data as { status?: string }).status === 't'
          ) {
            authStore.setState(state => ({
              ...state,
              userStatus: {
                logged: true,
                authed: true,
                registered: true,
                token: currentUserStatus.token,
              },
            }));
          } else {
            authStore.getState().logout();
            router.push('/login');
          }
        } else {
          authStore.getState().logout();
          router.push('/login');
        }
      } catch (error) {
        console.error('Error during auth verification:', error);
        authStore.getState().logout();
        router.push('/login');
      } finally {
        setIsAuthChecked(true);
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleScroll = () => {
      if (layoutRef.current) {
        const currentScrollTop = layoutRef.current.scrollTop;
        if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
          setFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop.current) {
          setFooterHidden(false);
        }
        lastScrollTop.current = currentScrollTop;
      }
    };

    updateVh();
    window.addEventListener('resize', updateVh);

    const layoutElement = layoutRef.current;
    if (layoutElement) {
      layoutElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', updateVh);
      if (layoutElement) {
        layoutElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden]);

  if (isLoading || !isAuthChecked) {
    return (
      <div className={style.emptyPage}>
        <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
          <Spin size="large" />
        </ConfigProvider>
      </div>
    );
  }

  const currentUserStatus = authStore.getState().userStatus;
  if (!currentUserStatus?.logged || !currentUserStatus?.token || !currentUserStatus?.registered) {
    return null;
  }

  return (
    <div ref={layoutRef} className={style.layoutContainer}>
      <header className={style.header}>
        <Image
          className={style.letovoCorp}
          src="/Logo_Mini.svg"
          alt="Letovo.corp"
          height={25}
          width={250}
          priority
          onClick={() => username && router.push(`/user/${username}`)}
        />
        <div className={style.headerMenu}>
          <Menu />
        </div>
      </header>
      <main className={style.content}>{children}</main>
      <footer
        className={`${style.footer} ${isFooterHidden ? style.footerHidden : ''}`}
        onClick={isFooterHidden ? toggleFooter : undefined}
      >
        <Footer />
      </footer>
    </div>
  );
}
