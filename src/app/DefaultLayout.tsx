'use client';
import style from './page.module.scss';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/shared/ui/footer';
import Menu from '@/shared/ui/menu';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import { useRouter, usePathname } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import navigationStore from '@/shared/stores/navigation-store';
import SpinModule from '@/shared/ui/spiner';
import Image from 'next/image';
import { useBalanceWebSocket } from '@/shared/hooks/useBalanceWebSocket';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const { isFooterHidden, setFooterHidden, toggleFooter, scrollContainerRef } = useFooterContext();
  const lastScrollTop = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const currentUserStatus = authStore(state => state.userStatus);
  const isNavigating = navigationStore(state => state.isNavigating);
  const setNavigating = navigationStore(state => state.setNavigating);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNavigating(false);
  }, [pathname, setNavigating]);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authStore.persist.rehydrate();
        const currentUserStatus = authStore.getState().userStatus;
        if (currentUserStatus.logged) {
          const authData = await authStore.getState().auth();
          if (!authData.success) {
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
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };

    const handleScroll = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const currentScrollTop = target.scrollTop;
      if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
        setFooterHidden(true);
      } else if (currentScrollTop < lastScrollTop.current) {
        setFooterHidden(false);
      }
      lastScrollTop.current = currentScrollTop;
    };

    updateVh();
    window.addEventListener('resize', updateVh);
    window.visualViewport?.addEventListener('resize', updateVh);
    window.visualViewport?.addEventListener('scroll', updateVh);

    const element = scrollContainerRef.current ?? layoutRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', updateVh);
      window.visualViewport?.removeEventListener('resize', updateVh);
      window.visualViewport?.removeEventListener('scroll', updateVh);
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden, isAuthChecked, scrollContainerRef]);

  useBalanceWebSocket(
    isAuthChecked &&
      !isLoading &&
      currentUserStatus.logged &&
      currentUserStatus.authed &&
      currentUserStatus.registered,
  );

  if (!mounted) return null;

  if (isLoading || !isAuthChecked) {
    return <SpinModule />;
  }

  if (!currentUserStatus?.logged || !currentUserStatus?.authed || !currentUserStatus?.registered) {
    return null;
  }

  const avatarPic = userStore.getState().store.userData.avatar_pic;
  const avatarSrc = avatarPic
    ? `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatarPic}`
    : '/26_user_icon.png';

  return (
    <div className={style.defaultLayoutContainer}>
      <aside className={style.desktopSidebar}>
        <Menu variant="sidebar" />
        <div className={style.sidebarLine}>
          <div className={style.sidebarLineTrack} />
          <div className={style.sidebarDots}>
            <span className={`${style.sidebarDot} ${style.sidebarDotBlue}`} />
            <span className={style.sidebarDotRing}>
              <span className={`${style.sidebarDot} ${style.sidebarDotRed}`} />
            </span>
            <span className={`${style.sidebarDot} ${style.sidebarDotYellow}`} />
          </div>
        </div>
        <div className={style.sidebarAvatar}>
          <div className={style.sidebarAvatarInner}>
            <Image src={avatarSrc} alt="" width={42} height={42} unoptimized />
          </div>
        </div>
      </aside>
      <main ref={layoutRef} className={style.pageContent}>
        {children}
      </main>
      {isNavigating && <SpinModule />}
      <footer
        className={`${style.footer} ${isFooterHidden ? style.footerHidden : ''}`}
        onClick={isFooterHidden ? toggleFooter : undefined}
      >
        <Footer />
      </footer>
    </div>
  );
}
