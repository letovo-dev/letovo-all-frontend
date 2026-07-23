'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import localFont from 'next/font/local';
import styles from './not-found.module.scss';

const orbitron = localFont({
  src: [
    { path: '../../public/fonts/orbitron.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/orbitron.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-orbitron',
});
const inter = localFont({
  src: [
    { path: '../../public/fonts/inter-latin-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/inter-latin-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter',
});

export default function NotFound() {
  const router = useRouter();
  return (
    <div className={`${styles.container} ${inter.className}`}>
      <div className={styles.glowRing} />
      <h1 className={`${styles.title} ${orbitron.className}`}>404</h1>
      <p className={styles.message}>Страница не найдена</p>
      <p className={styles.subMessage}>
        Даже не знаю, как ты забрел сюда. Либо страницы не существует, либо доступ тебе не светит
      </p>

      <div className={styles.imageWrap}>
        <Image
          src="/404-sad.svg"
          alt="Грустная иконка документа"
          fill
          sizes="(max-width: 600px) 80vw, 360px"
          priority
          className={styles.image}
        />
      </div>

      <button className={styles.button} onClick={() => router.push('/')}>
        На главную
      </button>
    </div>
  );
}
