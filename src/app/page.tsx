'use client';
import React, { useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { ConfigProvider, Spin } from 'antd';
import style from './page.module.scss';

export default function Home() {
  const auth = authStore.getState().auth;
  const userStatus = authStore(state => state.userStatus);
  const userData = userStore(state => state.store?.userData);
  const router = useRouter();
  const error = userStore(state => state.error);
  const loading = authStore(state => state.loading);

  useEffect(() => {
    async function checkAuth() {
      if (!userStatus?.token || !userStatus?.authed) {
        router.push('./login');
      } else {
        await auth(userStatus?.token);
        if (!error && userData.username && !userStatus?.registered) {
          router.push('/registration');
        }
        if (!error && userData?.username && userStatus?.registered) {
          router.push(`/user/${userData?.username}`);
        }
      }
    }
    checkAuth();
  }, [userStatus?.token, userStatus?.authed, userData?.username]);

  if (loading) {
    return (
      <div className={style.spinWrapper}>
        {loading && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
              },
            }}
          >
            <Spin size={'large'} />
          </ConfigProvider>
        )}
      </div>
    );
  }
  return <></>;
}
