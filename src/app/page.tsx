'use client';
import React, { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './page.module.css';
// import EnterForm from '../features/login/ui/EnterForm';
import { authStore } from '@/shared/stores/auth-store';

import { redirect } from 'next/navigation';
import '@ant-design/v5-patch-for-react-19';
import { useApi } from '@/shared/hooks/useApi';

export default function Home() {
  const authed = authStore(state => state.userData.authed);
  // const user = authStore.getState().userData;
  // console.log('user', user);
  // console.log('authed', authed);
  // console.log('loading', authStore.getState().loading);

  // const isClient = typeof window !== 'undefined';

  // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // console.log('token++++++', Boolean(token));

  useApi(authStore.getState().auth, {
    // onmount: Boolean(token),
    onmount: false,
  });
  useEffect(() => {
    if (!authed && !authStore.getState().loading) {
      redirect('./login');
    }
  }, [authed]);

  return (
    <div className={styles.main}>
      {authStore.getState().loading ? (
        <Spin className={styles.spinner} indicator={<LoadingOutlined spin />} size="large" />
      ) : (
        <div>Hello</div>
      )}
    </div>
  );
}
