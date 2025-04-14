'use client';
import style from '../page.module.scss';

export default function UserPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={style.layoutContainer}>
        <main className={style.content}>{children}</main>
      </div>
    </>
  );
}
