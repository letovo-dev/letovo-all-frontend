'use client';

import style from './page.module.scss';
import { Button, ConfigProvider, Spin } from 'antd';
import dataStore from '@/shared/stores/data-store';
import { useEffect, useState } from 'react';
import { getDataFromLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import { IUserData } from '@/shared/stores/user-store';
import { useRouter } from 'next/navigation';

interface ClientAchievementPageProps {
  id: string;
  username: string;
}

function ClientAchievementPage({ id, username }: ClientAchievementPageProps) {
  const { addAch, loading } = dataStore(state => state);
  const [user, setUser] = useState<IUserData | null>(null);
  const [trueUser, setTrueUser] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const {
        state: {
          store: { userData },
        },
      } = getDataFromLocaleStorage('userStore');
      console.log('User data from localStorage:', userData);
      setUser(userData);
    } catch (e) {
      console.error('Failed to get user data:', e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user && user.userrights === 'admin') {
      console.log('Admin user:', user);
      setTrueUser(true);
    }
    const timeoutId = setTimeout(() => {
      if (user && user.userrights !== 'admin' && user.username) {
        router.push(`/user/${user.username}`);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, router]);

  const handleButtonClick = async () => {
    if (!user?.username) {
      console.error('User or username is undefined');
      return;
    }
    try {
      await addAch(id, username);
      router.push(`/user/${user.username}`);
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
      <div className={style.pageContainer}>
        {trueUser ? (
          <>
            {loading && <Spin size="large" />}
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
          </>
        ) : (
          <h5>Вы не можете открывать ачивки</h5>
        )}
      </div>
    </ConfigProvider>
  );
}

export default ClientAchievementPage;
