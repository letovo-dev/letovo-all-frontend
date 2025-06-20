'use client';

import { notFound } from 'next/navigation';
import style from './page.module.scss';
import { Button, ConfigProvider } from 'antd';
import dataStore from '@/shared/stores/data-store';
import { useEffect, useState } from 'react';
import { getDataFromLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import { IUserData } from '@/shared/stores/user-store';
import { useRouter } from 'next/navigation';

interface Props {
  params: {
    id: string;
    username: string;
  };
}

export default function AchievementPage({ params }: Props) {
  const { id, username } = params;
  const { addAch } = dataStore(state => state);
  const [user, setUser] = useState<IUserData | null>(null);
  const [trueUser, setTrueUser] = useState<boolean>(false);
  const router = useRouter();

  console.log(`Achievement ID: ${id}, Username: ${username}`);

  if (!id || !username) {
    notFound();
  }

  useEffect(() => {
    const {
      state: {
        store: { userData },
      },
    } = getDataFromLocaleStorage('userStore');
    setUser(userData);
  }, [id, username]);

  useEffect(() => {
    if (user && user.userrights === 'admin') {
      console.log('user', user);
      setTrueUser(true);
    }
    const timeoutId = setTimeout(() => {
      if (user && user.userrights !== 'admin') {
        router.push(`/user/${user.username}`);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [user]);

  const handleButtonClick = async () => {
    await addAch(id, username);
    router.push(`/user/${user?.username}`);
  };

  return (
    <div className={style.pageContainer}>
      {trueUser ? (
        <>
          <div className={style.textContainer}>
            <h5>{`Для открытия ачивки ${id} для ${username} нажмите`}</h5>
            <p className={style.warnP}>
              Очивка будет разблокирована при условии предварительного логина в приложении
            </p>
          </div>

          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultHoverBorderColor: '#ffffff',
                  defaultHoverColor: '#ffffff',
                  defaultHoverBg: '#FB4724',
                },
              },
            }}
          >
            <Button className={style.button} onClick={handleButtonClick}>
              Открыть ачивку!
            </Button>
          </ConfigProvider>
        </>
      ) : (
        <h5>Вы не можете открывать ачивки</h5>
      )}
    </div>
  );
}
