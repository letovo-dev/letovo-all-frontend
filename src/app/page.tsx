'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { ConfigProvider, Spin, Button } from 'antd';
import style from './page.module.scss';

export const dynamic = 'force-dynamic';

export default function Home() {
  const auth = authStore.getState().auth;
  const userData = userStore((state: IUserStore) => state.store?.userData);
  const router = useRouter();
  const error = userStore((state: IUserStore) => state.error);
  const loading = authStore(state => state.loading);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function handleAuthCheck() {
      try {
        const authResult = await auth();
        const { userStatus } = authStore.getState();

        if (authResult.success && userData?.username && userStatus?.authed) {
          router.push(`/user/${userData.username}`);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setAuthChecked(true);
      }
    }

    if (!authChecked) {
      handleAuthCheck();
    }
  }, [auth, router, userData, authChecked]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setAuthChecked(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setAuthChecked(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (loading || !authChecked) {
    return (
      <div className={style.spinWrapper}>
        <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
          <Spin size="large" />
        </ConfigProvider>
      </div>
    );
  }

  return (
    <div className={style.spinWrapper}>
      <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
        <Spin size="large" />
      </ConfigProvider>
    </div>
  );
}
