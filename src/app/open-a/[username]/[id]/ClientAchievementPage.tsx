'use client';

import style from './page.module.scss';
import { Button, ConfigProvider, Spin } from 'antd';
import dataStore from '@/shared/stores/data-store';
import { useEffect, useRef, useState } from 'react';
import { getDataFromLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import userStore, { IUserData } from '@/shared/stores/user-store';
import { useRouter } from 'next/navigation';

interface ClientAchievementPageProps {
  id: string;
  username: string;
}

function ClientAchievementPage({ id, username }: ClientAchievementPageProps) {
  const { addAch, loading } = dataStore(state => state);
  const { userData } = userStore(state => state.store);
  const [trueUser, setTrueUser] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!userData) return;

    if (userData.userrights !== 'admin' && userData.userrights !== 'moder') {
      const timeoutId = setTimeout(() => {
        router.push(`/user/${userData?.username || 'unknown'}`);
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      setTrueUser(true);
    }
  }, [userData]);

  const handleButtonClick = async () => {
    if (!userData?.username) {
      console.error('User or username is undefined');
      return;
    }
    try {
      await addAch(id, username);
      router.push(`/user/${userData.username}`);
    } catch (e) {
      console.error('Failed to add achievement:', e);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FB4724',
        },
        components: {
          Button: {
            defaultHoverBorderColor: '#ffffff',
            defaultHoverColor: '#ffffff',
            defaultHoverBg: '#FB4724',
          },
        },
      }}
    >
      {userData.userrights === '' || loading ? (
        <Spin size="large" />
      ) : (
        <div className={style.pageContainer}>
          {trueUser ? (
            <div className={style.textContainer}>
              <h5>
                Для открытия ачивки {id} для {username} нажмите
              </h5>
              <Button className={style.button} onClick={handleButtonClick}>
                Открыть ачивку!
              </Button>
              <p className={style.warnP}>
                Ачивка будет разблокирована при условии предварительного логина в приложении
              </p>
            </div>
          ) : (
            <h5>Вы не можете открывать ачивки</h5>
          )}
        </div>
      )}
    </ConfigProvider>
  );
}

export default ClientAchievementPage;
