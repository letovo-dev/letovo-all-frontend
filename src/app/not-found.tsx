'use client';

import { useRouter } from 'next/navigation';
import styles from './not-found.module.scss';

const NotFound: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Страница не найдена</p>
      <p className={styles.subMessage}>
        Похоже, вы пытались открыть страницу, которой не существует, или у вас нет доступа.
      </p>
      <button className={styles.button} onClick={handleGoHome}>
        На главную
      </button>
    </div>
  );
};

export default NotFound;
