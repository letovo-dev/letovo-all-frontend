'use client';
import style from '../page.module.scss';
import { useEffect } from 'react';

export default function UserPageLayout({ children }: { children: React.ReactNode }) {
  // useEffect(() => {
  //   const updateVh = () => {
  //     const vh = window.innerHeight * 0.01;
  //     document.documentElement.style.setProperty('--vh', `${vh}px`);
  //   };

  //   updateVh(); // Установить значение при загрузке страницы.
  //   window.addEventListener('resize', updateVh); // Обновлять при изменении размера окна.

  //   return () => {
  //     window.removeEventListener('resize', updateVh);
  //   };
  // }, []);

  return (
    <>
      <div className={style.layoutContainer}>
        <main className={style.content}>{children}</main>
      </div>
    </>
  );
}
