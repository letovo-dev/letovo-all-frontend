'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Orbitron, Inter } from 'next/font/google';
import styles from './not-found.module.scss';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['500', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

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
          src="/404.png"
          alt="anime girl says no"
          fill
          sizes="(max-width: 600px) 80vw, 400px"
          priority
          className={styles.image}
        />
        <div className={`${styles.speech} ${orbitron.className}`}>No</div>
      </div>

      <button className={styles.button} onClick={() => router.push('/')}>
        На главную
      </button>
    </div>
  );
}
