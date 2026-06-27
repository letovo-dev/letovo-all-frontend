'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from 'antd';
import Image from 'next/image';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import style from './UserBlock26.module.scss';

const departments: {
  [key: string]: {
    color: string;
    borderColor: string;
    iconColor: string;
    name: string;
    icon: string;
  };
} = {
  '0': {
    color: 'var(--x-header)',
    borderColor: 'var(--x-border)',
    iconColor: 'var(--x-icon)',
    name: '[НЕТ ДОСТУПА]',
    icon: '/26_x.svg',
  },
  '1': {
    color: 'var(--it-header)',
    borderColor: 'var(--it-border)',
    iconColor: 'var(--it-icon)',
    name: 'IT',
    icon: '/26_it.svg',
  },
  '2': {
    color: 'var(--management-header)',
    borderColor: 'var(--management-border)',
    iconColor: 'var(--management-icon)',
    name: 'Менеджмент',
    icon: '/26_management.svg',
  },
  '3': {
    color: 'var(--enginery-header)',
    borderColor: 'var(--enginery-border)',
    iconColor: 'var(--enginery-icon)',
    name: 'Инженерный',
    icon: '/26_engineer.svg',
  },
  '4': {
    color: 'var(--public-relations-header)',
    borderColor: 'var(--public-relations-border)',
    iconColor: 'var(--public-relations-icon)',
    name: 'Связи с общественностью',
    icon: '/26_x.svg',
  },
  '5': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Арт',
    icon: '/26_design.svg',
  },
  '6': {
    color: 'var(--science-header)',
    borderColor: 'var(--science-border)',
    iconColor: 'var(--science-icon)',
    name: 'Наука',
    icon: '/26_science.svg',
  },
  '7': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Проект 11',
    icon: '/26_proj11.svg',
  },
  '8': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Клуб',
    icon: '/26_proj11.svg',
  },
  '9': {
    color: 'var(--x-header)',
    borderColor: 'var(--x-border)',
    iconColor: 'var(--x-icon)',
    name: '[БЕЗ НАЗВАНИЯ]',
    icon: '/26_x.svg',
  },
  '10': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Дизайн',
    icon: '/26_design.svg',
  },
  '11': {
    color: 'var(--x-header)',
    borderColor: 'var(--x-border)',
    iconColor: 'var(--x-icon)',
    name: 'Х',
    icon: '/26_x.svg',
  },
};

const UserBlock26 = () => {
  const router = useRouter();
  const userData = userStore((state: IUserStore) => state.store.userData);

  const logout = () => {
    authStore.getState().logout();
    setDataToLocaleStorage('token', '');
    router.push('/login');
  };

  if (!userData?.username) return null;

  const userOnBoard = userData?.active === 't' ? 'Работает' : 'В отпуске';
  const fullName = (userData.display_name || '').trim();
  const parts = fullName.split(/\s+/);
  const surname = parts[0] ?? '';
  const givenName = parts.slice(1).join(' ');
  const dep = departments[userData?.departmentid] ?? departments['1'];

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
        <Image
          className={`${style.depIcon} ${style.depIconMobile}`}
          src={dep.icon}
          alt="icon"
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
          <Image
            className={`${style.depIcon} ${style.depIconDesktop}`}
            src={dep.icon}
            alt=""
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
