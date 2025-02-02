'use client';
import React, { useEffect, Suspense } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './page.module.css';
// import EnterForm from '../features/login/ui/EnterForm';
import { authStore } from '@/shared/stores/auth-store';
import Login from './login/page';
import { useRouter, redirect } from 'next/navigation';
import '@ant-design/v5-patch-for-react-19';

export default function Home() {
  const authed = authStore(state => state.userData.authed);
  const router = useRouter();

  useEffect(() => {
    if (!authed && !authStore.getState().loading) {
      // router.push('/login');
      redirect('./login');
    }
  }, [authed]);

  return (
    <div className={styles.main}>
      {authStore.getState().loading ? (
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      ) : (
        <div>Hello</div>
      )}
    </div>
  );
}
