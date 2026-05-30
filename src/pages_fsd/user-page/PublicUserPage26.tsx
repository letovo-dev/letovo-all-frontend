'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from 'antd';
import Image from 'next/image';
import style from './UserPage26.module.scss';
import { departments } from './model/departments';
import publicProfileStore from '@/shared/stores/public-profile-store';
import userStore from '@/shared/stores/user-store';
import SpinModule from '@/shared/ui/spiner';
import Collapse from './ui/Collapse';
import CollapseBody from './ui/CollapseBody';
import AchievementsGrid from './ui/AchievementsGrid';
import ProfilePosts from './ui/ProfilePosts';

interface PublicUserPage26Props {
  username: string;
}

const PublicUserPage26: React.FC<PublicUserPage26Props> = ({ username }) => {
  const router = useRouter();
  const { loading, error, userData, career, achievements, posts, loadProfile, reset } =
    publicProfileStore(state => state);
  const [openCollapseIndex, setOpenCollapseIndex] = useState<number | null>(0);
  const [viewSection, setViewSection] = useState<string>('career');

  useEffect(() => {
    const ownUsername = userStore.getState().store.userData?.username;
    if (ownUsername && ownUsername === username) {
      router.replace(`/user/${username}`);
      return;
    }
    loadProfile(username);
    return () => reset();
  }, [username]);

  if (loading) {
    return <SpinModule />;
  }

  if (error || !userData) {
    return <p>{error ?? 'Пользователь не найден'}</p>;
  }

  const depId = userData.departmentid;
  const dep = departments[depId] ?? departments['1'];
  const userOnBoard = userData.active === 't' ? 'Работает' : 'В отпуске';

  const fullName = (userData.display_name || '').trim();
  const parts = fullName.split(/\s+/);
  const surname = parts[0] ?? '';
  const givenName = parts.slice(1).join(' ');

  return (
    <>
      <div className={style.topRow}>
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
                <p className={style.branchName}>{userData.brigadename ?? 'xxxxx'}</p>
              </div>
            </div>
          </div>
        </section>
        <Image
          className={style.corpLogo}
          src="/26_corp_logo.svg"
          alt=""
          width={120}
          height={102}
          aria-hidden="true"
        />
      </div>

      <section aria-label="Карьера и достижения" className={style.careerAndAchievementsBlock}>
        <button
          type="button"
          className={`${style.tabButton} ${viewSection === 'career' ? style.tabButtonActive : ''}`}
          onClick={() => setViewSection('career')}
        >
          <Image src="/26_career.svg" alt="" height={18} width={18} />
          Карьера
        </button>
        <button
          type="button"
          className={`${style.tabButton} ${viewSection === 'achievements' ? style.tabButtonActive : ''}`}
          onClick={() => setViewSection('achievements')}
        >
          Достижения
          <Image src="/26_achive.svg" alt="" height={18} width={18} />
        </button>
      </section>

      <div className={style.careerAchieveRow}>
        <section
          aria-label="Карьера"
          className={`${style.careerBlock} ${viewSection !== 'career' ? style.mobileHidden : ''}`}
        >
          <div className={style.careerHeader}>
            <h3 className={style.careerHeaderTitle}>Карьера</h3>
          </div>
          <div className={style.collapseContainer}>
            {career?.achivements?.map((achivement: any, i: number) => {
              const depKey = String(achivement.department_id ?? depId);
              const itemDep = departments[depKey] ?? dep;
              return (
                <Collapse
                  key={`${i}-${career?.username}`}
                  leftText={achivement.role}
                  rightText={`${achivement.department} | ${achivement.chapter} | ${achivement.year}`}
                  isOpen={openCollapseIndex === i}
                  onToggle={() => setOpenCollapseIndex(prev => (prev === i ? null : i))}
                  headerColor={itemDep.color}
                  dotColor={itemDep.iconColor}
                  borderColor={itemDep.borderColor}
                >
                  <CollapseBody
                    departmentIcon={itemDep.icon}
                    brigade={achivement.department}
                    post={achivement.role}
                    achivements={achivement.achivements}
                    iconColor={itemDep.iconColor}
                  />
                  <></>
                </Collapse>
              );
            })}
          </div>
        </section>

        <div className={viewSection !== 'achievements' ? style.mobileHidden : ''}>
          <AchievementsGrid achievements={achievements} />
        </div>
      </div>

      <section aria-label="Посты пользователя">
        <ProfilePosts posts={posts} />
      </section>
    </>
  );
};

export default PublicUserPage26;
