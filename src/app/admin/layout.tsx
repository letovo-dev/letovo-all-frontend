import type { ReactNode } from 'react';
import style from './AdminLayout.module.scss';

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <section className={style.page} data-admin-shell>
      <div className={style.content}>{children}</div>
    </section>
  );
}
