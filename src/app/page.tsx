'use client';
import React, { useEffect } from 'react';
import { authStore } from '@/shared/stores/auth-store';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from 'next/navigation';

export default function Home() {
  const authed = authStore(state => state.userData.authed);
  const username = authStore(state => state.userData.user.login);
  const auth = authStore(state => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (!authed) {
      auth();
    }
  }, [authed]);

  useEffect(() => {
    if (username) {
      router.push(`/user/${username}`);
    }
  }, [username, router]);

  console.log(username);

  return <></>;
}
