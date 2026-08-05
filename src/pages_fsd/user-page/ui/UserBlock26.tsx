'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from 'antd';
import Image from 'next/image';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import style from './UserBlock26.module.scss';
import { getDepartmentMeta } from '../model/departments';
import DepartmentEmblem from './DepartmentEmblem';

const UserBlock26 = () => {
  const router = useRouter();
  const userData = userStore((state: IUserStore) => state.store.userData);

  const logout = () => {
    authStore.getState().logout();
    router.push('/login');
  };

  if (!userData?.username) return null;

  const userOnBoard = userData?.active === 't' ? 'Работает' : 'В отпуске';
  const fullName = (userData.display_name || '').trim();
  const parts = fullName.split(/\s+/);
  const surname = parts[0] ?? '';
  const givenName = parts.slice(1).join(' ');
  const dep = getDepartmentMeta(userData.departmentid);

  return (
    <section aria-label="Профиль пользователя" className={style.userBlock}>
      <div className={style.icons}>
        <div className={style.userIcon}>
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${userData.avatar_pic}`}
            size={80}
            shape="circle"
          />
        </div>
        <DepartmentEmblem
          className={`${style.depIcon} ${style.depIconMobile}`}
          department={dep}
          alt="Эмблема департамента"
          height={80}
          width={80}
        />
      </div>
      <div className={style.userData}>
        <h1 className={style.userName}>
          <span className={style.surname}>{surname.toUpperCase()}</span>{' '}
          <span className={style.givenName}>{givenName.toUpperCase()}</span>
        </h1>
        <p className={style.status}>{userOnBoard}</p>
        <div className={style.depData}>
          <DepartmentEmblem
            className={`${style.depIcon} ${style.depIconDesktop}`}
            department={dep}
            height={41}
            width={50}
          />
          <div className={style.depTextWrap}>
            <p className={style.depName}>{`${dep.name} >`}</p>
            <p className={style.branchName}>{userData?.brigadename ?? 'xxxxx'}</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Выйти"
        className={style.menuButtonDiv}
        onClick={() => logout()}
      >
        <Image className={style.logout} src="/26_logout.svg" alt="exit" height={20} width={20} />
      </button>
    </section>
  );
};

export default UserBlock26;
