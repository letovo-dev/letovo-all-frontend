'use client';
import React, { useEffect } from 'react';
import style from './UserPage.module.scss';
import { authStore } from '@/shared/stores/auth-store';
import userStore from '@/shared/stores/user-store';

const data = [
  { id: 1, text: 'Элемент 1' },
  { id: 2, text: 'Элемент 2' },
  { id: 3, text: 'Элемент 3' },
  { id: 4, text: 'Элемент 4' },
  { id: 5, text: 'Элемент 5' },
  { id: 6, text: 'Элемент 6' },
  { id: 7, text: 'Элемент 7' },
  { id: 8, text: 'Элемент 8' },
  { id: 9, text: 'Элемент 9' },
];
const UserPage = () => {
  // const userData = userStore(state => state.userData);
  const { userData } = userStore.getState().store;
  const getAllUserAchievements = userStore(state => state.getAllUserAchievements);
  console.log('userData', userData);

  useEffect(() => {
    getAllUserAchievements(userData.username);
  }, []);

  const col1 = data.filter((item, index) => index % 3 === 0);
  const col2 = data.filter((item, index) => index % 3 === 1);
  const col3 = data.filter((item, index) => index % 3 === 2);
  return (
    <div className={style.wrap}>
      <div className={style.container}>
        {/* Первая колонка */}
        <div className={style.column}>
          {col1.map(item => (
            <div key={item.id} className={style.item}>
              {item.text}
            </div>
          ))}
        </div>

        {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
        <div className={style.column}>
          <div className={style.spacer}>TEXT</div>
          {col2.map(item => (
            <div key={item.id} className={style.item}>
              {item.text}
            </div>
          ))}
        </div>

        {/* Третья колонка */}
        <div className={style.column}>
          {col3.map(item => (
            <div key={item.id} className={style.item}>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
