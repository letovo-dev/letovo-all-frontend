'use client';
import React, { useEffect, useState } from 'react';
import style from './UserPage.module.scss';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { Button } from 'antd';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import QRScanner from '@/features/qr-scanner/QrScanner';
import TableElement from '@/features/qr-scanner/Table';

const UserPage = () => {
  const { userData } = userStore.getState().store;
  const getAllUserAchievements = userStore(state => state.getAllUserAchievements);
  const allPossibleUserAchievements = userStore(state => state.store.allPossibleUserAchievements);
  const [data, setData] = useState<IUserAchData[][]>([]);

  useEffect(() => {
    if (userData?.username) {
      getAllUserAchievements(userData.username);
    }
  }, [userData?.username]);

  const changeLogin = () => {
    userStore.getState().changeLogin('newUser');
  };

  const changePass = () => {
    userStore.getState().changePass('new_pass');
  };

  useEffect(() => {
    if (allPossibleUserAchievements) {
      console.log('allPossibleUserAchievements', allPossibleUserAchievements);
      const col1 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 0,
      );
      console.log('col1', col1);

      const col2 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 1,
      );
      console.log('col2', col2);
      const col3 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 2,
      );
      console.log('col3', col3);
      setData([[...col1], [...col2], [...col3]]);
    }
  }, [allPossibleUserAchievements]);

  console.log('col4', allPossibleUserAchievements);

  return (
    <div className={style.wrap}>
      {/* <div style={{ marginTop: '200px' }}></div>
      <TableElement /> */}
      <Button onClick={changeLogin}> Change login </Button>
      <Button onClick={changePass}> Change pass </Button>
      <CustomSelect />
      {/* <div className={style.skewedInputContainer}> */}
      <input className={style.inputWrapper} type="text" placeholder="Введите текст" />
      {/* </div> */}
      {data.length > 0 && (
        <div className={style.container}>
          {/* Первая колонка */}
          <div className={style.column}>
            {data[0]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>

          {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
          <div className={style.column}>
            <div className={style.spacer}>TEXT</div>
            {/* <QRScanner /> */}
            {data[1]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>

          {/* Третья колонка */}
          <div className={style.column}>
            {data[2]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
