'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { ConfigProvider, Spin } from 'antd';
import style from './page.module.scss';

export default function Home() {
  const auth = authStore.getState().auth;
  const userData = userStore((state: IUserStore) => state.store?.userData);
  const router = useRouter();
  const error = userStore((state: IUserStore) => state.error);
  const loading = authStore(state => state.loading);

  useEffect(() => {
    async function handleAuthCheck() {
      try {
        await checkAuth();
        const { userStatus } = authStore.getState();
        if (!error && userData?.username && userStatus?.authed) {
          router.push(`/user/${userData?.username}`);
          return;
        }
        if (!userStatus.logged || !userStatus?.registered) {
          router.push('/login');
          return;
        }
      } catch (err) {
        console.error('Ошибка авторизации:', err);
      }
    }

    handleAuthCheck();

    async function checkAuth() {
      return await auth();
    }
  }, []);

  if (loading) {
    return (
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
    );
  }
  return <></>;
}
