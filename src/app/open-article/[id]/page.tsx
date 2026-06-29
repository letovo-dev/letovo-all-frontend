'use client';

import authStore from '@/shared/stores/auth-store';
import SpinModule from '@/shared/ui/spiner';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AchievementPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  useEffect(() => {
    const redirectToArticle = async () => {
      if (!id) {
        router.push('/404');
        return;
      }

      try {
        await authStore.persist.rehydrate();
        const authResult = await authStore.getState().auth();
        if (authResult.success) {
          router.replace(`/articles?article=${encodeURIComponent(id)}`);
        } else {
          router.replace(`/login?next=/open-article/${encodeURIComponent(id)}`);
        }
      } catch (err) {
        console.error('Ошибка проверки доступа к статье:', err);
        router.replace('/login');
      }
    };

    redirectToArticle();
  }, [id, router]);

  return <SpinModule />;
}
