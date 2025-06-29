'use client';

import articlesStore from '@/shared/stores/articles-store';
import userStore from '@/shared/stores/user-store';
import { ConfigProvider, Spin } from 'antd';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import style from './page.module.scss';
import bcrypt from 'bcryptjs';

const SECRET_KEY = 'очень-секретный-key';

const validateToken = async (key: string, hashedKey: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(key, hashedKey);
  return isMatch;
};

export default function AchievementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get('token');

  const { revealSecretArticle } = articlesStore(state => state);
  const {
    store: { userData },
  } = userStore(state => state);

  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      if (!id || !token) {
        console.error('Токен или id отсутствует');
        router.push('/404');
        return;
      }

      try {
        const isValid = await validateToken(SECRET_KEY + id, token);
        if (isValid) {
          revealSecretArticle(id);
          router.push(`/user/${userData.username}`);
        } else {
          console.error('Недействительный токен');
          router.push('/404');
        }
      } catch (err) {
        console.error('Ошибка проверки токена:', err);
        router.push('/404');
      }
    };

    checkToken();
  }, [id, token, userData]);

  return (
    <div className={style.spinWrapper}>
      <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
        <Spin size="large" />
      </ConfigProvider>
    </div>
  );
}
