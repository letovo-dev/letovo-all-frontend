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

  const a = {
    bmc: {
      list: 'event_name',
      inventory: {
        update: 'event_name',
        last: 'event_name',
      },
    },
  };

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
