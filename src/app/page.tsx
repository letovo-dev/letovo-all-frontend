'use client';
import React, { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './page.module.css';
import { authStore } from '@/shared/stores/auth-store';
import '@ant-design/v5-patch-for-react-19';

export default function Home() {
  const authed = authStore(state => state.userData.authed);
  const auth = authStore(state => state.auth);

  useEffect(() => {
    if (!authed) {
      auth();
    }
  }, [authed]);

  return (
    authed && (
      <div className={styles.main}>
        {authStore.getState().loading ? (
          <Spin className={styles.spinner} indicator={<LoadingOutlined spin />} size="large" />
        ) : (
          <div>Hello</div>
        )}
      </div>
    )
  );
}
