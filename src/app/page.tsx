'use client';
import React, { useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from 'next/navigation';
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';

export default function Home() {
  const auth = authStore.getState().auth;
  const { authed, registered } = authStore(state => state.userStatus);
  const username = userStore.getState().store.userData.username;
  const router = useRouter();
  const token = localStorage.getItem('token');
  const error = userStore(state => state.error);

  useEffect(() => {
    async function checkAuth() {
      if (!token || !authed) {
        router.push('./login');
      } else {
        await auth(token);
        if (error === undefined && username && !registered) {
          router.push('/registration');
        }
        router.push(`/user/${username}`);
      }
    }
    checkAuth();
  }, [token, authed, username]);

  return <></>;
}
