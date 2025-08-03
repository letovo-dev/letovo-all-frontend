'use client';

import { EnterForm } from '@/features/login';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import { notification } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

export default function Login() {
  const [api, contextHolder] = notification.useNotification();
  const shownRef = useRef(false);
  const { getMessageText } = userStore((state: IUserStore) => state);
  const { messageText } = userStore((state: IUserStore) => state.store);

  useEffect(() => {
    getMessageText();
  }, []);

  const openNotification = useCallback(() => {
    api.open({
      message: '',
      description: messageText,
      duration: null,
    });
  }, [api, messageText]);

  useEffect(() => {
    if (messageText && messageText !== '' && !shownRef.current) {
      openNotification();
      shownRef.current = true;
    }
  }, [messageText]);

  return (
    <>
      {contextHolder}
      <EnterForm />
    </>
  );
}
